import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "yazi_kategorileri" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sira" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yazi_kategorileri_locales" (
  	"ad" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "yazilar_kaynaklar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"metin" varchar NOT NULL
  );
  
  CREATE TABLE "yazilar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"kategori_id" integer,
  	"tarih" timestamp(3) with time zone,
  	"okuma_suresi_otomatik" boolean DEFAULT true,
  	"okuma_suresi" numeric,
  	"kapak_id" integer,
  	"yayinda" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yazilar_locales" (
  	"baslik" varchar NOT NULL,
  	"ozet" varchar NOT NULL,
  	"govde" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "yazilar_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"kitaplar_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "yazi_kategorileri_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "yazilar_id" integer;
  ALTER TABLE "yazi_kategorileri_locales" ADD CONSTRAINT "yazi_kategorileri_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."yazi_kategorileri"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yazilar_kaynaklar" ADD CONSTRAINT "yazilar_kaynaklar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."yazilar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yazilar" ADD CONSTRAINT "yazilar_kategori_id_yazi_kategorileri_id_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."yazi_kategorileri"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "yazilar" ADD CONSTRAINT "yazilar_kapak_id_media_id_fk" FOREIGN KEY ("kapak_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "yazilar_locales" ADD CONSTRAINT "yazilar_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."yazilar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yazilar_rels" ADD CONSTRAINT "yazilar_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."yazilar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yazilar_rels" ADD CONSTRAINT "yazilar_rels_kitaplar_fk" FOREIGN KEY ("kitaplar_id") REFERENCES "public"."kitaplar"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "yazi_kategorileri_updated_at_idx" ON "yazi_kategorileri" USING btree ("updated_at");
  CREATE INDEX "yazi_kategorileri_created_at_idx" ON "yazi_kategorileri" USING btree ("created_at");
  CREATE UNIQUE INDEX "yazi_kategorileri_locales_locale_parent_id_unique" ON "yazi_kategorileri_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "yazi_kategorileri_locales_parent_id_idx" ON "yazi_kategorileri_locales" USING btree ("_parent_id");
  CREATE INDEX "yazilar_kaynaklar_order_idx" ON "yazilar_kaynaklar" USING btree ("_order");
  CREATE INDEX "yazilar_kaynaklar_parent_id_idx" ON "yazilar_kaynaklar" USING btree ("_parent_id");
  CREATE INDEX "yazilar_kaynaklar_locale_idx" ON "yazilar_kaynaklar" USING btree ("_locale");
  CREATE UNIQUE INDEX "yazilar_slug_idx" ON "yazilar" USING btree ("slug");
  CREATE INDEX "yazilar_kategori_idx" ON "yazilar" USING btree ("kategori_id");
  CREATE INDEX "yazilar_tarih_idx" ON "yazilar" USING btree ("tarih");
  CREATE INDEX "yazilar_kapak_idx" ON "yazilar" USING btree ("kapak_id");
  CREATE INDEX "yazilar_yayinda_idx" ON "yazilar" USING btree ("yayinda");
  CREATE INDEX "yazilar_updated_at_idx" ON "yazilar" USING btree ("updated_at");
  CREATE INDEX "yazilar_created_at_idx" ON "yazilar" USING btree ("created_at");
  CREATE UNIQUE INDEX "yazilar_locales_locale_parent_id_unique" ON "yazilar_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "yazilar_locales_parent_id_idx" ON "yazilar_locales" USING btree ("_parent_id");
  CREATE INDEX "yazilar_rels_order_idx" ON "yazilar_rels" USING btree ("order");
  CREATE INDEX "yazilar_rels_parent_idx" ON "yazilar_rels" USING btree ("parent_id");
  CREATE INDEX "yazilar_rels_path_idx" ON "yazilar_rels" USING btree ("path");
  CREATE INDEX "yazilar_rels_kitaplar_id_idx" ON "yazilar_rels" USING btree ("kitaplar_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_yazi_kategorileri_fk" FOREIGN KEY ("yazi_kategorileri_id") REFERENCES "public"."yazi_kategorileri"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_yazilar_fk" FOREIGN KEY ("yazilar_id") REFERENCES "public"."yazilar"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_yazi_kategorileri_id_idx" ON "payload_locked_documents_rels" USING btree ("yazi_kategorileri_id");
  CREATE INDEX "payload_locked_documents_rels_yazilar_id_idx" ON "payload_locked_documents_rels" USING btree ("yazilar_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "yazi_kategorileri" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "yazi_kategorileri_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "yazilar_kaynaklar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "yazilar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "yazilar_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "yazilar_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "yazi_kategorileri" CASCADE;
  DROP TABLE "yazi_kategorileri_locales" CASCADE;
  DROP TABLE "yazilar_kaynaklar" CASCADE;
  DROP TABLE "yazilar" CASCADE;
  DROP TABLE "yazilar_locales" CASCADE;
  DROP TABLE "yazilar_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_yazi_kategorileri_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_yazilar_fk";
  
  DROP INDEX "payload_locked_documents_rels_yazi_kategorileri_id_idx";
  DROP INDEX "payload_locked_documents_rels_yazilar_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "yazi_kategorileri_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "yazilar_id";`)
}
