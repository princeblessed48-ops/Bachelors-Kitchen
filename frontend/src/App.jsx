import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import api from './api';
import { demoMeals, demoPlans, demoTimetable } from './data/demoData';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);

const getStoredUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('bk-user') || 'null');
    return user;
  } catch {
    return null;
  }
};

const getStoredSubscription = () => {
  try {
    const item = JSON.parse(localStorage.getItem('bk-subscription') || 'null');
    return item;
  } catch {
    return null;
  }
};

const getTodayMeal = (meals) => {
  const today = new Date();
  const index = today.getDate() % meals.length;
  return meals[index] || meals[0];
};

const isSubscriber = (user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return Boolean(getStoredSubscription()?.active || user.subscription === 'active');
};

function App() {
  const [user, setUser] = useState(getStoredUser());
  const [meals, setMeals] = useState(demoMeals);
  const [timetable, setTimetable] = useState(demoTimetable);
  const [plans, setPlans] = useState(demoPlans);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState({
    currentPlan: 'Monthly Pro',
    startDate: '2026-09-01',
    expiryDate: '2026-10-01',
    status: 'active',
    amountPaid: 5000,
    payments: [
      { date: '2026-09-01', amount: 5000, reference: 'BK-1001', status: 'Successful', method: 'Card' },
      { date: '2026-08-01', amount: 5000, reference: 'BK-0910', status: 'Successful', method: 'Bank Transfer' },
    ],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const mealResult = await api.get('/meals');
        const timetableResult = await api.get('/timetable');
        const plansResult = await api.get('/subscriptions/plans');

        if (Array.isArray(mealResult.data?.meals) && mealResult.data.meals.length > 0) {
          setMeals(mealResult.data.meals.map((meal) => ({ ...meal, id: meal.id || meal._id })));
        }
        if (Array.isArray(timetableResult.data?.entries) && timetableResult.data.entries.length > 0) {
          setTimetable(timetableResult.data.entries);
        }
        if (Array.isArray(plansResult.data?.plans) && plansResult.data.plans.length > 0) {
          setPlans(plansResult.data.plans);
        }
      } catch {
        setMeals(demoMeals);
        setTimetable(demoTimetable);
        setPlans(demoPlans);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const saveAuth = (nextUser, token = '') => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem('bk-user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('bk-user');
    }
    if (token) {
      localStorage.setItem('bk-token', token);
    }
  };

  const handleLogin = ({ email, password }) => {
    const normalizedEmail = String(email || '').toLowerCase();
    const demoUser =
      normalizedEmail.includes('admin')
        ? { id: 'admin-1', name: 'Admin User', email: normalizedEmail, role: 'admin' }
        : { id: 'user-1', name: 'Demo User', email: normalizedEmail, role: 'user' };

    const subscription = normalizedEmail.includes('admin') ? { active: true, plan: 'Admin' } : null;
    saveAuth(demoUser, 'demo-token');
    if (subscription) {
      localStorage.setItem('bk-subscription', JSON.stringify(subscription));
    } else {
      localStorage.removeItem('bk-subscription');
    }
  };

  const handleRegister = (payload) => {
    const nextUser = { id: Date.now().toString(), name: payload.name, email: payload.email, role: 'user' };
    saveAuth(nextUser, 'demo-token');
    localStorage.removeItem('bk-subscription');
  };

  const handleLogout = () => {
    saveAuth(null, '');
    localStorage.removeItem('bk-subscription');
  };

  const subscribeUser = (plan) => {
    if (!user) {
      return;
    }

    const activeSubscription = { active: true, plan: plan.name };
    localStorage.setItem('bk-subscription', JSON.stringify(activeSubscription));
    setUser((currentUser) => ({ ...currentUser, subscription: 'active' }));
    setBilling({
      currentPlan: plan.name,
      startDate: '2026-09-29',
      expiryDate: '2026-10-29',
      status: 'active',
      amountPaid: plan.price,
      payments: [
        { date: '2026-09-29', amount: plan.price, reference: `BK-${Date.now()}`, status: 'Successful', method: 'Card' },
        ...billing.payments,
      ],
    });
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header user={user} onLogout={handleLogout} />
        {loading ? <div className="page-loader">Loading menu data...</div> : null}
        {!loading ? (
          <Routes>
            <Route path="/" element={<HomePage meals={meals} user={user} isSubscriber={isSubscriber(user)} />} />
            <Route path="/meals" element={<MealsPage meals={meals} user={user} isSubscriber={isSubscriber(user)} />} />
            <Route path="/meals/:id" element={<MealDetailPage meals={meals} user={user} isSubscriber={isSubscriber(user)} />} />
            <Route path="/meal-plan" element={<TimetablePage timetable={timetable} />} />
            <Route path="/plans" element={<SubscriptionPage plans={plans} user={user} onSubscribe={subscribeUser} />} />
            <Route path="/billing" element={<BillingPage billing={billing} user={user} />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/direction-requests" element={<DirectionRequestPage user={user} meals={meals} isSubscriber={isSubscriber(user)} />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/login" element={<AuthPage onLogin={handleLogin} onRegister={handleRegister} user={user} />} />
            <Route path="/admin" element={<AdminPage meals={meals} timetable={timetable} />} />
            <Route path="*" element={<HomePage meals={meals} user={user} isSubscriber={isSubscriber(user)} />} />
          </Routes>
        ) : null}
      </div>
    </BrowserRouter>
  );
}

function Header({ user, onLogout }) {
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/meals', label: 'Meals' },
    { path: '/meal-plan', label: 'Meal Plan' },
    { path: '/plans', label: 'Subscription' },
    { path: '/billing', label: 'Billing' },
  ];

  const adminExtra = user?.role === 'admin' ? [{ path: '/admin', label: 'Dashboard' }] : [];
  const authenticatedExtra = user ? [{ path: '/profile', label: 'My Account' }, { path: '/direction-requests', label: 'My Requests' }] : [];

  const items = [...navItems, ...adminExtra, ...authenticatedExtra];

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-mark">BK</span>
        <div>
          <strong>Bachelor Kitchen</strong>
          <small>Eat well. Cook fast. Live better.</small>
        </div>
      </Link>

      <nav className="main-nav">
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => (isActive ? 'active' : '')}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="auth-actions">
        {user ? (
          <>
            <span className="user-pill">{user.name}</span>
            <button type="button" onClick={onLogout} className="secondary-btn">Logout</button>
          </>
        ) : (
          <Link to="/login" className="primary-btn">Login</Link>
        )}
      </div>
    </header>
  );
}

function HomePage({ meals, user, isSubscriber }) {
  const todaysMeal = getTodayMeal(meals);

  return (
    <main className="page home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Nutrition for busy living</p>
          <h1>Bachelor Kitchen</h1>
          <p className="tagline">Eat well. Cook fast. Live better.</p>
          <div className="cta-row">
            <Link to="/meals" className="primary-btn">Explore Meals</Link>
            <Link to="/meal-plan" className="secondary-btn">View This Month's Plan</Link>
          </div>
          {!isSubscriber ? (
            <div className="promo-box">
              <strong>Unlock premium meals</strong>
              <p>Get nutrition, servings, chef details, and video guides.</p>
              <Link to="/plans" className="primary-btn small">View Plans</Link>
            </div>
          ) : null}
        </div>
        <div className="hero-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554"
            alt="Fresh meal prep"
            className="hero-image"
          />
        </div>
      </section>

      <section className="panel-section">
        <div className="section-header">
          <h2>Today's Meal</h2>
        </div>
        <div className="meal-highlight">
          <img src={todaysMeal.image} alt={todaysMeal.title} />
          <div className="meal-highlight-copy">
            <span className="category-tag">{todaysMeal.category}</span>
            <h3>{todaysMeal.title}</h3>
            <div className="meta-grid">
              <span>{todaysMeal.preparationTime}</span>
              <span>{todaysMeal.difficulty}</span>
              <span>{formatCurrency(todaysMeal.estimatedCost)}</span>
            </div>
            <p>{todaysMeal.description}</p>
            <Link to={`/meals/${todaysMeal.id || todaysMeal._id}`} className="primary-btn">View Recipe</Link>
          </div>
        </div>
      </section>

      <section className="panel-section">
        <div className="section-header">
          <h2>Popular categories</h2>
        </div>
        <div className="category-grid">
          {['High Protein', 'Energy / Sports', 'High Carbohydrate', 'Weight Gain', 'Balanced Meals', 'Budget Meals'].map((category) => (
            <div key={category} className="category-card">
              {category}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function MealsPage({ meals, user, isSubscriber }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      const matchesQuery = !query || meal.title.toLowerCase().includes(query.toLowerCase()) || meal.category.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'All' || meal.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [meals, query, category]);

  const categories = ['All', ...new Set(meals.map((meal) => meal.category))];

  return (
    <main className="page">
      <div className="section-header top-space">
        <h2>Meals</h2>
      </div>

      <div className="toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search meals, ingredients or category" />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="meal-grid">
        {filteredMeals.map((meal) => (
          <article key={meal.id || meal._id} className="meal-card">
            <img src={meal.image} alt={meal.title} />
            <div className="meal-card-body">
              <div className="card-header">
                <span className="category-tag">{meal.category}</span>
                {!isSubscriber ? <span className="subscription-badge">Subscriber</span> : null}
              </div>
              <h3>{meal.title}</h3>
              <div className="meta-grid compact">
                <span>{meal.preparationTime}</span>
                <span>{meal.difficulty}</span>
                <span>{formatCurrency(meal.estimatedCost)}</span>
              </div>
              <p>{meal.description}</p>
              <Link to={`/meals/${meal.id || meal._id}`} className="primary-btn small">View Recipe</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function MealDetailPage({ meals, user, isSubscriber }) {
  const { id } = useParams();
  const meal = meals.find((item) => item.id === id || item._id === id);
  const navigate = useNavigate();

  if (!meal) {
    return <div className="page empty-state">Meal not found</div>;
  }

  const handleRequestDirection = (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isSubscriber) {
      navigate('/plans');
      return;
    }
    alert('Direction request saved for review.');
  };

  return (
    <main className="page meal-detail-page">
      <div className="meal-detail-hero">
        <img src={meal.image} alt={meal.title} />
        <div>
          <span className="category-tag">{meal.category}</span>
          <h2>{meal.title}</h2>
          <p>{meal.description}</p>
          <div className="meta-grid">
            <span>Prep: {meal.preparationTime}</span>
            <span>Difficulty: {meal.difficulty}</span>
            <span>Cost: {formatCurrency(meal.estimatedCost)}</span>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-panel">
          <h3>Ingredients</h3>
          <ul>
            {meal.ingredients?.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className="detail-panel">
          <h3>Cooking procedure</h3>
          <ol>
            {meal.preparationSteps?.map((step, index) => <li key={`${step}-${index}`}>{step}</li>)}
          </ol>
        </section>
      </div>

      {!isSubscriber ? (
        <div className="locked-box">
          <h3>🔒 Subscriber only</h3>
          <p>Unlock nutrition, servings, storage details, reheating instructions, video guide, and chef contact information.</p>
          <Link to="/plans" className="primary-btn">Subscribe to unlock</Link>
        </div>
      ) : (
        <div className="premium-panel">
          <div className="premium-block">
            <h3>Nutrition</h3>
            <p>Calories: {meal.nutrition?.calories || 0}</p>
            <p>Protein: {meal.nutrition?.protein || 0} g</p>
            <p>Carbohydrates: {meal.nutrition?.carbohydrates || 0} g</p>
            <p>Fat: {meal.nutrition?.fat || 0} g</p>
            <p>Fibre: {meal.nutrition?.fibre || 0} g</p>
            <small>Nutritional values are estimates and vary by ingredients and portion size.</small>
          </div>

          <div className="premium-block">
            <h3>Servings & storage</h3>
            <p>Serves: {meal.servings || 2}</p>
            <p>{meal.storageInstructions}</p>
            <p>{meal.reheatingInstructions}</p>
          </div>

          <div className="premium-block">
            <h3>Video guide</h3>
            <a href={meal.videoUrl} target="_blank" rel="noreferrer">Watch video guide</a>
          </div>

          <div className="premium-block">
            <h3>Chef details</h3>
            <p>Chef: {meal.chef?.name}</p>
            <p>Location: {meal.chef?.location}</p>
            <p>Contact: {meal.chef?.contact}</p>
            <p>Price: {formatCurrency(meal.chef?.price || 0)}</p>
          </div>
        </div>
      )}

      <div className="cta-box">
        <button type="button" className="primary-btn" onClick={handleRequestDirection}>Need help preparing this meal?</button>
      </div>
    </main>
  );
}

function TimetablePage({ timetable }) {
  return (
    <main className="page">
      <div className="section-header top-space">
        <h2>Monthly Meal Timetable</h2>
      </div>
      <div className="timetable-grid">
        {timetable.map((entry) => (
          <div className="timetable-card" key={entry.id || entry._id}>
            <h3>{entry.day || new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' })}</h3>
            <p>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            <strong>{entry.meal}</strong>
            <span>{entry.category}</span>
          </div>
        ))}
      </div>
    </main>
  );
}

function SubscriptionPage({ plans, user, onSubscribe }) {
  return (
    <main className="page">
      <div className="section-header top-space">
        <h2>Subscription plans</h2>
        <p>Choose a plan and unlock premium access.</p>
      </div>
      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id || plan._id} className="plan-card">
            <h3>{plan.name}</h3>
            <div className="price">{formatCurrency(plan.price)}</div>
            <p>{plan.duration}</p>
            <p>{plan.description}</p>
            <ul>
              {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <button type="button" className="primary-btn" onClick={() => onSubscribe(plan)} disabled={!user}>
              {user ? 'Subscribe now' : 'Login to subscribe'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

function BillingPage({ billing, user }) {
  return (
    <main className="page">
      <div className="section-header top-space">
        <h2>Billing</h2>
      </div>

      <div className="billing-layout">
        <div className="detail-panel">
          <h3>Current plan</h3>
          <p><strong>{billing.currentPlan}</strong></p>
          <p>Status: {billing.status}</p>
          <p>Start date: {billing.startDate}</p>
          <p>Expiry: {billing.expiryDate}</p>
          <p>Amount paid: {formatCurrency(billing.amountPaid)}</p>
        </div>

        <div className="detail-panel">
          <h3>Payment history</h3>
          {billing.payments.map((payment) => (
            <div key={payment.reference} className="payment-row">
              <span>{payment.date}</span>
              <span>{formatCurrency(payment.amount)}</span>
              <span>{payment.reference}</span>
              <span>{payment.status}</span>
              <span>{payment.method}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function ProfilePage({ user }) {
  if (!user) {
    return <div className="page empty-state">Please log in to view your profile.</div>;
  }

  return (
    <main className="page">
      <div className="section-header top-space">
        <h2>Profile</h2>
      </div>
      <div className="detail-panel profile-panel">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>
    </main>
  );
}

function DirectionRequestPage({ user, meals, isSubscriber }) {
  const [question, setQuestion] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(meals[0]?.id || '1');

  if (!user) {
    return <div className="page empty-state">Please log in to submit a request.</div>;
  }

  if (!isSubscriber) {
    return <div className="page empty-state">Subscribe to request extra cooking help.</div>;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    alert('Your direction request has been submitted.');
    setQuestion('');
  };

  return (
    <main className="page">
      <div className="section-header top-space">
        <h2>Direction requests</h2>
      </div>
      <form className="detail-panel request-form" onSubmit={handleSubmit}>
        <label>
          Meal
          <select value={selectedMeal} onChange={(event) => setSelectedMeal(event.target.value)}>
            {meals.map((meal) => (
              <option key={meal.id || meal._id} value={meal.id || meal._id}>{meal.title}</option>
            ))}
          </select>
        </label>
        <label>
          Question
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="I do not have an oven. How can I prepare this using a frying pan?"
          />
        </label>
        <button type="submit" className="primary-btn">Submit request</button>
      </form>
    </main>
  );
}

function DeliveryPage() {
  const [distance, setDistance] = useState(6);
  const [zone, setZone] = useState('A');
  const [express, setExpress] = useState(false);
  const [fee, setFee] = useState({ baseFee: 1000, distanceFee: 900, expressFee: 0, total: 1900 });

  const calculate = () => {
    const base = 1000;
    const zoneMap = { A: 1000, B: 1500, C: 2000 };
    const distanceFee = Number(distance) * 150;
    const expressFee = express ? 500 : 0;
    const total = Math.max(1000, zoneMap[zone] + distanceFee + expressFee);
    setFee({ baseFee: zoneMap[zone], distanceFee, expressFee, total });
  };

  return (
    <main className="page">
      <div className="section-header top-space">
        <h2>Delivery pricing</h2>
      </div>
      <div className="delivery-card">
        <label>
          Distance (km)
          <input type="number" value={distance} onChange={(event) => setDistance(event.target.value)} />
        </label>
        <label>
          Zone
          <select value={zone} onChange={(event) => setZone(event.target.value)}>
            <option value="A">Zone A</option>
            <option value="B">Zone B</option>
            <option value="C">Zone C</option>
          </select>
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={express} onChange={() => setExpress((current) => !current)} />
          Express delivery
        </label>
        <button type="button" className="primary-btn" onClick={calculate}>Calculate delivery fee</button>
      </div>

      <div className="detail-panel delivery-results">
        <p>Base fee: {formatCurrency(fee.baseFee)}</p>
        <p>Distance fee: {formatCurrency(fee.distanceFee)}</p>
        <p>Express fee: {formatCurrency(fee.expressFee)}</p>
        <h3>Total: {formatCurrency(fee.total)}</h3>
      </div>
    </main>
  );
}

function AuthPage({ onLogin, onRegister, user }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [navigate, user]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mode === 'login') {
      onLogin(form);
    } else {
      onRegister(form);
    }
    navigate('/');
  };

  return (
    <main className="page auth-page">
      <div className="auth-card">
        <div className="auth-toggle">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' ? (
            <label>
              Name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
          ) : null}

          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>

          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>

          <button type="submit" className="primary-btn full-width">{mode === 'login' ? 'Login' : 'Create account'}</button>
        </form>
      </div>
    </main>
  );
}

function AdminPage({ meals, timetable }) {
  const stats = [
    { label: 'Total users', value: '1,204' },
    { label: 'Active subscribers', value: '482' },
    { label: 'Expired subscribers', value: '112' },
    { label: 'Revenue', value: '₦6.2M' },
  ];

  return (
    <main className="page">
      <div className="section-header top-space">
        <h2>Admin dashboard</h2>
      </div>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-grid">
        <div className="detail-panel">
          <h3>Meals</h3>
          <ul>
            {meals.slice(0, 5).map((meal) => <li key={meal.id || meal._id}>{meal.title}</li>)}
          </ul>
        </div>

        <div className="detail-panel">
          <h3>Timetable</h3>
          <ul>
            {timetable.slice(0, 5).map((entry) => <li key={entry.id || entry._id}>{entry.meal}</li>)}
          </ul>
        </div>
      </div>
    </main>
  );
}

export default App;
