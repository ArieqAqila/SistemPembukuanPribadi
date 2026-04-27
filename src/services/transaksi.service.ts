import { db } from "../db";
import { transaksi, kantong, tipeTransaksi, kategori } from "../db/schema";
import { eq, and, isNull, sql, desc, lte } from "drizzle-orm";
import { TIPE_TRANSAKSI } from "../utils/constants";
import { KategoriService } from "./kategori.service";

export class TransaksiService {
    private kategoriService = new KategoriService();
    private async getTipeId(nama: string) {
        const [result] = await db.select().from(tipeTransaksi).where(and(eq(tipeTransaksi.nama, nama), isNull(tipeTransaksi.deletedAt)));
        if (!result) throw new Error(`Transaction type ${nama} not found`);
        return result.id;
    }

    private async calculateBalanceAfter(kantongId: string, upToDate: Date, userId?: string) {
        const [pocket] = await db.select().from(kantong).where(and(eq(kantong.id, kantongId), isNull(kantong.deletedAt)));
        if (!pocket) throw new Error("Pocket not found");
        
        if (userId && pocket.userId !== userId) {
            throw new Error("Forbidden: You do not own this pocket");
        }

        const [sumResult] = await db.select({
            total: sql<string>`sum(
                case 
                    when tipe_transaksi.nama in (${TIPE_TRANSAKSI.TOPUP}, ${TIPE_TRANSAKSI.INCOME}) then nominal 
                    when tipe_transaksi.nama = ${TIPE_TRANSAKSI.TRANSFER} and kantong_tujuan_id = ${kantongId} then nominal
                    when tipe_transaksi.nama = ${TIPE_TRANSAKSI.TRANSFER} and kantong_id = ${kantongId} then -nominal
                    else -nominal 
                end
            )`
        })
        .from(transaksi)
        .innerJoin(tipeTransaksi, eq(transaksi.tipeTransaksiId, tipeTransaksi.id))
        .where(
            and(
                sql`(${transaksi.kantongId} = ${kantongId} or ${transaksi.kantongTujuanId} = ${kantongId})`,
                sql`${transaksi.tanggal} <= ${upToDate.toISOString()}`
            )
        );

        const balance = parseFloat(pocket.saldoAwal) + (parseFloat(sumResult?.total || "0"));
        return balance.toFixed(2);
    }

    async topup(data: { userId: string, kantongId: string, nominal: string, title: string, deskripsi: string, metodeBayarId: string, tanggal: Date }) {
        if (parseFloat(data.nominal) <= 0) throw new Error("Amount must be greater than 0");
        
        // Validate pocket ownership
        await this.calculateBalanceAfter(data.kantongId, new Date(), data.userId);

        const tipeId = await this.getTipeId(TIPE_TRANSAKSI.TOPUP);
        const [result] = await db.insert(transaksi).values({
            ...data,
            tipeTransaksiId: tipeId,
        }).returning();

        const balanceAfter = await this.calculateBalanceAfter(data.kantongId, data.tanggal, data.userId);
        return { ...result, balance_after: balanceAfter };
    }

    async transfer(data: { userId: string, kantongId: string, kantongTujuanId: string, nominal: string, title: string, deskripsi: string, tanggal: Date, categoryId?: string }) {
        if (parseFloat(data.nominal) <= 0) throw new Error("Amount must be greater than 0");
        
        if (data.categoryId) {
            await this.kategoriService.validateCategoryOwnership(data.userId, data.categoryId);
        }

        const tipeId = await this.getTipeId(TIPE_TRANSAKSI.TRANSFER);
        
        // Validate balance and ownership
        const currentBalance = await this.calculateBalanceAfter(data.kantongId, new Date(), data.userId);
        if (parseFloat(currentBalance) < parseFloat(data.nominal)) {
            throw new Error("Insufficient balance in source pocket");
        }

        // Validate destination pocket ownership
        await this.calculateBalanceAfter(data.kantongTujuanId, new Date(), data.userId);

        const [result] = await db.insert(transaksi).values({
            ...data,
            tipeTransaksiId: tipeId,
            kategoriId: data.categoryId ?? null,
        }).returning();

        const balanceAfterSource = await this.calculateBalanceAfter(data.kantongId, data.tanggal, data.userId);
        const balanceAfterDest = await this.calculateBalanceAfter(data.kantongTujuanId, data.tanggal, data.userId);

        return { 
            ...result, 
            balance_after_source: balanceAfterSource,
            balance_after_dest: balanceAfterDest 
        };
    }

    async record(data: { userId: string, type: 'INCOME' | 'EXPENSE', kantongId?: string, nominal: string, title: string, deskripsi: string, metodeBayarId: string, tanggal: Date, categoryId?: string }) {
        if (parseFloat(data.nominal) <= 0) throw new Error("Amount must be greater than 0");

        if (data.categoryId) {
            await this.kategoriService.validateCategoryOwnership(data.userId, data.categoryId);
        }

        const tipeId = await this.getTipeId(data.type);
        
        let targetKantongId = data.kantongId;
        if (!targetKantongId) {
            const [mainPocket] = await db.select().from(kantong).where(and(eq(kantong.userId, data.userId), eq(kantong.isDefault, true)));
            if (!mainPocket) throw new Error("Main pocket not found");
            targetKantongId = mainPocket.id;
        }

        if (data.type === 'EXPENSE') {
            const currentBalance = await this.calculateBalanceAfter(targetKantongId, new Date(), data.userId);
            if (parseFloat(currentBalance) < parseFloat(data.nominal)) {
                throw new Error("Insufficient balance in pocket");
            }
        } else {
            // Validate ownership for income as well
            await this.calculateBalanceAfter(targetKantongId, new Date(), data.userId);
        }

        const [result] = await db.insert(transaksi).values({
            userId: data.userId,
            kantongId: targetKantongId,
            tipeTransaksiId: tipeId,
            title: data.title,
            deskripsi: data.deskripsi,
            nominal: data.nominal,
            metodeBayarId: data.metodeBayarId,
            kategoriId: data.categoryId ?? null,
            tanggal: data.tanggal
        }).returning();

        const balanceAfter = await this.calculateBalanceAfter(targetKantongId, data.tanggal, data.userId);
        return { ...result, balance_after: balanceAfter };
    }

    async getHistory(userId: string, filters: { startDate?: string, endDate?: string, kantongId?: string }) {
        const query = db.select({
            id: transaksi.id,
            title: transaksi.title,
            deskripsi: transaksi.deskripsi,
            nominal: transaksi.nominal,
            tanggal: transaksi.tanggal,
            tipe: tipeTransaksi.nama,
            kantong: kantong.nama,
        })
        .from(transaksi)
        .innerJoin(tipeTransaksi, eq(transaksi.tipeTransaksiId, tipeTransaksi.id))
        .innerJoin(kantong, eq(transaksi.kantongId, kantong.id))
        .where(and(
            eq(transaksi.userId, userId),
            filters.startDate ? sql`${transaksi.tanggal} >= ${new Date(filters.startDate)}` : undefined,
            filters.endDate ? sql`${transaksi.tanggal} <= ${new Date(filters.endDate)}` : undefined,
            filters.kantongId 
                ? sql`(${transaksi.kantongId} = ${filters.kantongId} or ${transaksi.kantongTujuanId} = ${filters.kantongId})`
                : sql`${tipeTransaksi.nama} != ${TIPE_TRANSAKSI.TRANSFER}`
        ))
        .orderBy(desc(transaksi.tanggal));

        return await query;
    }

    private async calculateGlobalBalanceAfter(userId: string, upToDate: Date) {
        const pockets = await db.select().from(kantong).where(and(eq(kantong.userId, userId), isNull(kantong.deletedAt)));
        let total = 0;
        for (const pocket of pockets) {
            const balance = await this.calculateBalanceAfter(pocket.id, upToDate, userId);
            total += parseFloat(balance);
        }
        return total.toFixed(2);
    }

    async getBalances(userId: string, filters: { startDate?: string, endDate?: string, kantongId?: string }) {
        const query = db.select({
            id: transaksi.id,
            title: transaksi.title,
            nominal: transaksi.nominal,
            tanggal: transaksi.tanggal,
            tipe: tipeTransaksi.nama,
            kantongId: transaksi.kantongId,
            kantongTujuanId: transaksi.kantongTujuanId,
        })
        .from(transaksi)
        .innerJoin(tipeTransaksi, eq(transaksi.tipeTransaksiId, tipeTransaksi.id))
        .where(and(
            eq(transaksi.userId, userId),
            filters.startDate ? sql`${transaksi.tanggal} >= ${new Date(filters.startDate)}` : undefined,
            filters.endDate ? sql`${transaksi.tanggal} <= ${new Date(filters.endDate)}` : undefined,
            filters.kantongId 
                ? and(
                    sql`(${transaksi.kantongId} = ${filters.kantongId} or ${transaksi.kantongTujuanId} = ${filters.kantongId})`,
                    sql`${tipeTransaksi.nama} in (${TIPE_TRANSAKSI.TOPUP}, ${TIPE_TRANSAKSI.TRANSFER})`
                  )
                : eq(tipeTransaksi.nama, TIPE_TRANSAKSI.TOPUP)
        ))
        .orderBy(desc(transaksi.tanggal));

        const results = await query;
        
        return await Promise.all(results.map(async (t) => {
            const balance_after = filters.kantongId 
                ? await this.calculateBalanceAfter(filters.kantongId, t.tanggal, userId)
                : await this.calculateGlobalBalanceAfter(userId, t.tanggal);
            
            return {
                id: t.id,
                title: t.title,
                nominal: t.nominal,
                tanggal: t.tanggal,
                tipe: t.tipe,
                balance_after
            };
        }));
    }
}
