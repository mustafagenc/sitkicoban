import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "iletisim_maddeler" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"baslik" varchar NOT NULL,
  	"metin" varchar NOT NULL
  );
  
  CREATE TABLE "iletisim_konular" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ad" varchar NOT NULL
  );
  
  CREATE TABLE "iletisim" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "iletisim_locales" (
  	"aciklama" varchar NOT NULL,
  	"metinler_iletisim_ne_icin" varchar,
  	"metinler_iletisim_not" varchar,
  	"metinler_iletisim_eposta" varchar,
  	"metinler_form_baslik" varchar,
  	"metinler_form_aciklama" varchar,
  	"metinler_form_ad" varchar,
  	"metinler_form_eposta" varchar,
  	"metinler_form_konu" varchar,
  	"metinler_form_konu_sec" varchar,
  	"metinler_form_telefon" varchar,
  	"metinler_form_istege_bagli" varchar,
  	"metinler_form_mesaj" varchar,
  	"metinler_form_ad_hata" varchar,
  	"metinler_form_eposta_hata" varchar,
  	"metinler_form_konu_hata" varchar,
  	"metinler_form_mesaj_hata" varchar,
  	"metinler_form_onay_hata" varchar,
  	"metinler_form_sayac" varchar,
  	"metinler_form_onay" varchar,
  	"metinler_form_aydinlatma" varchar,
  	"metinler_form_gonder" varchar,
  	"metinler_form_gonderiliyor" varchar,
  	"metinler_form_basari_baslik" varchar,
  	"metinler_form_basari_metin" varchar,
  	"metinler_form_yeni_mesaj" varchar,
  	"metinler_form_hata" varchar,
  	"metinler_form_kullanilamaz" varchar,
  	"metinler_eser_hakkinda" varchar,
  	"metinler_aydinlatma_baslik" varchar,
  	"metinler_iletisime_don" varchar,
  	"aydinlatma_metni" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "iletisim_maddeler" ADD CONSTRAINT "iletisim_maddeler_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."iletisim"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "iletisim_konular" ADD CONSTRAINT "iletisim_konular_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."iletisim"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "iletisim_locales" ADD CONSTRAINT "iletisim_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."iletisim"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "iletisim_maddeler_order_idx" ON "iletisim_maddeler" USING btree ("_order");
  CREATE INDEX "iletisim_maddeler_parent_id_idx" ON "iletisim_maddeler" USING btree ("_parent_id");
  CREATE INDEX "iletisim_maddeler_locale_idx" ON "iletisim_maddeler" USING btree ("_locale");
  CREATE INDEX "iletisim_konular_order_idx" ON "iletisim_konular" USING btree ("_order");
  CREATE INDEX "iletisim_konular_parent_id_idx" ON "iletisim_konular" USING btree ("_parent_id");
  CREATE INDEX "iletisim_konular_locale_idx" ON "iletisim_konular" USING btree ("_locale");
  CREATE UNIQUE INDEX "iletisim_locales_locale_parent_id_unique" ON "iletisim_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "iletisim_locales_parent_id_idx" ON "iletisim_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "iletisim_maddeler" CASCADE;
  DROP TABLE "iletisim_konular" CASCADE;
  DROP TABLE "iletisim" CASCADE;
  DROP TABLE "iletisim_locales" CASCADE;`)
}
