import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { createLeadDtoMock } from '../test/mocks/create-lead.dto.mock';

describe('LeadsController', () => {
  let controller: LeadsController;
  let leadsService: { upsertByPhone: jest.Mock };

  beforeEach(async () => {
    leadsService = { upsertByPhone: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [{ provide: LeadsService, useValue: leadsService }],
    }).compile();

    controller = module.get<LeadsController>(LeadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate to LeadsService.upsertByPhone and return its result', async () => {
    const expected = { simulationId: 'sim-1', cached: false };
    leadsService.upsertByPhone.mockResolvedValue(expected);

    const result = await controller.upsert(createLeadDtoMock);

    expect(leadsService.upsertByPhone).toHaveBeenCalledWith(createLeadDtoMock);
    expect(result).toEqual(expected);
  });
});
