import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { UI_STRINGS } from '../seed/ui-metinleri'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ui_metinleri_locales" ADD COLUMN "dua_dinle" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "dua_durdur" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "dua_aciklama" varchar;`)

  // Seed'i yeniden çalıştırmadan düğme metinleri dolu gelsin; panelden değiştirilebilir.
  for (const locale of ['tr', 'en', 'ar'] as const) {
    await db.execute(sql`
      UPDATE "ui_metinleri_locales" SET
        "dua_dinle" = ${UI_STRINGS.duaDinle[locale]},
        "dua_durdur" = ${UI_STRINGS.duaDurdur[locale]},
        "dua_aciklama" = ${UI_STRINGS.duaAciklama[locale]}
      WHERE "_locale" = ${locale}::"_locales";`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ui_metinleri_locales" DROP COLUMN "dua_dinle";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "dua_durdur";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "dua_aciklama";`)
}
