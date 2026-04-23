import { db } from "../db";
import { kantong } from "../db/schema";
import { eq, isNull, and } from "drizzle-orm";

export class KantongService {
    async getAll() {
        return await db.select().from(kantong).where(isNull(kantong.deletedAt));
    }

    async getById(id: string) {
        const result = await db.select().from(kantong).where(and(eq(kantong.id, id), isNull(kantong.deletedAt)));
        return result[0];
    }

    async create(data: { userId: string, tipeKantongId: string, nama: string, saldoAwal: string }) {
        const result = await db.insert(kantong).values({
            userId: data.userId,
            tipeKantongId: data.tipeKantongId,
            nama: data.nama,
            saldoAwal: data.saldoAwal,
        }).returning();
        return result[0];
    }

    async update(id: string, data: Partial<{ nama: string, tipeKantongId: string, saldoAwal: string }>) {
        const result = await db.update(kantong)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(kantong.id, id))
            .returning();
        return result[0];
    }

    async delete(id: string) {
        const result = await db.update(kantong)
            .set({ deletedAt: new Date() })
            .where(eq(kantong.id, id))
            .returning();
        return result[0];
    }
}
