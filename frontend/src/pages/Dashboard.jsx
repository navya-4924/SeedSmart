import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiDroplet, FiCalendar, FiArrowRight, FiCloud } from 'react-icons/fi';
import { FaSeedling, FaLeaf, FaTemperatureHigh, FaTint } from 'react-icons/fa';
import { 
  PieChart, Pie, Cell, LineChart, Line, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const cropData = [
    { name: 'Groundnut', value: 35, color: '#22c55e' },
    { name: 'Cotton', value: 25, color: '#3b82f6' },
    { name: 'Paddy', value: 20, color: '#eab308' },
    { name: 'Turmeric', value: 10, color: '#a855f7' },
    { name: 'Others', value: 10, color: '#6b7280' },
  ];

  const moistureData = [
    { day: 'Mon', value: 72 },
    { day: 'Tue', value: 68 },
    { day: 'Wed', value: 75 },
    { day: 'Thu', value: 70 },
    { day: 'Fri', value: 73 },
    { day: 'Sat', value: 68 },
    { day: 'Sun', value: 71 },
  ];

  const forecast = [
    { day: 'Tue', icon: '☀️', high: 24, low: 16 },
    { day: 'Wed', icon: '⛅', high: 26, low: 17 },
    { day: 'Thu', icon: '🌧️', high: 27, low: 18 },
    { day: 'Fri', icon: '🌧️', high: 28, low: 19 },
    { day: 'Sat', icon: '☀️', high: 29, low: 20 },
  ];

  const yieldData = [
    { crop: '🌾 Rice', value: '12.5', unit: 'tons/acre' },
    { crop: '🌽 Maize', value: '10.8', unit: 'tons/acre' },
    { crop: '☁️ Cotton', value: '8.4', unit: 'tons/acre' },
    { crop: '🥬 Vegetables', value: '6.2', unit: 'tons/acre' },
  ];

  const today = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  return (
    <div className="space-y-5">

      {/* ============ WELCOME BANNER ============ */}
      <div 
        className="card p-6 relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(120deg, rgba(8, 26, 13, 0.92) 0%, rgba(20, 53, 31, 0.75) 60%, rgba(34, 197, 94, 0.25) 100%), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}! 👋
            </h1>
            <p className="text-gray-300 mt-1.5 text-sm">
              Here's what's happening with your farm today.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-900/40 border border-green-700/40 px-4 py-2 rounded-xl">
            <FiCalendar className="text-green-400" size={16} />
            <span className="text-sm text-gray-200">{today}</span>
          </div>
        </div>
      </div>

      {/* ============ STAT CARDS ============ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<FaSeedling />} 
          value="24" 
          unit="Acres" 
          label="Total Farm Area" 
          trend="+2% from last week"
          color="from-green-500 to-emerald-600"
        />
        <StatCard 
          icon={<FaLeaf />} 
          value="6" 
          unit="Crops" 
          label="Total Crops" 
          trend="+1 new crop added"
          color="from-emerald-500 to-teal-600"
        />
        <StatCard 
          icon={<FaSeedling />} 
          value="6" 
          unit="Healthy" 
          label="Crops Growing" 
          trend="100% healthy"
          color="from-lime-500 to-green-600"
        />
        <StatCard 
          icon={<FiTrendingUp />} 
          value="86" 
          unit="tons" 
          label="Total Yield (Est.)" 
          trend="+12% from last season"
          color="from-teal-500 to-cyan-600"
        />
      </div>

      {/* ============ FIELD HEALTH + WEATHER ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Field Health */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            🏞️ Field Health Overview
          </h3>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie 
                  data={[
                    { name: 'Healthy', value: 86, color: '#22c55e' },
                    { name: 'Moderate', value: 8, color: '#eab308' },
                    { name: 'Needs Attention', value: 6, color: '#ef4444' },
                  ]}
                  dataKey="value" 
                  cx="50%" cy="50%" 
                  innerRadius={55} outerRadius={80}
                  paddingAngle={3}
                >
                  {[0, 1, 2].map((i) => (
                    <Cell key={i} fill={['#22c55e', '#eab308', '#ef4444'][i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#14351f', border: '1px solid #22c55e', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="-mt-32 mb-8 text-center">
              <p className="text-3xl font-bold text-green-400">86%</p>
              <p className="text-xs text-gray-400">Overall Health</p>
            </div>
            <div className="w-full space-y-2 mt-4">
              <HealthRow color="#22c55e" label="Healthy" value="86%" />
              <HealthRow color="#eab308" label="Moderate" value="8%" />
              <HealthRow color="#ef4444" label="Needs Attention" value="6%" />
            </div>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FiCloud className="text-green-400" /> Weather Today
            </h3>
            <span className="text-xs text-gray-400">📍 Kadapa, Andhra Pradesh</span>
          </div>

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🌤️</div>
              <div>
                <p className="text-4xl font-bold text-white">28°C</p>
                <p className="text-sm text-gray-400">Partly Cloudy</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <WeatherDetail icon="💧" label="Humidity" value="56%" />
              <WeatherDetail icon="💨" label="Wind" value="12 km/h" />
              <WeatherDetail icon="🌧️" label="Rainfall" value="0 mm" />
              <WeatherDetail icon="🌡️" label="Feels like" value="30°C" />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-4 border-t border-green-900/40">
            {forecast.map((f, i) => (
              <div key={i} className="text-center p-2 rounded-lg hover:bg-green-900/30 transition">
                <p className="text-xs text-gray-400 mb-1">{f.day}</p>
                <p className="text-2xl">{f.icon}</p>
                <p className="text-xs text-white mt-1 font-semibold">{f.high}°/{f.low}°</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ SOIL HEALTH + FARM IMAGE ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Soil Health */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            🧪 Soil Health Summary
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <SoilParam label="pH" value="6.5" status="Optimal" />
            <SoilParam label="N" value="48" unit="kg/ha" />
            <SoilParam label="P" value="22" unit="kg/ha" />
            <SoilParam label="K" value="32" unit="kg/ha" />
          </div>
          <div className="pt-3 border-t border-green-900/40">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Soil Fertility</span>
              <span className="text-green-400 font-semibold">Good</span>
            </div>
            <div className="w-full bg-green-950 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-lime-400 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>

        {/* Farm Image */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="relative h-full min-h-[220px]">
            <img 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200" 
              alt="Farm" 
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#081a0d] via-transparent to-transparent"></div>
            
            {/* Pin markers */}
            <div className="absolute top-8 left-12 bg-green-500 rounded-full p-2 shadow-lg shadow-green-500/50 animate-pulse">
              <FaSeedling className="text-white" size={14} />
            </div>
            <div className="absolute top-16 left-1/2 bg-blue-500 rounded-full p-2 shadow-lg shadow-blue-500/50">
              <FaTint className="text-white" size={14} />
            </div>
            <div className="absolute bottom-12 right-16 bg-yellow-500 rounded-full p-2 shadow-lg shadow-yellow-500/50">
              <FaTemperatureHigh className="text-white" size={14} />
            </div>

            <div className="absolute top-4 right-4 bg-green-900/80 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-green-500/40">
              <p className="text-xs text-green-300 font-medium">Crop Health</p>
              <p className="text-sm font-bold text-white">Good (92%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ CHARTS ROW ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Soil Moisture */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-white mb-4">💧 Soil Moisture Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={moistureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#166534" />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip contentStyle={{ background: '#14351f', border: '1px solid #22c55e', borderRadius: 8, color: '#fff' }} />
              <Line 
                type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} 
                dot={{ r: 4, fill: '#22c55e' }} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Crop Distribution */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-white mb-4">🌾 Crop Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="60%" height={180}>
              <PieChart>
                <Pie 
                  data={cropData} dataKey="value" cx="50%" cy="50%" 
                  innerRadius={45} outerRadius={70} paddingAngle={3}
                >
                  {cropData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#14351f', border: '1px solid #22c55e', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 text-xs">
              {cropData.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-300">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }}></div>
                  <span className="min-w-[80px]">{c.name}</span>
                  <span className="text-white font-semibold">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Yield Forecast */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-white mb-4">📈 Yield Forecast</h3>
          <div className="space-y-3">
            {yieldData.map((y, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-300">{y.crop}</span>
                <div className="text-right">
                  <span className="text-white font-bold">{y.value}</span>
                  <span className="text-xs text-gray-500 ml-1">{y.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/reports" className="flex items-center justify-center gap-1 mt-4 text-xs text-green-400 hover:text-green-300 font-medium">
            View Full Report <FiArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ============ UPCOMING TASKS ============ */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <FiCalendar className="text-green-400" /> Upcoming Tasks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TaskItem color="#22c55e" title="Irrigation - Field 1" time="Today, 08:00 AM" />
          <TaskItem color="#eab308" title="Fertilizer Application" time="Tomorrow, 06:00 AM" />
          <TaskItem color="#ef4444" title="Pest Monitoring" time="Jun 29, 2024" />
          <TaskItem color="#3b82f6" title="Harvest Planning" time="Jul 5, 2024" />
        </div>
      </div>

    </div>
  );
}

/* ============ SUB-COMPONENTS ============ */

function StatCard({ icon, value, unit, label, trend, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className={`bg-gradient-to-br ${color} text-white p-2.5 rounded-xl text-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400">{label}</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-400">{unit}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-green-400">
        <FiTrendingUp size={11} />
        <span>{trend}</span>
      </div>
    </div>
  );
}

function HealthRow({ color, label, value }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }}></div>
        <span className="text-gray-300">{label}</span>
      </div>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}

function WeatherDetail({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span>{icon}</span>
      <div>
        <p className="text-gray-500 text-[10px]">{label}</p>
        <p className="text-white font-semibold">{value}</p>
      </div>
    </div>
  );
}

function SoilParam({ label, value, unit, status }) {
  return (
    <div className="bg-green-900/30 rounded-xl p-3 border border-green-800/40">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-bold text-white mt-0.5">
        {value} {unit && <span className="text-xs text-gray-500">{unit}</span>}
      </p>
      {status && <p className="text-[10px] text-green-400 mt-0.5">({status})</p>}
    </div>
  );
}

function TaskItem({ color, title, time }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-900/30 transition">
      <div className="w-2 h-2 rounded-full" style={{ background: color }}></div>
      <div className="flex-1">
        <p className="text-sm text-white font-medium">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
      <FiArrowRight className="text-gray-500" size={14} />
    </div>
  );
}

export default Dashboard;