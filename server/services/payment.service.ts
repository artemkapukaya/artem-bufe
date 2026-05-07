// server/services/payment.service.ts
import { getDb } from "../db";
import { paymentMethods, payments } from "../../drizzle/schema"; // Yolu kontrol et krall
import { eq } from "drizzle-orm";

export const createPayment = async (data: any) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.insert(payments).values(data);
    return result;
};

export const getPaymentByOrderId = async (orderId: number) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
    return result[0] ?? null;
};

// ÖNEMLÝ: Dashboard'un ödeme yöntemlerini görmesi için burasý boþ dönmemeli
export const getActivePaymentMethods = async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(paymentMethods).where(eq(paymentMethods.isActive, 1));
};

export const getAllPaymentMethods = async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(paymentMethods);
};

export const getPaymentMethodBySlug = async (slug: string) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(paymentMethods).where(eq(paymentMethods.slug, slug)).limit(1);
    return result[0] ?? null;
};

// Varsayýlan ödeme yöntemlerini oluþturma (Uygulama ilk açýldýðýnda çalýþýr)
export const initializeDefaultPaymentMethods = async () => {
    const db = await getDb();
    if (!db) return false;

    const existing = await db.select().from(paymentMethods).limit(1);
    if (existing.length > 0) return true;

    const defaults = [
        { name: "Kapýda Ödeme", slug: "cash", isActive: 1, displayOrder: 1 },
        { name: "Kredi Kartý", slug: "card", isActive: 1, displayOrder: 2 }
    ];

    for (const method of defaults) {
        await db.insert(paymentMethods).values(method);
    }
    return true;
};

// Diðer update/delete fonksiyonlarýný da benzer þekilde db üzerinden güncelleyebilirsin.