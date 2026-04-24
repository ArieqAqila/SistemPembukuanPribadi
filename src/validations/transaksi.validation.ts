import { t } from "elysia";

export const topupSchema = t.Object({
    kantongId: t.String({ format: "uuid", error: "Invalid pocket ID format" }),
    nominal: t.String({ pattern: "^[0-9]+(\\.[0-9]{1,2})?$", error: "Invalid nominal format (e.g. 100.00)" }),
    title: t.String({ minLength: 3, maxLength: 255 }),
    deskripsi: t.String({ maxLength: 500 }),
    metodeBayarId: t.String({ format: "uuid", error: "Invalid payment method ID format" }),
    tanggal: t.String({ error: "Invalid date format" })
});

export const transferSchema = t.Object({
    kantongId: t.String({ format: "uuid", error: "Invalid source pocket ID format" }),
    kantongTujuanId: t.String({ format: "uuid", error: "Invalid destination pocket ID format" }),
    nominal: t.String({ pattern: "^[0-9]+(\\.[0-9]{1,2})?$", error: "Invalid nominal format" }),
    title: t.String({ minLength: 3, maxLength: 255 }),
    deskripsi: t.String({ maxLength: 500 }),
    tanggal: t.String({ error: "Invalid date format" })
});

export const recordSchema = t.Object({
    type: t.Union([t.Literal("INCOME"), t.Literal("EXPENSE")]),
    kantongId: t.Optional(t.String({ format: "uuid", error: "Invalid pocket ID format" })),
    nominal: t.String({ pattern: "^[0-9]+(\\.[0-9]{1,2})?$", error: "Invalid nominal format" }),
    title: t.String({ minLength: 3, maxLength: 255 }),
    deskripsi: t.String({ maxLength: 500 }),
    metodeBayarId: t.String({ format: "uuid", error: "Invalid payment method ID format" }),
    tanggal: t.String({ error: "Invalid date format" })
});

export const historySchema = t.Object({
    startDate: t.Optional(t.String()),
    endDate: t.Optional(t.String()),
    kantongId: t.Optional(t.String({ format: "uuid" }))
});

export const balancesSchema = t.Object({
    startDate: t.Optional(t.String()),
    endDate: t.Optional(t.String()),
    kantongId: t.Optional(t.String({ format: "uuid" }))
});
