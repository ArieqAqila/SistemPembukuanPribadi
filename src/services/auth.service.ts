import { db } from "../db";
import { users, refreshTokens, kantong, tipeKantong } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.util";

export class AuthService {
    async register(data: any) {
        const existingUser = await db.select().from(users).where(and(eq(users.username, data.username), isNull(users.deletedAt)));
        if (existingUser.length > 0) {
            throw new Error("Username already exists");
        }

        const hashedPassword = await Bun.password.hash(data.password);
        
        return await db.transaction(async (tx) => {
            const [newUser] = await tx.insert(users).values({
                fullname: data.fullname,
                username: data.username,
                email: data.email,
                password: hashedPassword,
            }).returning();

            if (!newUser) {
                throw new Error("Registration failed");
            }

            let [tipe] = await tx.select().from(tipeKantong).where(isNull(tipeKantong.deletedAt)).limit(1);
            if (!tipe) {
                const [newTipe] = await tx.insert(tipeKantong).values({ nama: 'General' }).returning();
                if (!newTipe) {
                    throw new Error("Failed to create default pocket type");
                }
                tipe = newTipe;
            }

            await tx.insert(kantong).values({
                userId: newUser.id,
                tipeKantongId: tipe.id,
                nama: "Main Pocket",
                saldoAwal: "0",
                isDefault: true,
            });

            const { password, ...userWithoutPassword } = newUser;
            return userWithoutPassword;
        });
    }

    async login(data: any) {
        const [user] = await db.select().from(users).where(and(eq(users.username, data.username), isNull(users.deletedAt)));
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await Bun.password.verify(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        const accessToken = generateAccessToken({ userId: user.id, username: user.username });
        const refreshToken = generateRefreshToken({ userId: user.id });

        await db.insert(refreshTokens).values({
            userId: user.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const { password, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken
        };
    }

    async refresh(oldRefreshToken: string) {
        const [storedToken] = await db.select().from(refreshTokens).where(and(eq(refreshTokens.token, oldRefreshToken), isNull(refreshTokens.revokedAt)));
        
        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new Error("Invalid or expired refresh token");
        }

        const [user] = await db.select().from(users).where(eq(users.id, storedToken.userId));
        if (!user) {
            throw new Error("User not found");
        }

        // Revoke old token
        await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.id, storedToken.id));

        const accessToken = generateAccessToken({ userId: user.id, username: user.username });
        const newRefreshToken = generateRefreshToken({ userId: user.id });

        // Save new refresh token
        await db.insert(refreshTokens).values({
            userId: user.id,
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return {
            accessToken,
            refreshToken: newRefreshToken
        };
    }

    async logout(token: string) {
        await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.token, token));
        return true;
    }
}
