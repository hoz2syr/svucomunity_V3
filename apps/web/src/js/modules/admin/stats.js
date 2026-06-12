export async function loadStats(db) {
  try {
    const result = await db.rpc('get_admin_stats');
    if (result.data?.length) {
      const stats = result.data[0];
      document.getElementById('statUsers').textContent = stats.total_users ?? 0;
      document.getElementById('statActive').textContent = stats.active_users ?? 0;
      document.getElementById('statGroups').textContent = stats.total_groups ?? 0;
      document.getElementById('statMembers').textContent = stats.total_memberships ?? 0;
      return;
    }
  } catch (e) {
    // fallback: manual count
  }

  try {
    const usersCount = await db.from('users').select('*', { count: 'exact', head: true });
    const groupsCount = await db.from('groups').select('*', { count: 'exact', head: true });
    const membersCount = await db.from('group_members').select('*', { count: 'exact', head: true });
    document.getElementById('statUsers').textContent = usersCount.count ?? 0;
    document.getElementById('statActive').textContent = '-';
    document.getElementById('statGroups').textContent = groupsCount.count ?? 0;
    document.getElementById('statMembers').textContent = membersCount.count ?? 0;
  } catch (e) {
    // ignore fallback errors
  }
}
