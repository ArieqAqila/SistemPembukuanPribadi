import { db } from "../db";
import { produk } from "../db/schema";
import { eq, isNull, and } from "drizzle-orm";

export class ProdukService {
    async getAll() {
        return await db.select().from(produk).where(isNull(produk.deletedAt));
    }

    async getById(id: string) {
        const result = await db.select().from(produk).where(and(eq(produk.id, id), isNull(produk.deletedAt)));
        return result[0];
    }

    async create(data: { userId: string, nama: string, harga: string }) {
        const result = await db.insert(produk).values({
            userId: data.userId,
            nama: data.nama,
            harga: data.harga,
        }).returning();
        return result[0];
    }

    async update(id: string, data: Partial<{ nama: string, harga: string }>) {
        const result = await db.update(produk)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(produk.id, id))
            .returning();
        return result[0];
    }

    async delete(id: string) {
        const result = await db.update(produk)
            .set({ deletedAt: new Date() })
            .where(eq(produk.id, id))
            .returning();
        return result[0];
    }
}
