(() => {
  'use strict';

  const STORAGE_KEY = 'vmatrice-concept-v1';
  const asset = name => `https://v-matrice.ru/review/assets/${name}`;
  const guides = {
    owl: { name: 'Сова', subtitle: 'ясность и мудрый взгляд', image: asset('guide-owl-v2.webp'), thumb: asset('guide-owl-thumb-v2.webp') },
    wolf: { name: 'Волчица', subtitle: 'интуиция и верность себе', image: asset('guide-wolf-v2.webp'), thumb: asset('guide-wolf-thumb-v2.webp') },
    luna: { name: 'Луна', subtitle: 'мягкость и внутренняя опора', image: asset('guide-cat-v2.webp'), thumb: asset('guide-cat-thumb-v2.webp') },
    lion: { name: 'Лев', subtitle: 'смелость и проявленность', image: asset('guide-lion-v2.webp'), thumb: asset('guide-lion-thumb-v2.webp') }
  };
  const defaultState = {
    mode: 'new', route: 'home', guide: 'owl', birthReady: false, reportReady: false,
    birth: { date: '', time: '', city: '', unknownTime: false },
    topic: '', request: '', answers: {}, messages: []
  };
  let state = loadState();
  const previewParams = new URLSearchParams(location.search);
  const previewRoute = previewParams.get('screen');
  const previewMode = previewParams.get('mode');
  if (['home', 'birth', 'chart', 'guide', 'request', 'report', 'reports', 'profile'].includes(previewRoute)) state.route = previewRoute;
  if (['new', 'returning'].includes(previewMode)) {
    state.mode = previewMode;
    if (previewMode === 'returning') { state.birthReady = true; state.reportReady = true; }
  }
  const app = document.querySelector('#app');
  const brandTemplate = document.querySelector('#brand-template');

  function loadState() {
    try { return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
    catch { return { ...defaultState }; }
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function esc(value = '') { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
  function iconBack() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>'; }
  function iconArrow() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function header(title, back = 'home') {
    return `<header class="screen-header"><button class="icon-button" type="button" data-route="${back}" aria-label="Назад">${iconBack()}</button><div class="header-copy"><span class="eyebrow">В МАТРИЦЕ</span><h2>${title}</h2></div></header>`;
  }
  function avatar() {
    const guide = guides[state.guide];
    return `<button class="avatar-button" type="button" data-route="profile" aria-label="Открыть профиль"><img src="${guide.thumb}" alt=""></button>`;
  }
  function brand() { return brandTemplate.innerHTML; }
  function go(route, options = {}) {
    if (route === 'chart' && !state.birthReady) route = 'birth';
    Object.assign(state, options, { route });
    save(); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function homeScreen() {
    const guide = guides[state.guide];
    const returning = state.mode === 'returning';
    return `<section class="screen" data-screen="home">
      <div class="home-head">${brand()}${avatar()}</div>
      <div class="title-block"><span class="eyebrow">Добро пожаловать${returning ? ' снова' : ''}</span><h1>${returning ? 'Твоя карта уже ждёт' : 'Начни с себя'}</h1></div>
      <article class="card welcome">
        <div class="guide-inline"><img src="${guide.thumb}" alt="Проводник ${guide.name}"><div><strong>${guide.name}</strong><p>${returning ? 'Я сохранила главное из нашего диалога. Продолжим оттуда, где остановились?' : 'Я буду рядом, пока ты знакомишься со своей картой и ищешь ответы.'}</p></div></div>
        <div class="next-step"><span class="eyebrow">Следующий шаг</span><h2>${returning ? 'Продолжить диалог' : 'Рассчитать натальную карту'}</h2><p>${returning ? 'Поговорим о том, что сейчас особенно важно.' : 'Это займёт пару минут. Нужны дата, время и город рождения.'}</p><button class="primary" type="button" data-route="${returning ? 'guide' : 'birth'}">${returning ? 'Открыть диалог' : 'Ввести данные'} ${iconArrow()}</button></div>
      </article>
      <div class="section-gap"><span class="eyebrow">Твоё пространство</span><div class="quick-grid">
        <button class="quick-card" type="button" data-route="chart"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8"/></svg><strong>Моя натальная карта</strong><span>${returning ? 'Солнце, Луна, Асцендент и детали' : 'Сначала добавь данные рождения'}</span></button>
        <button class="quick-card" type="button" data-route="guide"><svg viewBox="0 0 24 24"><path d="M5 17c-2-1-3-3-3-6 0-5 4-8 10-8s10 3 10 8-4 8-10 8c-1 0-2 0-3-.2L5 21z"/></svg><strong>Спросить проводника</strong><span>Диалог на важную тему</span></button>
        <button class="quick-card" type="button" data-route="request"><svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6zM9 11h6M9 15h6M9 7h3"/></svg><strong>Собрать разбор</strong><span>Глубоко под твой запрос</span></button>
        <button class="quick-card" type="button" data-route="reports"><svg viewBox="0 0 24 24"><path d="M4 6h16v14H4zM8 3h8v3M8 11h8M8 15h5"/></svg><strong>Мои разборы</strong><span>${returning ? '3 материала в истории' : 'Пока здесь пусто'}</span></button>
      </div></div>
    </section>`;
  }

  function birthScreen() {
    const b = state.birth;
    return `<section class="screen" data-screen="birth">${header('Данные рождения')}
      <div class="title-block"><h1>Расскажешь, где началась твоя история?</h1><p>Эти данные нужны только для демонстрации карты и сохраняются в твоём браузере.</p></div>
      <form id="birth-form" class="stack" novalidate>
        <div class="field"><label for="birth-date">Дата рождения</label><input class="input" id="birth-date" name="date" type="date" value="${esc(b.date)}" required><div class="error" data-error="date"></div></div>
        <div class="field time-field" ${b.unknownTime ? 'hidden' : ''}><label for="birth-time">Точное время</label><input class="input" id="birth-time" name="time" type="time" value="${esc(b.time)}" ${b.unknownTime ? '' : 'required'}><div class="error" data-error="time"></div></div>
        <div class="card card-pad toggle-row"><div><strong class="small">Не знаю точное время</strong><p class="muted small">Карту всё равно можно посмотреть</p></div><button class="switch" type="button" role="switch" aria-checked="${b.unknownTime}" aria-label="Не знаю точное время"></button></div>
        <div class="hint"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></svg><span>Без точного времени Асцендент и дома могут быть определены неточно. В превью мы покажем тестовый вариант.</span></div>
        <div class="field city-field"><label for="birth-city">Город рождения</label><input class="input" id="birth-city" name="city" autocomplete="off" placeholder="Начни вводить город" value="${esc(b.city)}" required><div class="suggestions" role="listbox"><button type="button" role="option">Самара, Россия</button><button type="button" role="option">Москва, Россия</button><button type="button" role="option">Казань, Россия</button></div><div class="error" data-error="city"></div></div>
        <button class="primary" type="submit">Рассчитать карту ${iconArrow()}</button>
      </form>
    </section>`;
  }

  function natalChart() {
    const symbols = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
    const labels = symbols.map((symbol, index) => { const angle = (index * 30 - 90) * Math.PI / 180; return `<text x="${100 + Math.cos(angle) * 83}" y="${100 + Math.sin(angle) * 83}">${symbol}</text>`; }).join('');
    const spokes = symbols.map((_, index) => { const angle = index * 30 * Math.PI / 180; return `<path class="fine" d="M100 100 L${100 + Math.cos(angle) * 91} ${100 + Math.sin(angle) * 91}"/>`; }).join('');
    return `<svg class="chart-svg" viewBox="0 0 200 200" role="img" aria-label="Демонстрационный круг натальной карты"><circle class="ring" cx="100" cy="100" r="94"/><circle class="ring" cx="100" cy="100" r="73"/><circle class="fine" cx="100" cy="100" r="48"/>${spokes}${labels}<path class="aspect" d="M100 27 145 136 42 82 158 82 55 136Z"/><path class="aspect" d="M100 52 140 120 70 142 62 75 151 98 100 52"/><circle cx="100" cy="100" r="4" fill="#d9aa67"/></svg>`;
  }

  function chartScreen() {
    return `<section class="screen" data-screen="chart">${header('Натальная карта')}
      <div class="chart-wrap">${natalChart()}</div>
      <div class="big-three">
        <div class="card astro-stat"><b>☉</b><span>Солнце</span><small>в Весах</small></div>
        <div class="card astro-stat"><b>☽</b><span>Луна</span><small>в Рыбах</small></div>
        <div class="card astro-stat"><b>↑</b><span>Асцендент</span><small>во Льве</small></div>
      </div>
      <div class="card card-pad">
        <details open><summary>Планеты</summary><div class="details-copy">Солнце в Весах помогает видеть обе стороны, а Луна в Рыбах усиливает эмпатию и тонкость восприятия.</div></details>
        <details><summary>Дома</summary><div class="details-copy">Первый дом во Льве подсвечивает тему заметности, достоинства и права занимать своё место.</div></details>
        <details><summary>Аспекты</summary><div class="details-copy">Гармоничная связь Луны и Венеры помогает превращать чувствительность в творчество и близость.</div></details>
      </div>
      <div class="stack section-gap"><button class="primary" type="button" data-route="guide">Спросить проводника ${iconArrow()}</button><button class="secondary" type="button" data-route="birth">Изменить данные рождения</button></div>
    </section>`;
  }

  function guideScreen() {
    const guide = guides[state.guide];
    const sample = state.mode === 'returning' || state.messages.length;
    const messages = sample ? `<div class="message user">Мне сложно проявляться открыто, хотя я чувствую, что готова к большему.</div><div class="message guide">В твоей карте есть сильная потребность быть увиденной — и одновременно высокая чувствительность к оценке. Это не противоречие, а настройка твоего способа проявляться.</div><div class="message guide">Начни не с громкости, а с ясности: выбери одну мысль, за которую готова стоять сегодня. Твой Асцендент во Льве раскрывается, когда ты не играешь роль, а позволяешь себе занимать место.</div>` : `<div class="message guide">Я рядом. О чём тебе хочется поговорить сегодня?</div>`;
    return `<section class="screen chat-screen" data-screen="guide">
      <div class="guide-hero"><img src="${guide.image}" alt="Проводник ${guide.name}"><header class="screen-header"><button class="icon-button" type="button" data-route="home" aria-label="Назад">${iconBack()}</button><div class="header-copy"></div>${avatar()}</header><div class="guide-name"><span class="eyebrow">Твой проводник</span><h1>${guide.name}</h1><p>${guide.subtitle}</p></div></div>
      <div class="chat">${messages}</div>
      <div class="prompts" aria-label="Подсказки для вопроса"><button class="chip" type="button" data-prompt="Что поможет мне проявляться?">Что поможет мне проявляться?</button><button class="chip" type="button" data-prompt="На что обратить внимание в отношениях?">Что важно в отношениях?</button><button class="chip" type="button" data-prompt="Где мой финансовый ресурс?">Где мой финансовый ресурс?</button></div>
      <button class="secondary section-gap" type="button" data-route="request">Собрать глубокий разбор по теме</button>
      <form class="chat-compose" id="chat-form"><input name="message" aria-label="Сообщение проводнику" placeholder="Напиши свой вопрос"><button class="send" type="submit" aria-label="Отправить"><svg viewBox="0 0 24 24"><path d="m4 4 17 8-17 8 3-8-3-8Zm3 8h14"/></svg></button></form>
    </section>`;
  }

  const questionSets = {
    'Финансы': ['Что сейчас важнее?', ['Рост дохода', 'Стабильность', 'Своё дело']],
    'Отношения': ['На чём хочется сфокусироваться?', ['Новые отношения', 'Текущая пара', 'Отношения с собой']],
    'Прогноз': ['Какой период посмотреть?', ['Ближайший месяц', 'Три месяца', 'До конца года']],
    'Проявленность': ['Где хочется стать заметнее?', ['В работе', 'В блоге', 'В творчестве']],
    'Карьера': ['Что ближе к запросу?', ['Смена пути', 'Рост', 'Предназначение']],
    'Дом': ['Что особенно важно?', ['Переезд', 'Семья', 'Опора и уют']]
  };

  function requestScreen() {
    const topics = Object.keys(questionSets);
    const current = state.topic && questionSets[state.topic];
    return `<section class="screen" data-screen="request">${header('Персональный разбор', 'guide')}
      <div class="title-block"><h1>С чем хочешь разобраться?</h1><p>Опиши ситуацию своими словами. Темы ниже помогут начать, но не ограничивают тебя.</p></div>
      <div class="topics" aria-label="Темы">${topics.map(topic => `<button class="chip ${topic === state.topic ? 'selected' : ''}" type="button" data-topic="${topic}">${topic}</button>`).join('')}</div>
      <div class="field section-gap"><label for="request-text">Твой запрос</label><textarea class="textarea" id="request-text" placeholder="Например: я хочу понять, как проявляться увереннее и не терять себя…">${esc(state.request)}</textarea><div class="error" data-error="request"></div></div>
      <div id="clarifying" class="stack section-gap">${current ? clarifyingQuestions(current) : '<div class="hint"><span>Выбери тему — появятся несколько коротких уточнений для более точного разбора.</span></div>'}</div>
      <button class="primary section-gap" id="build-report" type="button">Собрать разбор ${iconArrow()}</button>
    </section>`;
  }

  function clarifyingQuestions(set) {
    return `<div class="card question-card"><p>${set[0]}</p><div class="options">${set[1].map(option => `<button class="option ${state.answers.focus === option ? 'selected' : ''}" type="button" data-answer="${option}">${option}</button>`).join('')}</div></div><div class="card question-card"><p>Как ты хочешь чувствовать себя после разбора?</p><div class="options">${['Спокойнее', 'Увереннее', 'С ясным планом'].map(option => `<button class="option ${state.answers.feeling === option ? 'selected' : ''}" type="button" data-feeling="${option}">${option}</button>`).join('')}</div></div>`;
  }

  function reportTitle() {
    const text = state.request.trim();
    if (text) return text.length > 56 ? `${text.slice(0, 53).trim()}…` : text;
    return state.topic ? `${state.topic}: точка внутренней опоры` : 'Твоя точка внутренней опоры';
  }

  function reportScreen() {
    return `<section class="screen" data-screen="report">${header('Готовый разбор', 'reports')}
      <article class="card report-cover"><span class="eyebrow">Персональный разбор</span><h1>${esc(reportTitle())}</h1><p>Твоя сила сейчас — не в резком рывке, а в ясном выборе своего способа проявляться. Карта показывает, как соединить чувствительность, достоинство и действие.</p><div class="report-meta"><span>12 минут чтения</span><span>•</span><span>4 главы</span></div></article>
      <nav class="card toc section-gap" aria-label="Оглавление"><h3>Внутри разбора</h3><ol><li>Что происходит сейчас</li><li>Твой природный ресурс</li><li>Что мешает двигаться</li><li>Практические шаги</li></ol></nav>
      <article class="card chapter"><span class="eyebrow">Глава 1</span><h2>Что происходит сейчас</h2><p>Ты подошла к моменту, когда прежний способ оставаться в безопасности стал тесным. Желание проявляться уже сильнее привычки ждать идеальной готовности.</p><p>Солнце в Весах ищет верную форму и учитывает других. Асцендент во Льве просит не прятать свою позицию. Вместе они учат быть заметной без борьбы — через вкус, смысл и спокойную уверенность.</p></article>
      <article class="card chapter"><span class="eyebrow">Глава 2</span><h2>Твой природный ресурс</h2><p>Твоя Луна в Рыбах считывает нюансы, которые другие могут не замечать. Это способность понимать людей и создавать пространство, где им легче услышать себя.</p><p>Ресурс раскрывается, когда чувствительность получает форму: текст, метод, разговор, творческий проект. Тогда она перестаёт перегружать и начинает работать на тебя.</p></article>
      <article class="card chapter"><span class="eyebrow">Практика</span><h2>Три шага на ближайшую неделю</h2><ul><li>Сформулируй одну мысль, которую хочешь отстаивать публично.</li><li>Выбери один комфортный формат проявления и повтори его три раза.</li><li>После каждого действия отмечай не охваты, а ощущение честности с собой.</li></ul></article>
      <button class="primary section-gap" type="button" data-route="reports">Вернуться в «Мои разборы»</button>
    </section>`;
  }

  function reportsScreen() {
    const hasReports = state.mode === 'returning' || state.reportReady;
    return `<section class="screen" data-screen="reports">${header('Мои разборы')}
      <div class="title-block"><h1>История твоих разборов</h1><p>Возвращайся к готовым материалам в удобное время.</p></div>
      ${hasReports ? `<div class="stack"><button class="report-card" type="button" data-route="report"><span class="report-icon">☉</span><span><strong>${esc(reportTitle())}</strong><small>Сегодня · 12 минут</small></span><span class="status">Готов</span></button><button class="report-card" type="button"><span class="report-icon">♃</span><span><strong>Финансовый ресурс и точки роста</strong><small>28 сентября</small></span><span class="status pending">Собирается</span></button><button class="report-card" type="button" data-route="request"><span class="report-icon">☽</span><span><strong>Близость без потери себя</strong><small>12 сентября</small></span><span class="status question">Нужен ответ</span></button></div><button class="secondary section-gap" type="button" data-route="request">Собрать новый разбор</button>` : `<div class="card empty"><div class="empty-mark">✦</div><h2>Здесь появятся твои разборы</h2><p>Первый материал можно собрать под любой живой запрос — без готовых формулировок.</p><button class="primary" type="button" data-route="request">Собрать первый разбор</button></div>`}
    </section>`;
  }

  function profileScreen() {
    const guide = guides[state.guide];
    return `<section class="screen" data-screen="profile">${header('Профиль')}
      <div class="title-block"><h1>Твоё пространство</h1><p>Только основные данные — без тарифов и платёжной информации.</p></div>
      <div class="card card-pad profile-guide"><img src="${guide.thumb}" alt="${guide.name}"><div><span class="eyebrow">Выбранный проводник</span><h2>${guide.name}</h2><div class="guide-picker" aria-label="Выбрать проводника">${Object.entries(guides).map(([key, item]) => `<button class="${key === state.guide ? 'selected' : ''}" type="button" data-guide="${key}" aria-label="${item.name}"><img src="${item.thumb}" alt=""></button>`).join('')}</div></div></div>
      <div class="card card-pad section-gap">
        <div class="data-row"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg><div><strong>Данные рождения</strong><span>${state.birthReady || state.mode === 'returning' ? '12 октября 1990 · 09:40 · Самара' : 'Не добавлены'}</span></div><button type="button" data-route="birth">Изменить</button></div>
        <div class="data-row"><svg viewBox="0 0 24 24"><path d="M3 6h18v12H3zM3 7l9 7 9-7"/></svg><div><strong>Email</strong><span>tanya@example.ru</span></div><span></span></div>
      </div>
      <div class="hint section-gap"><span>Это тестовое превью. Профиль, email и данные рождения вымышлены и никуда не отправляются.</span></div>
    </section>`;
  }

  const screens = { home: homeScreen, birth: birthScreen, chart: chartScreen, guide: guideScreen, request: requestScreen, report: reportScreen, reports: reportsScreen, profile: profileScreen };

  function render() {
    app.innerHTML = (screens[state.route] || homeScreen)();
    document.querySelectorAll('.demo-switch button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode)));
    document.querySelectorAll('.bottom-nav button').forEach(button => button.classList.toggle('active', button.dataset.route === state.route || (state.route === 'birth' && button.dataset.route === 'chart') || (state.route === 'request' && button.dataset.route === 'reports') || (state.route === 'report' && button.dataset.route === 'reports')));
    bindScreen();
  }

  function bindScreen() {
    document.querySelectorAll('[data-route]').forEach(button => button.addEventListener('click', () => go(button.dataset.route)));
    document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
      state = { ...defaultState, mode: button.dataset.mode, route: 'home', guide: state.guide };
      if (state.mode === 'returning') { state.birthReady = true; state.reportReady = true; state.birth = { date: '1990-10-12', time: '09:40', city: 'Самара, Россия', unknownTime: false }; }
      save(); render();
    }));
    document.querySelectorAll('[data-guide]').forEach(button => button.addEventListener('click', () => { state.guide = button.dataset.guide; save(); render(); }));

    const switchButton = document.querySelector('.switch');
    if (switchButton) switchButton.addEventListener('click', () => { state.birth.unknownTime = !state.birth.unknownTime; save(); render(); });
    const city = document.querySelector('#birth-city');
    const suggestions = document.querySelector('.suggestions');
    if (city && suggestions) {
      const updateSuggestions = () => suggestions.classList.toggle('open', city.value.trim().length > 0 && !['Самара, Россия','Москва, Россия','Казань, Россия'].includes(city.value));
      city.addEventListener('input', updateSuggestions); city.addEventListener('focus', updateSuggestions);
      suggestions.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { city.value = button.textContent; suggestions.classList.remove('open'); }));
    }
    const birthForm = document.querySelector('#birth-form');
    if (birthForm) birthForm.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(birthForm); let valid = true;
      ['date','city'].forEach(name => { const input = birthForm.elements[name]; const missing = !String(data.get(name) || '').trim(); input.classList.toggle('invalid', missing); document.querySelector(`[data-error="${name}"]`).textContent = missing ? (name === 'date' ? 'Укажи дату рождения' : 'Выбери или введи город') : ''; valid = valid && !missing; });
      if (!state.birth.unknownTime) { const missing = !String(data.get('time') || '').trim(); birthForm.elements.time.classList.toggle('invalid', missing); document.querySelector('[data-error="time"]').textContent = missing ? 'Укажи время или включи переключатель выше' : ''; valid = valid && !missing; }
      if (!valid) return;
      state.birth = { date: data.get('date'), time: data.get('time') || '', city: data.get('city'), unknownTime: state.birth.unknownTime }; state.birthReady = true; save(); go('chart');
    });

    document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => { const input = document.querySelector('.chat-compose input'); input.value = button.dataset.prompt; input.focus(); }));
    const chatForm = document.querySelector('#chat-form');
    if (chatForm) chatForm.addEventListener('submit', event => { event.preventDefault(); const input = chatForm.elements.message; if (!input.value.trim()) return; state.messages.push(input.value.trim()); save(); render(); setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 0); });

    document.querySelectorAll('[data-topic]').forEach(button => button.addEventListener('click', () => { state.topic = button.dataset.topic; state.answers = {}; save(); render(); }));
    document.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => { state.answers.focus = button.dataset.answer; save(); render(); }));
    document.querySelectorAll('[data-feeling]').forEach(button => button.addEventListener('click', () => { state.answers.feeling = button.dataset.feeling; save(); render(); }));
    const request = document.querySelector('#request-text');
    if (request) request.addEventListener('input', () => { state.request = request.value; save(); });
    const build = document.querySelector('#build-report');
    if (build) build.addEventListener('click', () => {
      if (!state.request.trim() && !state.topic) { document.querySelector('[data-error="request"]').textContent = 'Опиши запрос или выбери тему'; request.classList.add('invalid'); request.focus(); return; }
      state.reportReady = true; save(); go('report');
    });
  }

  render();
})();
