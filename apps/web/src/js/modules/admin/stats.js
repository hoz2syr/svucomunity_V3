export async function loadStats(db) {
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? '-';
  };

  try {
    const result = await db.rpc('get_admin_stats');
    if (result.data?.length) {
      const stats = result.data[0];
      setText('adminTotalUsers', stats.total_users ?? 0);
      setText('adminTotalCourses', stats.total_courses ?? 0);
      setText('adminTotalGroups', stats.total_groups ?? 0);
      setText('adminActiveToday', stats.active_today ?? stats.active_users ?? '-');
      return;
    }
  } catch (e) {
    console.warn('[admin-stats] Primary RPC failed, using fallback queries', e);
  }

  try {
    const usersCount = await db.from('users').select('id', { count: 'exact', head: true });
    const groupsCount = await db.from('groups').select('id', { count: 'exact', head: true });
    const coursesCount = await db.from('courses').select('id', { count: 'exact', head: true });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const isoDate = todayStart.toISOString();
    const activeResult = await db
      .from('users')
      .select('id', { count: 'exact', head: true })
      .or(`last_login.gte.${isoDate},is_active.eq.true`);

    setText('adminTotalUsers', usersCount.count ?? 0);
    setText('adminTotalCourses', coursesCount.count ?? 0);
    setText('adminTotalGroups', groupsCount.count ?? 0);
    setText('adminActiveToday', activeResult.count ?? '-');
  } catch (e) {
    console.error('[admin-stats] Fallback queries failed:', e);
    setText('adminTotalUsers', '-');
    setText('adminTotalCourses', '-');
    setText('adminTotalGroups', '-');
    setText('adminActiveToday', '-');
  }
}
