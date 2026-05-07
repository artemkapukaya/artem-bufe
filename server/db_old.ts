import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { mysqlTable, int, varchar, timestamp, text } from "drizzle-orm/mysql-core";
import { desc, eq } from "drizzle-orm";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL });
export const db = drizzle(pool);

// ── Tablolar ──────────────────────────────────────────────────────────────────
const orders = mysqlTable("orders", {
    id:           int("id").primaryKey().autoincrement(),
    userId:       int("user_id").notNull().default(1),
    customerName: varchar("customer_name", { length: 255 }).notNull().default("Misafir"),
    totalAmount:  int("total_amount").notNull(),
    orderNumber:  text("order_number").notNull().default(""),
    status:       varchar("status", { length: 50 }).notNull().default("pending"),
    notes:        text("notes"),
    createdAt:    timestamp("created_at").defaultNow(),
    updatedAt:    timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Müşteri profil tablosu — telefon numarası ile tanımlama
const customerProfiles = mysqlTable("customer_profiles", {
    id:          int("id").primaryKey().autoincrement(),
    phone:       varchar("phone", { length: 20 }).notNull().unique(),
    name:        varchar("name", { length: 255 }).notNull(),
    totalGems:   int("total_gems").notNull().default(0),
    totalSpent:  int("total_spent").notNull().default(0),
    orderCount:  int("order_count").notNull().default(0),
    chefNote:    text("chef_note"),
    chefEmoji:   varchar("chef_emoji", { length: 10 }).default("👨‍🍳"),
    createdAt:   timestamp("created_at").defaultNow(),
    updatedAt:   timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ── Başlangıç ────────────────────────────────────────────────────────────────
export async function initDefaultAdmin() {
    console.log("ARTEM BÜFE Sistemi Hazırlanıyor...");
    try {
        const conn = await pool.getConnection();
        // Orders tablosu kolonları
        await conn.query(`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS order_number TEXT NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS notes TEXT,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
        `);
        // Müşteri profil tablosu
        await conn.query(`
            CREATE TABLE IF NOT EXISTS customer_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone VARCHAR(20) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                total_gems INT NOT NULL DEFAULT 0,
                total_spent INT NOT NULL DEFAULT 0,
                order_count INT NOT NULL DEFAULT 0,
                chef_note TEXT,
                chef_emoji VARCHAR(10) DEFAULT '👨‍🍳',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
            )
        `);
        conn.release();
        console.log("✅ Tablolar hazır");
    } catch (e: any) {
        if (!e.message?.includes("Duplicate column")) {
            console.log("Tablo güncelleme notu:", e.message);
        }
    }
    return true;
}

// ── Sipariş Oluştur ───────────────────────────────────────────────────────────
export async function createOrder(data: {
    totalAmount: number;
    statusNotes: string;
    orderNumber: string;
}) {
    const fullRecord = `${data.orderNumber} | ${data.statusNotes}`;
    const nameMatch = data.statusNotes.match(/Müşteri:\s*([^|]+)/);
    const phoneMatch = data.statusNotes.match(/Tel:\s*([^|]+)/);
    const customerName = nameMatch ? nameMatch[1].trim() : "Misafir";
    const phone = phoneMatch ? phoneMatch[1].trim() : "";

    await db.insert(orders).values({
        userId: 1,
        customerName,
        orderNumber: fullRecord,
        totalAmount: data.totalAmount,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // Müşteri profili güncelle — gem biriktir
    if (phone) {
        const gemsEarned = Math.floor(data.totalAmount / 10000) * 5; // her 100 TL = 5 gem (kuruş cinsinden)
        await upsertCustomerProfile(phone, customerName, data.totalAmount, gemsEarned);
    }

    return { success: true };
}

// ── Müşteri Profili Güncelle / Oluştur ───────────────────────────────────────
export async function upsertCustomerProfile(
    phone: string,
    name: string,
    orderAmount: number,
    gemsEarned: number
) {
    const conn = await pool.getConnection();
    try {
        await conn.query(`
            INSERT INTO customer_profiles (phone, name, total_gems, total_spent, order_count)
            VALUES (?, ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                total_gems = total_gems + ?,
                total_spent = total_spent + ?,
                order_count = order_count + 1,
                updated_at = NOW()
        `, [phone, name, gemsEarned, orderAmount, gemsEarned, orderAmount]);
    } finally {
        conn.release();
    }
}

// ── Müşteri Profili Getir ─────────────────────────────────────────────────────
export async function getCustomerProfile(phone: string) {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query(
            'SELECT * FROM customer_profiles WHERE phone = ?', [phone]
        ) as any;
        return rows[0] ?? null;
    } finally {
        conn.release();
    }
}

// ── Müşteri Şef Notu Güncelle ─────────────────────────────────────────────────
export async function updateChefNote(phone: string, note: string, emoji: string) {
    const conn = await pool.getConnection();
    try {
        await conn.query(
            'UPDATE customer_profiles SET chef_note = ?, chef_emoji = ? WHERE phone = ?',
            [note, emoji, phone]
        );
        return { success: true };
    } finally {
        conn.release();
    }
}

// ── Tüm Müşteri Profilleri (Admin) ───────────────────────────────────────────
export async function getAllCustomerProfiles() {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query(
            'SELECT * FROM customer_profiles ORDER BY total_gems DESC'
        ) as any;
        return rows;
    } finally {
        conn.release();
    }
}

// ── Tüm Siparişleri Getir (Admin) ─────────────────────────────────────────────
export async function getAllOrdersForAdmin() {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return rows.map(order => {
        const sep = (order.orderNumber ?? "").indexOf(" | ");
        const shortNumber = sep !== -1 ? order.orderNumber!.substring(0, sep) : `#${order.id}`;
        const statusNotes = sep !== -1 ? order.orderNumber!.substring(sep + 3) : "";
        return { ...order, orderNumber: shortNumber, statusNotes, currentStatus: order.status };
    });
}

// ── Durum Güncelle ────────────────────────────────────────────────────────────
export async function updateOrderStatus(id: number, status: string) {
    const valid = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
    const dbStatus = valid.includes(status) ? status : "pending";
    return await db.update(orders).set({ status: dbStatus, updatedAt: new Date() }).where(eq(orders.id, id));
}

// ── Sipariş Sil ───────────────────────────────────────────────────────────────
export async function deleteOrder(id: number) {
    return await db.delete(orders).where(eq(orders.id, id));
}

// ── Ürün & Kategori (placeholder) ─────────────────────────────────────────────
export async function getAllProducts() { return []; }
export async function createProduct(data: any) { return { success: true }; }
export async function updateProduct(id: number, data: any) { return { success: true }; }
export async function deleteProduct(id: number) { return { success: true }; }
export async function getAllCategories() { return []; }
export async function createCategory(data: any) { return { success: true }; }
export async function deleteCategory(id: number) { return { success: true }; }

/* ── Özel Ürünler (DB tabanlı) ─────────────────────────────────────── */
export async function getCustomProductsFromDB() {
    try {
        const conn = await pool.getConnection();
        const [rows] = await conn.query(
            'SELECT * FROM custom_products ORDER BY created_at DESC'
        ) as any;
        conn.release();
        return rows.map((r: any) => ({
            id: r.product_id,
            name: r.name,
            description: r.description || '',
            price: r.price,
            image: r.image || '',
            category: r.category,
            hasOptions: r.has_options === 1,
        }));
    } catch { return []; }
}

export async function saveCustomProductToDB(product: any) {
    const conn = await pool.getConnection();
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS custom_products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id VARCHAR(100) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price INT NOT NULL DEFAULT 0,
                image MEDIUMTEXT,
                category VARCHAR(100) NOT NULL,
                has_options TINYINT DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        await conn.query(`
            INSERT INTO custom_products (product_id, name, description, price, image, category, has_options)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name=VALUES(name), description=VALUES(description),
                price=VALUES(price), image=VALUES(image),
                category=VALUES(category), has_options=VALUES(has_options)
        `, [product.id, product.name, product.description||'', product.price, product.image||'', product.category, product.hasOptions ? 1 : 0]);
        return { success: true };
    } finally { conn.release(); }
}

export async function deleteCustomProductFromDB(productId: string) {
    const conn = await pool.getConnection();
    try {
        await conn.query('DELETE FROM custom_products WHERE product_id = ?', [productId]);
        return { success: true };
    } finally { conn.release(); }
}

/* ── Kategori Override (DB tabanlı) ────────────────────────────────── */
export async function getCategoryOverridesFromDB() {
    try {
        const conn = await pool.getConnection();
        await conn.query(`
            CREATE TABLE IF NOT EXISTS category_overrides (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id VARCHAR(100) NOT NULL UNIQUE,
                name VARCHAR(255),
                image MEDIUMTEXT,
                icon VARCHAR(20) DEFAULT '🍽️',
                is_custom TINYINT DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        const [rows] = await conn.query('SELECT * FROM category_overrides') as any;
        conn.release();
        // overrides objesi olarak döndür
        const overrides: any = {};
        const customIds: string[] = [];
        rows.forEach((r: any) => {
            overrides[r.category_id] = { name: r.name, image: r.image, icon: r.icon, isCustom: r.is_custom === 1 };
            if (r.is_custom === 1) customIds.push(r.category_id);
        });
        return { overrides, customIds };
    } catch { return { overrides: {}, customIds: [] }; }
}

export async function saveCategoryOverrideToDB(catId: string, data: any) {
    const conn = await pool.getConnection();
    try {
        await conn.query(`
            INSERT INTO category_overrides (category_id, name, image, icon, is_custom)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name=VALUES(name), image=VALUES(image), icon=VALUES(icon)
        `, [catId, data.name||'', data.image||'', data.icon||'🍽️', data.isCustom ? 1 : 0]);
        return { success: true };
    } finally { conn.release(); }
}

export async function deleteCategoryFromDB(catId: string) {
    const conn = await pool.getConnection();
    try {
        await conn.query('DELETE FROM category_overrides WHERE category_id = ?', [catId]);
        return { success: true };
    } finally { conn.release(); }
}
