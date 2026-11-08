import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_ayarlari" ADD COLUMN "ga_olcum_kimligi" varchar;
  ALTER TABLE "site_ayarlari_locales" ADD COLUMN "cerez_metin" varchar;
  ALTER TABLE "site_ayarlari_locales" ADD COLUMN "cerez_kabul" varchar;
  ALTER TABLE "site_ayarlari_locales" ADD COLUMN "cerez_reddet" varchar;
  ALTER TABLE "site_ayarlari_locales" ADD COLUMN "cerez_aydinlatma" varchar;
  ALTER TABLE "site_ayarlari_locales" ADD COLUMN "cerez_tercihler" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_ayarlari" DROP COLUMN "ga_olcum_kimligi";
  ALTER TABLE "site_ayarlari_locales" DROP COLUMN "cerez_metin";
  ALTER TABLE "site_ayarlari_locales" DROP COLUMN "cerez_kabul";
  ALTER TABLE "site_ayarlari_locales" DROP COLUMN "cerez_reddet";
  ALTER TABLE "site_ayarlari_locales" DROP COLUMN "cerez_aydinlatma";
  ALTER TABLE "site_ayarlari_locales" DROP COLUMN "cerez_tercihler";`)
}
