'use strict';

const dbPath = 'db/';

module.exports = {
  general: {
    client: 'sqlite3',
    connection: {
      filename: `${dbPath}database.db3`,
    },
    useNullAsDefault: true
  },
  session: {
    client: 'sqlite3',
    connection: {
      filename: `${dbPath}session.db3`,
    },
    useNullAsDefault: true
  }
};