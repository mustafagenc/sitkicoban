import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_push_abonelikleri_konular" AS ENUM('yazilar', 'kitaplar', 'eserler', 'videolar');
  CREATE TYPE "public"."enum_push_abonelikleri_dil" AS ENUM('tr', 'en', 'ar');
  CREATE TABLE "push_abonelikleri_konular" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_push_abonelikleri_konular",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "push_abonelikleri" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"endpoint" varchar NOT NULL,
  	"p256dh" varchar NOT NULL,
  	"auth" varchar NOT NULL,
  	"dil" "enum_push_abonelikleri_dil" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "push_abonelikleri_id" integer;
  ALTER TABLE "bulten_locales" ADD COLUMN "metinler_push_bekle" varchar;
  ALTER TABLE "push_abonelikleri_konular" ADD CONSTRAINT "push_abonelikleri_konular_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."push_abonelikleri"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "push_abonelikleri_konular_order_idx" ON "push_abonelikleri_konular" USING btree ("order");
  CREATE INDEX "push_abonelikleri_konular_parent_idx" ON "push_abonelikleri_konular" USING btree ("parent_id");
  CREATE UNIQUE INDEX "push_abonelikleri_endpoint_idx" ON "push_abonelikleri" USING btree ("endpoint");
  CREATE INDEX "push_abonelikleri_updated_at_idx" ON "push_abonelikleri" USING btree ("updated_at");
  CREATE INDEX "push_abonelikleri_created_at_idx" ON "push_abonelikleri" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_push_abonelikleri_fk" FOREIGN KEY ("push_abonelikleri_id") REFERENCES "public"."push_abonelikleri"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_push_abonelikleri_id_idx" ON "payload_locked_documents_rels" USING btree ("push_abonelikleri_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Üretilen sıra düzeltildi: tablo CASCADE ile silinince dış anahtar da gider; önce kilit tablosundaki
  // sütun ve kısıt kaldırılır, sonra tablolar.
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_push_abonelikleri_fk";
  DROP INDEX "payload_locked_documents_rels_push_abonelikleri_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "push_abonelikleri_id";
  ALTER TABLE "push_abonelikleri_konular" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "push_abonelikleri" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "push_abonelikleri_konular" CASCADE;
  DROP TABLE "push_abonelikleri" CASCADE;
  ALTER TABLE "bulten_locales" DROP COLUMN "metinler_push_bekle";
  DROP TYPE "public"."enum_push_abonelikleri_konular";
  DROP TYPE "public"."enum_push_abonelikleri_dil";`)
}
