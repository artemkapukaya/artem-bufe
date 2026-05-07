import { db } from "../db";
import { orders } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

/**
 * Admin — Tüm siparişleri getir
 */
export const getAllOrdersForAdmin = async () => {
    const rows = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt));

    // orderNumber: "ARTEM-123 | Müşteri: Ad | Tel: ... | Adres: ... | Ödeme: ... | Ürünler: ..."
    // İlk " | "'den sonrasını statusNotes olarak parse ediyoruz
    return rows.map(order => {
        const sep = order.orderNumber.indexOf(" | ");
        const shortNumber = sep !== -1 ? order.orderNumber.substring(0, sep) : order.orderNumber;
        const statusNotes = sep !== -1 ? order.orderNumber.substring(sep + 3) : "";
        return {
            ...order,
            orderNumber: shortNumber,
            statusNotes,
            currentStatus: order.status,
        };
    });
};

/**
 * Kullanıcının siparişleri (profil sayfası için)
 */
export const getOrdersByUserId = async (userId: number) => {
    return await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));
};

/**
 * Sipariş oluştur
 * statusNotes + orderNumber → orderNumber kolonuna birleşik yazılır
 */
export const createOrder = async (data: {
    totalAmount: number;
    statusNotes: string;
    orderNumber: string;
}) => {
    try {
        const fullRecord = `${data.orderNumber} | ${data.statusNotes}`;

        const result = await db.insert(orders).values({
            userId: 1,           // misafir sipariş
            orderNumber: fullRecord,
            totalAmount: data.totalAmount,
            status: "pending",
            pointsEarned: 0,
            pointsUsed: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        console.log("✅ Sipariş oluşturuldu:", data.orderNumber);
        return { success: true, data: result };
    } catch (error) {
        console.error("❌ Sipariş oluşturma hatası:", error);
        return { success: false };
    }
};

/**
 * Sipariş sil
 */
export const deleteOrder = async (id: number) => {
    try {
        await db.delete(orders).where(eq(orders.id, id));
        return { success: true };
    } catch (error) {
        console.error("❌ Sipariş silme hatası:", error);
        return { success: false };
    }
};

/**
 * Sipariş durumunu güncelle
 * Admin panelinden gelen: preparing | on_the_way | delivered | cancelled
 * Schema enum: pending | completed | cancelled
 */
export const updateOrderStatus = async (id: number, status: string) => {
    try {
        let dbStatus: "pending" | "completed" | "cancelled" = "pending";
        if (status === "delivered" || status === "completed") dbStatus = "completed";
        else if (status === "cancelled") dbStatus = "cancelled";

        await db
            .update(orders)
            .set({ status: dbStatus, updatedAt: new Date() })
            .where(eq(orders.id, id));

        return { success: true };
    } catch (error) {
        console.error("❌ Durum güncelleme hatası:", error);
        return { success: false };
    }
};
