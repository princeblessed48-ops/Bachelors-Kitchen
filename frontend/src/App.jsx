import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import api from './api';
import { demoMeals, demoPlans, demoTimetable } from './data/nigerianMeals';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);

const getCategoryName = (category) => typeof category === 'string' ? category : category?.name || 'Nigerian meals';

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

const getTodayMeal = (meals, timetable) => {
  const today = new Date();
  const todayEntry = timetable.find((entry) => new Date(entry.date).toDateString() === today.toDateString());
  if (todayEntry) {
    const scheduledId = typeof todayEntry.meal === 'object' ? todayEntry.meal._id : todayEntry.mealId;
    const scheduledTitle = typeof todayEntry.meal === 'object' ? todayEntry.meal.title : todayEntry.meal;
    const scheduledMeal = meals.find((item) => item.id === scheduledId || item._id === scheduledId || item.title === scheduledTitle);
    if (scheduledMeal) return scheduledMeal;
  }
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
          setMeals(mealResult.data.meals.map((meal) => ({ ...meal, id: meal.id || meal._id, category: getCategoryName(meal.category) })));
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
      localStorage.removeItem('bk-token');
    }
    if (token) {
      localStorage.setItem('bk-token', token);
    }
  };

  const handleLogin = async ({ email, password }) => {
    const result = await api.post('/auth/login', { email, password });
    const nextUser = result.data.user;
    const token = result.data.token;
    saveAuth(nextUser, token);
    try {
      const subscriptionResult = await api.get('/subscriptions/my');
      const activeSubscription = subscriptionResult.data.subscriptions?.find((item) => item.status === 'active' && new Date(item.endDate) >= new Date());
      if (activeSubscription) {
        localStorage.setItem('bk-subscription', JSON.stringify({ active: true, plan: activeSubscription.plan?.name }));
        nextUser.subscription = 'active';
        setUser(nextUser);
        localStorage.setItem('bk-user', JSON.stringify(nextUser));
      } else {
        localStorage.removeItem('bk-subscription');
      }
    } catch {
      localStorage.removeItem('bk-subscription');
    }
  };

  const handleRegister = async (payload) => {
    const result = await api.post('/auth/register', payload);
    saveAuth(result.data.user, result.data.token);
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
        <ScrollRevealObserver active={!loading} />
        <Header user={user} onLogout={handleLogout} />
        {loading ? <div className="page-loader">Loading menu data...</div> : null}
        {!loading ? (
          <Routes>
            <Route path="/" element={<HomePage meals={meals} timetable={timetable} isSubscriber={isSubscriber(user)} />} />
            <Route path="/meals" element={<MealsPage meals={meals} isSubscriber={isSubscriber(user)} />} />
            <Route path="/meals/:id" element={<MealDetailPage meals={meals} isSubscriber={isSubscriber(user)} />} />
            <Route path="/meal-plan" element={<TimetablePage timetable={timetable} isSubscriber={isSubscriber(user)} />} />
            <Route path="/plans" element={<SubscriptionPage plans={plans} user={user} onSubscribe={subscribeUser} />} />
            <Route path="/billing" element={<BillingPage billing={billing} />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/direction-requests" element={<DirectionRequestPage user={user} meals={meals} isSubscriber={isSubscriber(user)} />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/login" element={<AuthPage onLogin={handleLogin} onRegister={handleRegister} user={user} />} />
            <Route path="/admin" element={<AdminPage meals={meals} timetable={timetable} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<HomePage meals={meals} timetable={timetable} isSubscriber={isSubscriber(user)} />} />
          </Routes>
        ) : null}
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}

function ScrollRevealObserver({ active }) {
  const location = useLocation();

  useEffect(() => {
    if (!active) return undefined;
    const elements = document.querySelectorAll('[data-reveal]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [active, location.pathname]);

  return null;
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <img src="/bk-mark.svg" alt="" />
      <span>Bachelor Kitchen</span>
      <small>Eat well. Cook fast. Live better.</small>
    </footer>
  );
}

function Header({ user, onLogout }) {
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/meals', label: 'Meals' },
    { path: '/meal-plan', label: 'Meal Plan' },
    { path: '/plans', label: 'Subscription' },
    { path: '/about', label: 'About' },
  ];

  const adminExtra = user?.role === 'admin' ? [{ path: '/admin', label: 'Dashboard' }] : [];
  const activeSubscriber = isSubscriber(user);
  const authenticatedExtra = user ? [{ path: '/profile', label: 'My Account' }] : [];
  const subscriberExtra = activeSubscriber ? [{ path: '/direction-requests', label: 'My Requests' }, { path: '/billing', label: 'Billing' }] : [];

  const items = [...navItems, ...authenticatedExtra, ...subscriberExtra, ...adminExtra];

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <img className="brand-mark" src="/bk-mark.svg" alt="Fork, plate and spoon" />
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

function HomePage({ meals, timetable, isSubscriber }) {
  const todaysMeal = getTodayMeal(meals, timetable);

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
          <img src={todaysMeal.image} alt={todaysMeal.title} className="hero-image" fetchPriority="high" />
        </div>
      </section>

      <section className="panel-section" data-reveal>
        <div className="section-header">
          <h2>Today's Meal</h2>
        </div>
        <div className="meal-highlight">
          <img src={todaysMeal.image} alt={todaysMeal.title} loading="lazy" />
          <div className="meal-highlight-copy">
            <span className="category-tag">{getCategoryName(todaysMeal.category)}</span>
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

      <section className="panel-section" data-reveal>
        <div className="section-header">
          <h2>Popular categories</h2>
        </div>
        <div className="category-grid">
          {['High Protein', 'Energy / Sports', 'High Carbohydrate', 'Weight Gain', 'Balanced Meals', 'Budget Meals'].map((category) => (
            <div key={category} className="category-card" data-reveal>
              {category}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function MealsPage({ meals, isSubscriber }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      const mealCategory = getCategoryName(meal.category);
      const matchesQuery = !query || meal.title.toLowerCase().includes(query.toLowerCase()) || mealCategory.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'All' || mealCategory === category;
      return matchesQuery && matchesCategory;
    });
  }, [meals, query, category]);

  const categories = ['All', ...new Set(meals.map((meal) => getCategoryName(meal.category)))];

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
          <article key={meal.id || meal._id} className="meal-card" data-reveal>
            <img src={meal.image} alt={meal.title} loading="lazy" />
            <div className="meal-card-body">
              <div className="card-header">
                <span className="category-tag">{getCategoryName(meal.category)}</span>
                {!isSubscriber ? <span className="subscription-badge">Subscriber</span> : null}
              </div>
              <h3>{meal.title}</h3>
              {meal.isExotic ? <span className="exotic-label">🌍 Try something different</span> : null}
              <div className="meta-grid compact">
                <span>{meal.preparationTime}</span>
                <span>{meal.difficulty}</span>
                <span>{formatCurrency(meal.estimatedCost)}</span>
              </div>
              <p>{meal.description}</p>
              <small className="price-note">Estimated price: {meal.priceNote || 'Prices vary by market and location.'}</small>
              <Link to={`/meals/${meal.id || meal._id}`} className="primary-btn small">View Recipe</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function MealDetailPage({ meals, isSubscriber }) {
  const { id } = useParams();
  const meal = meals.find((item) => item.id === id || item._id === id);
  const navigate = useNavigate();
  const [subscriberDetails, setSubscriberDetails] = useState(null);
  const [premiumState, setPremiumState] = useState('idle');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [premiumRetry, setPremiumRetry] = useState(0);

  useEffect(() => {
    let active = true;

    if (!isSubscriber || !id) return () => { active = false; };

    api.get(`/meals/${id}/subscriber-details`)
      .then((result) => {
        if (active) {
          setSubscriberDetails(result.data.meal);
          setPremiumState('ready');
        }
      })
      .catch(() => {
        if (active) setPremiumState('error');
      });

    return () => { active = false; };
  }, [id, isSubscriber, premiumRetry]);

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
          <span className="category-tag">{getCategoryName(meal.category)}</span>
          <h2>{meal.title}</h2>
          <p>{meal.description}</p>
          {meal.isExotic ? <span className="exotic-label">🌍 Try something different</span> : null}
          <div className="meta-grid">
            <span>Prep: {meal.preparationTime}</span>
            <span>Difficulty: {meal.difficulty}</span>
            <span>Estimated price: {formatCurrency(meal.estimatedCost)}</span>
          </div>
          <small className="price-note">Prices vary by location, market and season.</small>
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-panel">
          <h3>Ingredients</h3>
          <ul>
            {meal.ingredientLines?.length ? meal.ingredientLines.map((item) => <li key={item.name}>{item.quantity} {item.unit} {item.name}</li>) : meal.ingredients?.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className="detail-panel procedure-panel">
          <h3>How to prepare it</h3>
          <p className="muted-copy">{meal.totalTime ? `Total time: ${meal.totalTime}` : `Ready in about ${meal.preparationTime}`}</p>
          <ol className="procedure-list">
            {meal.preparationSteps?.map((step, index) => (
              <li key={`${step}-${index}`} className={completedSteps.includes(index) ? 'step-complete' : ''}>
                <button type="button" className="step-number" aria-label={`Mark step ${index + 1} ${completedSteps.includes(index) ? 'incomplete' : 'complete'}`} onClick={() => setCompletedSteps((steps) => steps.includes(index) ? steps.filter((item) => item !== index) : [...steps, index])}>
                  {String(index + 1).padStart(2, '0')}
                </button>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {meal.requiredEquipment?.length ? <p><strong>Equipment:</strong> {meal.requiredEquipment.join(', ')}</p> : null}
        </section>
      </div>

      {!isSubscriber ? (
        <div className="locked-box">
          <h3>Subscriber content</h3>
          <p>Unlock nutrition, servings, storage details, reheating instructions, video guides, and chef information.</p>
          <Link to="/plans" className="primary-btn">Unlock with subscription</Link>
        </div>
      ) : premiumState === 'loading' || (isSubscriber && premiumState === 'idle') ? <div className="premium-skeleton" aria-label="Loading subscriber recipe details"><span /><span /><span /></div> : premiumState === 'error' ? (
        <div className="locked-box">
          <h3>Premium details could not be loaded</h3>
          <p>Your subscription could not be verified. Sign in again or try again shortly.</p>
          <button type="button" className="secondary-btn" onClick={() => setPremiumRetry((count) => count + 1)}>Try again</button>
        </div>
      ) : subscriberDetails ? (
        <div className="premium-panel">
          <div className="premium-block">
            <h3>Nutrition</h3>
            <p>Calories: {subscriberDetails.nutrition?.calories || 0}</p>
            <p>Protein: {subscriberDetails.nutrition?.protein || 0} g</p>
            <p>Carbohydrates: {subscriberDetails.nutrition?.carbohydrates || 0} g</p>
            <p>Fat: {subscriberDetails.nutrition?.fat || 0} g</p>
            <p>Fibre: {subscriberDetails.nutrition?.fibre || 0} g</p>
            <small>Nutritional values are estimates and vary by ingredients and portion size.</small>
          </div>

          <div className="premium-block">
            <h3>Servings & storage</h3>
            <p>Serves: {subscriberDetails.servings || 2}</p>
            <p>{subscriberDetails.storageInstructions}</p>
            <p>{subscriberDetails.reheatingInstructions}</p>
          </div>

          <div className="premium-block">
            <h3>Video guide</h3>
            {subscriberDetails.videoUrl ? <a href={subscriberDetails.videoUrl} target="_blank" rel="noreferrer">Watch video guide</a> : <p>Video guide coming soon.</p>}
          </div>

          <div className="premium-block">
            <h3>Chef details</h3>
            <p>Chef: {subscriberDetails.chef?.name}</p>
            <p>Location: {subscriberDetails.chef?.location}</p>
            <p>Contact: {subscriberDetails.chef?.contact}</p>
            <p>Price: {formatCurrency(subscriberDetails.chef?.preparationPrice || 0)}</p>
          </div>
        </div>
      ) : null}

      <div className="cta-box">
        <button type="button" className="primary-btn" onClick={handleRequestDirection}>Need help preparing this meal?</button>
      </div>
    </main>
  );
}

function TimetablePage({ timetable, isSubscriber }) {
  const [viewDate, setViewDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [monthEntries, setMonthEntries] = useState(timetable);
  const [monthRequestState, setMonthRequestState] = useState(null);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
  const monthKey = `${year}-${month + 1}`;
  const planStatus = monthRequestState?.key === monthKey ? monthRequestState.status : 'loading';
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = (new Date(year, month, 1).getDay() + 6) % 7;

  useEffect(() => {
    let active = true;
    api.get('/timetable', { params: { month: month + 1, year } })
      .then((result) => {
        if (active && Array.isArray(result.data.entries)) {
          const hasEntries = result.data.entries.length > 0;
          const hasSameMonthFallback = timetable.some((entry) => {
            const entryDate = new Date(`${String(entry.date).slice(0, 10)}T12:00:00`);
            return entryDate.getFullYear() === year && entryDate.getMonth() === month;
          });
          if (hasEntries || !hasSameMonthFallback) setMonthEntries(result.data.entries);
          setMonthRequestState({ key: monthKey, status: 'ready' });
        }
      })
      .catch(() => {
        if (active) {
          const fallback = month === new Date().getMonth() && year === new Date().getFullYear() ? timetable : [];
          setMonthEntries(fallback);
          setMonthRequestState({ key: monthKey, status: 'error' });
        }
      });
    return () => { active = false; };
  }, [month, monthKey, timetable, year]);

  const entriesByDay = new Map(monthEntries.map((entry) => [Number(String(entry.date).slice(8, 10)) || new Date(entry.date).getDate(), entry]));
  const dateNumbers = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const calendarCells = [...Array(leadingDays).fill(null), ...dateNumbers];
  while (calendarCells.length % 7) calendarCells.push(null);
  const mobileWeeks = Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, index) => dateNumbers.slice(index * 7, index * 7 + 7));
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const entryFor = (day) => entriesByDay.get(day);
  const mealTitle = (entry) => typeof entry?.meal === 'object' ? entry.meal.title : entry?.meal;
  const mealId = (entry) => typeof entry?.meal === 'object' ? entry.meal._id : entry?.mealId;
  const mealCategory = (entry) => typeof entry?.meal === 'object' ? getCategoryName(entry.meal.category) : getCategoryName(entry?.category);

  return (
    <main className="page timetable-page">
      <div className="calendar-heading">
        <div>
          <p className="eyebrow">Your monthly Nigerian meal guide</p>
          <h2>Meal plan</h2>
          <p className="muted-copy">Plan the month, cook with everyday ingredients, and keep your week moving.</p>
        </div>
        <div className="month-controls" aria-label="Choose month">
          <button type="button" className="calendar-arrow" aria-label="Previous month" onClick={() => setViewDate(new Date(year, month - 1, 1))}>‹</button>
          <strong>{monthLabel}</strong>
          <button type="button" className="calendar-arrow" aria-label="Next month" onClick={() => setViewDate(new Date(year, month + 1, 1))}>›</button>
          <button type="button" className="text-action" onClick={() => setViewDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Current month</button>
        </div>
      </div>

      {!isSubscriber ? <div className="calendar-access-note">Weeks 1-2 are open to everyone. Weeks 3 onward are included with a subscription.</div> : null}

      <div className={`calendar-wrap ${planStatus === 'loading' ? 'calendar-loading' : ''}`}>
        <div className="calendar-grid" role="table" aria-label={`${monthLabel} meal calendar`}>
          {weekdays.map((day) => <div className="calendar-weekday" role="columnheader" key={day}>{day.slice(0, 3)}</div>)}
          {calendarCells.map((day, index) => {
            if (!day) return <div className="calendar-cell calendar-blank" role="cell" key={`blank-${index}`} />;
            const locked = !isSubscriber && day > 14;
            const entry = entryFor(day);
            const title = mealTitle(entry);

            return (
              <div className={`calendar-cell ${locked ? 'calendar-locked' : ''}`} role="cell" key={day}>
                <span className="calendar-date">{String(day).padStart(2, '0')}</span>
                {locked ? (
                  <div className="calendar-lock"><span aria-hidden="true">⌑</span><small>Subscribers</small></div>
                ) : title ? (
                  <>
                    {entry.isExotic || entry.meal?.isExotic ? <span className="exotic-label">🌍 Exotic</span> : null}
                    {mealId(entry) ? <Link className="calendar-meal" to={`/meals/${mealId(entry)}`}>{title}</Link> : <strong className="calendar-meal">{title}</strong>}
                    <span className="calendar-category">{mealCategory(entry)}</span>
                    <small>{entry.preparationTime || entry.meal?.preparationTime || ''}</small>
                    {entry.estimatedCost || entry.meal?.estimatedCost ? <small>Est. {formatCurrency(entry.estimatedCost || entry.meal?.estimatedCost)}</small> : null}
                  </>
                ) : <small className="calendar-empty">No meal planned</small>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mobile-calendar" aria-label={`${monthLabel} meal plan`}>
        {mobileWeeks.map((days, weekIndex) => {
          const firstLockedDay = days.find((day) => !isSubscriber && day > 14);
          return (
            <section className="mobile-week" key={`week-${weekIndex}`}>
              <h3>Week {weekIndex + 1}</h3>
              {days.filter((day) => isSubscriber || day <= 14).map((day) => {
                const entry = entryFor(day);
                const title = mealTitle(entry);
                const date = new Date(year, month, day);
                return (
                  <article className="mobile-meal-row" key={day}>
                    <div className="mobile-date"><strong>{date.toLocaleDateString('en-NG', { weekday: 'long' })}</strong><span>{date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}</span></div>
                    {title ? <div className="mobile-meal-info">{entry.isExotic || entry.meal?.isExotic ? <span className="exotic-label">🌍 Exotic meal</span> : null}<strong>{title}</strong><span>{mealCategory(entry)} · {entry.preparationTime || entry.meal?.preparationTime || 'Meal plan'}</span>{mealId(entry) ? <Link to={`/meals/${mealId(entry)}`}>View meal</Link> : null}</div> : <span className="muted-copy">No meal planned</span>}
                  </article>
                );
              })}
              {firstLockedDay ? <div className="mobile-locked-week">Week {weekIndex + 1} <span>Locked for subscribers</span><Link to="/plans">Unlock full month</Link></div> : null}
            </section>
          );
        })}
      </div>

      {planStatus === 'error' ? <p className="calendar-error">Showing the available meal plan. We could not refresh this month just now.</p> : null}
      <p className="calendar-price-note">Meal costs are estimates and vary by location, market and season.</p>
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
          <div key={plan.id || plan._id} className="plan-card" data-reveal>
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

function BillingPage({ billing }) {
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

function AboutPage() {
  return (
    <main className="page about-page">
      <div className="hero-copy">
        <p className="eyebrow">Made for everyday Nigerian kitchens</p>
        <h2>Food that fits real life.</h2>
        <p className="muted-copy">Bachelor Kitchen brings practical Nigerian meals, clear beginner-friendly recipes, and monthly meal planning into one place.</p>
        <Link to="/meal-plan" className="primary-btn">Explore the meal plan</Link>
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
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    try {
      if (mode === 'login') await onLogin(form);
      else await onRegister(form);
      navigate('/');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to connect. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

          <button type="submit" className="primary-btn full-width" disabled={submitting}>{submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</button>
          {errorMessage ? <p className="auth-error" role="alert">{errorMessage}</p> : null}
        </form>
      </div>
    </main>
  );
}

function AdminPage({ meals, timetable }) {
  const [ingredientPrices, setIngredientPrices] = useState([]);
  const [priceMessage, setPriceMessage] = useState('');
  const [priceForm, setPriceForm] = useState({ name: '', unit: 'piece', quantity: 1, price: '', location: 'Lagos', market: '' });
  const stats = [
    { label: 'Total users', value: '1,204' },
    { label: 'Active subscribers', value: '482' },
    { label: 'Expired subscribers', value: '112' },
    { label: 'Revenue', value: '₦6.2M' },
  ];

  useEffect(() => {
    api.get('/admin/ingredient-prices')
      .then((result) => setIngredientPrices(result.data.prices || []))
      .catch(() => setPriceMessage('Sign in as an administrator to manage market prices.'));
  }, []);

  const saveIngredientPrice = async (event) => {
    event.preventDefault();
    setPriceMessage('');
    try {
      const result = await api.post('/admin/ingredient-prices', { ...priceForm, price: Number(priceForm.price) });
      setIngredientPrices((items) => [result.data.price, ...items]);
      setPriceForm({ name: '', unit: 'piece', quantity: 1, price: '', location: 'Lagos', market: '' });
      setPriceMessage('Ingredient price saved.');
    } catch (error) {
      setPriceMessage(error.response?.data?.message || 'Could not save this price. Check admin access and required fields.');
    }
  };

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

      <section className="detail-panel ingredient-price-admin">
        <h3>Ingredient market prices</h3>
        <p className="muted-copy">Add current local estimates. Meal costs should be reviewed as market prices change.</p>
        <form className="price-admin-form" onSubmit={saveIngredientPrice}>
          <label>Ingredient<input value={priceForm.name} onChange={(event) => setPriceForm({ ...priceForm, name: event.target.value })} required /></label>
          <label>Unit<input value={priceForm.unit} onChange={(event) => setPriceForm({ ...priceForm, unit: event.target.value })} required /></label>
          <label>Quantity<input type="number" min="0.01" step="any" value={priceForm.quantity} onChange={(event) => setPriceForm({ ...priceForm, quantity: event.target.value })} required /></label>
          <label>Estimated price (NGN)<input type="number" min="0" value={priceForm.price} onChange={(event) => setPriceForm({ ...priceForm, price: event.target.value })} required /></label>
          <label>City/area<input value={priceForm.location} onChange={(event) => setPriceForm({ ...priceForm, location: event.target.value })} /></label>
          <label>Market<input value={priceForm.market} onChange={(event) => setPriceForm({ ...priceForm, market: event.target.value })} /></label>
          <button type="submit" className="primary-btn">Save price</button>
        </form>
        {priceMessage ? <p className="price-message" role="status">{priceMessage}</p> : null}
        {ingredientPrices.length ? <div className="price-admin-list">{ingredientPrices.map((item) => <div className="price-admin-row" key={item._id}><strong>{item.name}</strong><span>{item.quantity} {item.unit}</span><span>{formatCurrency(item.price)}</span><span>{item.location}{item.market ? ` · ${item.market}` : ''}</span></div>)}</div> : <p className="muted-copy">No market prices have been added yet.</p>}
      </section>
    </main>
  );
}

export default App;
