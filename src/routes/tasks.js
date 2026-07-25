const express = require('express');
const { tasks } = require('../db');
const { validateTaskBody } = require('../middleware/validate');

const router = express.Router();

// GET /tasks — list all tasks, optionally filtered by ?status=
router.get('/', async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    const all = await tasks.find(query).sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id — fetch a single task
router.get('/:id', async (req, res, next) => {
  try {
    const task = await tasks.findOne({ _id: req.params.id });
    if (!task) {
      const err = new Error('Task not found');
      err.status = 404;
      throw err;
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// POST /tasks — create a task
router.post('/', validateTaskBody, async (req, res, next) => {
  try {
    const { title, status = 'todo' } = req.body;
    const created = await tasks.insertOne({
      title: title.trim(),
      status,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id — update a task
router.put('/:id', validateTaskBody, async (req, res, next) => {
  try {
    const existing = await tasks.findOne({ _id: req.params.id });
    if (!existing) {
      const err = new Error('Task not found');
      err.status = 404;
      throw err;
    }
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.status !== undefined) updates.status = req.body.status;

    await tasks.updateOne({ _id: req.params.id }, { $set: updates });
    const updated = await tasks.findOne({ _id: req.params.id });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id — remove a task
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await tasks.findOne({ _id: req.params.id });
    if (!existing) {
      const err = new Error('Task not found');
      err.status = 404;
      throw err;
    }
    await tasks.deleteOne({ _id: req.params.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
