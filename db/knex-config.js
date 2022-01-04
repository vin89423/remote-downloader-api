'use strict';

const dbPath = 'db/';

module.exports = {
  client: 'sqlite3',
  connection: {
    filename: `${dbPath}database.db3`,
  },
  useNullAsDefault: true
};