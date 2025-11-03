import { Stats, User } from '../types/types';

const AdminStats = ({ stats }: { stats: Stats }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Étudiants</h3>
          <p className="text-3xl font-bold">{stats.etudiants}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Formateurs</h3>
          <p className="text-3xl font-bold">{stats.formateurs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Administrateurs</h3>
          <p className="text-3xl font-bold">{stats.admins}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Formations</h3>
          <p className="text-3xl font-bold">{stats.courses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">EC (cours)</h3>
          <p className="text-3xl font-bold">{stats.ec}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Inscriptions</h3>
          <p className="text-3xl font-bold">{stats.inscriptions}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Utilisateurs connectés (temps réel)</h3>
          {stats.connectedUsers?.length > 0 ? (
            <ul>
              {stats.connectedUsers.map((u: User) => (
                <li key={u.id} className="mb-2">
                  <span className="font-bold">{u.nom} {u.prenom}</span> <span className="text-xs text-gray-500">({u.email})</span>
                  <span className="ml-2 text-xs text-green-600">{u.role}</span>
                  <span className="ml-2 text-xs text-gray-400">{u.last_login && new Date(u.last_login).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucun utilisateur connecté actuellement.</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Utilisateurs récemment connectés</h3>
          {stats.recentUsers?.length > 0 ? (
            <ul>
              {stats.recentUsers.map((u: User) => (
                <li key={u.id} className="mb-2">
                  <span className="font-bold">{u.nom} {u.prenom}</span> <span className="text-xs text-gray-500">({u.email})</span>
                  <span className="ml-2 text-xs text-blue-600">{u.role}</span>
                  <span className="ml-2 text-xs text-gray-400">{u.last_login && new Date(u.last_login).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucun utilisateur récemment connecté.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminStats;