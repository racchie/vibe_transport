export type TransportationType = 'train' | 'bus';

export interface TravelRecord {
  id: string;
  date: string;
  fromStation: string;
  toStation: string;
  transportationType: TransportationType;
  transportationCompany?: string;
  fare: number;
}

export interface FrequentRoute {
  id: string;
  name: string;
  fromStation: string;
  toStation: string;
  transportationType: TransportationType;
  transportationCompany?: string;
  fare: number;
}