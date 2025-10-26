export interface SimulationResponse {
  cached: boolean;
  expiresAt: string;
  simulationId: string;
  results: {
    offers: Array<{
      id: string;
      bank: string;
      product: 'fisso' | 'variabile' | 'misto';
      tan: number;
      taeg: number;
      ltv: number;
      monthlyPayment: number;
      upfrontFees: number;
      durationYears: number;
    }>;
    bestOfferId: string;
    note: string;
  };
}
