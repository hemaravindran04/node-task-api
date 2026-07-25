const express = require('express');
const { requireApiKey } = require('./middleware/auth');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const tasksRouter = require('./routes/tasks');

function createApp() {
  const app = express();
  app.use(express.json());

  // Health check stays unauthenticated — useful for container/orchestrator probes.
  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/tasks', requireApiKey, tasksRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
