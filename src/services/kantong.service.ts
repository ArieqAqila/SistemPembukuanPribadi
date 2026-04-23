import { db } from "../db";
import { kantong } from "../db/schema";
import { eq, isNull, and, count } from "drizzle-orm";

export class KantongService {
    async getAll() {
        return await db.select().from(kantong).where(isNull(kantong.deletedAt));
    }

    async getByUserId(userId: string) {
        return await db.select().from(kantong).where(and(eq(kantong.userId, userId), isNull(kantong.deletedAt)));
    }

    async getById(id: string) {
        const result = await db.select().from(kantong).where(and(eq(kantong.id, id), isNull(kantong.deletedAt)));
        return result[0];
    }

    async create(data: { userId: string, tipeKantongId: string, nama: string, saldoAwal: string, isDefault?: boolean }) {
        const [pocketCount] = await db.select({ value: count() }).from(kantong).where(and(eq(kantong.userId, data.userId), isNull(kantong.deletedAt)));
        if (!pocketCount || pocketCount.value >= 20) {
            throw new Error("Maximum 20 pockets allowed");
        }

        const result = await db.insert(kantong).values({
            userId: data.userId,
            tipeKantongId: data.tipeKantongId,
            nama: data.nama,
            saldoAwal: data.saldoAwal,
            isDefault: data.isDefault ?? false,
        }).returning();
        return result[0];
    }

    async update(id: string, data: Partial<{ nama: string, tipeKantongId: string, saldoAwal: string }>) {
        const existing = await this.getById(id);
        if (existing && existing.isDefault && data.nama && data.nama !== existing.nama) {
            throw new Error("Default pocket name cannot be changed");
        }

        const result = await db.update(kantong)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(kantong.id, id))
            .returning();
        return result[0];
    }

    async delete(id: string) {
        const existing = await this.getById(id);
        if (existing && existing.isDefault) {
            throw new Error("Default pocket cannot be deleted");
        }

        const result = await db.update(kantong)
            .set({ deletedAt: new Date() })
            .where(eq(kantong.id, id))
            .returning();
        return result[0];
    }
}
