import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "bulten" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "bulten_locales" (
  	"aciklama" varchar NOT NULL,
  	"metinler_baslik" varchar,
  	"metinler_alt_bilgi_baglanti" varchar,
  	"metinler_anasayfa_eyebrow" varchar,
  	"metinler_anasayfa_baslik" varchar,
  	"metinler_anasayfa_metin" varchar,
  	"metinler_anasayfa_baglanti" varchar,
  	"metinler_form_baslik" varchar,
  	"metinler_form_aciklama" varchar,
  	"metinler_form_eposta" varchar,
  	"metinler_form_eposta_hata" varchar,
  	"metinler_form_konular" varchar,
  	"metinler_form_konu_hata" varchar,
  	"metinler_konu_yazilar" varchar,
  	"metinler_konu_kitaplar" varchar,
  	"metinler_konu_eserler" varchar,
  	"metinler_konu_videolar" varchar,
  	"metinler_form_onay" varchar,
  	"metinler_form_aydinlatma" varchar,
  	"metinler_form_onay_hata" varchar,
  	"metinler_form_gonder" varchar,
  	"metinler_form_gonderiliyor" varchar,
  	"metinler_form_basari_baslik" varchar,
  	"metinler_form_basari_metin" varchar,
  	"metinler_form_yeniden" varchar,
  	"metinler_form_hata" varchar,
  	"metinler_form_kullanilamaz" varchar,
  	"metinler_onay_baslik" varchar,
  	"metinler_onay_bekleniyor" varchar,
  	"metinler_onay_basari_baslik" varchar,
  	"metinler_onay_basari_metin" varchar,
  	"metinler_onay_hata" varchar,
  	"metinler_onay_kullanilamaz" varchar,
  	"metinler_onay_bulten_sayfasi" varchar,
  	"metinler_onay_eposta_konu" varchar,
  	"metinler_onay_eposta_metin" varchar,
  	"metinler_onay_eposta_dugme" varchar,
  	"metinler_onay_eposta_not" varchar,
  	"metinler_duyuru_konu_yazi" varchar,
  	"metinler_duyuru_konu_kitap" varchar,
  	"metinler_duyuru_konu_eser" varchar,
  	"metinler_duyuru_konu_video" varchar,
  	"metinler_duyuru_oku" varchar,
  	"metinler_duyuru_gor" varchar,
  	"metinler_duyuru_ayril" varchar,
  	"metinler_push_baslik" varchar,
  	"metinler_push_aciklama" varchar,
  	"metinler_push_ac" varchar,
  	"metinler_push_kapat" varchar,
  	"metinler_push_acik" varchar,
  	"metinler_push_desteklenmiyor" varchar,
  	"metinler_push_iphone" varchar,
  	"metinler_push_izin_yok" varchar,
  	"metinler_push_hata" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "bulten_locales" ADD CONSTRAINT "bulten_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bulten"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "bulten_locales_locale_parent_id_unique" ON "bulten_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "bulten_locales_parent_id_idx" ON "bulten_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "bulten" CASCADE;
  DROP TABLE "bulten_locales" CASCADE;`)
}
