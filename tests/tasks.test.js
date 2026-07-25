process.env.NODE_ENV = 'test';
process.env.API_KEY = 'test-key';

const request = require('supertest');
const { createApp } = require('../src/app');

const app = createApp();
const authHeader = { 'x-api-key': 'test-key' };

describe('Auth middleware', () => {
  it('rejects requests with no API key', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(401);
  });

  it('rejects requests with the wrong API key', async () => {
    const res = await request(app).get('/tasks').set('x-api-key', 'wrong');
    expect(res.status).toBe(401);
  });
});

describe('GET /health', () => {
  it('does not require auth', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /tasks', () => {
  it('creates a task with valid input', async () => {
    const res = await request(app)
      .post('/tasks')
      .set(authHeader)
      .send({ title: 'Write tests' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Write tests');
    expect(res.body.status).toBe('todo');
    expect(res.body._id).toBeDefined();
  });

  it('rejects a missing title', async () => {
    const res = await request(app).post('/tasks').set(authHeader).send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('title is required and must be a non-empty string');
  });

  it('rejects an invalid status', async () => {
    const res = await request(app)
      .post('/tasks')
      .set(authHeader)
      .send({ title: 'Bad status', status: 'not_a_status' });

    expect(res.status).toBe(400);
  });
});

describe('GET /tasks', () => {
  it('lists created tasks', async () => {
    await request(app).post('/tasks').set(authHeader).send({ title: 'Task A' });
    const res = await request(app).get('/tasks').set(authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((t) => t.title === 'Task A')).toBe(true);
  });

  it('filters by status query param', async () => {
    const created = await request(app)
      .post('/tasks')
      .set(authHeader)
      .send({ title: 'Filter me', status: 'in_progress' });

    const res = await request(app)
      .get('/tasks?status=in_progress')
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.some((t) => t._id === created.body._id)).toBe(true);
  });
});

describe('GET /tasks/:id', () => {
  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/tasks/does-not-exist').set(authHeader);
    expect(res.status).toBe(404);
  });

  it('returns the task when it exists', async () => {
    const created = await request(app).post('/tasks').set(authHeader).send({ title: 'Fetch me' });
    const res = await request(app).get(`/tasks/${created.body._id}`).set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Fetch me');
  });
});

describe('PUT /tasks/:id', () => {
  it('updates title and status', async () => {
    const created = await request(app).post('/tasks').set(authHeader).send({ title: 'Old title' });

    const res = await request(app)
      .put(`/tasks/${created.body._id}`)
      .set(authHeader)
      .send({ title: 'New title', status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New title');
    expect(res.body.status).toBe('done');
  });

  it('returns 404 when updating an unknown id', async () => {
    const res = await request(app)
      .put('/tasks/does-not-exist')
      .set(authHeader)
      .send({ title: 'Nope' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  it('deletes an existing task', async () => {
    const created = await request(app).post('/tasks').set(authHeader).send({ title: 'Delete me' });

    const del = await request(app).delete(`/tasks/${created.body._id}`).set(authHeader);
    expect(del.status).toBe(204);

    const getAfter = await request(app).get(`/tasks/${created.body._id}`).set(authHeader);
    expect(getAfter.status).toBe(404);
  });

  it('returns 404 when deleting an unknown id', async () => {
    const res = await request(app).delete('/tasks/does-not-exist').set(authHeader);
    expect(res.status).toBe(404);
  });
});
