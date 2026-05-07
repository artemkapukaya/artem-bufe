// server/services/admin.service.ts (veya kullandığın dosya adı)
import { getDb } from "../db"; // .ts uzantısını kaldır, getDb kullan
import { eq } from "drizzle-orm";
import { adminCredentials } from "../../drizzle/schema"; // Şema yolunu kontrol et

// Admin login kontrolü - MySQL & Drizzle Uyumlu
export async function verifyAdminCredentials(
    username: string,
    password: string
) {
    try {
        const db = await getDb();
        if (!db) {
            console.error("❌ Veritabanı bağlantısı yok!");
            return false;
        }

        // Drizzle-ORM kullanarak güvenli sorgu yapıyoruz
        // Bu yapı sayesinde 'pg' hatasından ve SQL injection'dan kurtuluruz
        const results = await db
            .select()
            .from(adminCredentials)
            .where(eq(adminCredentials.username, username))
            .limit(1);

        const admin = results[0];

        if (!admin) {
            console.log("❌ Admin bulunamadı:", username);
            return false;
        }

        // Şimdilik düz karşılaştırma (Daha önce db.ts içinde verdiğim verifyPassword'ü de kullanabilirsin)
        // Eğer veritabanında şifreler hash'li değilse:
        if (admin.passwordHash !== password) return false;

        return true;
    } catch (error) {
        console.error("❌ Admin login error:", error);
        return false;
    }
}