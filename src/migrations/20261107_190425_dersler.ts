import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "dersler" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"saat" varchar,
  	"afis_id" integer,
  	"bitis" timestamp(3) with time zone NOT NULL,
  	"sira" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "dersler_locales" (
  	"kurum" varchar NOT NULL,
  	"baslik" varchar NOT NULL,
  	"alt_baslik" varchar,
  	"aciklama" varchar,
  	"gun" varchar NOT NULL,
  	"yer" varchar,
  	"kontenjan" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "media" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "dersler_id" integer;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "dersler_eyebrow" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "dersler_baslik" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "dersler_aciklama" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "kontenjan" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "afisi_buyut" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "bilgi_almak_icin" varchar;
  ALTER TABLE "dersler" ADD CONSTRAINT "dersler_afis_id_media_id_fk" FOREIGN KEY ("afis_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "dersler_locales" ADD CONSTRAINT "dersler_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."dersler"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "dersler_afis_idx" ON "dersler" USING btree ("afis_id");
  CREATE INDEX "dersler_updated_at_idx" ON "dersler" USING btree ("updated_at");
  CREATE INDEX "dersler_created_at_idx" ON "dersler" USING btree ("created_at");
  CREATE UNIQUE INDEX "dersler_locales_locale_parent_id_unique" ON "dersler_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "dersler_locales_parent_id_idx" ON "dersler_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_dersler_fk" FOREIGN KEY ("dersler_id") REFERENCES "public"."dersler"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_dersler_id_idx" ON "payload_locked_documents_rels" USING btree ("dersler_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "dersler" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "dersler_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "dersler" CASCADE;
  DROP TABLE "dersler_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_dersler_fk";
  
  DROP INDEX "payload_locked_documents_rels_dersler_id_idx";
  ALTER TABLE "media" DROP COLUMN "_objectkey";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "dersler_id";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "dersler_eyebrow";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "dersler_baslik";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "dersler_aciklama";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "kontenjan";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "afisi_buyut";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "bilgi_almak_icin";`)
}
