import { Document } from "solo-types";

export const defaultDoc: Document = {
  id: 1,
  statuses: [
    {
      id: 1,
      dic: "AS1",
      status_date: "2020-03-01T21:47:13-05:00",
      key_and_transmit_date: null,
      esd: "2020-03-20",
      projected_qty: 2,
      received_qty: null,
      document: 1
    },
    {
      id: 2,
      dic: "AB1",
      status_date: "2020-03-05T21:47:56-05:00",
      key_and_transmit_date: null,
      esd: null,
      projected_qty: 2,
      received_qty: null,
      document: 1
    }
  ],
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
  serviceRequest: "12345678",
  shipTo: {
    id: 4,
    name: "AAC-M30300",
    ric: "SMS"
  },
  holder: {
    id: 3,
    name: "requestor",
    ric: "5E3"
  },
  sdn: "M3030012341234",
  subinventorys: [
    {
      id: 1,
      code: "MTM_STGE"
    },
    {
      id: 2,
      code: "MTM_LAY"
    }
  ],
  locatorsBySubinventory: {
    MTM_LAY: [
      {
        id: 1,
        code: "M9994AA",
        desc: "",
        subinventorys: 1
      },
      {
        id: 2,
        code: "M9995A",
        desc: "",
        subinventorys: 1
      }
    ],
    MTM_STAGE: [
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
      }
    ]
  },
  commodityName: "Armory",
  loadingStatus: {
    loading: false
  },
  mostRecentStatusIdx: 1,
  enteredReceivedBy: "",
  enteredReceivedQty: 2,
  enteredSubinventoryCode: "",
  enteredLocatorCode: ""
};

const createFakeDocuments = (count: number = 20): Document[] => {
  return Array.from({ length: count }).map(() => ({
    ...defaultDoc,
    id: Math.floor(Math.random() * 100)
  }));
};

export default createFakeDocuments;
