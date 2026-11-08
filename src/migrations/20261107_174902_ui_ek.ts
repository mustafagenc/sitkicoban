import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ui_metinleri_locales" ADD COLUMN "logo_alt" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "menu" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ui_metinleri_locales" DROP COLUMN "logo_alt";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "menu";`)
}
