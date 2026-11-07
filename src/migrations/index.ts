import * as migration_20261107_173814_ilk from './20261107_173814_ilk';
import * as migration_20261107_174902_ui_ek from './20261107_174902_ui_ek';
import * as migration_20261107_190425_dersler from './20261107_190425_dersler';
import * as migration_20261107_205950_yazilar from './20261107_205950_yazilar';
import * as migration_20261107_210556_yazilar_ui from './20261107_210556_yazilar_ui';

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
    name: '20261107_210556_yazilar_ui'
  },
];
