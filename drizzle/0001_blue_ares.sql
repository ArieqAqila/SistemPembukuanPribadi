ALTER TABLE "kantong" ADD COLUMN "nama" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "kantong" ADD CONSTRAINT "kantong_user_id_nama_unique" UNIQUE("user_id","nama");--> statement-breakpoint
ALTER TABLE "metode_bayar" ADD CONSTRAINT "metode_bayar_nama_unique" UNIQUE("nama");--> statement-breakpoint
ALTER TABLE "produk" ADD CONSTRAINT "produk_nama_unique" UNIQUE("nama");--> statement-breakpoint
ALTER TABLE "tipe_kantong" ADD CONSTRAINT "tipe_kantong_nama_unique" UNIQUE("nama");--> statement-breakpoint
ALTER TABLE "tipe_transaksi" ADD CONSTRAINT "tipe_transaksi_nama_unique" UNIQUE("nama");