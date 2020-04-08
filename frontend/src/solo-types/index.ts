import { SortingRule, Filters } from "react-table";
export {
  default as createFakeApiDocs,
  defaultApiDoc,
  defaultApiResponse
} from "./apiDoc";
export * from "./warehouseUsers";
export { default as createFakeDocs, defaultDoc } from "./doc";

export interface Part {
  id: number;
  nsn: string;
  nomen: string;
  uom: string;
  price?: number;
  sac?: number;
  serial_control_flag?: string;
  lot_control_flag?: string;
  recoverability_code?: string;
  shelf_life_code?: number;
  controlled_inv_item_code?: string;
}

export interface Status {
  id: number;
  dic: string;
  status_date: string;
  key_and_transmit_date?: string | null;
  esd?: string | null;
  received_qty: number | null;
  projected_qty: number;
  received_by?: string | null;
  subinventory?: string | null;
  locator?: string | null;
  document: number;
  user?: number | null;
}

export interface Address {
  id: number;
  name: string;
  ric: string;
  city?: string;
  state?: string;
}

export interface Locator {
  id: number;
  code: string;
  desc?: string;
  subinventorys?: number;
}

export interface Subinventory {
  id: number;
  locators: Locator[];
  code: string;
  desc?: string;
  suppadd?: number;
}

export type LocatorMap = Record<string, Locator[]>;

export interface SuppAdd {
  id: number;
  code: string;
  subinventorys: Subinventory[];
}

export interface BaseDocument {
  id: number;
  sdn: string;
  statuses: Status[];
}

export interface ApiDocument extends BaseDocument {
  service_request: string | null;
  part: Part | null;
  suppadd: SuppAdd | null;
  ship_to: Address | null;
  holder: Address | null;
}

export interface Document extends BaseDocument {
  serviceRequest: string;
  part: Part;
  shipTo: Address;
  holder: Address;

  loadingStatus: LoadingStatus;
  subinventorys: Omit<Subinventory, "locators">[];
  locatorsBySubinventory: LocatorMap;
  commodityName: string;
  mostRecentStatusIdx: number;
  enteredReceivedQty: number;
  enteredReceivedBy: string;
  enteredSubinventoryCode: string;
  enteredLocatorCode: string;
}

export interface LoadingStatus {
  loading: boolean;
  error?: boolean;
  message?: string;
}

export interface Query<T extends object> {
  sort: SortingRule<T>[];
  page: number;
  filters: Filters<T>;
}

export interface PaginatedApiResponse<T> {
  results: T;
  count: number;
  next: number;
  previous: number;
}

export interface WarehouseUser extends LoadingStatus {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  dodID: string;
  canD6T: boolean;
  canCOR: boolean;
  aac: string;
  hasModified?: boolean;
}
