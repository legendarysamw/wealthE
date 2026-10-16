import { useState, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, DollarSign, Target, Zap, Calculator,
  ArrowRight, Sparkles, Shield, Rocket, Crown,
  BarChart3, PieChart as PieIcon, Clock, Award
} from 'lucide-react';

// Types
interface IncomeStream {
  id: string;
  name: string;
  monthlyIncome: number;
  growthRate: number;
  hoursPerWeek: number;
  type: 'active' | 'passive' | 'portfolio';
}

interface Scenario {
  name: string;
  savingsRate: number;
  investmentReturn: number;
  years: number;
}

function App() {
  // Core financial inputs
  const [monthlyExpenses, setMonthlyExpenses] = useState(3000);
  const [currentSavings, setCurrentSavings] = useState(10000);
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [age, setAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(55);

  // Income streams
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>([
    { id: '1', name: 'Primary Job', monthlyIncome: 5000, growthRate: 3, hoursPerWeek: 40, type: 'active' },
    { id: '2', name: 'Freelance Work', monthlyIncome: 800, growthRate: 8, hoursPerWeek: 10, type: 'active' },
    { id: '3', name: 'Dividend Stocks', monthlyIncome: 150, growthRate: 5, hoursPerWeek: 1, type: 'portfolio' },
  ]);

  // Investment parameters
  const [monthlyInvestment, setMonthlyInvestment] = useState(1500);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [inflationRate, setInflationRate] = useState(3);

  // Active tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'streams' | 'simulator' | 'roadmap'>('dashboard');

  // Calculations
  const freedomNumber = useMemo(() => {
    const annualExpenses = monthlyExpenses * 12;
    return annualExpenses * 25; // 4% rule
  }, [monthlyExpenses]);

  const totalMonthlyPassiveIncome = useMemo(() => {
    return incomeStreams
      .filter(s => s.type === 'passive' || s.type === 'portfolio')
      .reduce((sum, s) => sum + s.monthlyIncome, 0);
  }, [incomeStreams]);

  const totalMonthlyIncome = useMemo(() => {
    return incomeStreams.reduce((sum, s) => sum + s.monthlyIncome, 0);
  }, [incomeStreams]);

  const autonomyScore = useMemo(() => {
    const passiveRatio = totalMonthlyPassiveIncome / Math.max(monthlyExpenses, 1);
    const savingsRatio = currentSavings / Math.max(freedomNumber, 1);
    const incomeDiversity = Math.min(incomeStreams.length / 5, 1);
    const score = (passiveRatio * 40 + savingsRatio * 35 + incomeDiversity * 25);
    return Math.min(Math.round(score), 100);
  }, [totalMonthlyPassiveIncome, monthlyExpenses, currentSavings, freedomNumber, incomeStreams.length]);

  const yearsToFreedom = useMemo(() => {
    const monthlyGap = monthlyExpenses - totalMonthlyPassiveIncome;
    if (monthlyGap <= 0) return 0;
    const needed = freedomNumber - currentSavings;
    const monthlyContrib = monthlyIncome - monthlyExpenses;
    if (monthlyContrib <= 0) return Infinity;
    const r = annualReturn / 100 / 12;
    let months = 0;
    let balance = currentSavings;
    while (balance < freedomNumber && months < 600) {
      balance = balance * (1 + r) + monthlyContrib;
      months++;
    }
    return Math.ceil(months / 12);
  }, [monthlyExpenses, totalMonthlyPassiveIncome, freedomNumber, currentSavings, monthlyIncome, annualReturn]);

  // Growth projection data
  const projectionData = useMemo(() => {
    const data = [];
    let balance = currentSavings;
    const r = annualReturn / 100 / 12;
    const monthlyContrib = monthlyInvestment;

    for (let year = 0; year <= Math.min(yearsToFreedom + 5, 40); year++) {
      const yearBalance = balance;
      const passiveIncome = totalMonthlyPassiveIncome * 12 * Math.pow(1.05, year);
      data.push({
        year: age + year,
        wealth: Math.round(yearBalance),
        freedomLine: freedomNumber,
        passiveIncome: Math.round(passiveIncome),
        expenses: Math.round(monthlyExpenses * 12 * Math.pow(1 + inflationRate / 100, year)),
      });
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + r) + monthlyContrib;
      }
    }
    return data;
  }, [currentSavings, annualReturn, monthlyInvestment, totalMonthlyPassiveIncome, freedomNumber, age, yearsToFreedom, monthlyExpenses, inflationRate]);

  // Income breakdown for pie chart
  const incomeBreakdown = useMemo(() => {
    return incomeStreams.map(s => ({
      name: s.name,
      value: s.monthlyIncome,
      type: s.type,
    }));
  }, [incomeStreams]);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  // Add income stream
  const addIncomeStream = () => {
    const newStream: IncomeStream = {
      id: Date.now().toString(),
      name: 'New Stream',
      monthlyIncome: 0,
      growthRate: 5,
      hoursPerWeek: 5,
      type: 'active',
    };
    setIncomeStreams([...incomeStreams, newStream]);
  };

  const updateStream = (id: string, field: keyof IncomeStream, value: any) => {
    setIncomeStreams(incomeStreams.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const removeStream = (id: string) => {
    setIncomeStreams(incomeStreams.filter(s => s.id !== id));
  };

  // Autonomy level
  const getAutonomyLevel = () => {
    if (autonomyScore >= 80) return { label: 'Financially Free', color: 'text-emerald-400', icon: Crown };
    if (autonomyScore >= 60) return { label: 'Approaching Freedom', color: 'text-blue-400', icon: Rocket };
    if (autonomyScore >= 40) return { label: 'Building Momentum', color: 'text-purple-400', icon: Zap };
    if (autonomyScore >= 20) return { label: 'Getting Started', color: 'text-amber-400', icon: Target };
    return { label: 'Planting Seeds', color: 'text-gray-400', icon: Sparkles };
  };

  const autonomyLevel = getAutonomyLevel();
  const AutonomyIcon = autonomyLevel.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-xl bg-gray-950/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Wealth Autonomy Engine
              </h1>
              <p className="text-xs text-gray-500">Your path to financial freedom</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700/50 text-sm flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autonomyScore >= 60 ? 'bg-emerald-400' : autonomyScore >= 30 ? 'bg-amber-400' : 'bg-red-400'} animate-pulse`} />
              <span className="text-gray-300">Autonomy: <span className="font-bold text-white">{autonomyScore}%</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'streams', label: 'Income Streams', icon: DollarSign },
            { id: 'simulator', label: 'Simulator', icon: Calculator },
            { id: 'roadmap', label: 'Roadmap', icon: Target },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Autonomy Score Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-700" />
                    <circle
                      cx="64" cy="64" r="56" stroke="url(#gradient)" strokeWidth="8" fill="none"
                      strokeDasharray={`${autonomyScore * 3.52} 352`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-3xl font-bold">{autonomyScore}</span>
                      <span className="text-sm text-gray-400">/100</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className={`flex items-center gap-2 justify-center md:justify-start ${autonomyLevel.color}`}>
                    <AutonomyIcon className="w-6 h-6" />
                    <span className="text-xl font-bold">{autonomyLevel.label}</span>
                  </div>
                  <p className="text-gray-400 mt-2">
                    {autonomyScore >= 60
                      ? "You're on the fast track to financial freedom! Keep diversifying your income."
                      : autonomyScore >= 30
                      ? "Good progress! Focus on building passive income streams to accelerate."
                      : "Every expert was once a beginner. Start by tracking expenses and building your first side income."}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">${freedomNumber.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Freedom Number</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {yearsToFreedom === Infinity ? '∞' : `${yearsToFreedom} yrs`}
                      </p>
                      <p className="text-xs text-gray-500">To Freedom</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">${totalMonthlyPassiveIncome}/mo</p>
                      <p className="text-xs text-gray-500">Passive Income</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Monthly Income', value: `$${totalMonthlyIncome.toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500/20 to-emerald-500/5' },
                { label: 'Monthly Expenses', value: `$${monthlyExpenses.toLocaleString()}`, icon: TrendingUp, color: 'from-red-500/20 to-red-500/5' },
                { label: 'Monthly Savings', value: `$${(totalMonthlyIncome - monthlyExpenses).toLocaleString()}`, icon: Shield, color: 'from-blue-500/20 to-blue-500/5' },
                { label: 'Income Streams', value: `${incomeStreams.length}`, icon: Zap, color: 'from-purple-500/20 to-purple-500/5' },
              ].map((stat, i) => (
                <div key={i} className={`rounded-xl bg-gradient-to-br ${stat.color} border border-gray-700/50 p-4`}>
                  <stat.icon className="w-5 h-5 text-gray-400 mb-2" />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Wealth Projection */}
              <div className="rounded-2xl bg-gray-800/30 border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Wealth Projection
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={projectionData}>
                    <defs>
                      <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Area type="monotone" dataKey="wealth" stroke="#10b981" fill="url(#wealthGrad)" strokeWidth={2} name="Net Worth" />
                    <Line type="monotone" dataKey="freedomLine" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} name="Freedom Line" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Income Breakdown */}
              <div className="rounded-2xl bg-gray-800/30 border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-blue-400" />
                  Income Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={incomeBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {incomeBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}/mo`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {incomeBreakdown.map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Income vs Expenses Over Time */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Passive Income vs Expenses Over Time
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Line type="monotone" dataKey="passiveIncome" stroke="#10b981" strokeWidth={2} name="Passive Income" dot={false} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses (inflated)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Income Stream Architect</h2>
                <p className="text-gray-400 text-sm mt-1">Build multiple revenue streams for financial autonomy</p>
              </div>
              <button
                onClick={addIncomeStream}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Add Stream
              </button>
            </div>

            {/* Stream Cards */}
            <div className="grid gap-4">
              {incomeStreams.map((stream) => (
                <div key={stream.id} className="rounded-2xl bg-gray-800/30 border border-gray-700/50 p-5 hover:border-gray-600/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="text"
                          value={stream.name}
                          onChange={(e) => updateStream(stream.id, 'name', e.target.value)}
                          className="bg-transparent text-lg font-semibold border-b border-gray-700 focus:border-emerald-500 outline-none pb-1 w-full max-w-[200px]"
                        />
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          stream.type === 'active' ? 'bg-amber-500/20 text-amber-400' :
                          stream.type === 'passive' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {stream.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">Monthly $</label>
                          <input
                            type="number"
                            value={stream.monthlyIncome}
                            onChange={(e) => updateStream(stream.id, 'monthlyIncome', Number(e.target.value))}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Growth %/yr</label>
                          <input
                            type="number"
                            value={stream.growthRate}
                            onChange={(e) => updateStream(stream.id, 'growthRate', Number(e.target.value))}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Hours/Week</label>
                          <input
                            type="number"
                            value={stream.hoursPerWeek}
                            onChange={(e) => updateStream(stream.id, 'hoursPerWeek', Number(e.target.value))}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Type</label>
                          <select
                            value={stream.type}
                            onChange={(e) => updateStream(stream.id, 'type', e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:border-emerald-500 outline-none"
                          >
                            <option value="active">Active</option>
                            <option value="passive">Passive</option>
                            <option value="portfolio">Portfolio</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-400">${stream.monthlyIncome.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">/month</p>
                      </div>
                      <button
                        onClick={() => removeStream(stream.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {/* Growth projection mini bar */}
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>5yr projection:</span>
                      <span className="text-emerald-400 font-medium">
                        ${Math.round(stream.monthlyIncome * Math.pow(1 + stream.growthRate / 100, 5)).toLocaleString()}/mo
                      </span>
                      <span className="text-gray-600">→</span>
                      <span className="text-gray-400">
                        ${Math.round(stream.monthlyIncome * Math.pow(1 + stream.growthRate / 100, 5) * 12).toLocaleString()}/yr
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stream Ideas */}
            <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Income Stream Ideas to Consider
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { name: 'Digital Products', desc: 'Courses, ebooks, templates', type: 'passive' },
                  { name: 'Rental Income', desc: 'Real estate, equipment', type: 'passive' },
                  { name: 'Affiliate Marketing', desc: 'Recommend products for commission', type: 'passive' },
                  { name: 'Dividend Investing', desc: 'Stocks, ETFs, REITs', type: 'portfolio' },
                  { name: 'Consulting', desc: 'Leverage your expertise', type: 'active' },
                  { name: 'SaaS / Micro-SaaS', desc: 'Build software that solves problems', type: 'passive' },
                  { name: 'Content Creation', desc: 'YouTube, podcast, newsletter', type: 'active' },
                  { name: 'Index Fund Investing', desc: 'Automated wealth building', type: 'portfolio' },
                ].map((idea, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/30 border border-gray-700/30">
                    <div className={`w-2 h-2 rounded-full ${
                      idea.type === 'passive' ? 'bg-emerald-400' : idea.type === 'portfolio' ? 'bg-blue-400' : 'bg-amber-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{idea.name}</p>
                      <p className="text-xs text-gray-500">{idea.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">What-If Simulator</h2>
              <p className="text-gray-400 text-sm mt-1">Test different strategies and see how they affect your freedom timeline</p>
            </div>

            {/* Input Controls */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-xl bg-gray-800/30 border border-gray-700/50 p-4">
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4" /> Monthly Expenses
                </label>
                <input
                  type="range" min="500" max="20000" step="100"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-lg font-bold mt-1">${monthlyExpenses.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-gray-800/30 border border-gray-700/50 p-4">
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4" /> Current Savings
                </label>
                <input
                  type="range" min="0" max="500000" step="1000"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <p className="text-lg font-bold mt-1">${currentSavings.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-gray-800/30 border border-gray-700/50 p-4">
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4" /> Monthly Investment
                </label>
                <input
                  type="range" min="0" max="10000" step="100"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <p className="text-lg font-bold mt-1">${monthlyInvestment.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-gray-800/30 border border-gray-700/50 p-4">
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4" /> Annual Return %
                </label>
                <input
                  type="range" min="1" max="15" step="0.5"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <p className="text-lg font-bold mt-1">{annualReturn}%</p>
              </div>
              <div className="rounded-xl bg-gray-800/30 border border-gray-700/50 p-4">
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" /> Current Age
                </label>
                <input
                  type="range" min="18" max="65" step="1"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <p className="text-lg font-bold mt-1">{age} years</p>
              </div>
              <div className="rounded-xl bg-gray-800/30 border border-gray-700/50 p-4">
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4" /> Inflation Rate %
                </label>
                <input
                  type="range" min="0" max="8" step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
                <p className="text-lg font-bold mt-1">{inflationRate}%</p>
              </div>
            </div>

            {/* Results */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-5 text-center">
                <p className="text-sm text-gray-400">Freedom Number</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">${freedomNumber.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">25x annual expenses (4% rule)</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 p-5 text-center">
                <p className="text-sm text-gray-400">Years to Freedom</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">
                  {yearsToFreedom === Infinity ? '∞' : `${yearsToFreedom}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {yearsToFreedom !== Infinity ? `Age ${age + yearsToFreedom}` : 'Increase savings rate'}
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-5 text-center">
                <p className="text-sm text-gray-400">Total Invested</p>
                <p className="text-3xl font-bold text-purple-400 mt-1">
                  ${yearsToFreedom !== Infinity ? ((monthlyInvestment * 12 * yearsToFreedom) + currentSavings).toLocaleString() : '—'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Principal contributions</p>
              </div>
            </div>

            {/* Comparison Chart */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4">Wealth Growth: Conservative vs Aggressive</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={projectionData.map(d => ({
                  ...d,
                  conservative: Math.round(currentSavings * Math.pow(1.04, d.year - age) + monthlyInvestment * 12 * ((d.year - age) || 1) * 0.8),
                  aggressive: Math.round(currentSavings * Math.pow(1.12, d.year - age) + monthlyInvestment * 12 * ((d.year - age) || 1) * 1.2),
                }))}>
                  <defs>
                    <linearGradient id="consGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aggGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="conservative" stroke="#f59e0b" fill="url(#consGrad)" strokeWidth={2} name="Conservative (4%)" />
                  <Area type="monotone" dataKey="wealth" stroke="#10b981" fill="url(#wealthGrad)" strokeWidth={2} name={`Your Plan (${annualReturn}%)`} />
                  <Area type="monotone" dataKey="aggressive" stroke="#8b5cf6" fill="url(#aggGrad)" strokeWidth={2} name="Aggressive (12%)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Your Freedom Roadmap</h2>
              <p className="text-gray-400 text-sm mt-1">Actionable steps based on your current financial situation</p>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-purple-500" />
              
              {[
                {
                  phase: 'Phase 1: Foundation',
                  time: 'Months 1-3',
                  color: 'emerald',
                  actions: [
                    'Track every expense for 30 days',
                    'Build 1-month emergency fund',
                    'Identify 3 skills you can monetize',
                    'Set up automatic savings (pay yourself first)',
                  ]
                },
                {
                  phase: 'Phase 2: First Income Stream',
                  time: 'Months 3-6',
                  color: 'blue',
                  actions: [
                    'Launch your first side hustle',
                    'Aim for $500/month additional income',
                    'Invest all side income (don\'lifestyle inflate)',
                    'Learn one high-income skill deeply',
                  ]
                },
                {
                  phase: 'Phase 3: Diversification',
                  time: 'Months 6-18',
                  color: 'purple',
                  actions: [
                    'Add second income stream',
                    'Start index fund investing (Bogleheads method)',
                    'Build passive income to cover 25% of expenses',
                    'Negotiate raise or switch to higher-paying role',
                  ]
                },
                {
                  phase: 'Phase 4: Acceleration',
                  time: 'Years 2-5',
                  color: 'amber',
                  actions: [
                    'Scale your best income stream',
                    'Passive income covers 50% of expenses',
                    'Max out tax-advantaged accounts',
                    'Build systems that work without you',
                  ]
                },
                {
                  phase: 'Phase 5: Freedom',
                  time: 'Years 5-10',
                  color: 'rose',
                  actions: [
                    'Passive income exceeds expenses',
                    'Choose work based on passion, not paycheck',
                    'Diversify across asset classes',
                    'Mentor others on their wealth journey',
                  ]
                },
              ].map((phase, i) => (
                <div key={i} className="relative pl-14 pb-8">
                  <div className={`absolute left-4 w-5 h-5 rounded-full bg-${phase.color}-500 border-4 border-gray-900 shadow-lg shadow-${phase.color}-500/20`}
                    style={{ backgroundColor: phase.color === 'emerald' ? '#10b981' : phase.color === 'blue' ? '#3b82f6' : phase.color === 'purple' ? '#8b5cf6' : phase.color === 'amber' ? '#f59e0b' : '#f43f5e' }}
                  />
                  <div className="rounded-2xl bg-gray-800/30 border border-gray-700/50 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold">{phase.phase}</h3>
                      <span className="text-xs text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">{phase.time}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      {phase.actions.map((action, j) => (
                        <div key={j} className="flex items-start gap-2 text-sm text-gray-300">
                          <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-gray-500 flex-shrink-0" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key Principles */}
            <div className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Core Wealth Principles
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Spend Less Than You Earn', desc: 'The gap between income and expenses is your wealth-building fuel.' },
                  { title: 'Invest the Difference', desc: 'Money sitting idle loses value. Make it work through diversified investments.' },
                  { title: 'Build Multiple Streams', desc: 'Never depend on a single income source. Diversify like a business.' },
                  { title: 'Increase Earning Power', desc: 'Your skills are your greatest asset. Invest in learning constantly.' },
                  { title: 'Automate Everything', desc: 'Remove willpower from the equation. Auto-save, auto-invest.' },
                  { title: 'Think in Decades', desc: 'Compound interest rewards patience. Start now, stay consistent.' },
                ].map((principle, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-900/30 border border-gray-700/30">
                    <p className="font-medium text-sm">{principle.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{principle.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* The Math */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 p-6">
              <h3 className="text-lg font-semibold mb-3">💡 The Freedom Math (4% Rule)</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Your <strong className="text-emerald-400">Freedom Number</strong> = Annual Expenses × 25</p>
                <p>• At ${monthlyExpenses.toLocaleString()}/month, you need <strong className="text-emerald-400">${freedomNumber.toLocaleString()}</strong> invested</p>
                <p>• With a 4% withdrawal rate, this generates <strong className="text-emerald-400">${monthlyExpenses.toLocaleString()}/month</strong> forever</p>
                <p>• At {annualReturn}% returns investing ${monthlyInvestment}/month, you reach this in <strong className="text-blue-400">{yearsToFreedom === Infinity ? 'never - increase savings!' : `${yearsToFreedom} years`}</strong></p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-6 text-center text-sm text-gray-600">
        <p>Wealth Autonomy Engine • Your financial freedom starts with a single decision</p>
      </footer>
    </div>
  );
}

export default App;
