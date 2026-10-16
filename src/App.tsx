import { useState, useMemo, useCallback } from 'react';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  TopAppBar,
  FilledButton, TonalButton, OutlinedButton, TextButton,
  FAB, IconButton,
  Card,
  Chip,
  TextField,
  Slider,
  LinearProgress,
  Snackbar, Dialog, BottomSheet,
  NavigationBar, SegmentedButton, Divider, SurfaceContainer,
} from './components';

/* ==========================================================================
   Types
   ========================================================================== */
interface IncomeStream {
  id: string;
  name: string;
  monthlyIncome: number;
  growthRate: number;
  hoursPerWeek: number;
  type: 'active' | 'passive' | 'portfolio';
}

/* ==========================================================================
   M3 Color tokens for charts — sourced from CSS variables via getComputedStyle
   We resolve them once at module load so recharts gets stable hex values.
   ========================================================================== */
const CHART_COLORS = {
  primary: '#006874',
  primaryContainer: '#97f0ff',
  secondary: '#4a6268',
  secondaryContainer: '#cce7ed',
  tertiary: '#775a00',
  tertiaryContainer: '#ffdea4',
  error: '#ba1a1a',
  surfaceVariant: '#dae4e7',
  outline: '#6f797c',
  onSurface: '#171d1e',
  onSurfaceVariant: '#3f484b',
};

/* ==========================================================================
   Main App
   ========================================================================== */
function App() {
  /* ---------- Core financial inputs ---------- */
  const [monthlyExpenses, setMonthlyExpenses] = useState(3000);
  const [currentSavings, setCurrentSavings] = useState(10000);
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [age, setAge] = useState(30);

  /* ---------- Income streams ---------- */
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>([
    { id: '1', name: 'Primary Job', monthlyIncome: 5000, growthRate: 3, hoursPerWeek: 40, type: 'active' },
    { id: '2', name: 'Freelance Work', monthlyIncome: 800, growthRate: 8, hoursPerWeek: 10, type: 'active' },
    { id: '3', name: 'Dividend Stocks', monthlyIncome: 150, growthRate: 5, hoursPerWeek: 1, type: 'portfolio' },
  ]);

  /* ---------- Investment parameters ---------- */
  const [monthlyInvestment, setMonthlyInvestment] = useState(1500);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [inflationRate, setInflationRate] = useState(3);

  /* ---------- Navigation ---------- */
  const [tabIndex, setTabIndex] = useState(0);
  const tabs = [
    { label: 'Dashboard' },
    { label: 'Streams' },
    { label: 'Simulator' },
    { label: 'Roadmap' },
  ];

  /* ---------- Feedback ---------- */
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; name: string }>({ open: false, id: null, name: '' });
  const [sheetOpen, setSheetOpen] = useState(false);

  const showSnackbar = useCallback((message: string) => {
    setSnackbar({ open: true, message });
  }, []);

  /* ---------- Derived values ---------- */
  const freedomNumber = useMemo(() => monthlyExpenses * 12 * 25, [monthlyExpenses]);

  const totalMonthlyPassiveIncome = useMemo(
    () => incomeStreams.filter(s => s.type === 'passive' || s.type === 'portfolio').reduce((sum, s) => sum + s.monthlyIncome, 0),
    [incomeStreams],
  );

  const totalMonthlyIncome = useMemo(
    () => incomeStreams.reduce((sum, s) => sum + s.monthlyIncome, 0),
    [incomeStreams],
  );

  const autonomyScore = useMemo(() => {
    const passiveRatio = totalMonthlyPassiveIncome / Math.max(monthlyExpenses, 1);
    const savingsRatio = currentSavings / Math.max(freedomNumber, 1);
    const incomeDiversity = Math.min(incomeStreams.length / 5, 1);
    return Math.min(Math.round(passiveRatio * 40 + savingsRatio * 35 + incomeDiversity * 25), 100);
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

  const projectionData = useMemo(() => {
    const data: any[] = [];
    let balance = currentSavings;
    const r = annualReturn / 100 / 12;
    const years = Math.min(yearsToFreedom === Infinity ? 30 : yearsToFreedom + 5, 40);
    for (let year = 0; year <= years; year++) {
      data.push({
        year: age + year,
        wealth: Math.round(balance),
        freedomLine: freedomNumber,
        passiveIncome: Math.round(totalMonthlyPassiveIncome * 12 * Math.pow(1.05, year)),
        expenses: Math.round(monthlyExpenses * 12 * Math.pow(1 + inflationRate / 100, year)),
      });
      for (let m = 0; m < 12; m++) balance = balance * (1 + r) + monthlyInvestment;
    }
    return data;
  }, [currentSavings, annualReturn, monthlyInvestment, totalMonthlyPassiveIncome, freedomNumber, age, yearsToFreedom, monthlyExpenses, inflationRate]);

  const incomeBreakdown = useMemo(
    () => incomeStreams.map(s => ({ name: s.name, value: s.monthlyIncome })),
    [incomeStreams],
  );

  const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.tertiary, CHART_COLORS.outline, CHART_COLORS.error, CHART_COLORS.secondaryContainer];

  /* ---------- Stream CRUD ---------- */
  const addStream = () => {
    const newStream: IncomeStream = {
      id: Date.now().toString(),
      name: '',
      monthlyIncome: 0,
      growthRate: 5,
      hoursPerWeek: 5,
      type: 'active',
    };
    setIncomeStreams([...incomeStreams, newStream]);
    showSnackbar('New income stream added');
  };

  const updateStream = (id: string, field: keyof IncomeStream, value: any) => {
    setIncomeStreams(incomeStreams.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const confirmDelete = (id: string, name: string) => {
    setDeleteDialog({ open: true, id, name });
  };

  const performDelete = () => {
    if (deleteDialog.id) {
      setIncomeStreams(incomeStreams.filter(s => s.id !== deleteDialog.id));
      showSnackbar(`Removed "${deleteDialog.name}"`);
    }
    setDeleteDialog({ open: false, id: null, name: '' });
  };

  /* ---------- Autonomy level ---------- */
  const autonomyLevel = useMemo(() => {
    if (autonomyScore >= 80) return { label: 'Financially Free', tone: 'primary' as const };
    if (autonomyScore >= 60) return { label: 'Approaching Freedom', tone: 'primary' as const };
    if (autonomyScore >= 40) return { label: 'Building Momentum', tone: 'tertiary' as const };
    if (autonomyScore >= 20) return { label: 'Getting Started', tone: 'secondary' as const };
    return { label: 'Planting Seeds', tone: 'secondary' as const };
  }, [autonomyScore]);

  const fmtMoney = (n: number) => `$${n.toLocaleString()}`;

  /* ==========================================================================
     RENDER
     ========================================================================== */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--md-sys-color-background)', color: 'var(--md-sys-color-on-background)', display: 'flex', flexDirection: 'column' }}>
      {/* Top App Bar */}
      <TopAppBar
        headline="Wealth Autonomy Engine"
        supportingText="Your path to financial freedom"
        actions={
          <IconButton aria-label="Info" onClick={() => setSheetOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 17h2v-6h-2zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2z"/></svg>
          </IconButton>
        }
      />

      {/* Segmented Button for tabs */}
      <div style={{ padding: '8px 16px 16px', display: 'flex', justifyContent: 'center' }}>
        <SegmentedButton
          segments={tabs.map(t => ({ label: t.label }))}
          selectedIndex={tabIndex}
          onSelect={setTabIndex}
        />
      </div>

      {/* Main content */}
      <main style={{ flex: 1, padding: '0 16px 120px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        {/* ============ DASHBOARD ============ */}
        {tabIndex === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Hero — Autonomy Score */}
            <Card variant="elevated" style={{ padding: 24 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
                {/* Circular progress */}
                <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
                  <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="70" cy="70" r="60" fill="none" stroke="var(--md-sys-color-surface-variant)" strokeWidth="10" />
                    <circle
                      cx="70" cy="70" r="60" fill="none"
                      stroke="var(--md-sys-color-primary)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(autonomyScore / 100) * 2 * Math.PI * 60} ${2 * Math.PI * 60}`}
                      style={{ transition: `stroke-dasharray var(--md-sys-motion-duration-long1) var(--md-sys-motion-easing-emphasized)` }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="type-display-small" style={{ color: 'var(--md-sys-color-on-surface)', lineHeight: 1 }}>
                      {autonomyScore}
                    </span>
                    <span className="type-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>of 100</span>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      className="type-label-large"
                      style={{
                        padding: '4px 12px',
                        borderRadius: 'var(--md-sys-shape-small)',
                        background: autonomyLevel.tone === 'primary' ? 'var(--md-sys-color-primary-container)' : autonomyLevel.tone === 'tertiary' ? 'var(--md-sys-color-tertiary-container)' : 'var(--md-sys-color-secondary-container)',
                        color: autonomyLevel.tone === 'primary' ? 'var(--md-sys-color-on-primary-container)' : autonomyLevel.tone === 'tertiary' ? 'var(--md-sys-color-on-tertiary-container)' : 'var(--md-sys-color-on-secondary-container)',
                      }}
                    >
                      {autonomyLevel.label}
                    </span>
                  </div>
                  <p className="type-body-large" style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: '8px 0 16px' }}>
                    {autonomyScore >= 60
                      ? "You're on the fast track to financial freedom. Keep diversifying."
                      : autonomyScore >= 30
                      ? 'Good progress. Focus on building passive income streams.'
                      : 'Start by tracking expenses and building your first side income.'}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                    <div>
                      <div className="type-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Freedom Number</div>
                      <div className="type-headline-small" style={{ color: 'var(--md-sys-color-primary)' }}>{fmtMoney(freedomNumber)}</div>
                    </div>
                    <div>
                      <div className="type-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>To Freedom</div>
                      <div className="type-headline-small" style={{ color: 'var(--md-sys-color-tertiary)' }}>
                        {yearsToFreedom === Infinity ? '∞' : `${yearsToFreedom} yrs`}
                      </div>
                    </div>
                    <div>
                      <div className="type-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Passive Income</div>
                      <div className="type-headline-small" style={{ color: 'var(--md-sys-color-secondary)' }}>{fmtMoney(totalMonthlyPassiveIncome)}/mo</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick stats — 4 filled cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <Card variant="filled">
                <div className="type-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Monthly Income</div>
                <div className="type-headline-small" style={{ color: 'var(--md-sys-color-primary)', marginTop: 4 }}>{fmtMoney(totalMonthlyIncome)}</div>
              </Card>
              <Card variant="filled">
                <div className="type-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Monthly Expenses</div>
                <div className="type-headline-small" style={{ color: 'var(--md-sys-color-error)', marginTop: 4 }}>{fmtMoney(monthlyExpenses)}</div>
              </Card>
              <Card variant="filled">
                <div className="type-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Monthly Savings</div>
                <div className="type-headline-small" style={{ color: 'var(--md-sys-color-tertiary)', marginTop: 4 }}>{fmtMoney(totalMonthlyIncome - monthlyExpenses)}</div>
              </Card>
              <Card variant="filled">
                <div className="type-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Income Streams</div>
                <div className="type-headline-small" style={{ color: 'var(--md-sys-color-secondary)', marginTop: 4 }}>{incomeStreams.length}</div>
              </Card>
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              <Card variant="elevated" style={{ padding: 20 }}>
                <div className="type-title-medium" style={{ marginBottom: 12 }}>Wealth Projection</div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={projectionData}>
                    <defs>
                      <linearGradient id="m3-wealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={CHART_COLORS.surfaceVariant} strokeDasharray="3 3" />
                    <XAxis dataKey="year" stroke={CHART_COLORS.onSurfaceVariant} fontSize={12} />
                    <YAxis stroke={CHART_COLORS.onSurfaceVariant} fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: CHART_COLORS.secondaryContainer, border: 'none', borderRadius: 12, color: CHART_COLORS.onSurface }} />
                    <Area type="monotone" dataKey="wealth" stroke={CHART_COLORS.primary} fill="url(#m3-wealth)" strokeWidth={2} name="Net Worth" />
                    <Line type="monotone" dataKey="freedomLine" stroke={CHART_COLORS.error} strokeDasharray="4 4" strokeWidth={1.5} name="Freedom Line" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card variant="elevated" style={{ padding: 20 }}>
                <div className="type-title-medium" style={{ marginBottom: 12 }}>Income Breakdown</div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={incomeBreakdown} cx="50%" cy="50%" innerRadius={56} outerRadius={88} paddingAngle={4} dataKey="value">
                      {incomeBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: CHART_COLORS.secondaryContainer, border: 'none', borderRadius: 12, color: CHART_COLORS.onSurface }} formatter={(v: number) => fmtMoney(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {incomeBreakdown.map((item, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} className="type-body-small">
                      <span style={{ width: 10, height: 10, borderRadius: 'var(--md-sys-shape-full)', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{item.name}</span>
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            {/* Passive income vs expenses */}
            <Card variant="elevated" style={{ padding: 20 }}>
              <div className="type-title-medium" style={{ marginBottom: 12 }}>Passive Income vs Expenses</div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={projectionData}>
                  <CartesianGrid stroke={CHART_COLORS.surfaceVariant} strokeDasharray="3 3" />
                  <XAxis dataKey="year" stroke={CHART_COLORS.onSurfaceVariant} fontSize={12} />
                  <YAxis stroke={CHART_COLORS.onSurfaceVariant} fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: CHART_COLORS.secondaryContainer, border: 'none', borderRadius: 12, color: CHART_COLORS.onSurface }} formatter={(v: number) => fmtMoney(v)} />
                  <Line type="monotone" dataKey="passiveIncome" stroke={CHART_COLORS.primary} strokeWidth={2} name="Passive Income" dot={false} />
                  <Line type="monotone" dataKey="expenses" stroke={CHART_COLORS.error} strokeWidth={2} name="Expenses" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* ============ STREAMS ============ */}
        {tabIndex === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 className="type-headline-small" style={{ margin: 0 }}>Income Stream Architect</h2>
                <p className="type-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: '4px 0 0' }}>
                  Build multiple revenue streams for financial autonomy
                </p>
              </div>
              <FAB icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>} label="Add Stream" onClick={addStream} />
            </div>

            {incomeStreams.map((stream) => (
              <Card key={stream.id} variant="outlined" style={{ padding: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <TextField
                        label="Stream name"
                        value={stream.name}
                        onChange={(e) => updateStream(stream.id, 'name', e.target.value)}
                        style={{ flex: 1, minWidth: 200 }}
                      />
                      <div style={{ display: 'flex', gap: 4 }}>
                        {(['active', 'passive', 'portfolio'] as const).map(t => (
                          <Chip
                            key={t}
                            variant="filter"
                            selected={stream.type === t}
                            onClick={() => updateStream(stream.id, 'type', t)}
                            label={t.charAt(0).toUpperCase() + t.slice(1)}
                          />
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                      <TextField label="Monthly $" type="number" value={stream.monthlyIncome} onChange={(e) => updateStream(stream.id, 'monthlyIncome', Number(e.target.value))} />
                      <TextField label="Growth %/yr" type="number" value={stream.growthRate} onChange={(e) => updateStream(stream.id, 'growthRate', Number(e.target.value))} />
                      <TextField label="Hours/week" type="number" value={stream.hoursPerWeek} onChange={(e) => updateStream(stream.id, 'hoursPerWeek', Number(e.target.value))} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 120 }}>
                    <div className="type-headline-small" style={{ color: 'var(--md-sys-color-primary)' }}>{fmtMoney(stream.monthlyIncome)}</div>
                    <div className="type-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>per month</div>
                    <div className="type-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', textAlign: 'right' }}>
                      5yr: {fmtMoney(Math.round(stream.monthlyIncome * Math.pow(1 + stream.growthRate / 100, 5)))}/mo
                    </div>
                    <TextButton onClick={() => confirmDelete(stream.id, stream.name || 'this stream')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--md-sys-color-error)' }}><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg>
                      Remove
                    </TextButton>
                  </div>
                </div>
              </Card>
            ))}

            {/* Ideas card */}
            <Card variant="filled" style={{ padding: 20, background: 'var(--md-sys-color-tertiary-container)', color: 'var(--md-sys-color-on-tertiary-container)' }}>
              <div className="type-title-medium" style={{ marginBottom: 12 }}>💡 Income Stream Ideas</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                {[
                  { name: 'Digital Products', desc: 'Courses, ebooks, templates' },
                  { name: 'Rental Income', desc: 'Real estate, equipment' },
                  { name: 'Affiliate Marketing', desc: 'Commission on recommendations' },
                  { name: 'Dividend Investing', desc: 'Stocks, ETFs, REITs' },
                  { name: 'Consulting', desc: 'Leverage your expertise' },
                  { name: 'SaaS / Micro-SaaS', desc: 'Software that solves problems' },
                  { name: 'Content Creation', desc: 'YouTube, podcast, newsletter' },
                  { name: 'Index Fund Investing', desc: 'Automated wealth building' },
                ].map((idea, i) => (
                  <div key={i} style={{ padding: 12, borderRadius: 'var(--md-sys-shape-small)', background: 'color-mix(in srgb, var(--md-sys-color-on-tertiary-container) 8%, transparent)' }}>
                    <div className="type-title-small">{idea.name}</div>
                    <div className="type-body-small" style={{ opacity: 0.8 }}>{idea.desc}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ============ SIMULATOR ============ */}
        {tabIndex === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h2 className="type-headline-small" style={{ margin: 0 }}>What-If Simulator</h2>
              <p className="type-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: '4px 0 0' }}>
                Test strategies and see how they affect your freedom timeline
              </p>
            </div>

            <Card variant="outlined" style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <Slider label="Monthly Expenses" min={500} max={20000} step={100} value={monthlyExpenses} onChange={setMonthlyExpenses} valueFormatter={fmtMoney} />
                <Slider label="Current Savings" min={0} max={500000} step={1000} value={currentSavings} onChange={setCurrentSavings} valueFormatter={fmtMoney} />
                <Slider label="Monthly Investment" min={0} max={10000} step={100} value={monthlyInvestment} onChange={setMonthlyInvestment} valueFormatter={fmtMoney} />
                <Slider label="Annual Return" min={1} max={15} step={0.5} value={annualReturn} onChange={setAnnualReturn} valueFormatter={(v) => `${v}%`} />
                <Slider label="Current Age" min={18} max={65} step={1} value={age} onChange={setAge} valueFormatter={(v) => `${v} yrs`} />
                <Slider label="Inflation Rate" min={0} max={8} step={0.5} value={inflationRate} onChange={setInflationRate} valueFormatter={(v) => `${v}%`} />
              </div>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <Card variant="filled" style={{ padding: 20, textAlign: 'center' }}>
                <div className="type-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Freedom Number</div>
                <div className="type-headline-medium" style={{ color: 'var(--md-sys-color-primary)', marginTop: 4 }}>{fmtMoney(freedomNumber)}</div>
                <div className="type-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: 4 }}>25× annual expenses (4% rule)</div>
              </Card>
              <Card variant="filled" style={{ padding: 20, textAlign: 'center' }}>
                <div className="type-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Years to Freedom</div>
                <div className="type-headline-medium" style={{ color: 'var(--md-sys-color-tertiary)', marginTop: 4 }}>
                  {yearsToFreedom === Infinity ? '∞' : yearsToFreedom}
                </div>
                <div className="type-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: 4 }}>
                  {yearsToFreedom === Infinity ? 'Increase savings rate' : `Age ${age + yearsToFreedom}`}
                </div>
              </Card>
              <Card variant="filled" style={{ padding: 20, textAlign: 'center' }}>
                <div className="type-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Total Contributed</div>
                <div className="type-headline-medium" style={{ color: 'var(--md-sys-color-secondary)', marginTop: 4 }}>
                  {yearsToFreedom === Infinity ? '—' : fmtMoney((monthlyInvestment * 12 * yearsToFreedom) + currentSavings)}
                </div>
                <div className="type-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: 4 }}>Principal contributions</div>
              </Card>
            </div>

            <Card variant="elevated" style={{ padding: 20 }}>
              <div className="type-title-medium" style={{ marginBottom: 12 }}>Conservative vs Your Plan vs Aggressive</div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={projectionData.map(d => ({
                  ...d,
                  conservative: Math.round(currentSavings * Math.pow(1.04, d.year - age) + monthlyInvestment * 12 * Math.max(d.year - age, 1) * 0.8),
                  aggressive: Math.round(currentSavings * Math.pow(1.12, d.year - age) + monthlyInvestment * 12 * Math.max(d.year - age, 1) * 1.2),
                }))}>
                  <defs>
                    <linearGradient id="m3-cons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.tertiary} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={CHART_COLORS.tertiary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="m3-agg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="m3-plan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART_COLORS.surfaceVariant} strokeDasharray="3 3" />
                  <XAxis dataKey="year" stroke={CHART_COLORS.onSurfaceVariant} fontSize={12} />
                  <YAxis stroke={CHART_COLORS.onSurfaceVariant} fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: CHART_COLORS.secondaryContainer, border: 'none', borderRadius: 12, color: CHART_COLORS.onSurface }} formatter={(v: number) => fmtMoney(v)} />
                  <Area type="monotone" dataKey="conservative" stroke={CHART_COLORS.tertiary} fill="url(#m3-cons)" strokeWidth={2} name="Conservative (4%)" />
                  <Area type="monotone" dataKey="wealth" stroke={CHART_COLORS.primary} fill="url(#m3-plan)" strokeWidth={2} name={`Your Plan (${annualReturn}%)`} />
                  <Area type="monotone" dataKey="aggressive" stroke={CHART_COLORS.secondary} fill="url(#m3-agg)" strokeWidth={2} name="Aggressive (12%)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* ============ ROADMAP ============ */}
        {tabIndex === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h2 className="type-headline-small" style={{ margin: 0 }}>Your Freedom Roadmap</h2>
              <p className="type-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: '4px 0 0' }}>
                Actionable steps based on your current financial situation
              </p>
            </div>

            {/* Timeline */}
            <div style={{ position: 'relative', paddingLeft: 32 }}>
              <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${CHART_COLORS.primary}, ${CHART_COLORS.tertiary})`, borderRadius: 'var(--md-sys-shape-full)' }} />
              {[
                { phase: 'Phase 1: Foundation', time: 'Months 1–3', tone: 'primary' as const, actions: ['Track every expense for 30 days', 'Build 1-month emergency fund', 'Identify 3 skills you can monetize', 'Set up automatic savings'] },
                { phase: 'Phase 2: First Income Stream', time: 'Months 3–6', tone: 'primary' as const, actions: ['Launch your first side hustle', 'Aim for $500/month additional income', 'Invest all side income', 'Learn one high-income skill deeply'] },
                { phase: 'Phase 3: Diversification', time: 'Months 6–18', tone: 'secondary' as const, actions: ['Add second income stream', 'Start index fund investing', 'Build passive income to cover 25% of expenses', 'Negotiate raise or switch roles'] },
                { phase: 'Phase 4: Acceleration', time: 'Years 2–5', tone: 'tertiary' as const, actions: ['Scale your best income stream', 'Passive income covers 50% of expenses', 'Max out tax-advantaged accounts', 'Build systems that work without you'] },
                { phase: 'Phase 5: Freedom', time: 'Years 5–10', tone: 'primary' as const, actions: ['Passive income exceeds expenses', 'Choose work based on passion', 'Diversify across asset classes', 'Mentor others on their journey'] },
              ].map((p, i) => {
                const container = p.tone === 'primary' ? 'var(--md-sys-color-primary-container)' : p.tone === 'tertiary' ? 'var(--md-sys-color-tertiary-container)' : 'var(--md-sys-color-secondary-container)';
                const onContainer = p.tone === 'primary' ? 'var(--md-sys-color-on-primary-container)' : p.tone === 'tertiary' ? 'var(--md-sys-color-on-tertiary-container)' : 'var(--md-sys-color-on-secondary-container)';
                return (
                  <div key={i} style={{ position: 'relative', paddingBottom: 16 }}>
                    <div style={{ position: 'absolute', left: -25, top: 20, width: 16, height: 16, borderRadius: 'var(--md-sys-shape-full)', background: container, border: `3px solid var(--md-sys-color-background)` }} />
                    <Card variant="outlined" style={{ padding: 16 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                        <div className="type-title-medium">{p.phase}</div>
                        <span className="type-label-medium" style={{ padding: '4px 12px', borderRadius: 'var(--md-sys-shape-small)', background: container, color: onContainer }}>{p.time}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                        {p.actions.map((a, j) => (
                          <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--md-sys-color-primary)', flexShrink: 0, marginTop: 2 }}><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
                            <span className="type-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Principles */}
            <Card variant="elevated" style={{ padding: 20 }}>
              <div className="type-title-medium" style={{ marginBottom: 12 }}>🏆 Core Wealth Principles</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                {[
                  { t: 'Spend Less Than You Earn', d: 'The gap between income and expenses is your wealth-building fuel.' },
                  { t: 'Invest the Difference', d: 'Money sitting idle loses value. Make it work through diversified investments.' },
                  { t: 'Build Multiple Streams', d: 'Never depend on a single income source. Diversify like a business.' },
                  { t: 'Increase Earning Power', d: 'Your skills are your greatest asset. Invest in learning constantly.' },
                  { t: 'Automate Everything', d: 'Remove willpower from the equation. Auto-save, auto-invest.' },
                  { t: 'Think in Decades', d: 'Compound interest rewards patience. Start now, stay consistent.' },
                ].map((p, i) => (
                  <Card key={i} variant="filled" style={{ padding: 12 }}>
                    <div className="type-title-small">{p.t}</div>
                    <div className="type-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: 4 }}>{p.d}</div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Math callout */}
            <Card variant="filled" style={{ padding: 20, background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)' }}>
              <div className="type-title-medium" style={{ marginBottom: 8 }}>💡 The Freedom Math (4% Rule)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }} className="type-body-medium">
                <div>• Your <strong>Freedom Number</strong> = Annual Expenses × 25</div>
                <div>• At {fmtMoney(monthlyExpenses)}/month, you need <strong>{fmtMoney(freedomNumber)}</strong> invested</div>
                <div>• With a 4% withdrawal rate, this generates <strong>{fmtMoney(monthlyExpenses)}/month</strong> forever</div>
                <div>• At {annualReturn}% returns investing {fmtMoney(monthlyInvestment)}/month, you reach this in <strong>{yearsToFreedom === Infinity ? '∞ — increase savings!' : `${yearsToFreedom} years`}</strong></div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar (mobile-friendly) */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', background: 'var(--md-sys-color-background)' }}>
        <div style={{ width: '100%', maxWidth: 600 }}>
          <NavigationBar
            destinations={[
              {
                label: 'Dashboard',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z"/></svg>,
                activeIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z"/></svg>,
              },
              {
                label: 'Streams',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
                activeIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
              },
              {
                label: 'Simulator',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>,
                activeIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>,
              },
              {
                label: 'Roadmap',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>,
                activeIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>,
              },
            ]}
            selectedIndex={tabIndex}
            onSelect={setTabIndex}
          />
        </div>
      </div>

      {/* Dialog for delete confirmation */}
      <Dialog
        open={deleteDialog.open}
        onDismiss={() => setDeleteDialog({ open: false, id: null, name: '' })}
        icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>}
        headline="Remove income stream?"
        supportingText={`"${deleteDialog.name}" will be permanently removed from your plan.`}
        actions={
          <>
            <TextButton onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>Cancel</TextButton>
            <FilledButton onClick={performDelete}>Remove</FilledButton>
          </>
        }
      />

      {/* Bottom sheet — About */}
      <BottomSheet open={sheetOpen} onDismiss={() => setSheetOpen(false)} title="About Wealth Autonomy Engine">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="type-body-large">
          <p style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)' }} className="type-body-medium">
            A financial freedom tool built with Material Design 3 (Expressive). It helps you visualize your path to autonomy using the 4% rule, multiple income streams, and compound growth.
          </p>
          <Divider />
          <div className="type-title-small">How it works</div>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }} className="type-body-medium">
            <li>Your <strong>Freedom Number</strong> = 25 × annual expenses</li>
            <li>Your <strong>Autonomy Score</strong> weighs passive income, savings progress, and stream diversity</li>
            <li>The <strong>Simulator</strong> lets you test different strategies</li>
            <li>The <strong>Roadmap</strong> gives you concrete steps to follow</li>
          </ul>
          <Divider />
          <FilledButton onClick={() => setSheetOpen(false)} style={{ alignSelf: 'flex-end' }}>Got it</FilledButton>
        </div>
      </BottomSheet>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        onDismiss={() => setSnackbar({ open: false, message: '' })}
      />
    </div>
  );
}

export default App;
