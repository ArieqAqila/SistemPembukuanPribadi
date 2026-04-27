CREATE TABLE "kategori" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"nama" varchar(255) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "kategori_user_id_nama_unique" UNIQUE("user_id","nama")
);
--> statement-breakpoint
ALTER TABLE "transaksi" ADD COLUMN "kategori_id" uuid;--> statement-breakpoint
ALTER TABLE "kategori" ADD CONSTRAINT "kategori_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_kategori_id_kategori_id_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."kategori"("id") ON DELETE no action ON UPDATE no action;