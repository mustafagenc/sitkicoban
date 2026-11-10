import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "eserler" ADD COLUMN "duyur" boolean DEFAULT false;
  ALTER TABLE "eserler" ADD COLUMN "yeniden_duyur" boolean DEFAULT false;
  ALTER TABLE "eserler" ADD COLUMN "duyuruldu" timestamp(3) with time zone;
  ALTER TABLE "kitaplar" ADD COLUMN "duyur" boolean DEFAULT false;
  ALTER TABLE "kitaplar" ADD COLUMN "yeniden_duyur" boolean DEFAULT false;
  ALTER TABLE "kitaplar" ADD COLUMN "duyuruldu" timestamp(3) with time zone;
  ALTER TABLE "yazilar" ADD COLUMN "duyur" boolean DEFAULT false;
  ALTER TABLE "yazilar" ADD COLUMN "yeniden_duyur" boolean DEFAULT false;
  ALTER TABLE "yazilar" ADD COLUMN "duyuruldu" timestamp(3) with time zone;
  ALTER TABLE "videolar" ADD COLUMN "duyur" boolean DEFAULT false;
  ALTER TABLE "videolar" ADD COLUMN "yeniden_duyur" boolean DEFAULT false;
  ALTER TABLE "videolar" ADD COLUMN "duyuruldu" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "eserler" DROP COLUMN "duyur";
  ALTER TABLE "eserler" DROP COLUMN "yeniden_duyur";
  ALTER TABLE "eserler" DROP COLUMN "duyuruldu";
  ALTER TABLE "kitaplar" DROP COLUMN "duyur";
  ALTER TABLE "kitaplar" DROP COLUMN "yeniden_duyur";
  ALTER TABLE "kitaplar" DROP COLUMN "duyuruldu";
  ALTER TABLE "yazilar" DROP COLUMN "duyur";
  ALTER TABLE "yazilar" DROP COLUMN "yeniden_duyur";
  ALTER TABLE "yazilar" DROP COLUMN "duyuruldu";
  ALTER TABLE "videolar" DROP COLUMN "duyur";
  ALTER TABLE "videolar" DROP COLUMN "yeniden_duyur";
  ALTER TABLE "videolar" DROP COLUMN "duyuruldu";`)
}
