import { expect, test, describe, beforeAll } from "bun:test";
import { TransaksiService } from "../services/transaksi.service";
import { db } from "../db";
import { users, kantong, tipeKantong, tipeTransaksi, metodeBayar } from "../db/schema";
import { eq } from "drizzle-orm";
import { TIPE_TRANSAKSI } from "../utils/constants";

describe("TransaksiService", () => {
    const transaksiService = new TransaksiService();
    let testUser: any;
    let testPocket: any;
    let destPocket: any;
    let testMetode: any;

    beforeAll(async () => {
        // Ensure master data
        for (const nama of Object.values(TIPE_TRANSAKSI)) {
            const [existing] = await db.select().from(tipeTransaksi).where(eq(tipeTransaksi.nama, nama));
            if (!existing) await db.insert(tipeTransaksi).values({ nama });
        }

        const [existingMetode] = await db.select().from(metodeBayar).limit(1);
        if (!existingMetode) {
            [testMetode] = await db.insert(metodeBayar).values({ nama: "Cash" }).returning();
        } else {
            testMetode = existingMetode;
        }

        const [existingTipeKantong] = await db.select().from(tipeKantong).limit(1);
        let tId: string;
        if (!existingTipeKantong) {
            const [newTipe] = await db.insert(tipeKantong).values({ nama: "General" }).returning();
            if (!newTipe) throw new Error("Failed to create test tipeKantong");
            tId = newTipe.id;
        } else {
            tId = existingTipeKantong.id;
        }

        // Create test user
        const [user] = await db.insert(users).values({
            fullname: "Test User",
            username: `test_user_${Date.now()}`,
            password: "password123"
        }).returning();
        if (!user) throw new Error("Failed to create test user");
        testUser = user;

        // Create test pockets
        const [p1] = await db.insert(kantong).values({
            userId: testUser.id as string,
            tipeKantongId: tId,
            nama: "Test Pocket",
            saldoAwal: "1000",
            isDefault: true
        }).returning();
        testPocket = p1;

        const [p2] = await db.insert(kantong).values({
            userId: testUser.id as string,
            tipeKantongId: tId,
            nama: "Dest Pocket",
            saldoAwal: "500"
        }).returning();
        destPocket = p2;
    });

describe("Top-up", () => {
        test("should increase balance successfully", async () => {
            const result = await transaksiService.topup({
                userId: testUser.id,
                kantongId: testPocket.id,
                nominal: "500",
                title: "Topup Test",
                deskripsi: "Testing topup",
                metodeBayarId: testMetode.id,
                tanggal: new Date()
            });
            expect(result.balance_after).toBe("1500.00");
        });
    });

    describe("Transfer", () => {
        test("should move balance between pockets correctly", async () => {
            const result = await transaksiService.transfer({
                userId: testUser.id,
                kantongId: testPocket.id,
                kantongTujuanId: destPocket.id,
                nominal: "200",
                title: "Transfer Test",
                deskripsi: "Testing transfer",
                tanggal: new Date()
            });
            expect(result.balance_after_source).toBe("1300.00");
            expect(result.balance_after_dest).toBe("700.00");
        });
    });

    describe("Record (Income/Expense)", () => {
        test("should decrease balance on expense", async () => {
            const result = await transaksiService.record({
                userId: testUser.id,
                type: "EXPENSE",
                kantongId: testPocket.id,
                nominal: "100",
                title: "Expense Test",
                deskripsi: "Testing expense",
                metodeBayarId: testMetode.id,
                tanggal: new Date()
            });
            expect(result.balance_after).toBe("1200.00");
        });

        test("should use default pocket for income if not specified", async () => {
            const result = await transaksiService.record({
                userId: testUser.id,
                type: "INCOME",
                nominal: "300",
                title: "Default Income Test",
                deskripsi: "Testing default pocket",
                metodeBayarId: testMetode.id,
                tanggal: new Date()
            });
            expect(result.kantongId).toBe(testPocket.id);
            expect(result.balance_after).toBe("1500.00");
        });
    });

    describe("Validations", () => {
        test("should throw error for insufficient balance", async () => {
            const promise = transaksiService.record({
                userId: testUser.id,
                type: "EXPENSE",
                kantongId: testPocket.id,
                nominal: "5000",
                title: "Large Expense",
                deskripsi: "Should fail",
                metodeBayarId: testMetode.id,
                tanggal: new Date()
            });
            expect(promise).rejects.toThrow("Insufficient balance in pocket");
        });

        test("should throw error for non-positive amount", async () => {
            const promise = transaksiService.topup({
                userId: testUser.id,
                kantongId: testPocket.id,
                nominal: "0",
                title: "Zero Topup",
                deskripsi: "Should fail",
                metodeBayarId: testMetode.id,
                tanggal: new Date()
            });
            expect(promise).rejects.toThrow("Amount must be greater than 0");
        });

        test("should throw error when accessing other user's pocket", async () => {
            const promise = transaksiService.topup({
                userId: "other-user-id",
                kantongId: testPocket.id, // testPocket belongs to testUser
                nominal: "100",
                title: "Unauthorized Topup",
                deskripsi: "Should fail",
                metodeBayarId: testMetode.id,
                tanggal: new Date()
            });
            expect(promise).rejects.toThrow("Forbidden: You do not own this pocket");
        });
    });
});
