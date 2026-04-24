ALTER TABLE "transaksi" ALTER COLUMN "metode_bayar_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transaksi" ADD COLUMN "kantong_tujuan_id" uuid;--> statement-breakpoint
ALTER TABLE "transaksi" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_kantong_tujuan_id_kantong_id_fk" FOREIGN KEY ("kantong_tujuan_id") REFERENCES "public"."kantong"("id") ON DELETE no action ON UPDATE no action;