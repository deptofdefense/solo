import { Document } from "solo-types";
import { parseISO, sub } from "date-fns";

export const defaultDoc = {
  id: 1,
  part: [
    {
      id: 2,
      nsn: "5930015931045",
      nomen: "Switch, rotary, 24V dc waterproof",
      uom: "ea",
      document: [1]
    }
  ],
  status: [
    {
      id: 1,
      dic: {
        id: 1,
        code: "AS1",
        desc: "Shipping Status",
        status: [1]
      },
      status_date: "2020-03-06T13:01:21-05:00",
      key_and_transmit_date: null,
      esd: null,
      qty: 5,
      document: 1,
      user: null
    },
    {
      id: 2,
      dic: {
        id: 1,
        code: "AS2",
        desc: "Shipping Status",
        status: [1]
      },
      status_date: "2020-03-06T13:01:21-05:00",
      key_and_transmit_date: null,
      esd: null,
      qty: 5,
      document: 1,
      user: null
    }
  ],
  address: [
    {
      id: 7,
      address_type: "1",
      name: "requestor",
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
      id: 8,
      address_type: "2",
      name: "AAC-Residence Inn Arlington Pentagon City: Rm 1103",
      ric: "5E3",
      addy1: "Residence Inn Arlington Pentagon City: Rm 1103",
      addy2: "550 Army Navy Dr",
      addy3: "addy3",
      city: "Arlington",
      state: "VA",
      zip: "22202",
      country: "United States",
      document: [1]
    },
    {
      id: 9,
      address_type: "3",
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
    },
    {
      id: 10,
      address_type: "4",
      name: "AAC-M30300",
      ric: "5E3",
      addy1: "addy1",
      addy2: "addy2",
      addy3: "bldg 24006 Montezuma",
      city: "Arlington",
      state: "VA",
      zip: "22202",
      country: "United States",
      document: [1]
    }
  ],
  sdn: "M0000000000000",
  service_request: 5
};

const createFakeDocuments = (count: number = 20): Document[] => {
  return Array.from({ length: count }).map(() => ({
    ...defaultDoc,
    status: defaultDoc.status.map(stat => ({
      ...stat,
      status_date: sub(parseISO(stat.status_date), {
        days: Math.floor(Math.random() * 10)
      }).toISOString()
    }))
  }));
};

export default createFakeDocuments;
