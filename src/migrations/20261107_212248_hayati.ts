import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_hayati_bolumler_baglantilar_sayfa" AS ENUM('eserler', 'kitaplar', 'yazilar', 'videolar');
  CREATE TABLE "hocalar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"imza_id" integer,
  	"sira" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "hocalar_locales" (
  	"ad" varchar NOT NULL,
  	"kalemler" varchar NOT NULL,
  	"aciklama" varchar NOT NULL,
  	"sayfa_aciklama" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "hayati_kunye" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"etiket" varchar NOT NULL,
  	"deger" varchar NOT NULL
  );
  
  CREATE TABLE "hayati_bolumler_baglantilar" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"etiket" varchar NOT NULL,
  	"sayfa" "enum_hayati_bolumler_baglantilar_sayfa" NOT NULL
  );
  
  CREATE TABLE "hayati_bolumler" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"baslik" varchar NOT NULL,
  	"govde" jsonb NOT NULL
  );
  
  CREATE TABLE "hayati" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"portre_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "hayati_locales" (
  	"giris_cumlesi" varchar NOT NULL,
  	"kapanis" varchar,
  	"anasayfa_ozet" jsonb NOT NULL,
  	"anasayfa_soz" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hocalar_id" integer;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "hayati_bu_sayfada" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "hayati_portre_alt" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "icazet_eyebrow" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "icazet_baslik" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "anasayfa_hayati_baslik" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "devamini_oku" varchar;
  ALTER TABLE "hocalar" ADD CONSTRAINT "hocalar_imza_id_media_id_fk" FOREIGN KEY ("imza_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hocalar_locales" ADD CONSTRAINT "hocalar_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hocalar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hayati_kunye" ADD CONSTRAINT "hayati_kunye_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hayati"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hayati_bolumler_baglantilar" ADD CONSTRAINT "hayati_bolumler_baglantilar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hayati_bolumler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hayati_bolumler" ADD CONSTRAINT "hayati_bolumler_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hayati"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hayati" ADD CONSTRAINT "hayati_portre_id_media_id_fk" FOREIGN KEY ("portre_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hayati_locales" ADD CONSTRAINT "hayati_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hayati"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "hocalar_imza_idx" ON "hocalar" USING btree ("imza_id");
  CREATE INDEX "hocalar_updated_at_idx" ON "hocalar" USING btree ("updated_at");
  CREATE INDEX "hocalar_created_at_idx" ON "hocalar" USING btree ("created_at");
  CREATE UNIQUE INDEX "hocalar_locales_locale_parent_id_unique" ON "hocalar_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "hocalar_locales_parent_id_idx" ON "hocalar_locales" USING btree ("_parent_id");
  CREATE INDEX "hayati_kunye_order_idx" ON "hayati_kunye" USING btree ("_order");
  CREATE INDEX "hayati_kunye_parent_id_idx" ON "hayati_kunye" USING btree ("_parent_id");
  CREATE INDEX "hayati_kunye_locale_idx" ON "hayati_kunye" USING btree ("_locale");
  CREATE INDEX "hayati_bolumler_baglantilar_order_idx" ON "hayati_bolumler_baglantilar" USING btree ("_order");
  CREATE INDEX "hayati_bolumler_baglantilar_parent_id_idx" ON "hayati_bolumler_baglantilar" USING btree ("_parent_id");
  CREATE INDEX "hayati_bolumler_baglantilar_locale_idx" ON "hayati_bolumler_baglantilar" USING btree ("_locale");
  CREATE INDEX "hayati_bolumler_order_idx" ON "hayati_bolumler" USING btree ("_order");
  CREATE INDEX "hayati_bolumler_parent_id_idx" ON "hayati_bolumler" USING btree ("_parent_id");
  CREATE INDEX "hayati_bolumler_locale_idx" ON "hayati_bolumler" USING btree ("_locale");
  CREATE INDEX "hayati_portre_idx" ON "hayati" USING btree ("portre_id");
  CREATE UNIQUE INDEX "hayati_locales_locale_parent_id_unique" ON "hayati_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "hayati_locales_parent_id_idx" ON "hayati_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hocalar_fk" FOREIGN KEY ("hocalar_id") REFERENCES "public"."hocalar"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_hocalar_id_idx" ON "payload_locked_documents_rels" USING btree ("hocalar_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hocalar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hocalar_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hayati_kunye" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hayati_bolumler_baglantilar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hayati_bolumler" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hayati" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hayati_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "hocalar" CASCADE;
  DROP TABLE "hocalar_locales" CASCADE;
  DROP TABLE "hayati_kunye" CASCADE;
  DROP TABLE "hayati_bolumler_baglantilar" CASCADE;
  DROP TABLE "hayati_bolumler" CASCADE;
  DROP TABLE "hayati" CASCADE;
  DROP TABLE "hayati_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hocalar_fk";
  
  DROP INDEX "payload_locked_documents_rels_hocalar_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hocalar_id";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "hayati_bu_sayfada";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "hayati_portre_alt";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "icazet_eyebrow";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "icazet_baslik";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "anasayfa_hayati_baslik";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "devamini_oku";
  DROP TYPE "public"."enum_hayati_bolumler_baglantilar_sayfa";`)
}
