import { db } from "../db";
import { tipeTransaksi, tipeKantong, metodeBayar } from "../db/schema";
import { eq, isNull, and } from "drizzle-orm";

export class MasterService {
    private table: any;

    constructor(tableName: 'tipeTransaksi' | 'tipeKantong' | 'metodeBayar') {
        if (tableName === 'tipeTransaksi') this.table = tipeTransaksi;
        else if (tableName === 'tipeKantong') this.table = tipeKantong;
        else this.table = metodeBayar;
    }

    async getAll() {
        return await db.select().from(this.table).where(isNull(this.table.deletedAt));
    }

    async getById(id: string) {
        const result = await db.select().from(this.table).where(and(eq(this.table.id, id), isNull(this.table.deletedAt)));
        return result[0];
    }

    async create(nama: string) {
        const result = await db.insert(this.table).values({ nama }).returning();
        return result[0];
    }

    async update(id: string, nama: string) {
        const result = await db.update(this.table).set({ nama, updatedAt: new Date() }).where(eq(this.table.id, id)).returning();
        return result[0];
    }

    async delete(id: string) {
        const result = await db.update(this.table).set({ deletedAt: new Date() }).where(eq(this.table.id, id)).returning();
        return result[0];
    }
}
