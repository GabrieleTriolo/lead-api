import { Test, TestingModule } from '@nestjs/testing';
import { LeadApplicantsService } from './lead-applicants.service';

describe('LeadApplicantsService', () => {
  let service: LeadApplicantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadApplicantsService],
    }).compile();

    service = module.get<LeadApplicantsService>(LeadApplicantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
