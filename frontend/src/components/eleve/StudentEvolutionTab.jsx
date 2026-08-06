import React from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

const StudentEvolutionTab = ({ evolution }) => {
  return (
    <div className="tab-pane">
      <div className="evolution-section card-box">
        <h2>Graphique d'Évolution de Moyenne Générale</h2>
        <p className="subtitle">Ce graphique affiche votre moyenne générale calculée semestre par semestre tout au long de votre parcours.</p>
        
        <div className="chart-container mt-6">
          {evolution.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                data={evolution}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMoy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periode" />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Area type="monotone" dataKey="moyenne" name="Moyenne" stroke="#15803d" fillOpacity={1} fill="url(#colorMoy)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <Activity size={48} className="text-gray" />
              <p>Pas assez de données de moyennes pour tracer le graphique.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentEvolutionTab;
