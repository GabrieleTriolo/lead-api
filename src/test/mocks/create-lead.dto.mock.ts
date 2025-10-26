import { CreateLeadDto } from '../../leads/dto/create-lead.dto';

export const createLeadDtoMock: CreateLeadDto = {
  phoneNumber: '+3900112233',
  requestedLoan: 100000,
  homeValue: 200000,
  city: 'Torino',
  applicants: [
    {
      type: 'first',
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@example.com',
      birthDate: '1990-01-01',
      monthlyIncome: 2000,
      payFrequency: 13,
    },
  ],
};
