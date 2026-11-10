import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_duyurular_kanallar" AS ENUM('eposta', 'bildirim');
  CREATE TYPE "public"."enum_duyurular_baglanti" AS ENUM('yok', 'home', 'eserler', 'kitaplar', 'yazilar', 'videolar', 'hayati', 'iletisim', 'bulten', 'yazi');
  CREATE TYPE "public"."enum_duyurular_kitle" AS ENUM('hepsi', 'yazilar', 'kitaplar', 'eserler', 'videolar');
  CREATE TABLE "duyurular_kanallar" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_duyurular_kanallar",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "duyurular" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"gorsel_id" integer,
  	"baglanti" "enum_duyurular_baglanti" DEFAULT 'home' NOT NULL,
  	"yazi_id" integer,
  	"kitle" "enum_duyurular_kitle" DEFAULT 'hepsi' NOT NULL,
  	"gonder" boolean DEFAULT false,
  	"gonderildi" timestamp(3) with time zone,
  	"sonuc" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "duyurular_locales" (
  	"baslik" varchar NOT NULL,
  	"metin" varchar NOT NULL,
  	"dugme" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "duyurular_id" integer;
  ALTER TABLE "duyurular_kanallar" ADD CONSTRAINT "duyurular_kanallar_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."duyurular"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "duyurular" ADD CONSTRAINT "duyurular_gorsel_id_media_id_fk" FOREIGN KEY ("gorsel_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "duyurular" ADD CONSTRAINT "duyurular_yazi_id_yazilar_id_fk" FOREIGN KEY ("yazi_id") REFERENCES "public"."yazilar"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "duyurular_locales" ADD CONSTRAINT "duyurular_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."duyurular"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "duyurular_kanallar_order_idx" ON "duyurular_kanallar" USING btree ("order");
  CREATE INDEX "duyurular_kanallar_parent_idx" ON "duyurular_kanallar" USING btree ("parent_id");
  CREATE INDEX "duyurular_gorsel_idx" ON "duyurular" USING btree ("gorsel_id");
  CREATE INDEX "duyurular_yazi_idx" ON "duyurular" USING btree ("yazi_id");
  CREATE INDEX "duyurular_updated_at_idx" ON "duyurular" USING btree ("updated_at");
  CREATE INDEX "duyurular_created_at_idx" ON "duyurular" USING btree ("created_at");
  CREATE UNIQUE INDEX "duyurular_locales_locale_parent_id_unique" ON "duyurular_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "duyurular_locales_parent_id_idx" ON "duyurular_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_duyurular_fk" FOREIGN KEY ("duyurular_id") REFERENCES "public"."duyurular"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_duyurular_id_idx" ON "payload_locked_documents_rels" USING btree ("duyurular_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "duyurular_kanallar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "duyurular" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "duyurular_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "duyurular_kanallar" CASCADE;
  DROP TABLE "duyurular" CASCADE;
  DROP TABLE "duyurular_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_duyurular_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_duyurular_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "duyurular_id";
  DROP TYPE "public"."enum_duyurular_kanallar";
  DROP TYPE "public"."enum_duyurular_baglanti";
  DROP TYPE "public"."enum_duyurular_kitle";`)
}
