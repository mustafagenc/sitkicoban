import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "video_kategorileri" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sira" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "video_kategorileri_locales" (
  	"ad" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "videolar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"youtube" varchar NOT NULL,
  	"kategori_id" integer,
  	"bolum" numeric,
  	"sure" varchar,
  	"tarih" timestamp(3) with time zone,
  	"kanal" varchar,
  	"kapak_id" integer,
  	"anasayfada" boolean DEFAULT false,
  	"sira" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "videolar_locales" (
  	"baslik" varchar NOT NULL,
  	"alt_baslik" varchar,
  	"seri" varchar,
  	"aciklama" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "video_kategorileri_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "videolar_id" integer;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "videolar_baslik" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "videolar_aciklama" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "videolar_liste_baslik" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "video_kategori_grubu" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "video_sayisi" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "videolar_bos" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "video_oynat" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "ders_no" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "video_seri_baslik" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "youtubeda_ac" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "tum_videolar_ok" varchar;
  ALTER TABLE "video_kategorileri_locales" ADD CONSTRAINT "video_kategorileri_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."video_kategorileri"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videolar" ADD CONSTRAINT "videolar_kategori_id_video_kategorileri_id_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."video_kategorileri"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videolar" ADD CONSTRAINT "videolar_kapak_id_media_id_fk" FOREIGN KEY ("kapak_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videolar_locales" ADD CONSTRAINT "videolar_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."videolar"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "video_kategorileri_updated_at_idx" ON "video_kategorileri" USING btree ("updated_at");
  CREATE INDEX "video_kategorileri_created_at_idx" ON "video_kategorileri" USING btree ("created_at");
  CREATE UNIQUE INDEX "video_kategorileri_locales_locale_parent_id_unique" ON "video_kategorileri_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "video_kategorileri_locales_parent_id_idx" ON "video_kategorileri_locales" USING btree ("_parent_id");
  CREATE INDEX "videolar_kategori_idx" ON "videolar" USING btree ("kategori_id");
  CREATE INDEX "videolar_kapak_idx" ON "videolar" USING btree ("kapak_id");
  CREATE INDEX "videolar_updated_at_idx" ON "videolar" USING btree ("updated_at");
  CREATE INDEX "videolar_created_at_idx" ON "videolar" USING btree ("created_at");
  CREATE UNIQUE INDEX "videolar_locales_locale_parent_id_unique" ON "videolar_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "videolar_locales_parent_id_idx" ON "videolar_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_video_kategorileri_fk" FOREIGN KEY ("video_kategorileri_id") REFERENCES "public"."video_kategorileri"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videolar_fk" FOREIGN KEY ("videolar_id") REFERENCES "public"."videolar"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_video_kategorileri_id_idx" ON "payload_locked_documents_rels" USING btree ("video_kategorileri_id");
  CREATE INDEX "payload_locked_documents_rels_videolar_id_idx" ON "payload_locked_documents_rels" USING btree ("videolar_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "video_kategorileri" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "video_kategorileri_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "videolar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "videolar_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "video_kategorileri" CASCADE;
  DROP TABLE "video_kategorileri_locales" CASCADE;
  DROP TABLE "videolar" CASCADE;
  DROP TABLE "videolar_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_video_kategorileri_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_videolar_fk";
  
  DROP INDEX "payload_locked_documents_rels_video_kategorileri_id_idx";
  DROP INDEX "payload_locked_documents_rels_videolar_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "video_kategorileri_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "videolar_id";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "videolar_baslik";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "videolar_aciklama";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "videolar_liste_baslik";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "video_kategori_grubu";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "video_sayisi";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "videolar_bos";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "video_oynat";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "ders_no";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "video_seri_baslik";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "youtubeda_ac";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "tum_videolar_ok";`)
}
