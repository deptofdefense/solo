export interface Part {
  id: number;
  nsn: string;
  nomen: string;
  uom: string;
  document: number[];
}

export interface Dic {
  id: number;
  code: string;
  desc: string;
  status: number[];
}

export interface Status {
  id: number;
  dic: Dic;
  status_date: string;
  key_and_transmit_date?: string | null;
  esd?: string | null;
  qty: number;
  document: number;
  user?: number | null;
}

export interface Address {
  id: number;
  address_type: string;
  name: string;
  ric: string;
  addy1: string;
  addy2: string;
  addy3: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  document: number[];
}

export interface Document {
  id: number;
  sdn: string;
  service_request: number;
  part: Part[];
  status: Status[];
  address: Address[];
}
