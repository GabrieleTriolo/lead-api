import { Injectable } from '@nestjs/common';
import { CreateLeadApplicantDto } from './dto/create-lead-applicant.dto';

@Injectable()
export class LeadApplicantsService {
  create(createLeadApplicantDto: CreateLeadApplicantDto) {
    return 'This action adds a new leadApplicant';
  }
}
