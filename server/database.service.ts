import { db } from "./db";

export async function createCustomerAddress(data: InsertCustomerAddress) {
  const database = await db();
  return database.insert(customerAddresses).values(data);
}