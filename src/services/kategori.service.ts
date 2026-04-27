import { db } from "../db";
import { kategori, transaksi } from "../db/schema";
import { or, eq, and, isNull } from "drizzle-orm";

export class KategoriService {
  async getAll(userId: string) {
    const results = await db
      .select()
      .from(kategori)
      .where(
        and(
          isNull(kategori.deletedAt),
          or(isNull(kategori.userId), eq(kategori.userId, userId))
        )
      );

    return results.map((k) => ({
      category_id: k.id,
      name: k.nama,
      is_default: k.isDefault,
      is_owned_by_user: k.userId === userId,
    }));
  }

  async create(userId: string, nama: string) {
    if (!nama || nama.trim().length === 0) {
      throw new Error("Category name is required");
    }

    try {
      const [result] = await db
        .insert(kategori)
        .values({
          userId,
          nama: nama.trim(),
          isDefault: false,
        })
        .returning();

      return {
        category_id: result!.id,
        name: result!.nama,
        is_default: result!.isDefault,
      };
    } catch (error: any) {
      const isDuplicate = 
        error.code === "23505" || 
        error.cause?.code === "23505" ||
        error.message?.includes("unique constraint") ||
        error.detail?.includes("already exists");

      if (isDuplicate) {
        throw new Error("Category name already exists");
      }
      throw error;
    }
  }

  async update(userId: string, kategoriId: string, nama: string) {
    const [existing] = await db
      .select()
      .from(kategori)
      .where(and(eq(kategori.id, kategoriId), isNull(kategori.deletedAt)));

    if (!existing) {
      throw new Error("Category not found");
    }

    if (existing.userId === null) {
      throw new Error("Cannot update system category");
    }

    if (existing.userId !== userId) {
      throw new Error("Category does not belong to the user");
    }

    const [result] = await db
      .update(kategori)
      .set({
        nama: nama.trim(),
        updatedAt: new Date(),
      })
      .where(eq(kategori.id, kategoriId))
      .returning();

    return {
      category_id: result!.id,
      name: result!.nama,
    };
  }

  async delete(userId: string, kategoriId: string) {
    const [existing] = await db
      .select()
      .from(kategori)
      .where(and(eq(kategori.id, kategoriId), isNull(kategori.deletedAt)));

    if (!existing) {
      throw new Error("Category not found");
    }

    if (existing.userId === null) {
      throw new Error("Cannot delete system category");
    }

    if (existing.userId !== userId) {
      throw new Error("Category does not belong to the user");
    }

    return await db.transaction(async (tx) => {
      await tx
        .update(transaksi)
        .set({ kategoriId: null })
        .where(eq(transaksi.kategoriId, kategoriId));

      const [result] = await tx
        .update(kategori)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(kategori.id, kategoriId))
        .returning();

      return {
        category_id: result!.id,
        name: result!.nama,
      };
    });
  }

  async validateCategoryOwnership(userId: string, kategoriId: string) {
    const [existing] = await db
      .select()
      .from(kategori)
      .where(and(eq(kategori.id, kategoriId), isNull(kategori.deletedAt)));

    if (!existing) {
      throw new Error("Category not found");
    }

    if (existing.userId !== null && existing.userId !== userId) {
      throw new Error("Category does not belong to the user");
    }

    return true;
  }
}
