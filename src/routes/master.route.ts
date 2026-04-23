import { Elysia, t } from "elysia";
import { MasterService } from "../services/master.service";

const tipeTransaksiService = new MasterService('tipeTransaksi');
const tipeKantongService = new MasterService('tipeKantong');
const metodeBayarService = new MasterService('metodeBayar');

export const masterRoutes = new Elysia()
    .group("/tipe-transaksi", app => app
        .get("/", () => tipeTransaksiService.getAll())
        .get("/:id", ({ params: { id } }) => tipeTransaksiService.getById(id))
        .post("/", ({ body: { nama } }) => tipeTransaksiService.create(nama), { body: t.Object({ nama: t.String() }) })
        .put("/:id", ({ params: { id }, body: { nama } }) => tipeTransaksiService.update(id, nama), { body: t.Object({ nama: t.String() }) })
        .delete("/:id", ({ params: { id } }) => tipeTransaksiService.delete(id))
    )
    .group("/tipe-kantong", app => app
        .get("/", () => tipeKantongService.getAll())
        .get("/:id", ({ params: { id } }) => tipeKantongService.getById(id))
        .post("/", ({ body: { nama } }) => tipeKantongService.create(nama), { body: t.Object({ nama: t.String() }) })
        .put("/:id", ({ params: { id }, body: { nama } }) => tipeKantongService.update(id, nama), { body: t.Object({ nama: t.String() }) })
        .delete("/:id", ({ params: { id } }) => tipeKantongService.delete(id))
    )
    .group("/metode-bayar", app => app
        .get("/", () => metodeBayarService.getAll())
        .get("/:id", ({ params: { id } }) => metodeBayarService.getById(id))
        .post("/", ({ body: { nama } }) => metodeBayarService.create(nama), { body: t.Object({ nama: t.String() }) })
        .put("/:id", ({ params: { id }, body: { nama } }) => metodeBayarService.update(id, nama), { body: t.Object({ nama: t.String() }) })
        .delete("/:id", ({ params: { id } }) => metodeBayarService.delete(id))
    );
