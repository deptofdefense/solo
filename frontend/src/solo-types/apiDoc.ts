import { ApiDocument } from "solo-types";

export const defaultApiDoc: ApiDocument = {
  id: 1,
  statuses: [
    {
      id: 1,
      dic: {
        id: 1,
        code: "AE1",
        desc: "in transit"
      },
      status_date: "2020-03-01T21:47:13-05:00",
      key_and_transmit_date: null,
      esd: "2020-03-20",
      projected_qty: 2,
      received_qty: null,
      document: 1
    },
    {
      id: 2,
      dic: {
        id: 2,
        code: "AS1",
        desc: "received"
      },
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
        locators: [],
        code: "MTM_LAY",
        desc: "",
        suppadd: 1
      },
      {
        id: 3,
        locators: [],
        code: "MTM_PEB",
        desc: "",
        suppadd: 1
      }
    ],
    code: "YMTM",
    desc: "Motor Transportation"
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
  service_request: {
    id: 1,
    service_request: "12345678"
  },
  addresses: [
    {
      id: 4,
      address_type: {
        id: 4,
        type: "Bill-To",
        desc: null
      },
      name: "AAC-M30300",
      ric: "SMS",
      addy1: "addy1",
      addy2: "addy2",
      addy3: "bldg 24006 Montezuma",
      city: "Arlington",
      state: "VA",
      zip: "22202",
      country: "United States",
      document: [1]
    },
    {
      id: 3,
      address_type: {
        id: 3,
        type: "Requester",
        desc: null
      },
      name: "requestor",
      ric: "5E3",
      addy1: "addy1",
      addy2: "addy2",
      addy3: "addy3",
      city: "Arlington",
      state: "VA",
      zip: "22202",
      country: "United States",
      document: [1]
    },
    {
      id: 2,
      address_type: {
        id: 2,
        type: "Ship-To",
        desc: null
      },
      name: "shit tp",
      ric: "SMS",
      addy1: "addy1",
      addy2: "addy2",
      addy3: "addy3",
      city: "Arlington",
      state: "VA",
      zip: "22202",
      country: "United States",
      document: [1]
    },
    {
      id: 1,
      address_type: {
        id: 1,
        type: "Holder",
        desc: null
      },
      name: "AAC-M30300",
      ric: "SMS",
      addy1: "addy1",
      addy2: "addy2",
      addy3: "addy3",
      city: "Arlington",
      state: "VA",
      zip: "22202",
      country: "United States",
      document: [1]
    }
  ],
  sdn: "M3030012341234"
};

const createFakeApiDocuments = (count: number = 20): ApiDocument[] => {
  return Array.from({ length: count }).map(() => ({
    ...defaultApiDoc,
    statuses: defaultApiDoc.statuses.map(stat => ({
      ...stat,
      id: Math.floor(Math.random() * 100)
    }))
  }));
};

export default createFakeApiDocuments;
