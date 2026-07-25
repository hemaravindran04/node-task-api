const Datastore = require('nedb-promises');
const path = require('path');

// Embedded, file-backed datastore (real persistence, no external DB server needed).
// In tests we point this at an in-memory store instead — see tests/tasks.test.js.
const dbFile = process.env.DB_FILE || path.join(__dirname, '..', 'data', 'tasks.db');

const tasks = Datastore.create({
  filename: process.env.NODE_ENV === 'test' ? undefined : dbFile,
  inMemoryOnly: process.env.NODE_ENV === 'test',
  autoload: true,
});

module.exports = { tasks };
