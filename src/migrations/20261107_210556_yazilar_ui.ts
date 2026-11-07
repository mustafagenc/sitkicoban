import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ui_metinleri_locales" ADD COLUMN "yazilar_baslik" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "yazilar_aciklama" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "yazilar_eyebrow" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "son_yazilar_baslik" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "son_yazi" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "yaziyi_oku" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "okuma_suresi" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "yazilar_bos" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "kitap_suzgeci" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "kaynaklar_baslik" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "yazilar_gezinti" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "onceki_yazi" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "sonraki_yazi" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "tum_yazilar" varchar;
  ALTER TABLE "ui_metinleri_locales" ADD COLUMN "yazilar_sayfasina_don" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ui_metinleri_locales" DROP COLUMN "yazilar_baslik";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "yazilar_aciklama";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "yazilar_eyebrow";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "son_yazilar_baslik";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "son_yazi";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "yaziyi_oku";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "okuma_suresi";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "yazilar_bos";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "kitap_suzgeci";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "kaynaklar_baslik";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "yazilar_gezinti";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "onceki_yazi";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "sonraki_yazi";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "tum_yazilar";
  ALTER TABLE "ui_metinleri_locales" DROP COLUMN "yazilar_sayfasina_don";`)
}
