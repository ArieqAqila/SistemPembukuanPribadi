import { expect, test, describe, beforeAll } from "bun:test";
import { KategoriService } from "../services/kategori.service";
import { TransaksiService } from "../services/transaksi.service";
import { db } from "../db";
import {
  users,
  kantong,
  tipeKantong,
  tipeTransaksi,
  metodeBayar,
  kategori,
  transaksi,
} from "../db/schema";
import { eq } from "drizzle-orm";
import { TIPE_TRANSAKSI } from "../utils/constants";

describe("Category Service", () => {
  const kategoriService = new KategoriService();
  const transaksiService = new TransaksiService();
  let userA: any;
  let userB: any;
  let userAPocket: any;
  let testMetode: any;
  let userACategoryId: string;

  beforeAll(async () => {
    for (const nama of Object.values(TIPE_TRANSAKSI)) {
      const [existing] = await db
        .select()
        .from(tipeTransaksi)
        .where(eq(tipeTransaksi.nama, nama));
      if (!existing) await db.insert(tipeTransaksi).values({ nama });
    }

    const [existingMetode] = await db.select().from(metodeBayar).limit(1);
    if (!existingMetode) {
      [testMetode] = await db
        .insert(metodeBayar)
        .values({ nama: "Cash" })
        .returning();
    } else {
      testMetode = existingMetode;
    }

    const [existingTipeKantong] = await db.select().from(tipeKantong).limit(1);
    let tId: string;
    if (!existingTipeKantong) {
      const [newTipe] = await db
        .insert(tipeKantong)
        .values({ nama: "General" })
        .returning();
      tId = newTipe!.id;
    } else {
      tId = existingTipeKantong.id;
    }

    const [uA] = await db
      .insert(users)
      .values({
        fullname: "Category User A",
        username: `cat_user_a_${Date.now()}`,
        password: "password12345678",
      })
      .returning();
    userA = uA;

    const [uB] = await db
      .insert(users)
      .values({
        fullname: "Category User B",
        username: `cat_user_b_${Date.now()}`,
        password: "password12345678",
      })
      .returning();
    userB = uB;

    const [p1] = await db
      .insert(kantong)
      .values({
        userId: userA.id,
        tipeKantongId: tId,
        nama: "Cat Test Pocket",
        saldoAwal: "10000",
        isDefault: true,
      })
      .returning();
    userAPocket = p1;
  });

  describe("Get Categories", () => {
    test("should return system categories and user-owned categories", async () => {
      const result = await kategoriService.getAll(userA.id);
      const systemCats = result.filter((c) => !c.is_owned_by_user);
      expect(systemCats.length).toBeGreaterThanOrEqual(5);
    });

    test("should not return categories owned by other users", async () => {
      await kategoriService.create(userB.id, "User B Private Cat");
      const result = await kategoriService.getAll(userA.id);
      const hasUserBCat = result.some((c) => c.name === "User B Private Cat");
      expect(hasUserBCat).toBe(false);
    });
  });

  describe("Create Category", () => {
    test("should create a new category for the authenticated user", async () => {
      const result = await kategoriService.create(userA.id, "Investasi");
      userACategoryId = result.category_id;
      expect(result.name).toBe("Investasi");
      expect(result.is_default).toBe(false);
    });

    test("should throw error if name is empty", async () => {
      const promise = kategoriService.create(userA.id, " ");
      await expect(promise).rejects.toThrow("Category name is required");
    });

    test("should throw error if category name already exists for the user", async () => {
      try {
        await kategoriService.create(userA.id, "Investasi");
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toBe("Category name already exists");
      }
    });

    test("should ignore or reject is_default field from user input", async () => {
      const result = await kategoriService.create(userA.id, "Test Default Reject");
      expect(result.is_default).toBe(false);
    });
  });

  describe("Update Category", () => {
    test("should update category name if owned by the user", async () => {
      const result = await kategoriService.update(
        userA.id,
        userACategoryId,
        "Investasi & Saham"
      );
      expect(result.name).toBe("Investasi & Saham");
    });

    test("should throw error if category does not belong to the user", async () => {
      try {
        await kategoriService.update(userB.id, userACategoryId, "Hacked");
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toBe("Category does not belong to the user");
      }
    });

    test("should throw error if trying to update a system category", async () => {
      const allCats = await kategoriService.getAll(userA.id);
      const systemCat = allCats.find((c) => c.is_default && !c.is_owned_by_user);
      expect(systemCat).toBeDefined();
      try {
        await kategoriService.update(userA.id, systemCat!.category_id, "Hacked System");
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toBe("Cannot update system category");
      }
    });
  });

  describe("Delete Category", () => {
    test("should soft delete a user-owned category", async () => {
      const created = await kategoriService.create(userA.id, "To Be Deleted");
      await kategoriService.delete(userA.id, created.category_id);
      const allCats = await kategoriService.getAll(userA.id);
      const found = allCats.find((c) => c.category_id === created.category_id);
      expect(found).toBeUndefined();
    });

    test("should set kategori_id to null on related transactions when category is deleted", async () => {
      const created = await kategoriService.create(userA.id, "Linked Category");
      await transaksiService.record({
        userId: userA.id,
        type: "EXPENSE",
        kantongId: userAPocket.id,
        nominal: "100",
        title: "Linked Expense",
        deskripsi: "Testing linked delete",
        metodeBayarId: testMetode.id,
        tanggal: new Date(),
        categoryId: created.category_id,
      });

      await kategoriService.delete(userA.id, created.category_id);

      const [txn] = await db
        .select()
        .from(transaksi)
        .where(eq(transaksi.title, "Linked Expense"));
      expect(txn!.kategoriId).toBeNull();
    });

    test("should throw error if category does not belong to the user", async () => {
      try {
        await kategoriService.delete(userB.id, userACategoryId);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toBe("Category does not belong to the user");
      }
    });

    test("should throw error if trying to delete a system category", async () => {
      const allCats = await kategoriService.getAll(userA.id);
      const systemCat = allCats.find((c) => c.is_default && !c.is_owned_by_user);
      expect(systemCat).toBeDefined();
      try {
        await kategoriService.delete(userA.id, systemCat!.category_id);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toBe("Cannot delete system category");
      }
    });
  });

  describe("Assign Category to Transaction", () => {
    test("should allow assigning a system category to a transaction", async () => {
      const allCats = await kategoriService.getAll(userA.id);
      const systemCat = allCats.find((c) => c.is_default && !c.is_owned_by_user);

      const result = await transaksiService.record({
        userId: userA.id,
        type: "EXPENSE",
        kantongId: userAPocket.id,
        nominal: "50",
        title: "System Cat Expense",
        deskripsi: "Testing system category",
        metodeBayarId: testMetode.id,
        tanggal: new Date(),
        categoryId: systemCat!.category_id,
      });

      expect(result.kategoriId).toBe(systemCat!.category_id);
    });

    test("should allow assigning a user-owned category to a transaction", async () => {
      const result = await transaksiService.record({
        userId: userA.id,
        type: "EXPENSE",
        kantongId: userAPocket.id,
        nominal: "50",
        title: "Own Cat Expense",
        deskripsi: "Testing own category",
        metodeBayarId: testMetode.id,
        tanggal: new Date(),
        categoryId: userACategoryId,
      });

      expect(result.kategoriId).toBe(userACategoryId);
    });

    test("should throw error if category belongs to another user", async () => {
      const userBCat = await kategoriService.create(userB.id, "User B Exclusive");
      try {
        await transaksiService.record({
          userId: userA.id,
          type: "EXPENSE",
          kantongId: userAPocket.id,
          nominal: "50",
          title: "Cross User Expense",
          deskripsi: "Should fail",
          metodeBayarId: testMetode.id,
          tanggal: new Date(),
          categoryId: userBCat.category_id,
        });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toBe("Category does not belong to the user");
      }
    });
  });
});
