/* ════════════════════════════════════════════
   STATE
════════════════════════════════════════════ */
const state = {
  role: null,
  selectedBudget: null,
  selectedWish: null,
  selectedPayMethod: 'card',
  anonymous: false,
  trackingStep: 0,
  createdWish: null,
  catalogFilter: 'all',
  catalogSearch: '',
  formValues: {}
};

/* ════════════════════════════════════════════
   DEMO DATA
════════════════════════════════════════════ */
const COLORS = ['av-blue','av-teal','av-amber','av-violet','av-rose','av-green'];
const ICONS = {
  'творчество':'🎨','спорт':'⚽','обучение':'📚','игры':'🎮','одежда':'👕','другое':'✨'
};

const demoWishes = [
  {
    id:1, name:'Маша', age:9, city:'Москва', category:'творчество',
    wish:'Набор для рисования и скетчинга',
    reason:'Маша обожает рисовать, но у неё нет качественных материалов. Она мечтает создавать красивые картины и развивать свой талант.',
    budget:3000, gratitude:true, color:'av-rose',
    product:{ name:'Набор для скетчинга Derwent 36 цветов', desc:'Профессиональные акварельные карандаши + альбом А4 + 3 кисти', price:2850, icon:'🎨' }
  },
  {
    id:2, name:'Артём', age:11, city:'Санкт-Петербург', category:'спорт',
    wish:'Футбольный мяч Nike',
    reason:'Артём занимается в дворовой команде, но мяч давно пришёл в негодность. Тренер говорит, что у него хорошие данные.',
    budget:3000, gratitude:true, color:'av-blue',
    product:{ name:'Футбольный мяч Nike Strike', desc:'Размер 5, сертифицирован FIFA, усиленное покрытие', price:2490, icon:'⚽' }
  },
  {
    id:3, name:'Дима', age:8, city:'Новосибирск', category:'игры',
    wish:'Конструктор LEGO Technic',
    reason:'Дима интересуется механикой и инженерией. LEGO поможет развить пространственное мышление и творческие навыки.',
    budget:5000, gratitude:false, color:'av-amber',
    product:{ name:'LEGO Technic 42143 Ferrari Daytona', desc:'738 деталей, движущиеся части, подвеска', price:4790, icon:'🧱' }
  },
  {
    id:4, name:'Аня', age:13, city:'Казань', category:'одежда',
    wish:'Тёплая зимняя куртка',
    reason:'Аня из многодетной семьи. Старая куртка стала мала, и ей холодно ходить в школу в морозы.',
    budget:5000, gratitude:true, color:'av-violet',
    product:{ name:'Зимняя куртка Columbia Arctic Blast', desc:'Наполнитель 250г, мембрана Omni-Heat, до -25°C, рост 158-164', price:4950, icon:'🧥' }
  },
  {
    id:5, name:'Саша', age:10, city:'Екатеринбург', category:'обучение',
    wish:'Книги и настольная лампа для учёбы',
    reason:'Саша очень любит читать, но книг дома почти нет, а освещение плохое. Хочет стать учёным.',
    budget:3000, gratitude:false, color:'av-teal',
    product:{ name:'Набор "Юный учёный" + LED-лампа Baseus', desc:'5 книг серии "Большая наука" + лампа с регулировкой яркости', price:2780, icon:'📚' }
  },
  {
    id:6, name:'Кирилл', age:14, city:'Воронеж', category:'обучение',
    wish:'Наушники для дистанционного обучения',
    reason:'Кирилл учится онлайн, но дешёвые наушники сломались. Без хорошего звука сложно воспринимать уроки.',
    budget:5000, gratitude:true, color:'av-green',
    product:{ name:'Беспроводные наушники JBL Tune 520BT', desc:'Bluetooth 5.3, 57 часов работы, шумоподавление', price:3990, icon:'🎧' }
  }
];

let catalogItems = [...demoWishes];

/* ════════════════════════════════════════════
   SECURITY: HTML escaping for user-controlled data
════════════════════════════════════════════ */
const ESC_MAP = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' };
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, ch => ESC_MAP[ch]);
}

/* ════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════ */
function goTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + screenId);
  if (target) target.classList.add('active');
  target && target.scrollTop && (target.scrollTop = 0);
  const body = target && target.querySelector('.screen-body');
  if (body) body.scrollTop = 0;
}

function startDonor() {
  state.role = 'donor';
  renderCatalog();
  goTo('catalog');
}

function startWisher() {
  state.role = 'wisher';
  goTo('create');
}

/* ════════════════════════════════════════════
   WISH CREATION
════════════════════════════════════════════ */
function selectBudget(btn) {
  document.querySelectorAll('#budget-group .seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.selectedBudget = parseInt(btn.dataset.val);
  updateProgress();
}

function updateProgress() {
  const fields = ['f-name','f-age','f-city','f-category','f-wish'];
  const filled = fields.filter(id => document.getElementById(id).value.trim()).length;
  const hasBudget = state.selectedBudget ? 1 : 0;
  const pct = Math.round(((filled + hasBudget) / 6) * 100);
  document.getElementById('create-progress').style.width = pct + '%';
}

function submitWish() {
  const name = document.getElementById('f-name').value.trim();
  const age = document.getElementById('f-age').value.trim();
  const city = document.getElementById('f-city').value.trim();
  const category = document.getElementById('f-category').value;
  const wish = document.getElementById('f-wish').value.trim();
  const reason = document.getElementById('f-reason').value.trim();
  const gratitude = document.getElementById('f-gratitude').checked;

  let valid = true;
  [['err-name',name],['err-age',age],['err-city',city],['err-category',category],['err-wish',wish]].forEach(([id,val])=>{
    const el = document.getElementById(id);
    if (!val) { el.classList.add('show'); valid = false; }
    else el.classList.remove('show');
  });
  const errBudget = document.getElementById('err-budget');
  if (!state.selectedBudget) { errBudget.classList.add('show'); valid = false; }
  else errBudget.classList.remove('show');
  if (!valid) return;

  const ageNum = parseInt(age);
  const matchedProduct = guessProduct(category, wish, state.selectedBudget);

  const newWish = {
    id: Date.now(), name, age: ageNum, city, category, wish, reason,
    budget: state.selectedBudget, gratitude, color: COLORS[Math.floor(Math.random()*COLORS.length)],
    product: matchedProduct, isNew: true
  };
  state.createdWish = newWish;
  catalogItems.unshift(newWish);

  renderModerationScreen(newWish, matchedProduct);
  goTo('moderation');
  runModeration();
}

function guessProduct(category, wish, budget) {
  const templates = {
    'творчество': { name:'Набор для творчества Premium', desc:'Краски, кисти, альбом, мелки', icon:'🎨' },
    'спорт': { name:'Спортивный инвентарь', desc:'Профессиональное качество для юных спортсменов', icon:'⚽' },
    'обучение': { name:'Обучающий набор', desc:'Книги, материалы, инструменты для учёбы', icon:'📚' },
    'игры': { name:'Игровой набор', desc:'Развивающие и развлекательные материалы', icon:'🎮' },
    'одежда': { name:'Детская одежда', desc:'Тёплая, качественная, по сезону', icon:'👕' },
    'другое': { name:'Специальный подарок', desc:'Подобрано под желание ребёнка', icon:'✨' }
  };
  const t = templates[category] || templates['другое'];
  const price = Math.round(budget * 0.85);
  return { name: t.name, desc: t.desc, price, icon: t.icon };
}

function renderModerationScreen(wish, product) {
  const wishContent = document.getElementById('mod-wish-content');
  wishContent.innerHTML = `
    <div class="info-row"><span class="info-label">Имя</span><span class="info-value">${escapeHtml(wish.name)}, ${escapeHtml(wish.age)} лет</span></div>
    <div class="info-row"><span class="info-label">Город</span><span class="info-value">${escapeHtml(wish.city)}</span></div>
    <div class="info-row"><span class="info-label">Категория</span><span class="info-value">${ICONS[wish.category]||'✨'} ${escapeHtml(wish.category)}</span></div>
    <div class="info-row"><span class="info-label">Желание</span><span class="info-value">${escapeHtml(wish.wish)}</span></div>
    <div class="info-row"><span class="info-label">Бюджет</span><span class="info-value">до ${wish.budget.toLocaleString('ru')} ₽</span></div>
  `;
  document.getElementById('mod-product-name').textContent = product.name;
  document.getElementById('mod-product-desc').textContent = product.desc;
  document.getElementById('mod-product-price').textContent = product.price.toLocaleString('ru') + ' ₽';
  document.getElementById('mod-product-icon').textContent = product.icon;
}

function runModeration() {
  const steps = [
    { icon: 'tl-mod-1', line: 'tl-line-1', label: 'tl-label-1', sub: 'tl-sub-1', subText: 'Проверка прошла успешно' },
    { icon: 'tl-mod-2', line: 'tl-line-2', label: 'tl-label-2', sub: 'tl-sub-2', subText: 'Товар найден на Ozon' },
    { icon: 'tl-mod-3', label: 'tl-label-3', sub: 'tl-sub-3', subText: 'Желание опубликовано' }
  ];
  let idx = 0;
  const advance = () => {
    if (idx >= steps.length) {
      document.getElementById('mod-badge').textContent = '✓ Опубликовано';
      document.getElementById('mod-badge').classList.add('done');
      document.getElementById('mod-wish-summary').style.display = 'block';
      document.getElementById('mod-product-wrap').style.display = 'block';
      const btn = document.getElementById('mod-btn');
      btn.style.opacity = '1'; btn.style.pointerEvents = 'auto';
      return;
    }
    const s = steps[idx];
    const iconEl = document.getElementById(s.icon);
    iconEl.className = 'tl-icon active';
    iconEl.textContent = (idx+2);
    setTimeout(() => {
      iconEl.className = 'tl-icon done';
      iconEl.textContent = '✓';
      if (s.line) { const l = document.getElementById(s.line); l.classList.add('done'); }
      document.getElementById(s.label).classList.remove('dim');
      document.getElementById(s.sub).textContent = s.subText;
      idx++;
      setTimeout(advance, 900);
    }, 800);
  };
  setTimeout(advance, 600);
}

/* ════════════════════════════════════════════
   CATALOG
════════════════════════════════════════════ */
function setFilter(el, filter) {
  document.querySelectorAll('#filter-chips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  state.catalogFilter = filter;
  filterCatalog();
}

function filterCatalog() {
  state.catalogSearch = document.getElementById('search-input').value.toLowerCase();
  renderCatalog();
}

function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  const empty = document.getElementById('catalog-empty');
  const { catalogFilter: f, catalogSearch: q } = state;

  const filtered = catalogItems.filter(w => {
    const matchSearch = !q || w.name.toLowerCase().includes(q) || w.category.toLowerCase().includes(q) || w.wish.toLowerCase().includes(q) || w.city.toLowerCase().includes(q);
    const matchFilter = f === 'all' ||
      (f === '1000' && w.budget <= 1000) ||
      (f === '3000' && w.budget <= 3000) ||
      (f === '5000' && w.budget <= 5000) ||
      (f === 'gratitude' && w.gratitude);
    return matchSearch && matchFilter;
  });

  document.getElementById('catalog-count').textContent = filtered.length;

  if (!filtered.length) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  grid.style.display = 'flex';
  empty.style.display = 'none';

  grid.innerHTML = filtered.map(w => `
    <div class="wish-card" onclick="selectWish(${w.id})">
      <div class="wish-card-top">
        <div class="wish-avatar ${w.color}">${escapeHtml((w.name || '?')[0])}</div>
        <div class="wish-card-meta">
          <div class="wish-card-name">${escapeHtml(w.name)}, ${escapeHtml(w.age)} лет</div>
          <div class="wish-card-sub">${escapeHtml(w.city)} · ${ICONS[w.category]||'✨'} ${escapeHtml(w.category)}</div>
        </div>
        ${w.isNew ? '<span class="badge badge-teal">Новое</span>' : ''}
      </div>
      <div class="wish-card-desc">${escapeHtml(w.wish)}</div>
      <div class="wish-card-footer">
        <div class="wish-price">${w.product.price.toLocaleString('ru')} ₽</div>
        <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap; justify-content:flex-end;">
          <span class="badge badge-green">✓ Проверено</span>
          ${w.gratitude ? '<span class="badge badge-amber">💌 Благодарность</span>' : ''}
        </div>
      </div>
      <div style="margin-top:12px;">
        <button class="btn btn-primary btn-full btn-sm" onclick="event.stopPropagation(); selectWish(${w.id})">Исполнить желание →</button>
      </div>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════
   WISH DETAILS
════════════════════════════════════════════ */
function selectWish(id) {
  const wish = catalogItems.find(w => w.id === id);
  if (!wish) return;
  state.selectedWish = wish;
  renderDetails(wish);
  goTo('details');
}

function renderDetails(w) {
  const body = document.getElementById('details-body');
  body.innerHTML = `
    <div class="card" style="padding:20px;">
      <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;">
        <div class="wish-avatar ${w.color}" style="width:56px;height:56px;border-radius:18px;font-size:22px;">${escapeHtml((w.name || '?')[0])}</div>
        <div>
          <div style="font-size:18px;font-weight:800;color:var(--gray-900);">${escapeHtml(w.name)}</div>
          <div style="font-size:14px;color:var(--gray-500);">${escapeHtml(w.age)} лет · ${escapeHtml(w.city)}</div>
          <div style="margin-top:4px;"><span class="badge badge-blue">${ICONS[w.category]||'✨'} ${escapeHtml(w.category)}</span></div>
        </div>
      </div>
      <hr class="divider" style="margin-bottom:14px;">
      <div style="font-size:15px;font-weight:700;color:var(--gray-900);margin-bottom:6px;">💭 Желание</div>
      <div style="font-size:14px;color:var(--gray-700);line-height:1.6;margin-bottom:14px;">${escapeHtml(w.wish)}</div>
      ${w.reason ? `<div style="font-size:13px;color:var(--gray-500);line-height:1.6;background:var(--gray-100);border-radius:12px;padding:12px;white-space:pre-wrap;">${escapeHtml(w.reason)}</div>` : ''}
    </div>

    <div class="product-card">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span class="section-label">Подходящий товар</span>
        <span class="badge badge-teal">✓ Подобрано</span>
      </div>
      <div class="product-header">
        <div class="product-icon">${escapeHtml(w.product.icon)}</div>
        <div>
          <div class="product-name">${escapeHtml(w.product.name)}</div>
          <div class="product-desc">${escapeHtml(w.product.desc)}</div>
        </div>
      </div>
      <div class="product-footer">
        <div class="product-price">${w.product.price.toLocaleString('ru')} ₽</div>
        <div class="marketplace-badge">🛒 Найдено на маркетплейсе</div>
      </div>
    </div>

    <div class="transp-block">
      <div style="font-size:13px;font-weight:700;color:var(--blue);margin-bottom:4px;">🔍 Прозрачность операции</div>
      <div class="transp-row">
        <div class="transp-icon">✓</div>
        <div class="transp-text">Желание прошло проверку команды</div>
      </div>
      <div class="transp-row">
        <div class="transp-icon">🛍</div>
        <div class="transp-text">Товар подобран точно под запрос</div>
      </div>
      <div class="transp-row">
        <div class="transp-icon">📦</div>
        <div class="transp-text">Доставка организуется командой проекта</div>
      </div>
      ${w.gratitude ? `<div class="transp-row"><div class="transp-icon">💌</div><div class="transp-text">Ребёнок хочет передать благодарность</div></div>` : ''}
    </div>
  `;
  renderPaymentScreen(w);
}

/* ════════════════════════════════════════════
   PAYMENT
════════════════════════════════════════════ */
function renderPaymentScreen(w) {
  const body = document.getElementById('payment-body');
  body.innerHTML = `
    <div class="card" style="padding:18px;">
      <div class="section-label" style="margin-bottom:12px;">Ваш заказ</div>
      <div class="info-row">
        <span class="info-label">Получатель</span>
        <span class="info-value">${escapeHtml(w.name)}, ${escapeHtml(w.age)} лет · ${escapeHtml(w.city)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Подарок</span>
        <span class="info-value">${escapeHtml(w.product.name)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Стоимость</span>
        <span class="info-value">${w.product.price.toLocaleString('ru')} ₽</span>
      </div>
      <div class="info-row">
        <span class="info-label">Статус</span>
        <span class="info-value" style="color:var(--green);">✓ Доставка включена</span>
      </div>
      <hr class="divider">
      <div class="total-row">
        <span class="total-label">Итого</span>
        <span class="total-value">${w.product.price.toLocaleString('ru')} ₽</span>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px;">
      <div class="section-label">Способ оплаты</div>
      <div class="pay-option selected" id="pay-card" onclick="selectPayMethod('card')">
        <div class="pay-option-icon">💳</div>
        <div class="pay-option-label">Банковская карта</div>
        <div class="pay-radio" id="radio-card"></div>
      </div>
      <div class="pay-option" id="pay-sbp" onclick="selectPayMethod('sbp')">
        <div class="pay-option-icon" style="background:var(--teal-light);">⚡</div>
        <div class="pay-option-label">СБП (Система быстрых платежей)</div>
        <div class="pay-radio" id="radio-sbp"></div>
      </div>
      <div class="pay-option" id="pay-digital" onclick="selectPayMethod('digital')">
        <div class="pay-option-icon" style="background:#1a1917;">🍎</div>
        <div class="pay-option-label">Apple Pay / Google Pay</div>
        <div class="pay-radio" id="radio-digital"></div>
      </div>
    </div>

    <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:14px;">
      <div class="toggle-row">
        <span class="toggle-label">Остаться анонимным дарителем</span>
        <button class="toggle ${state.anonymous?'on':''}" id="anon-toggle" onclick="toggleAnon()" aria-label="Анонимность"></button>
      </div>
      <div class="form-group">
        <label class="form-label" for="pay-msg">Сообщение команде проекта (необязательно)</label>
        <textarea class="form-textarea" id="pay-msg" placeholder="Например, пожелания или особые инструкции..." style="min-height:70px;"></textarea>
      </div>
    </div>
  `;
}

function selectPayMethod(method) {
  state.selectedPayMethod = method;
  ['card','sbp','digital'].forEach(m => {
    document.getElementById('pay-'+m).classList.toggle('selected', m === method);
    const r = document.getElementById('radio-'+m);
    r.style.borderColor = m === method ? 'var(--blue)' : '';
  });
}

function toggleAnon() {
  state.anonymous = !state.anonymous;
  const t = document.getElementById('anon-toggle');
  t.classList.toggle('on', state.anonymous);
}

function confirmPayment() {
  const btn = document.getElementById('pay-btn');
  btn.innerHTML = '<div class="spinner"></div>';
  btn.disabled = true;
  setTimeout(() => {
    state.trackingStep = 0;
    renderTracking();
    goTo('tracking');
  }, 1800);
}

/* ════════════════════════════════════════════
   TRACKING
════════════════════════════════════════════ */
const trackingSteps = [
  { label: 'Оплата подтверждена', sub: 'Средства получены', icon: '💳' },
  { label: 'Товар выкуплен', sub: 'Заказ оформлен на маркетплейсе', icon: '🛒' },
  { label: 'Передан в доставку', sub: 'Курьерская служба принята', icon: '🚚' },
  { label: 'Вручён ребёнку', sub: 'Желание исполнено!', icon: '🎉' }
];

function renderTracking() {
  const w = state.selectedWish;
  const s = state.trackingStep;
  const body = document.getElementById('tracking-body');
  const actions = document.getElementById('tracking-actions');

  body.innerHTML = `
    <div class="success-banner">
      <div class="success-banner-icon">✓</div>
      <div>
        <div class="success-banner-title">Подарок оплачен!</div>
        <div class="success-banner-sub">Команда уже начала работу над доставкой</div>
      </div>
    </div>

    <div class="card" style="padding:18px;">
      <div class="section-label" style="margin-bottom:14px;">Статус доставки</div>
      <div class="timeline" id="tracking-timeline">${renderTrackingTimeline(s)}</div>
    </div>

    <div class="card" style="padding:16px;background:var(--gray-100);border-color:var(--gray-200);">
      <div class="section-label" style="margin-bottom:10px;">Детали заказа</div>
      <div class="info-row"><span class="info-label">Кому</span><span class="info-value">${escapeHtml(w.name)}, ${escapeHtml(w.age)} лет · ${escapeHtml(w.city)}</span></div>
      <div class="info-row"><span class="info-label">Что</span><span class="info-value">${escapeHtml(w.product.name)}</span></div>
      <div class="info-row"><span class="info-label">Сумма</span><span class="info-value">${w.product.price.toLocaleString('ru')} ₽</span></div>
      ${w.gratitude ? '<div class="info-row"><span class="info-label">Благодарность</span><span class="info-value" style="color:var(--amber);">💌 Будет отправлена</span></div>' : ''}
    </div>
  `;

  const allDone = s >= trackingSteps.length;
  if (allDone) {
    actions.innerHTML = '';
    setTimeout(() => { renderResult(); goTo('result'); }, 700);
    return;
  }
  actions.innerHTML = `
    <button class="btn btn-primary btn-full" onclick="advanceTracking()">Симулировать следующий этап →</button>
    <button class="btn btn-ghost btn-full" onclick="skipToResult()">Сразу показать финальный результат</button>
  `;
}

function renderTrackingTimeline(currentStep) {
  return trackingSteps.map((s, i) => {
    const done = i < currentStep;
    const active = i === currentStep;
    const dim = i > currentStep;
    const iconClass = done ? 'done' : active ? 'active' : '';
    const lineClass = done ? 'done' : '';
    const labelClass = dim ? 'dim' : '';
    const icon = done ? '✓' : (active ? s.icon : (i+1));
    return `
      <div class="timeline-item">
        <div class="tl-icon-wrap">
          <div class="tl-icon ${iconClass}">${icon}</div>
          ${i < trackingSteps.length-1 ? `<div class="tl-line ${lineClass}"></div>` : ''}
        </div>
        <div class="tl-content">
          <div class="tl-label ${labelClass}">${s.label}</div>
          <div class="tl-sub">${done ? s.sub : (active ? 'В процессе...' : 'Ожидание')}</div>
        </div>
      </div>
    `;
  }).join('');
}

function advanceTracking() {
  state.trackingStep++;
  renderTracking();
}

function skipToResult() {
  state.trackingStep = trackingSteps.length;
  renderResult();
  goTo('result');
}

/* ════════════════════════════════════════════
   RESULT
════════════════════════════════════════════ */
function renderResult() {
  const w = state.selectedWish;
  const body = document.getElementById('result-body');
  const actions = document.getElementById('result-actions');

  body.innerHTML = `
    <div class="result-hero">
      <div class="check-circle">
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 18L15 25L28 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div style="font-size:24px;font-weight:800;color:var(--gray-900);letter-spacing:-.02em;">Желание исполнено!</div>
      <div style="font-size:14px;color:var(--gray-500);max-width:270px;line-height:1.5;">Подарок успешно вручён ${escapeHtml(w.name)}. Спасибо, что делаете мир добрее.</div>
    </div>

    <div class="card" style="padding:18px;">
      <div class="section-label" style="margin-bottom:12px;">Итоги</div>
      <div class="info-row"><span class="info-label">Кому помогли</span><span class="info-value">${escapeHtml(w.name)}, ${escapeHtml(w.age)} лет · ${escapeHtml(w.city)}</span></div>
      <div class="info-row"><span class="info-label">Подарок</span><span class="info-value">${escapeHtml(w.product.name)}</span></div>
      <div class="info-row"><span class="info-label">Сумма</span><span class="info-value">${w.product.price.toLocaleString('ru')} ₽</span></div>
      <div class="info-row"><span class="info-label">Статус</span><span class="info-value" style="color:var(--green);">✓ Вручено</span></div>
    </div>

    ${w.gratitude ? `
    <div class="gratitude-card">
      <div class="gratitude-title">💌 Спасибо за подарок!</div>
      <div class="gratitude-msg">${escapeHtml(getGratitudeText(w.name, w.wish))}</div>
      <button class="btn btn-full" style="background:var(--amber);color:#fff;font-size:14px;box-shadow:none;" onclick="openGratitudeModal(${w.id})">
        🎧 Смотреть благодарность
      </button>
    </div>
    ` : ''}

    <div style="background:var(--blue-soft);border-radius:var(--radius-md);padding:16px;text-align:center;">
      <div style="font-size:13px;color:var(--blue);font-weight:600;">🌍 Вы один из <strong>1 247</strong> дарителей, которые меняют жизни детей</div>
    </div>
  `;

  actions.innerHTML = `
    <button class="btn btn-primary btn-full" onclick="goToCatalogFromResult()">Исполнить ещё одно желание 🎁</button>
    <button class="btn btn-outline btn-full" onclick="goToCreateFromResult()">Добавить новое желание ⭐</button>
  `;
}

function getGratitudeText(name, wish) {
  const texts = [
    `«Спасибо огромное! Я так счастлив(а)! Это именно то, о чём я мечтал(а). Вы очень добрый человек!»`,
    `«Большое спасибо за такой замечательный подарок. Я буду им очень дорожить и думать о вашей доброте.»`,
    `«Не могу поверить, что моё желание исполнилось! Огромное спасибо — вы сделали меня самым счастливым(ой)!»`
  ];
  return texts[Math.floor(Math.random() * texts.length)];
}

function openGratitudeModal(id) {
  const modal = document.getElementById('gratitude-modal');
  modal.classList.remove('hidden');
}

function closeModal(e) {
  if (e.target === document.getElementById('gratitude-modal')) {
    document.getElementById('gratitude-modal').classList.add('hidden');
  }
}

function goToCatalogFromResult() {
  renderCatalog();
  goTo('catalog');
}

function goToCreateFromResult() {
  document.getElementById('f-name').value = '';
  document.getElementById('f-age').value = '';
  document.getElementById('f-city').value = '';
  document.getElementById('f-category').value = '';
  document.getElementById('f-wish').value = '';
  document.getElementById('f-reason').value = '';
  document.getElementById('f-gratitude').checked = false;
  state.selectedBudget = null;
  document.querySelectorAll('#budget-group .seg-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('create-progress').style.width = '0%';
  goTo('create');
}

/* ════════════════════════════════════════════
   BOOT
════════════════════════════════════════════ */
renderCatalog();
