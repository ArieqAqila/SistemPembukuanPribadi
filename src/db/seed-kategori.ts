import { db } from "./index";
import { kategori } from "./schema";
import { eq, and, isNull } from "drizzle-orm";

const DEFAULT_CATEGORIES = [
  "Makanan & Minuman",
  "Transportasi",
  "Kesehatan",
  "Hiburan",
  "Pindah Dana",
];

async function seed() {
  for (const nama of DEFAULT_CATEGORIES) {
    const [existing] = await db
      .select()
      .from(kategori)
      .where(and(eq(kategori.nama, nama), isNull(kategori.userId)));

    if (!existing) {
      await db.insert(kategori).values({
        nama,
        isDefault: true,
      });
    }
  }

  console.log("Default categories seeded successfully");
  process.exit(0);
}

seed();
