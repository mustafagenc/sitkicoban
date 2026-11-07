import * as migration_20261107_173814_ilk from './20261107_173814_ilk';
import * as migration_20261107_174902_ui_ek from './20261107_174902_ui_ek';

export const migrations = [
  {
    up: migration_20261107_173814_ilk.up,
    down: migration_20261107_173814_ilk.down,
    name: '20261107_173814_ilk',
  },
  {
    up: migration_20261107_174902_ui_ek.up,
    down: migration_20261107_174902_ui_ek.down,
    name: '20261107_174902_ui_ek'
  },
];
