import { SortingRule } from "react-table";
export { default as createFakeApiDocs, defaultApiDoc } from "./apiDoc";
export { default as createFakeDocs, defaultDoc } from "./doc";

export interface Part {
  id: number;
  nsn: string;
  nomen: string;
  uom: string;
  price: number;
  sac: number;
  serial_control_flag: string;
  lot_control_flag: string;
  recoverability_code: string;
  shelf_life_code: number;
  controlled_inv_item_code: string;
}

export interface Dic {
  id: number;
  code: string;
  desc: string;
}

export interface Status {
  id: number;
  dic: Dic;
  status_date: string;
  key_and_transmit_date?: string | null;
  esd?: string | null;
  received_qty: number | null;
  projected_qty: number;
  document: number;
  user?: number | null;
}

export interface AddressType {
  id: number;
  type: string;
  desc?: string | null;
}

export interface Address {
  id: number;
  address_type: AddressType;
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

export interface ServiceRequest {
  id: number;
  service_request: string;
}

export interface SuppAdd {
  id: number;
  code: string;
  desc: string;
  subinventorys: any;
}

export interface ApiDocument {
  id: number;
  sdn: string;
  service_request: ServiceRequest;
  part: Part;
  statuses: Status[];
  addresses: Address[];
  suppadd: SuppAdd;
}

export interface Document {
  id: number;
  sdn: string;
  serviceRequest: ServiceRequest;
  part: Part;
  statuses: Status[];
  suppadd: Omit<SuppAdd, "subinventorys">;

  shipper?: Address;
  receiver?: Address;
}

export interface Query<T> {
  sort: SortingRule<T>[];
}
