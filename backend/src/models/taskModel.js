const { query } = require('../config/db');

const SELECT_BASE = `
  SELECT
    t.id, t.title, t.description, t.status, t.priority,
    t.due_date, t.project_id, t.assigned_to, t.created_by,
    t.completed_at, t.created_at, t.updated_at,
    p.name       AS project_name,
    p.status     AS project_status,
    p.created_by AS project_creator,
    a.name       AS assignee_name,
    a.email      AS assignee_email,
    a.avatar_url AS assignee_avatar,
    c.name       AS creator_name,
    c.email      AS creator_email
  FROM tasks t
  LEFT JOIN projects p ON p.id = t.project_id
  LEFT JOIN users    a ON a.id = t.assigned_to
  LEFT JOIN users    c ON c.id = t.created_by
`;

const buildFilters = (filters = {}, startIdx = 1) => {
  const where = [];
  const params = [];
  let idx = startIdx;

  if (filters.projectId) {
    params.push(filters.projectId);
    where.push(`t.project_id = $${idx++}`);
  }
  if (filters.status) {
    params.push(filters.status);
    where.push(`t.status = $${idx++}`);
  }
  if (filters.priority) {
    params.push(filters.priority);
    where.push(`t.priority = $${idx++}`);
  }
  if (filters.assignedTo) {
    if (filters.assignedTo === 'unassigned') {
      where.push(`t.assigned_to IS NULL`);
    } else {
      params.push(filters.assignedTo);
      where.push(`t.assigned_to = $${idx++}`);
    }
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    where.push(`(t.title ILIKE $${idx} OR t.description ILIKE $${idx})`);
    idx++;
  }
  if (filters.overdueOnly) {
    where.push(`t.due_date < CURRENT_DATE AND t.status <> 'completed'`);
  }
  return { where, params, nextIdx: idx };
};

const list = async (filters = {}, { sort = 'created_at', order = 'desc' } = {}) => {
  const { where, params } = buildFilters(filters);
  const allowedSort = new Set(['created_at', 'due_date', 'priority', 'status', 'title', 'updated_at']);
  const sortCol = allowedSort.has(sort) ? sort : 'created_at';
  const sortDir = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const sql =
    SELECT_BASE +
    (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
    ` ORDER BY t.${sortCol} ${sortDir} NULLS LAST, t.created_at DESC`;

  const { rows } = await query(sql, params);
  return rows;
};

const findById = async (id) => {
  const sql = SELECT_BASE + ` WHERE t.id = $1 LIMIT 1`;
  const { rows } = await query(sql, [id]);
  return rows[0] || null;
};

const create = async ({
  title,
  description,
  status,
  priority,
  dueDate,
  projectId,
  assignedTo,
  createdBy,
}) => {
  const { rows } = await query(
    `INSERT INTO tasks
       (title, description, status, priority, due_date, project_id, assigned_to, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      title,
      description || null,
      status || 'todo',
      priority || 'medium',
      dueDate || null,
      projectId,
      assignedTo || null,
      createdBy,
    ]
  );
  return findById(rows[0].id);
};

const update = async (id, patch) => {
  // Only update fields explicitly provided by the caller. `cast` keeps PG
  // happy when assigning text parameters to custom enum columns.
  const fieldMap = {
    title:       { col: 'title' },
    description: { col: 'description' },
    status:      { col: 'status',      cast: 'task_status' },
    priority:    { col: 'priority',    cast: 'priority_level' },
    dueDate:     { col: 'due_date',    cast: 'date' },
    assignedTo:  { col: 'assigned_to', cast: 'uuid' },
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
    `UPDATE tasks SET ${sets.join(', ')} WHERE id = $1 RETURNING id`,
    params
  );
  if (!rows[0]) return null;
  return findById(id);
};

const updateStatus = async (id, status) => {
  const { rows } = await query(
    `UPDATE tasks SET status = $2::task_status WHERE id = $1 RETURNING id`,
    [id, status]
  );
  if (!rows[0]) return null;
  return findById(id);
};

const remove = async (id) => {
  const { rowCount } = await query(`DELETE FROM tasks WHERE id = $1`, [id]);
  return rowCount > 0;
};

module.exports = { list, findById, create, update, updateStatus, remove };
