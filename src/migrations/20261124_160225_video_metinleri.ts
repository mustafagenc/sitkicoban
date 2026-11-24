import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { VIDEO_METINLERI } from '../seed/video-metinleri'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "video_metinleri" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now(),
  	"created_at" timestamp(3) with time zone DEFAULT now()
  );
  
  CREATE TABLE "video_metinleri_locales" (
  	"videolar_baslik" varchar,
  	"videolar_aciklama" varchar,
  	"videolar_liste_baslik" varchar,
  	"video_kategori_grubu" varchar,
  	"video_sayisi" varchar,
  	"videolar_bos" varchar,
  	"video_oynat" varchar,
  	"ders_no" varchar,
  	"video_seri_baslik" varchar,
  	"youtubeda_ac" varchar,
  	"tum_videolar_ok" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "video_metinleri_locales" ADD CONSTRAINT "video_metinleri_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."video_metinleri"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "video_metinleri_locales_locale_parent_id_unique" ON "video_metinleri_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "video_metinleri_locales_parent_id_idx" ON "video_metinleri_locales" USING btree ("_parent_id");`)

  // Mevcut ui_metinleri_locales değerlerini koruyarak taşı; boşsa varsayılan metinlerle doldur.
  await db.execute(sql`INSERT INTO "video_metinleri" ("updated_at", "created_at") VALUES (now(), now());`)
  for (const locale of ['tr', 'en', 'ar'] as const) {
    await db.execute(sql`
      INSERT INTO "video_metinleri_locales" (
        "_locale", "_parent_id",
        "videolar_baslik", "videolar_aciklama", "videolar_liste_baslik", "video_kategori_grubu",
        "video_sayisi", "videolar_bos", "video_oynat", "ders_no",
        "video_seri_baslik", "youtubeda_ac", "tum_videolar_ok"
      )
      SELECT
        ${locale}::"_locales",
        vm."id",
        COALESCE(u."videolar_baslik", ${VIDEO_METINLERI.videolarBaslik[locale]}),
        COALESCE(u."videolar_aciklama", ${VIDEO_METINLERI.videolarAciklama[locale]}),
        COALESCE(u."videolar_liste_baslik", ${VIDEO_METINLERI.videolarListeBaslik[locale]}),
        COALESCE(u."video_kategori_grubu", ${VIDEO_METINLERI.videoKategoriGrubu[locale]}),
        COALESCE(u."video_sayisi", ${VIDEO_METINLERI.videoSayisi[locale]}),
        COALESCE(u."videolar_bos", ${VIDEO_METINLERI.videolarBos[locale]}),
        COALESCE(u."video_oynat", ${VIDEO_METINLERI.videoOynat[locale]}),
        COALESCE(u."ders_no", ${VIDEO_METINLERI.dersNo[locale]}),
        COALESCE(u."video_seri_baslik", ${VIDEO_METINLERI.videoSeriBaslik[locale]}),
        COALESCE(u."youtubeda_ac", ${VIDEO_METINLERI.youtubedaAc[locale]}),
        COALESCE(u."tum_videolar_ok", ${VIDEO_METINLERI.tumVideolarOk[locale]})
      FROM (SELECT "id" FROM "video_metinleri" ORDER BY "id" LIMIT 1) vm
      LEFT JOIN "ui_metinleri_locales" u ON u."_locale" = ${locale}::"_locales"
      LIMIT 1;`)
  }

  await db.execute(sql`
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

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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

  UPDATE "ui_metinleri_locales" u SET
    "videolar_baslik" = vm."videolar_baslik",
    "videolar_aciklama" = vm."videolar_aciklama",
    "videolar_liste_baslik" = vm."videolar_liste_baslik",
    "video_kategori_grubu" = vm."video_kategori_grubu",
    "video_sayisi" = vm."video_sayisi",
    "videolar_bos" = vm."videolar_bos",
    "video_oynat" = vm."video_oynat",
    "ders_no" = vm."ders_no",
    "video_seri_baslik" = vm."video_seri_baslik",
    "youtubeda_ac" = vm."youtubeda_ac",
    "tum_videolar_ok" = vm."tum_videolar_ok"
  FROM "video_metinleri_locales" vm
  WHERE u."_locale" = vm."_locale";

  DROP TABLE "video_metinleri_locales" CASCADE;
  DROP TABLE "video_metinleri" CASCADE;`)
}
