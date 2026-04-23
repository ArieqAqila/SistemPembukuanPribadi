import { Elysia, t } from "elysia";
import { ProdukService } from "../services/produk.service";
import { KantongService } from "../services/kantong.service";

const produkService = new ProdukService();
const kantongService = new KantongService();

export const productPocketRoutes = new Elysia()
    .group("/produk", app => app
        .get("/", () => produkService.getAll())
        .get("/:id", ({ params: { id } }) => produkService.getById(id))
        .post("/", ({ body }) => produkService.create(body), {
            body: t.Object({
                userId: t.String(),
                nama: t.String(),
                harga: t.String(),
            })
        })
        .put("/:id", ({ params: { id }, body }) => produkService.update(id, body), {
            body: t.Partial(t.Object({
                nama: t.String(),
                harga: t.String(),
            }))
        })
        .delete("/:id", ({ params: { id } }) => produkService.delete(id))
    )
    .group("/kantong", app => app
        .get("/", () => kantongService.getAll())
        .get("/:id", ({ params: { id } }) => kantongService.getById(id))
        .post("/", ({ body }) => kantongService.create(body), {
            body: t.Object({
                userId: t.String(),
                tipeKantongId: t.String(),
                nama: t.String(),
                saldoAwal: t.String(),
            })
        })
        .put("/:id", ({ params: { id }, body }) => kantongService.update(id, body), {
            body: t.Partial(t.Object({
                nama: t.String(),
                tipeKantongId: t.String(),
                saldoAwal: t.String(),
            }))
        })
        .delete("/:id", ({ params: { id } }) => kantongService.delete(id))
    );
