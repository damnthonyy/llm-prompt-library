import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { stringifyTags } from '../src/lib/tags.js';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'password123';

const SAMPLE_PROMPTS: Array<{ title: string; body: string; tags: string[] }> = [
  {
    title: 'Senior code reviewer',
    body: 'You are a meticulous senior engineer. Review the following code for correctness, edge cases, and readability. Reply with prioritized, actionable comments.',
    tags: ['coding', 'review', 'engineering'],
  },
  {
    title: 'Explain like I am five',
    body: 'Explain the following concept in simple terms a five-year-old could understand, using a short analogy. Concept: {{topic}}',
    tags: ['education', 'simplify'],
  },
  {
    title: 'Cold email writer',
    body: 'Write a concise, friendly cold outreach email (under 120 words) to {{persona}} about {{product}}. Include one clear call to action.',
    tags: ['marketing', 'writing', 'sales'],
  },
  {
    title: 'SQL query helper',
    body: 'Given this schema, write an optimized SQL query that answers the question below. Explain any indexes you would add. Schema: {{schema}} Question: {{question}}',
    tags: ['coding', 'sql', 'data'],
  },
  {
    title: 'Meeting summarizer',
    body: 'Summarize the following meeting transcript into: (1) key decisions, (2) action items with owners, (3) open questions. Transcript: {{transcript}}',
    tags: ['productivity', 'summarize'],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, passwordHash },
  });

  // Reset this user's prompts so the seed is idempotent.
  await prisma.prompt.deleteMany({ where: { authorId: user.id } });

  await prisma.prompt.createMany({
    data: SAMPLE_PROMPTS.map((p) => ({
      title: p.title,
      body: p.body,
      tags: stringifyTags(p.tags),
      authorId: user.id,
    })),
  });

  const count = await prisma.prompt.count({ where: { authorId: user.id } });
  console.log(`✅ Seeded user ${DEMO_EMAIL} (password: ${DEMO_PASSWORD}) with ${count} prompts.`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
