/* eslint-disable no-console */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

const USERS = [
  { name: 'Ada Lovelace',      email: 'ada@demo.dev',      password: 'Password123!', role: 'admin'  },
  { name: 'Grace Hopper',      email: 'grace@demo.dev',    password: 'Password123!', role: 'member' },
  { name: 'Linus Torvalds',    email: 'linus@demo.dev',    password: 'Password123!', role: 'member' },
  { name: 'Margaret Hamilton', email: 'margaret@demo.dev', password: 'Password123!', role: 'member' },
];

const PROJECTS = [
  { name: 'Cobalt Web Platform',  description: 'Rebuild the customer-facing analytics dashboard with new design system and SSR.', priority: 'high',   status: 'active',   daysToDeadline: 28 },
  { name: 'Onboarding Revamp',    description: 'Reduce time-to-first-action for new sign-ups by 40% across web and mobile.',     priority: 'medium', status: 'active',   daysToDeadline: 14 },
  { name: 'Mobile App v2',        description: 'Native-feeling PWA with offline mode, push notifications, and deep linking.',    priority: 'high',   status: 'active',   daysToDeadline: 60 },
  { name: 'Q1 Retrospective Wiki',description: 'Document learnings from the Q1 launch — archived after Q2 planning.',            priority: 'low',    status: 'archived', daysToDeadline: -10 },
];

const TASK_TEMPLATES = [
  ['Define design tokens',                  'high',   'completed',    -10],
  ['Build responsive sidebar',              'medium', 'completed',    -3],
  ['Wire up authentication flow',           'high',   'in_progress',  4],
  ['Implement project CRUD endpoints',      'high',   'in_progress',  2],
  ['Add Kanban drag-and-drop',              'medium', 'todo',         9],
  ['Set up CI pipeline',                    'low',    'todo',         15],
  ['Onboarding survey wireframes',          'medium', 'completed',    -6],
  ['A/B test welcome modal copy',           'low',    'in_progress',  5],
  ['Integrate analytics events',            'high',   'todo',         12],
  ['Mobile push notification service',      'high',   'todo',         20],
  ['Service worker offline cache',          'medium', 'in_progress',  6],
  ['Deep link routing tests',               'low',    'todo',         30],
  ['Architecture overview document',        'medium', 'completed',    -2],
  ['Performance benchmark report',          'high',   'completed',    -1],
  ['Retro: launch week postmortem',         'low',    'completed',    -8],
  ['Backlog grooming notes',                'low',    'completed',    -4],
  ['Database migration runbook',            'high',   'in_progress',  3],
  ['Error monitoring integration',          'medium', 'todo',         11],
  ['Accessibility audit (WCAG 2.2 AA)',     'high',   'todo',         7],
  ['Empty states + skeleton loaders',       'medium', 'in_progress',  1],
];

function addDays(days) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function run() {
  try {
    console.log('Wiping existing data...');
    await sql`TRUNCATE tasks, projects, refresh_tokens, users RESTART IDENTITY CASCADE`;

    console.log('Seeding users...');
    const insertedUsers = [];
    for (const u of USERS) {
      const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
      const rows = await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (${u.name}, ${u.email.toLowerCase()}, ${hash}, ${u.role || 'member'})
        RETURNING id, email, name, role
      `;
      insertedUsers.push(rows[0]);
    }

    console.log('Seeding projects...');
    const insertedProjects = [];
    for (let i = 0; i < PROJECTS.length; i++) {
      const p = PROJECTS[i];
      const creator = insertedUsers[i % insertedUsers.length];
      const rows = await sql`
        INSERT INTO projects (name, description, priority, status, deadline, created_by)
        VALUES (${p.name}, ${p.description}, ${p.priority}, ${p.status}, ${addDays(p.daysToDeadline)}, ${creator.id})
        RETURNING id, name
      `;
      insertedProjects.push(rows[0]);
    }

    console.log('Seeding tasks...');
    const adminUser = insertedUsers.find((u) => u.role === 'admin');
    const memberUsers = insertedUsers.filter((u) => u.role !== 'admin');
    const pickCreator = (i) => memberUsers[i % memberUsers.length];
    const pickAssignee = (i) => {
      const pool = [adminUser, ...memberUsers];
      return pool[(i + 2) % pool.length];
    };
    for (let i = 0; i < TASK_TEMPLATES.length; i++) {
      const [title, priority, status, dueOffset] = TASK_TEMPLATES[i];
      const project = insertedProjects[i % insertedProjects.length];
      const creator = pickCreator(i);
      const assignee = pickAssignee(i);
      await sql`
        INSERT INTO tasks (title, description, status, priority, due_date, project_id, assigned_to, created_by)
        VALUES (
          ${title},
          ${`${title} — auto-generated demo task for ${project.name}.`},
          ${status},
          ${priority},
          ${addDays(dueOffset)},
          ${project.id},
          ${assignee.id},
          ${creator.id}
        )
      `;
    }

    console.log('\nSeed complete.');
    console.log('Demo accounts:');
    USERS.forEach((u) => console.log(`  ${u.email}  /  ${u.password}   [${u.role}]`));
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

run();
