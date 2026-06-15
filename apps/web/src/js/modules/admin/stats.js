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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isoDate = today.toISOString();
    const { count: creatorCount } = await db
      .from('study_groups')
      .select('*', { count: 'exact', head: true });
    const { data: members, error: membersErr } = await db
      .from('group_members')
      .select('group_id, user_id');
    if (membersErr) throw membersErr;
    const uniqueGroupIdsMember = [...new Set((members || []).map(m => m.group_id))];
    const { count: memberCount } = uniqueGroupIdsMember.length
      ? await db.from('study_groups').select('*', { count: 'exact', head: true }).in('id', uniqueGroupIdsMember)
      : { count: 0 };
    const activeResult = await db
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('last_login', isoDate);
    const usersCount = await db.from('users').select('id', { count: 'exact', head: true });
    const groupsCount = await db.from('groups').select('id', { count: 'exact', head: true });
    const coursesCount = await db.from('courses').select('id', { count: 'exact', head: true });
    setText('adminTotalUsers', usersCount.count ?? 0);
    setText('adminTotalCourses', coursesCount.count ?? 0);
    setText('adminTotalGroups', (groupsCount.count ?? 0) + (memberCount ?? 0));
    setText('adminActiveToday', activeResult.count ?? '-');
  } catch (e) {
    console.error('[admin-stats] Fallback queries failed:', e);
    setText('adminTotalUsers', '-');
    setText('adminTotalCourses', '-');
    setText('adminTotalGroups', '-');
    setText('adminActiveToday', '-');
  }
}
