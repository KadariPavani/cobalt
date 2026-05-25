const { query } = require('../config/db');

const SELECT_BASE = `
  SELECT
    p.id, p.name, p.description, p.status, p.priority, p.deadline,
    p.created_by, p.created_at, p.updated_at,
    u.name  AS creator_name,
    u.email AS creator_email,
    COALESCE(t.total_tasks, 0)::int      AS total_tasks,
    COALESCE(t.completed_tasks, 0)::int  AS completed_tasks,
    COALESCE(t.in_progress_tasks, 0)::int AS in_progress_tasks,
    COALESCE(t.todo_tasks, 0)::int       AS todo_tasks,
    COALESCE(m.members, 0)::int          AS member_count
  FROM projects p
  LEFT JOIN users u ON u.id = p.created_by
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*)                                            AS total_tasks,
      COUNT(*) FILTER (WHERE status = 'completed')        AS completed_tasks,
      COUNT(*) FILTER (WHERE status = 'in_progress')      AS in_progress_tasks,
      COUNT(*) FILTER (WHERE status = 'todo')             AS todo_tasks
    FROM tasks WHERE project_id = p.id
  ) t ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(DISTINCT assigned_to) AS members
    FROM tasks WHERE project_id = p.id AND assigned_to IS NOT NULL
  ) m ON TRUE
`;

const list = async ({ status, priority, search, sort = 'created_at', order = 'desc' } = {}) => {
  const params = [];
  const where = [];
  if (status)   { params.push(status);   where.push(`p.status = $${params.length}`); }
  if (priority) { params.push(priority); where.push(`p.priority = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }

  const allowedSort = new Set(['created_at', 'deadline', 'priority', 'name', 'updated_at']);
  const sortCol = allowedSort.has(sort) ? sort : 'created_at';
  const sortDir = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const sql =
    SELECT_BASE +
    (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
    ` ORDER BY p.${sortCol} ${sortDir} NULLS LAST, p.created_at DESC`;

  const { rows } = await query(sql, params);
  return rows;
};

const findById = async (id) => {
  const sql = SELECT_BASE + ` WHERE p.id = $1 LIMIT 1`;
  const { rows } = await query(sql, [id]);
  return rows[0] || null;
};

const create = async ({ name, description, status, priority, deadline, createdBy }) => {
  // Defaults applied in JS so PG can cast text → enum cleanly (COALESCE
  // breaks enum inference because both args appear as `text`).
  const { rows } = await query(
    `INSERT INTO projects (name, description, status, priority, deadline, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      name,
      description || null,
      status || 'active',
      priority || 'medium',
      deadline || null,
      createdBy,
    ]
  );
  return findById(rows[0].id);
};

const update = async (id, patch) => {
  // `cast` makes the bound parameter type explicit so PG can assign text
  // into custom enum columns without ambiguity.
  const fieldMap = {
    name:        { col: 'name' },
    description: { col: 'description' },
    status:      { col: 'status',   cast: 'project_status' },
    priority:    { col: 'priority', cast: 'priority_level' },
    deadline:    { col: 'deadline', cast: 'date' },
  };
  const sets = [];
  const params = [id];
  let idx = 2;
  for (const [key, def] of Object.entries(fieldMap)) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      const placeholder = def.cast ? `$${idx}::${def.cast}` : `$${idx}`;
      sets.push(`${def.col} = ${placeholder}`);
      params.push(patch[key] === '' ? null : patch[key]);
      idx++;
    }
  }
  if (sets.length === 0) return findById(id);
  const { rows } = await query(
    `UPDATE projects SET ${sets.join(', ')} WHERE id = $1 RETURNING id`,
    params
  );
  if (!rows[0]) return null;
  return findById(id);
};

const remove = async (id) => {
  const { rowCount } = await query(`DELETE FROM projects WHERE id = $1`, [id]);
  return rowCount > 0;
};

module.exports = { list, findById, create, update, remove };
