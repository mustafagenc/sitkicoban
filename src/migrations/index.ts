import * as migration_20261107_173814_ilk from './20261107_173814_ilk';
import * as migration_20261107_174902_ui_ek from './20261107_174902_ui_ek';
import * as migration_20261107_190425_dersler from './20261107_190425_dersler';
import * as migration_20261107_205950_yazilar from './20261107_205950_yazilar';
import * as migration_20261107_210556_yazilar_ui from './20261107_210556_yazilar_ui';
import * as migration_20261107_212248_hayati from './20261107_212248_hayati';
import * as migration_20261107_213629_videolar from './20261107_213629_videolar';
import * as migration_20261107_215705_iletisim from './20261107_215705_iletisim';
import * as migration_20261107_221311_blob_anahtari from './20261107_221311_blob_anahtari';
import * as migration_20261107_221414_konu_anahtari from './20261107_221414_konu_anahtari';
import * as migration_20261108_020414_cerez from './20261108_020414_cerez';
import * as migration_20261110_122402_anasayfa_meta from './20261110_122402_anasayfa_meta';

export const migrations = [
  {
    up: migration_20261107_173814_ilk.up,
    down: migration_20261107_173814_ilk.down,
    name: '20261107_173814_ilk',
  },
  {
    up: migration_20261107_174902_ui_ek.up,
    down: migration_20261107_174902_ui_ek.down,
    name: '20261107_174902_ui_ek',
  },
  {
    up: migration_20261107_190425_dersler.up,
    down: migration_20261107_190425_dersler.down,
    name: '20261107_190425_dersler',
  },
  {
    up: migration_20261107_205950_yazilar.up,
    down: migration_20261107_205950_yazilar.down,
    name: '20261107_205950_yazilar',
  },
  {
    up: migration_20261107_210556_yazilar_ui.up,
    down: migration_20261107_210556_yazilar_ui.down,
    name: '20261107_210556_yazilar_ui',
  },
  {
    up: migration_20261107_212248_hayati.up,
    down: migration_20261107_212248_hayati.down,
    name: '20261107_212248_hayati',
  },
  {
    up: migration_20261107_213629_videolar.up,
    down: migration_20261107_213629_videolar.down,
    name: '20261107_213629_videolar',
  },
  {
    up: migration_20261107_215705_iletisim.up,
    down: migration_20261107_215705_iletisim.down,
    name: '20261107_215705_iletisim',
  },
  {
    up: migration_20261107_221311_blob_anahtari.up,
    down: migration_20261107_221311_blob_anahtari.down,
    name: '20261107_221311_blob_anahtari',
  },
  {
    up: migration_20261107_221414_konu_anahtari.up,
    down: migration_20261107_221414_konu_anahtari.down,
    name: '20261107_221414_konu_anahtari',
  },
  {
    up: migration_20261108_020414_cerez.up,
    down: migration_20261108_020414_cerez.down,
    name: '20261108_020414_cerez',
  },
  {
    up: migration_20261110_122402_anasayfa_meta.up,
    down: migration_20261110_122402_anasayfa_meta.down,
    name: '20261110_122402_anasayfa_meta'
  },
];
