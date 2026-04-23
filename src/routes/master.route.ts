import { Elysia, t } from "elysia";
import { MasterService } from "../services/master.service";
import { authMiddleware } from "../middlewares/auth.middleware";

const tipeTransaksiService = new MasterService('tipeTransaksi');
const tipeKantongService = new MasterService('tipeKantong');
const metodeBayarService = new MasterService('metodeBayar');

export const masterRoutes = (app: Elysia) =>
    app
        .use(authMiddleware)
        .group("/master", (group) =>
            group
                .get("/tipe-transaksi", () => tipeTransaksiService.getAll())
                .get("/tipe-kantong", () => tipeKantongService.getAll())
                .get("/metode-bayar", () => metodeBayarService.getAll())
                
                .group("", (group) => 
                    group
                        .onBeforeHandle(({ user, set }) => {
                            if (!user) {
                                set.status = 401;
                                return { success: false, message: "Unauthorized" };
                            }
                        })
                        .post("/tipe-transaksi", ({ body: { nama } }) => tipeTransaksiService.create(nama), { body: t.Object({ nama: t.String() }) })
                        .put("/tipe-transaksi/:id", ({ params: { id }, body: { nama } }) => tipeTransaksiService.update(id, nama), { body: t.Object({ nama: t.String() }) })
                        .delete("/tipe-transaksi/:id", ({ params: { id } }) => tipeTransaksiService.delete(id))
                        
                        .post("/tipe-kantong", ({ body: { nama } }) => tipeKantongService.create(nama), { body: t.Object({ nama: t.String() }) })
                        .put("/tipe-kantong/:id", ({ params: { id }, body: { nama } }) => tipeKantongService.update(id, nama), { body: t.Object({ nama: t.String() }) })
                        .delete("/tipe-kantong/:id", ({ params: { id } }) => tipeKantongService.delete(id))
                        
                        .post("/metode-bayar", ({ body: { nama } }) => metodeBayarService.create(nama), { body: t.Object({ nama: t.String() }) })
                        .put("/metode-bayar/:id", ({ params: { id }, body: { nama } }) => metodeBayarService.update(id, nama), { body: t.Object({ nama: t.String() }) })
                        .delete("/metode-bayar/:id", ({ params: { id } }) => metodeBayarService.delete(id))
                )
        );
