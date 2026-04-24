CREATE INDEX "transaksi_user_id_idx" ON "transaksi" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transaksi_kantong_id_idx" ON "transaksi" USING btree ("kantong_id");--> statement-breakpoint
CREATE INDEX "transaksi_kantong_tujuan_id_idx" ON "transaksi" USING btree ("kantong_tujuan_id");--> statement-breakpoint
CREATE INDEX "transaksi_tanggal_idx" ON "transaksi" USING btree ("tanggal");--> statement-breakpoint
CREATE INDEX "transaksi_user_tanggal_idx" ON "transaksi" USING btree ("user_id","tanggal");