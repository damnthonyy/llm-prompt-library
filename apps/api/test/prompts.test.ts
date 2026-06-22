import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

const app = createApp();

beforeAll(async () => {
  // Start from a clean slate (the test DB is migrated but unseeded).
  await prisma.prompt.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('prompt CRUD happy path', () => {
  const agent = request.agent(app); // persists the auth cookie across requests
  let promptId = '';

  it('registers a user and sets the auth cookie', async () => {
    const res = await agent
      .post('/auth/register')
      .send({ email: 'tester@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('tester@example.com');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('creates a prompt and normalizes tags', async () => {
    const res = await agent.post('/prompts').send({
      title: 'Test prompt',
      body: 'A body about Kubernetes',
      tags: ['Infra', 'infra', 'devops'],
    });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test prompt');
    expect(res.body.tags).toEqual(['infra', 'devops']); // lowercased + de-duped
    promptId = res.body.id;
  });

  it('lists prompts in a pagination envelope', async () => {
    const res = await agent.get('/prompts');
    expect(res.status).toBe(200);
    expect(res.body.meta).toMatchObject({ page: 1, total: 1, totalPages: 1, hasNextPage: false });
    expect(res.body.data[0].id).toBe(promptId);
  });

  it('searches case-insensitively across title and body', async () => {
    const res = await agent.get('/prompts').query({ q: 'KUBERNETES' });
    expect(res.body.meta.total).toBe(1);
  });

  it('filters by tag (exact, not partial)', async () => {
    const match = await agent.get('/prompts').query({ tag: 'devops' });
    expect(match.body.meta.total).toBe(1);
    const partial = await agent.get('/prompts').query({ tag: 'dev' });
    expect(partial.body.meta.total).toBe(0);
  });

  it('exposes the tag in GET /tags', async () => {
    const res = await agent.get('/tags');
    expect(res.body.tags).toEqual(expect.arrayContaining(['devops', 'infra']));
  });

  it('fetches a single prompt', async () => {
    const res = await agent.get(`/prompts/${promptId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(promptId);
  });

  it('updates an owned prompt', async () => {
    const res = await agent.patch(`/prompts/${promptId}`).send({ title: 'Updated title' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated title');
  });

  it('deletes an owned prompt', async () => {
    const res = await agent.delete(`/prompts/${promptId}`);
    expect(res.status).toBe(204);
    const after = await agent.get(`/prompts/${promptId}`);
    expect(after.status).toBe(404);
  });
});

describe('auth + ownership guards', () => {
  it('rejects unauthenticated create with 401', async () => {
    const res = await request(app).post('/prompts').send({ title: 'x', body: 'y' });
    expect(res.status).toBe(401);
  });

  it('forbids updating a prompt you do not own with 403', async () => {
    const owner = request.agent(app);
    await owner
      .post('/auth/register')
      .send({ email: 'owner@example.com', password: 'password123' });
    const created = await owner.post('/prompts').send({ title: 'Mine', body: 'Body', tags: [] });

    const other = request.agent(app);
    await other
      .post('/auth/register')
      .send({ email: 'other@example.com', password: 'password123' });
    const res = await other.patch(`/prompts/${created.body.id}`).send({ title: 'hacked' });
    expect(res.status).toBe(403);
  });
});
