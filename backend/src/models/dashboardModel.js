const { query } = require('../config/db');

const getStats = async ({ userId } = {}) => {
  const [
    projectsAgg,
    tasksAgg,
    priorityAgg,
    last7Agg,
    activityAgg,
    myTasksAgg,
  ] = await Promise.all([
    query(`
      SELECT
        COUNT(*)::int                                              AS total_projects,
        COUNT(*) FILTER (WHERE status = 'active')::int             AS active_projects,
        COUNT(*) FILTER (WHERE status = 'archived')::int           AS archived_projects
      FROM projects
    `),
    query(`
      SELECT
        COUNT(*)::int                                                          AS total_tasks,
        COUNT(*) FILTER (WHERE status = 'completed')::int                      AS completed_tasks,
        COUNT(*) FILTER (WHERE status = 'in_progress')::int                    AS in_progress_tasks,
        COUNT(*) FILTER (WHERE status = 'todo')::int                           AS todo_tasks,
        COUNT(*) FILTER (
          WHERE due_date < CURRENT_DATE AND status <> 'completed'
        )::int                                                                 AS overdue_tasks
      FROM tasks
    `),
    query(`
      SELECT
        COUNT(*) FILTER (WHERE priority = 'low')::int    AS low,
        COUNT(*) FILTER (WHERE priority = 'medium')::int AS medium,
        COUNT(*) FILTER (WHERE priority = 'high')::int   AS high
      FROM tasks
    `),
    query(`
      WITH series AS (
        SELECT generate_series(
          (CURRENT_DATE - INTERVAL '6 days')::date,
          CURRENT_DATE::date,
          INTERVAL '1 day'
        )::date AS day
      )
      SELECT
        s.day,
        COALESCE(COUNT(t.id), 0)::int AS completed
      FROM series s
      LEFT JOIN tasks t
        ON DATE(t.completed_at) = s.day
       AND t.status = 'completed'
      GROUP BY s.day
      ORDER BY s.day ASC
    `),
    query(`
      SELECT
        t.id,
        t.title,
        t.status,
        t.priority,
        t.project_id,
        p.name        AS project_name,
        t.updated_at  AS at,
        u.name        AS actor_name,
        u.email       AS actor_email
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN users    u ON u.id = COALESCE(t.assigned_to, t.created_by)
      ORDER BY t.updated_at DESC
      LIMIT 10
    `),
    userId
      ? query(
          `SELECT
              t.id, t.title, t.status, t.priority, t.due_date,
              t.project_id, p.name AS project_name
           FROM tasks t
           LEFT JOIN projects p ON p.id = t.project_id
           WHERE t.assigned_to = $1
           ORDER BY
             CASE t.status WHEN 'in_progress' THEN 1 WHEN 'todo' THEN 2 ELSE 3 END,
             t.due_date NULLS LAST
           LIMIT 8`,
          [userId]
        )
      : Promise.resolve({ rows: [] }),
  ]);

  const tasks = tasksAgg.rows[0];
  const projects = projectsAgg.rows[0];
  const priority = priorityAgg.rows[0];
  const completionRate =
    tasks.total_tasks > 0
      ? Math.round((tasks.completed_tasks / tasks.total_tasks) * 1000) / 10
      : 0;

  return {
    totalProjects:    projects.total_projects,
    activeProjects:   projects.active_projects,
    archivedProjects: projects.archived_projects,
    totalTasks:       tasks.total_tasks,
    completedTasks:   tasks.completed_tasks,
    inProgressTasks:  tasks.in_progress_tasks,
    pendingTasks:     tasks.todo_tasks,
    overdueTasks:     tasks.overdue_tasks,
    completionRate,
    tasksByPriority: {
      low:    priority.low,
      medium: priority.medium,
      high:   priority.high,
    },
    completedLast7Days: last7Agg.rows.map((r) => ({
      day: r.day,
      completed: r.completed,
    })),
    recentActivity: activityAgg.rows,
    myTasks: myTasksAgg.rows,
  };
};

module.exports = { getStats };
