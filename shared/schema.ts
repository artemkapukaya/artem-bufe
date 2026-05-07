import {
    mysqlTable,
    int,
    varchar,
    timestamp,
    text,
} from "drizzle-orm/mysql-core";

export const orders = mysqlTable("orders", {
    id:           int("id").primaryKey().autoincrement(),
    userId:       int("user_id").notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    totalAmount:  int("total_amount").notNull(),
    orderNumber:  varchar("order_number", { length: 500 }).notNull().default(""),
    status:       varchar("status", { length: 50 }).notNull().default("pending"),
    notes:        text("notes"),
    createdAt:    timestamp("created_at").defaultNow(),
    updatedAt:    timestamp("updated_at").defaultNow().onUpdateNow(),
});
