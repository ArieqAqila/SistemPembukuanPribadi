import { pgTable, uuid, varchar, timestamp, decimal, integer, uniqueIndex, unique, boolean, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  fullname: varchar('fullname', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id).notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
});

export const tipeTransaksi = pgTable('tipe_transaksi', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  nama: varchar('nama', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const tipeKantong = pgTable('tipe_kantong', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  nama: varchar('nama', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const metodeBayar = pgTable('metode_bayar', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  nama: varchar('nama', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const kantong = pgTable('kantong', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  nama: varchar('nama', { length: 255 }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  tipeKantongId: uuid('tipe_kantong_id').references(() => tipeKantong.id).notNull(),
  saldoAwal: decimal('saldo_awal', { precision: 15, scale: 2 }).notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  unq: unique().on(table.userId, table.nama)
}));

export const produk = pgTable('produk', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id).notNull(),
  nama: varchar('nama', { length: 255 }).notNull().unique(),
  harga: decimal('harga', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const penjualan = pgTable('penjualan', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id).notNull(),
  produkId: uuid('produk_id').references(() => produk.id).notNull(),
  kantongId: uuid('kantong_id').references(() => kantong.id).notNull(),
  metodeBayarId: uuid('metode_bayar_id').references(() => metodeBayar.id).notNull(),
  tanggal: timestamp('tanggal').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const transaksi = pgTable('transaksi', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id).notNull(),
  kantongId: uuid('kantong_id').references(() => kantong.id).notNull(),
  kantongTujuanId: uuid('kantong_tujuan_id').references(() => kantong.id),
  tipeTransaksiId: uuid('tipe_transaksi_id').references(() => tipeTransaksi.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  deskripsi: varchar('deskripsi', { length: 500 }).notNull(),
  nominal: decimal('nominal', { precision: 15, scale: 2 }).notNull(),
  metodeBayarId: uuid('metode_bayar_id').references(() => metodeBayar.id),
  tanggal: timestamp('tanggal').notNull(),
  refType: varchar('ref_type', { length: 50 }),
  refId: uuid('ref_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('transaksi_user_id_idx').on(table.userId),
  kantongIdIdx: index('transaksi_kantong_id_idx').on(table.kantongId),
  kantongTujuanIdIdx: index('transaksi_kantong_tujuan_id_idx').on(table.kantongTujuanId),
  tanggalIdx: index('transaksi_tanggal_idx').on(table.tanggal),
  userTanggalIdx: index('transaksi_user_tanggal_idx').on(table.userId, table.tanggal),
}));

export const rumus = pgTable('rumus', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  nama: varchar('nama', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const detailRumus = pgTable('detail_rumus', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  rumusId: uuid('rumus_id').references(() => rumus.id).notNull(),
  tipeTransaksiId: uuid('tipe_transaksi_id').references(() => tipeTransaksi.id).notNull(),
  operator: varchar('operator', { length: 10 }).notNull(),
  urutan: integer('urutan').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
