import { Elysia, t } from "elysia";
import { ProdukService } from "../services/produk.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import type { TokenPayload } from "../utils/jwt.util";

const produkService = new ProdukService();

export const productRoutes = (app: Elysia) =>
    app
        .use(authMiddleware)
        .group("/produk", { isProtected: true }, (group) =>
            group
                .get("/", ({ user }) => produkService.getByUserId((user as TokenPayload).userId))
                .get("/:id", async ({ params: { id }, user, set }) => {
                    const result = await produkService.getById(id);
                    if (!result || result.userId !== (user as TokenPayload).userId) {
                        set.status = 404;
                        return { success: false, message: "Not Found" };
                    }
                    return result;
                })
                .post("/", ({ body, user }) => produkService.create({
                    ...body,
                    userId: (user as TokenPayload).userId
                }), {
                    body: t.Object({
                        nama: t.String(),
                        harga: t.String(),
                    })
                })
                .put("/:id", async ({ params: { id }, body, user, set }) => {
                    const existing = await produkService.getById(id);
                    if (!existing || existing.userId !== (user as TokenPayload).userId) {
                        set.status = 404;
                        return { success: false, message: "Not Found" };
                    }
                    return produkService.update(id, body);
                }, {
                    body: t.Partial(t.Object({
                        nama: t.String(),
                        harga: t.String(),
                    }))
                })
                .delete("/:id", async ({ params: { id }, user, set }) => {
                    const existing = await produkService.getById(id);
                    if (!existing || existing.userId !== (user as TokenPayload).userId) {
                        set.status = 404;
                        return { success: false, message: "Not Found" };
                    }
                    return produkService.delete(id);
                })
        );
