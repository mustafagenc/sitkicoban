import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bulten_locales" ADD COLUMN "metinler_davet_metin" varchar;
  ALTER TABLE "bulten_locales" ADD COLUMN "metinler_davet_sonra" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bulten_locales" DROP COLUMN "metinler_davet_metin";
  ALTER TABLE "bulten_locales" DROP COLUMN "metinler_davet_sonra";`)
}
