import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { UI_STRINGS } from '../seed/ui-metinleri'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_kitaplar_rol" ADD VALUE 'editor';
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "rol_editor" varchar;`)

  // Seed'i yeniden çalıştırmadan rol metni dolu gelsin; panelden değiştirilebilir.
  for (const locale of ['tr', 'en', 'ar'] as const) {
    await db.execute(sql`
      UPDATE "ui_metinleri_locales" SET "rol_editor" = ${UI_STRINGS.rolEditor[locale]}
      WHERE "_locale" = ${locale}::"_locales";`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "kitaplar" ALTER COLUMN "rol" SET DATA TYPE text;
  UPDATE "kitaplar" SET "rol" = NULL WHERE "rol" = 'editor';
  DROP TYPE "public"."enum_kitaplar_rol";
  CREATE TYPE "public"."enum_kitaplar_rol" AS ENUM('yazar', 'hazirlayan', 'sadelestiren', 'derleyen');
  ALTER TABLE "kitaplar" ALTER COLUMN "rol" SET DATA TYPE "public"."enum_kitaplar_rol" USING "rol"::"public"."enum_kitaplar_rol";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "rol_editor";`)
}
