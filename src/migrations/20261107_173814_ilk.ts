import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('tr', 'en', 'ar');
  CREATE TYPE "public"."enum_kitaplar_rol" AS ENUM('yazar', 'hazirlayan', 'sadelestiren', 'derleyen');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "yazi_turleri" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sira" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yazi_turleri_locales" (
  	"ad" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "eser_turleri" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "eser_turleri_locales" (
  	"ad" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "eserler" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"gorsel_id" integer,
  	"oran" numeric,
  	"tur_id" integer,
  	"yil" varchar,
  	"metin" varchar,
  	"olcu" varchar,
  	"sira" numeric DEFAULT 0,
  	"anasayfada_goster" boolean DEFAULT false,
  	"anasayfa_sira" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "eserler_locales" (
  	"baslik" varchar NOT NULL,
  	"anlam" varchar,
  	"kaynak" varchar,
  	"aciklama" varchar,
  	"malzeme" varchar,
  	"tezhip" varchar,
  	"ebru" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "eserler_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"yazi_turleri_id" integer
  );
  
  CREATE TABLE "kitaplar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"rol" "enum_kitaplar_rol",
  	"asil_yazar" varchar,
  	"kapak_id" integer,
  	"kapak_sigdir" boolean DEFAULT false,
  	"yayinevi" varchar,
  	"yil" varchar,
  	"sayfa" numeric,
  	"isbn" varchar,
  	"satin_al_linki" varchar,
  	"sira" numeric DEFAULT 0,
  	"anasayfada_goster" boolean DEFAULT false,
  	"anasayfa_sira" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "kitaplar_locales" (
  	"baslik" varchar NOT NULL,
  	"alt_baslik" varchar,
  	"aciklama" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"yazi_turleri_id" integer,
  	"eser_turleri_id" integer,
  	"eserler_id" integer,
  	"kitaplar_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_ayarlari" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eposta" varchar,
  	"telefon" varchar,
  	"instagram" varchar,
  	"facebook" varchar,
  	"youtube" varchar,
  	"form_hedef_eposta" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_ayarlari_locales" (
  	"adres" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ui_metinleri" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "ui_metinleri_locales" (
  	"nav_eserler" varchar,
  	"nav_yazilar" varchar,
  	"nav_kitaplar" varchar,
  	"nav_videolar" varchar,
  	"nav_hayati" varchar,
  	"nav_iletisim" varchar,
  	"tumu" varchar,
  	"tumu_ok" varchar,
  	"tum_eserler_ok" varchar,
  	"bilgi_girilecek" varchar,
  	"satin_al" varchar,
  	"ilgili_yazilar" varchar,
  	"onceki_kitap" varchar,
  	"sonraki_kitap" varchar,
  	"rol_yazar" varchar,
  	"rol_hazirlayan" varchar,
  	"rol_sadelestiren" varchar,
  	"rol_derleyen" varchar,
  	"olcu" varchar,
  	"malzeme" varchar,
  	"tezhip" varchar,
  	"ebru" varchar,
  	"kaynak" varchar,
  	"yil" varchar,
  	"yayinevi" varchar,
  	"sayfa" varchar,
  	"isbn" varchar,
  	"gorunum_duvar" varchar,
  	"gorunum_sirali" varchar,
  	"gorunum_muze" varchar,
  	"gorunum_etiket" varchar,
  	"bos_secim" varchar,
  	"menu_ac" varchar,
  	"menu_kapat" varchar,
  	"tema_degistir" varchar,
  	"tema_gunduz" varchar,
  	"dil_sec" varchar,
  	"asagi_kaydir" varchar,
  	"kapat" varchar,
  	"eser_tarih" varchar,
  	"eser_ipucu" varchar,
  	"uzaklastir" varchar,
  	"yakinlastir" varchar,
  	"sigdir" varchar,
  	"eser_sor" varchar,
  	"onceki" varchar,
  	"sonraki" varchar,
  	"eserler_baslik" varchar,
  	"eserler_aciklama" varchar,
  	"kitaplar_baslik" varchar,
  	"kitaplar_aciklama" varchar,
  	"footer_telif" varchar,
  	"footer_not" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "anasayfa" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "anasayfa_locales" (
  	"hero_eyebrow" varchar,
  	"hero_baslik" varchar,
  	"hero_aciklama" varchar,
  	"eserler_eyebrow" varchar,
  	"eserler_baslik" varchar,
  	"eserler_aciklama" varchar,
  	"kitaplar_eyebrow" varchar,
  	"kitaplar_baslik" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yazi_turleri_locales" ADD CONSTRAINT "yazi_turleri_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."yazi_turleri"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eser_turleri_locales" ADD CONSTRAINT "eser_turleri_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."eser_turleri"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eserler" ADD CONSTRAINT "eserler_gorsel_id_media_id_fk" FOREIGN KEY ("gorsel_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "eserler" ADD CONSTRAINT "eserler_tur_id_eser_turleri_id_fk" FOREIGN KEY ("tur_id") REFERENCES "public"."eser_turleri"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "eserler_locales" ADD CONSTRAINT "eserler_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."eserler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eserler_rels" ADD CONSTRAINT "eserler_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."eserler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eserler_rels" ADD CONSTRAINT "eserler_rels_yazi_turleri_fk" FOREIGN KEY ("yazi_turleri_id") REFERENCES "public"."yazi_turleri"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kitaplar" ADD CONSTRAINT "kitaplar_kapak_id_media_id_fk" FOREIGN KEY ("kapak_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kitaplar_locales" ADD CONSTRAINT "kitaplar_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."kitaplar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_yazi_turleri_fk" FOREIGN KEY ("yazi_turleri_id") REFERENCES "public"."yazi_turleri"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_eser_turleri_fk" FOREIGN KEY ("eser_turleri_id") REFERENCES "public"."eser_turleri"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_eserler_fk" FOREIGN KEY ("eserler_id") REFERENCES "public"."eserler"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kitaplar_fk" FOREIGN KEY ("kitaplar_id") REFERENCES "public"."kitaplar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_ayarlari_locales" ADD CONSTRAINT "site_ayarlari_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_ayarlari"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ui_metinleri_locales" ADD CONSTRAINT "ui_metinleri_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ui_metinleri"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "anasayfa_locales" ADD CONSTRAINT "anasayfa_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."anasayfa"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "yazi_turleri_updated_at_idx" ON "yazi_turleri" USING btree ("updated_at");
  CREATE INDEX "yazi_turleri_created_at_idx" ON "yazi_turleri" USING btree ("created_at");
  CREATE UNIQUE INDEX "yazi_turleri_locales_locale_parent_id_unique" ON "yazi_turleri_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "yazi_turleri_locales_parent_id_idx" ON "yazi_turleri_locales" USING btree ("_parent_id");
  CREATE INDEX "eser_turleri_updated_at_idx" ON "eser_turleri" USING btree ("updated_at");
  CREATE INDEX "eser_turleri_created_at_idx" ON "eser_turleri" USING btree ("created_at");
  CREATE UNIQUE INDEX "eser_turleri_locales_locale_parent_id_unique" ON "eser_turleri_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "eser_turleri_locales_parent_id_idx" ON "eser_turleri_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "eserler_slug_idx" ON "eserler" USING btree ("slug");
  CREATE INDEX "eserler_gorsel_idx" ON "eserler" USING btree ("gorsel_id");
  CREATE INDEX "eserler_tur_idx" ON "eserler" USING btree ("tur_id");
  CREATE INDEX "eserler_updated_at_idx" ON "eserler" USING btree ("updated_at");
  CREATE INDEX "eserler_created_at_idx" ON "eserler" USING btree ("created_at");
  CREATE UNIQUE INDEX "eserler_locales_locale_parent_id_unique" ON "eserler_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "eserler_locales_parent_id_idx" ON "eserler_locales" USING btree ("_parent_id");
  CREATE INDEX "eserler_rels_order_idx" ON "eserler_rels" USING btree ("order");
  CREATE INDEX "eserler_rels_parent_idx" ON "eserler_rels" USING btree ("parent_id");
  CREATE INDEX "eserler_rels_path_idx" ON "eserler_rels" USING btree ("path");
  CREATE INDEX "eserler_rels_yazi_turleri_id_idx" ON "eserler_rels" USING btree ("yazi_turleri_id");
  CREATE UNIQUE INDEX "kitaplar_slug_idx" ON "kitaplar" USING btree ("slug");
  CREATE INDEX "kitaplar_kapak_idx" ON "kitaplar" USING btree ("kapak_id");
  CREATE INDEX "kitaplar_updated_at_idx" ON "kitaplar" USING btree ("updated_at");
  CREATE INDEX "kitaplar_created_at_idx" ON "kitaplar" USING btree ("created_at");
  CREATE UNIQUE INDEX "kitaplar_locales_locale_parent_id_unique" ON "kitaplar_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "kitaplar_locales_parent_id_idx" ON "kitaplar_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_yazi_turleri_id_idx" ON "payload_locked_documents_rels" USING btree ("yazi_turleri_id");
  CREATE INDEX "payload_locked_documents_rels_eser_turleri_id_idx" ON "payload_locked_documents_rels" USING btree ("eser_turleri_id");
  CREATE INDEX "payload_locked_documents_rels_eserler_id_idx" ON "payload_locked_documents_rels" USING btree ("eserler_id");
  CREATE INDEX "payload_locked_documents_rels_kitaplar_id_idx" ON "payload_locked_documents_rels" USING btree ("kitaplar_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "site_ayarlari_locales_locale_parent_id_unique" ON "site_ayarlari_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_ayarlari_locales_parent_id_idx" ON "site_ayarlari_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "ui_metinleri_locales_locale_parent_id_unique" ON "ui_metinleri_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ui_metinleri_locales_parent_id_idx" ON "ui_metinleri_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "anasayfa_locales_locale_parent_id_unique" ON "anasayfa_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "anasayfa_locales_parent_id_idx" ON "anasayfa_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "yazi_turleri" CASCADE;
  DROP TABLE "yazi_turleri_locales" CASCADE;
  DROP TABLE "eser_turleri" CASCADE;
  DROP TABLE "eser_turleri_locales" CASCADE;
  DROP TABLE "eserler" CASCADE;
  DROP TABLE "eserler_locales" CASCADE;
  DROP TABLE "eserler_rels" CASCADE;
  DROP TABLE "kitaplar" CASCADE;
  DROP TABLE "kitaplar_locales" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_ayarlari" CASCADE;
  DROP TABLE "site_ayarlari_locales" CASCADE;
  DROP TABLE "ui_metinleri" CASCADE;
  DROP TABLE "ui_metinleri_locales" CASCADE;
  DROP TABLE "anasayfa" CASCADE;
  DROP TABLE "anasayfa_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_kitaplar_rol";`)
}
