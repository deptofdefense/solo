import { WarehouseUser, PaginatedApiResponse } from "solo-types";
import * as faker from "faker";

export const defaultWareHouseUser: WarehouseUser = {
  userId: 1,
  username: "1234123123",
  first_name: "testFirst",
  last_name: "testLast",
  aac: "testaac",
  canD6T: false,
  canCOR: false,
  loading: false
};

export const defaultUserApiResponse: PaginatedApiResponse<WarehouseUser[]> = {
  results: [defaultWareHouseUser],
  count: 10,
  next: 2,
  previous: 1
};

export const createFakeUsers = (count: number = 25): WarehouseUser[] => {
  return Array.from({ length: count }).map((_, idx) => ({
    ...defaultWareHouseUser,
    userId: idx + 1,
    username: faker.finance.account(10),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    aac: faker.random.arrayElement(["M30300", "M30305"]),
    canCOR: faker.random.boolean(),
    canD6T: faker.random.boolean()
  }));
};
