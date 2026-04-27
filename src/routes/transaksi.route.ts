import { Elysia } from "elysia";
import { TransaksiService } from "../services/transaksi.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import { topupSchema, transferSchema, recordSchema, historySchema, balancesSchema } from "../validations/transaksi.validation";
import type { TokenPayload } from "../utils/jwt.util";

const transaksiService = new TransaksiService();

export const transaksiRoutes = (app: Elysia) =>
    app
        .use(authMiddleware)
        .group("/transactions", (group) =>
            group
                .onBeforeHandle(({ user, set }) => {
                    if (!user) {
                        set.status = 401;
                        return { success: false, message: "Unauthorized" };
                    }
                })
                .post("/topup", async ({ body, user }) => {
                    return await transaksiService.topup({
                        ...body,
                        userId: (user as TokenPayload).userId,
                        tanggal: new Date(body.tanggal)
                    });
                }, {
                    body: topupSchema
                })
                .post("/transfer", async ({ body, user }) => {
                    return await transaksiService.transfer({
                        ...body,
                        userId: (user as TokenPayload).userId,
                        tanggal: new Date(body.tanggal),
                        categoryId: body.category_id
                    });
                }, {
                    body: transferSchema
                })
                .post("/record", async ({ body, user }) => {
                    return await transaksiService.record({
                        ...body,
                        userId: (user as TokenPayload).userId,
                        tanggal: new Date(body.tanggal),
                        categoryId: body.category_id
                    });
                }, {
                    body: recordSchema
                })
                .get("/history", async ({ query, user }) => {
                    return await transaksiService.getHistory((user as TokenPayload).userId, query);
                }, {
                    query: historySchema
                })
                .get("/balances", async ({ query, user }) => {
                    return await transaksiService.getBalances((user as TokenPayload).userId, query);
                }, {
                    query: balancesSchema
                })
        );
