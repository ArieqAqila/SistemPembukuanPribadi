import { db } from "../db";
import { users } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";

export class UserService {
    async getAll() {
        return await db.select().from(users).where(isNull(users.deletedAt));
    }

    async getById(id: string) {
        const result = await db.select().from(users).where(and(eq(users.id, id), isNull(users.deletedAt)));
        return result[0];
    }

    async create(data: any) {
        const hashedPassword = await Bun.password.hash(data.password);
        const result = await db.insert(users).values({
            fullname: data.fullname,
            username: data.username,
            password: hashedPassword,
        }).returning();
        return result[0];
    }

    async update(id: string, data: any) {
        if (data.username) {
            const [existing] = await db.select().from(users).where(
                and(
                    eq(users.username, data.username),
                    isNull(users.deletedAt)
                )
            );
            if (existing && existing.id !== id) {
                throw new Error("Username already exists");
            }
        }

        if (data.email) {
            const [existing] = await db.select().from(users).where(
                and(
                    eq(users.email, data.email),
                    isNull(users.deletedAt)
                )
            );
            if (existing && existing.id !== id) {
                throw new Error("Email already exists");
            }
        }

        if (data.password) {
            data.password = await Bun.password.hash(data.password);
        }

        const result = await db.update(users)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(users.id, id))
            .returning();
        return result[0];
    }

    async delete(id: string) {
        const result = await db.update(users)
            .set({ deletedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return result[0];
    }
}
