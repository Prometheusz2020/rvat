export interface TechnicalReport {
  id?: string;
  reportNumber: string;
  date: string;
  client: {
    name: string;
    code?: string; // Optional now, often empty
    cnpj?: string; // Added CNPJ
    phone: string;
    email: string; // Added email contact
    address: string;
    city: string;
    contact: string;
  };
  transport: {
    departureDate: string;
    arrivalDate: string;
    departureKm: number;
    arrivalKm: number;
    totalKm: number; // calculated
    departureTime: string;
    arrivalTime: string;
    totalHours: string; // calculated or manual input
  };
  expenses: {
    advances: number;
    fuel: number;
    hotel: number;
    meals: number;
    tolls: number;
    tickets: number;
    others: number;
    sundry: number;
    total: number; // calculated
  };
  serviceHours: Array<{
    day: string;
    in: string;
    out: string;
    total: string;
  }>;
  description: string;
  mattersTreated: string;
  clientObservations: string;
  technicianName: string;
  clientSignature?: string | null;
}

export const initialReport: TechnicalReport = {
  reportNumber: '',
  date: new Date().toISOString().split('T')[0],
  client: {
    name: '',
    code: '',
    cnpj: '',
    phone: '',
    email: '', // Added email contact
    address: '',
    city: '',
    contact: '',
  },
  transport: {
    departureDate: '',
    arrivalDate: '',
    departureKm: 0,
    arrivalKm: 0,
    totalKm: 0,
    departureTime: '',
    arrivalTime: '',
    totalHours: '',
  },
  expenses: {
    advances: 0,
    fuel: 0,
    hotel: 0,
    meals: 0,
    tolls: 0,
    tickets: 0,
    others: 0,
    sundry: 0,
    total: 0,
  },
  serviceHours: Array(4).fill({
    day: '',
    in: '',
    out: '',
    total: '',
  }),
  description: '',
  mattersTreated: '',
  clientObservations: '',
  technicianName: '',
};
