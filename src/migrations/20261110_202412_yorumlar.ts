import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_yorumlar_durum" AS ENUM('bekliyor', 'onaylandi', 'reddedildi');
  CREATE TYPE "public"."enum_yorumlar_dil" AS ENUM('tr', 'en', 'ar');
  CREATE TABLE "yorumlar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"yazi_id" integer NOT NULL,
  	"durum" "enum_yorumlar_durum" DEFAULT 'bekliyor' NOT NULL,
  	"dil" "enum_yorumlar_dil" NOT NULL,
  	"ad" varchar NOT NULL,
  	"eposta" varchar NOT NULL,
  	"metin" varchar NOT NULL,
  	"cevap" varchar,
  	"cevap_tarihi" timestamp(3) with time zone,
  	"ip_ozeti" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yorum_metinleri" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "yorum_metinleri_locales" (
  	"metinler_baslik" varchar,
  	"metinler_bos" varchar,
  	"metinler_cevap_etiket" varchar,
  	"metinler_form_baslik" varchar,
  	"metinler_form_aciklama" varchar,
  	"metinler_form_ad" varchar,
  	"metinler_form_ad_hata" varchar,
  	"metinler_form_eposta" varchar,
  	"metinler_form_eposta_not" varchar,
  	"metinler_form_eposta_hata" varchar,
  	"metinler_form_metin" varchar,
  	"metinler_form_metin_hata" varchar,
  	"metinler_form_sayac" varchar,
  	"metinler_form_onay" varchar,
  	"metinler_form_aydinlatma" varchar,
  	"metinler_form_onay_hata" varchar,
  	"metinler_form_gonder" varchar,
  	"metinler_form_gonderiliyor" varchar,
  	"metinler_form_basari_baslik" varchar,
  	"metinler_form_basari_metin" varchar,
  	"metinler_form_yeni_yorum" varchar,
  	"metinler_form_hata" varchar,
  	"metinler_form_sinir" varchar,
  	"metinler_form_kullanilamaz" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "yorumlar_id" integer;
  ALTER TABLE "yorumlar" ADD CONSTRAINT "yorumlar_yazi_id_yazilar_id_fk" FOREIGN KEY ("yazi_id") REFERENCES "public"."yazilar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "yorum_metinleri_locales" ADD CONSTRAINT "yorum_metinleri_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."yorum_metinleri"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "yorumlar_yazi_idx" ON "yorumlar" USING btree ("yazi_id");
  CREATE INDEX "yorumlar_durum_idx" ON "yorumlar" USING btree ("durum");
  CREATE INDEX "yorumlar_ip_ozeti_idx" ON "yorumlar" USING btree ("ip_ozeti");
  CREATE INDEX "yorumlar_updated_at_idx" ON "yorumlar" USING btree ("updated_at");
  CREATE INDEX "yorumlar_created_at_idx" ON "yorumlar" USING btree ("created_at");
  CREATE UNIQUE INDEX "yorum_metinleri_locales_locale_parent_id_unique" ON "yorum_metinleri_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "yorum_metinleri_locales_parent_id_idx" ON "yorum_metinleri_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_yorumlar_fk" FOREIGN KEY ("yorumlar_id") REFERENCES "public"."yorumlar"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_yorumlar_id_idx" ON "payload_locked_documents_rels" USING btree ("yorumlar_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "yorumlar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "yorum_metinleri" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "yorum_metinleri_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "yorumlar" CASCADE;
  DROP TABLE "yorum_metinleri" CASCADE;
  DROP TABLE "yorum_metinleri_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_yorumlar_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_yorumlar_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "yorumlar_id";
  DROP TYPE "public"."enum_yorumlar_durum";
  DROP TYPE "public"."enum_yorumlar_dil";`)
}
