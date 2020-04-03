import {
  BaseDocument,
  PaginatedApiResponse,
  Part,
  SuppAdd,
  Address,
  ApiDocument
} from "solo-types";
import * as faker from "faker";

interface CompleteAPIDoc extends BaseDocument {
  service_request: string;
  part: Part;
  suppadd: SuppAdd;
  ship_to: Address;
  holder: Address;
}

export const defaultApiDoc: CompleteAPIDoc = {
  id: 1,
  statuses: [
    {
      id: 1,
      dic: "AE1",
      status_date: "2020-03-01T21:47:13-05:00",
      key_and_transmit_date: null,
      esd: "2020-03-20",
      projected_qty: 2,
      received_qty: null,
      document: 1
    },
    {
      id: 2,
      dic: "AS1",
      status_date: "2020-03-05T21:47:56-05:00",
      key_and_transmit_date: null,
      esd: null,
      projected_qty: 2,
      received_qty: null,
      document: 1
    }
  ],
  suppadd: {
    id: 1,
    subinventorys: [
      {
        id: 1,
        locators: [
          {
            id: 1,
            code: "M1234AA",
            desc: "",
            subinventorys: 1
          },
          {
            id: 2,
            code: "M1235A",
            desc: "",
            subinventorys: 1
          },
          {
            id: 3,
            code: "M1236",
            desc: "",
            subinventorys: 1
          }
        ],
        code: "MTM_STGE",
        desc: "",
        suppadd: 1
      },
      {
        id: 2,
        locators: [
          {
            id: 3,
            code: "M2296",
            desc: "",
            subinventorys: 1
          }
        ],
        code: "MTM_LAY",
        desc: "",
        suppadd: 1
      },
      {
        id: 3,
        locators: [
          {
            id: 3,
            code: "M3336",
            desc: "",
            subinventorys: 1
          }
        ],
        code: "MTM_PEB",
        desc: "",
        suppadd: 1
      }
    ],
    code: "YMTM"
  },
  part: {
    id: 2,
    nsn: "5430015061999",
    nomen: "TANK,LIQUID STORAGE",
    uom: "ea",
    price: 15,
    sac: 1,
    serial_control_flag: "n",
    lot_control_flag: "n",
    recoverability_code: "z",
    shelf_life_code: 0,
    controlled_inv_item_code: "u"
  },
  service_request: "12345678",
  ship_to: {
    id: 4,
    name: "AAC-M30300",
    ric: "SMS"
  },
  holder: {
    id: 3,
    name: "requestor",
    ric: "5E3"
  },
  sdn: "M3030012341234"
};

export const defaultApiResponse: PaginatedApiResponse<CompleteAPIDoc[]> = {
  results: [defaultApiDoc],
  count: 100,
  next: 1,
  previous: 2
};

const dics = ["AE1", "AS1", "AS2", "D6T", "COR"];

const createFakeApiDocuments = (count: number = 20): ApiDocument[] => {
  return Array.from({ length: count }).map(() => ({
    ...defaultApiDoc,
    statuses: Array.from({
      length: faker.random.number({ min: 1, max: 5 })
    }).map((_, idx) => ({
      id: Math.floor(Math.random() * 2000),
      status_date: faker.date.recent().toISOString(),
      key_and_transmit_date: null,
      esd: "2020-03-20",
      projected_qty: 20,
      received_qty: faker.random.number(20),
      document: 1,
      dic: dics[idx]
    })),
    service_request: faker.random.alphaNumeric(8).toUpperCase(),
    part: {
      ...defaultApiDoc.part,
      nomen: faker.commerce.productName(),
      id: faker.random.number(1000),
      nsn: faker.random.alphaNumeric(8),
      uom: "EA"
    },
    ship_to: {
      ...defaultApiDoc.ship_to,
      name: faker.company.companyName(),
      id: faker.random.number(1000),
      ric: faker.random.alphaNumeric(3)
    },
    holder: {
      ...defaultApiDoc.holder,
      name: faker.company.companyName(),
      id: faker.random.number(1000),
      ric: faker.random.alphaNumeric(3)
    },
    sdn: `M30300${faker.finance.account(8)}`
  }));
};

export default createFakeApiDocuments;
