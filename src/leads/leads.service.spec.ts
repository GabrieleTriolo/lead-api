import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { DataSource, EntityManager } from 'typeorm';
import { LeadRepository } from './repositories/lead.repository';
import { LeadApplicantRepository } from '../lead-applicants/repositories/lead-applicant.repository';
import { CrmPublisherService } from '../integrations/crm/crm-publisher.service';
import { LeadSimulationsService } from '../lead-simulations/lead-simulations.service';
import { Logger } from '@nestjs/common';
import { createLeadDtoMock } from '../test/mocks/create-lead.dto.mock';

describe('LeadsService', () => {
  let service: LeadsService;

  const txManager: Partial<EntityManager> = { symbol: 'txManager' } as any;
  const ds: Partial<DataSource> = { transaction: jest.fn() };

  const leadsRepo: Partial<LeadRepository> = {
    findByPhoneInTx: jest.fn(),
    createLeadInTx: jest.fn(),
    updateLeadInTx: jest.fn(),
    findByIdInTx: jest.fn(),
  };

  const applicantsRepo: Partial<LeadApplicantRepository> = {
    bulkCreateForLead: jest.fn(),
    replaceForLeadInTx: jest.fn(),
  };

  const crm: Partial<CrmPublisherService> = {
    publishLeadSync: jest.fn(),
  };

  const simulations: Partial<LeadSimulationsService> = {
    createForLeadWithIdempotency: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    (ds.transaction as jest.Mock).mockImplementation(async (cb: any) => cb(txManager));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: DataSource, useValue: ds },
        { provide: LeadRepository, useValue: leadsRepo },
        { provide: LeadApplicantRepository, useValue: applicantsRepo },
        { provide: CrmPublisherService, useValue: crm },
        { provide: LeadSimulationsService, useValue: simulations },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  it('creates a new lead when phone not found, publishes CRM and triggers simulation', async () => {
    // Arrange
    (leadsRepo.findByPhoneInTx as jest.Mock).mockResolvedValue(null);
    (leadsRepo.createLeadInTx as jest.Mock).mockResolvedValue({ id: '10' });
    (applicantsRepo.bulkCreateForLead as jest.Mock).mockResolvedValue(undefined);
    const fullLead = { id: '10', requestedLoan: createLeadDtoMock.requestedLoan, homeValue: createLeadDtoMock.homeValue, city: createLeadDtoMock.city };
    (leadsRepo.findByIdInTx as jest.Mock).mockResolvedValue(fullLead);
    const simResponse = { idempotencyKey: 'k', simulationId: 's1', cached: false };
    (simulations.createForLeadWithIdempotency as jest.Mock).mockResolvedValue(simResponse);

    // Act
    const result = await service.upsertByPhone(createLeadDtoMock);

    // Assert
    expect(ds.transaction).toHaveBeenCalledTimes(1);
    expect(leadsRepo.findByPhoneInTx).toHaveBeenCalledWith(txManager, createLeadDtoMock.phoneNumber);
    expect(leadsRepo.createLeadInTx).toHaveBeenCalledWith(txManager, {
      phoneNumber: createLeadDtoMock.phoneNumber,
      requestedLoan: createLeadDtoMock.requestedLoan,
      homeValue: createLeadDtoMock.homeValue,
      city: createLeadDtoMock.city,
    });
    expect(applicantsRepo.bulkCreateForLead).toHaveBeenCalledWith(txManager, '10', createLeadDtoMock.applicants);
    expect(leadsRepo.findByIdInTx).toHaveBeenCalledWith(txManager, '10');
    expect(crm.publishLeadSync).toHaveBeenCalledWith('create', fullLead);
    expect(simulations.createForLeadWithIdempotency).toHaveBeenCalledWith('10', {
      requestedLoan: createLeadDtoMock.requestedLoan,
      homeValue: createLeadDtoMock.homeValue,
      city: createLeadDtoMock.city,
    });
    expect(result).toBe(simResponse);
  });

  it('updates an existing lead when phone is found, replaces applicants, and triggers CRM+simulation', async () => {
    // Arrange
    (leadsRepo.findByPhoneInTx as jest.Mock).mockResolvedValue({ id: '77' });
    (leadsRepo.updateLeadInTx as jest.Mock).mockResolvedValue(undefined);
    (applicantsRepo.replaceForLeadInTx as jest.Mock).mockResolvedValue(undefined);
    const fullLead = { id: '77', requestedLoan: createLeadDtoMock.requestedLoan, homeValue: createLeadDtoMock.homeValue, city: createLeadDtoMock.city };
    (leadsRepo.findByIdInTx as jest.Mock).mockResolvedValue(fullLead);
    const simResponse = { idempotencyKey: 'k2', simulationId: 's2', cached: false } as any;
    (simulations.createForLeadWithIdempotency as jest.Mock).mockResolvedValue(simResponse);

    // Act
    const result = await service.upsertByPhone(createLeadDtoMock);

    // Assert
    expect(leadsRepo.createLeadInTx).not.toHaveBeenCalled();
    expect(leadsRepo.updateLeadInTx).toHaveBeenCalledWith(txManager, '77', {
      requestedLoan: createLeadDtoMock.requestedLoan,
      homeValue: createLeadDtoMock.homeValue,
      city: createLeadDtoMock.city,
    });
    expect(applicantsRepo.replaceForLeadInTx).toHaveBeenCalledWith(txManager, '77', createLeadDtoMock.applicants);
    expect(leadsRepo.findByIdInTx).toHaveBeenCalledWith(txManager, '77');
    expect(crm.publishLeadSync).toHaveBeenCalledWith('update', fullLead);
    expect(simulations.createForLeadWithIdempotency).toHaveBeenCalled();
    expect(result).toBe(simResponse);
  });
});
