import React, { useState, useEffect, useRef } from 'react';
import trainInside from './assets/train_inside.png';
import landscape from './assets/landscape_view.png';
import playerSprite from './assets/player.png';
import babaZinaSprite from './assets/baba-zina.png';
import olegSprite from './assets/oleg.png';
import artemSprite from './assets/artem.png';
import valeraSprite from './assets/valera.png';
import dimonSprite from './assets/dimon.png';
import uncleTolyaSprite from './assets/uncle-tolya.png';
import motherAndIlyaSprite from './assets/ilya-and-mother.png';
import fightScreen from './assets/fight-screen.png';
import { PixelIcon, Cursor, Gauge, signed } from './pixel';

// --- SOUND ENGINE (Web Audio API Synthesizer) ---
class TrainSoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.trainTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopTrainLoop();
    } else {
      this.startTrainLoop();
    }
    return !this.isMuted;
  }

  playClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) { console.error(e); }
  }

  playRage() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) { console.error(e); }
  }

  playHeal() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) { console.error(e); }
  }

  startTrainLoop() {
    if (this.trainTimer) clearInterval(this.trainTimer);
    // Simulates "clack-clack... clack-clack" rhythm of train wheels
    this.trainTimer = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      this.playWheelClack(0);
      this.playWheelClack(0.1);
      this.playWheelClack(0.35);
      this.playWheelClack(0.45);
    }, 1200);
  }

  stopTrainLoop() {
    if (this.trainTimer) {
      clearInterval(this.trainTimer);
      this.trainTimer = null;
    }
  }

  playWheelClack(delay) {
    try {
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) { console.error(e); }
  }
}

const soundFx = new TrainSoundEngine();

const INITIAL_ITEMS = [
  { id: 'headphones', name: 'Наушники с ANC', icon: 'headphones', count: 1, desc: 'Глушат плач детей и рассуждения про геополитику (-25% ярости).', healRage: -25, healMental: 5 },
  { id: 'doshik', name: 'Лапша "Дошик"', icon: 'noodles', count: 2, desc: 'Аромат специй на весь вагон и калории для выживания (+20 менталки).', healRage: -5, healMental: 20 },
  { id: 'zvezdochka', name: 'Бальзам Звёздочка', icon: 'balm', count: 1, desc: 'Оружие массового поражения. Перебивает даже запах носков дяди Толи (+15 менталки, -15 ярости).', healRage: -15, healMental: 15 },
  { id: 'valerian', name: 'Валерьянка', icon: 'bottle', count: 2, desc: 'Жидкое спокойствие. Убирает желание выйти на ходу (-30% ярости).', healRage: -30, healMental: 10 }
];

const NEIGHBORS = [
  {
    id: 'babushka',
    name: 'Баба Зина',
    title: 'Владелица 4 сумк и форточки',
    sprite: babaZinaSprite,
    bgAccent: 'from-emerald-950 to-slate-900',
    description: 'Везет рассаду и стратегический запас варёных яиц. Уверена, что сквозняк убивает быстрее радиации.',
    phrase: 'Закройте форточку, меня продует!',
    stats: { annoyance: 85, noise: 70, odor: 90 },
    actions: [
      { text: 'Сдаться и закрыть окно', mentalEffect: -15, rageEffect: -25, log: 'Баба Зина довольна и щедро угостила вас мятым огурцом.' },
      { text: 'Надеть наушники и сделать вид, что вы глухонемой', mentalEffect: -10, rageEffect: +15, log: 'Баба Зина громко вздыхает и крестит ваше сиденье.' },
      { text: 'Открыть форточку настежь', mentalEffect: -35, rageEffect: +40, log: 'СКАНДАЛ! Активирован режим турбо-бухтения на весь вагон.' }
    ]
  },
  {
    id: 'tiktok_kid',
    name: 'Димон (8 лет)',
    title: 'Оператор мобильного ада',
    sprite: dimonSprite,
    bgAccent: 'from-amber-950 to-slate-900',
    description: 'Смотрит рилсы и Skibidi Toilet без наушников. Каждые две минуты проверяет прочность вашей спинки кресла ногами.',
    phrase: 'МААААМ, купи чипсы, а этот чо злой сидит?',
    stats: { annoyance: 95, noise: 100, odor: 20 },
    actions: [
      { text: 'Попросить родителей усмирить наследника', mentalEffect: -10, rageEffect: +20, log: 'Мама выдала базу: «Он же ребёнок, вам сложно потерпеть?!»' },
      { text: 'Врубить тяжелый рок в ответ', mentalEffect: -20, rageEffect: +30, log: 'Вагон разделился на два лагеря. Идёт звуковая война.' },
      { text: 'Сунуть ему жвачку', mentalEffect: -5, rageEffect: -15, log: 'Димон затих на 3 минуты, влепив жвачку под ваш столик.' }
    ]
  },
  {
    id: 'dmb_man',
    name: 'Дядя Толя',
    title: 'Ветеран дембеля-1994',
    sprite: uncleTolyaSprite,
    bgAccent: 'from-blue-950 to-slate-900',
    description: 'Запах чеснока, газеты «МК» и суровой мужской ностальгии. Утверждает, что раньше поезда летади быстрее.',
    phrase: 'Уважение имеешь? Ну-ка двинься, братишка!',
    stats: { annoyance: 75, noise: 85, odor: 95 },
    actions: [
      { text: 'Выслушать часовую историю про армию', mentalEffect: -15, rageEffect: -30, log: 'Толя похлопал вас по плечу и назвал сыном полка.' },
      { text: 'Сказать, что вы удалили госуслуги и не пьете чай', mentalEffect: -25, rageEffect: +35, log: 'Толя разочарован в поколении снежинок.' },
      { text: 'Притвориться мертвым', mentalEffect: -10, rageEffect: +10, log: 'Толя начал храпеть так, что вибрируют стаканы в подстаканниках.' }
    ]
  },
  {
    id: 'crying_baby',
    name: 'Малыш Илюша и Мама',
    title: 'Живая сирена на 120 децибел',
    sprite: motherAndIlyaSprite,
    bgAccent: 'from-purple-950 to-slate-900',
    description: 'Ультразвуковой плач, пробивающий любые шумоподавляющие наушники. У мамы в глазах экзистенциальный ужас.',
    phrase: 'УААААА! ААААААААА!',
    stats: { annoyance: 99, noise: 99, odor: 40 },
    actions: [
      { text: 'Сделать укоризненный взгляд в сторону ребенка', mentalEffect: -20, rageEffect: +25, log: 'Мама посмотрела в ответ так, будто вы лично украли у неё детское пособие.' },
      { text: 'Показать малышу фокус с пальцем', mentalEffect: +10, rageEffect: -10, log: 'Чудо! Илюша икнул и уставился на вас с уважением.' },
      { text: 'Бежать в тамбур к курильщикам', mentalEffect: -5, rageEffect: -15, log: 'В тамбуре пахнет гарью и безысходностью, зато тихо.' }
    ]
  },
  {
    id: 'scanword_vendor',
    name: 'Валера-Бригадир',
    title: 'Король сканвордов и носков',
    sprite: valeraSprite,
    bgAccent: 'from-yellow-950 to-slate-900',
    description: 'Каждые 15 минут материализуется в проходе с криками: «Сканворды, кроссворды, носки бамбук!»',
    phrase: 'Мужик, бери три пары, на год забудешь про дырки!',
    stats: { annoyance: 60, noise: 80, odor: 30 },
    actions: [
      { text: 'Купить сканворд ради кроссворда про антилопу', mentalEffect: +15, rageEffect: -20, log: 'Вы застряли на слове «Африканское животное, 5 букв».' },
      { text: 'Резко ответить: «Ничего не надо!»', mentalEffect: -10, rageEffect: +15, log: 'Валера оскорбился и назвал вас занудой.' },
      { text: 'Спрятать ноги под плед', mentalEffect: -5, rageEffect: +5, log: 'Валера задел вашу коленку баулом с шерстяными носками.' }
    ]
  },
  {
    id: 'bard_guitarist',
    name: 'Олег "Шестая струна"',
    title: 'Инвестор трёх блатных аккордов',
    sprite: olegSprite,
    bgAccent: 'from-orange-950 to-slate-900',
    description: 'Везет гитару без чехла. В его репертуаре исключительно песни у костра, исполненные мимо нот.',
    phrase: 'А давайте «Батарейку» хором, а?',
    stats: { annoyance: 70, noise: 90, odor: 30 },
    actions: [
      { text: 'Затянуть «Цой жив»', mentalEffect: +10, rageEffect: -20, log: 'Полвагона подхватило. Душевно, черт побери!' },
      { text: 'Попросить играть потише или зачехлить инструмент', mentalEffect: -15, rageEffect: +25, log: 'Олег заявил, что вы глухи к высокому искусству.' },
      { text: 'Начать фальшивить еще громче в противофазе', mentalEffect: +5, rageEffect: -10, log: 'Вы заглушили барда своей какофонией. Победа!' }
    ]
  },
  {
    id: 'tech_bro',
    name: 'Артем Senior IT',
    title: 'Лид проекта на платной «симке»',
    sprite: artemSprite,
    bgAccent: 'from-cyan-950 to-slate-900',
    description: 'Проводит дейли-митинг по зуму через раздачу с телефона, обсуждая деплой на прод прямо из тамбура.',
    phrase: 'Коллеги, у меня отвалился VPN, давайте ретаргетнем спринт!',
    stats: { annoyance: 80, noise: 85, odor: 10 },
    actions: [
      { text: 'Подсказать ему правильный синтаксис SQL', mentalEffect: +15, rageEffect: -15, log: 'Артем зауважал вас и предложил рефералку в свой яндекс-стартап.' },
      { text: 'Закрыть его макбук рукой', mentalEffect: -40, rageEffect: +50, log: 'ЭПИЧНАЯ БИТВА ЗА ПРОПУСКНУЮ СПОСОБНОСТЬ СЕТИ!' },
      { text: 'Включить торрент на закачку сериалов', mentalEffect: -10, rageEffect: +20, log: 'У Артема упал созвон с инвесторами. Лицо бесценно.' }
    ]
  }
];
const TRAIN_ROUTES = [
  {
    id: 'short',
    name: 'До ближайшей станции',
    difficulty: 'Лёгкий',
    description: 'Короткая поездка. Почти прогулка.',
    distanceGoal: 50,
    drainRate: 0.2,
    tone: 'easy',
  },
  {
    id: 'medium',
    name: 'Через полобласти',
    difficulty: 'Средний',
    description: 'Пассажиры, сквозняки и испытание нервной системы.',
    distanceGoal: 100,
    drainRate: 0.5,
    tone: 'mid',
  },
  {
    id: 'long',
    name: 'Электричка до конечной',
    difficulty: 'Сложный',
    description: 'Долгая дорога. Нервы понадобятся крепкие.',
    distanceGoal: 150,
    drainRate: 1,
    tone: 'hard',
  },
];
const ACHIEVEMENTS = [
  { id: 'first_step', title: 'Первый шаг', desc: 'Проехать 10 км', icon: 'train', unlocked: false },
  { id: 'zen_master', title: 'Дзен-мастер', desc: 'Сохранить спокойствие в поездке', icon: 'heart', unlocked: false },
  { id: 'rage_aholic', title: 'На грани', desc: 'Достичь 90% ярости', icon: 'flame', unlocked: false },
  { id: 'item_user', title: 'Запасливый', desc: 'Использовать все типы предметов', icon: 'backpack', unlocked: false },
  { id: 'survivor', title: 'Выживший', desc: 'Добраться до конечной', icon: 'trophy', unlocked: false },
];

export default function App() {
  // Screen States: 'intro', 'route_select', 'game', 'gameover', 'victory'
  const [currentScreen, setCurrentScreen] = useState('intro');
  const [selectedRoute, setSelectedRoute] = useState(TRAIN_ROUTES[0]);

  // Gameplay States
  const [neighborIndex, setNeighborIndex] = useState(0);
  const [mentalHealth, setMentalHealth] = useState(100);
  const [rageLevel, setRageLevel] = useState(15);
  const [distanceKm, setDistanceKm] = useState(0);
  const [gameLogs, setGameLogs] = useState([]);
  const [inventory, setInventory] = useState(INITIAL_ITEMS);
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [usedItemTypes, setUsedItemTypes] = useState(new Set());

  const neighbor = NEIGHBORS[neighborIndex];

  // Sound Toggle Handler
  const toggleSound = () => {
    const active = soundFx.toggleMute();
    setIsAudioActive(active);
  };

  // Train Movement Effect Loop
  useEffect(() => {
    if (currentScreen !== 'game') return;

    const interval = setInterval(() => {
      setDistanceKm((prevKm) => {
        const nextKm = prevKm + 1;

        // Check Victory
        if (nextKm >= selectedRoute.distanceGoal) {
          setCurrentScreen('victory');
          unlockAchievement('survivor');
        }

        // Distance Achievements
        if (nextKm >= 10) unlockAchievement('first_step');

        return nextKm;
      });

      // Passive Mental Drain based on route difficulty
      setMentalHealth((prev) => {
        const nextMental = Math.max(0, prev - selectedRoute.drainRate);
        if (nextMental > 80 && distanceKm > 30) unlockAchievement('zen_master');
        return nextMental;
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [currentScreen, selectedRoute, distanceKm]);

  // Check Game Over conditions
  useEffect(() => {
    if (currentScreen === 'game') {
      if (rageLevel >= 90) unlockAchievement('rage_aholic');

      if (mentalHealth <= 0 || rageLevel >= 100) {
        soundFx.playRage();
        setCurrentScreen('gameover');
      }
    }
  }, [mentalHealth, rageLevel, currentScreen]);

  const unlockAchievement = (achId) => {
    setAchievements((prev) =>
      prev.map((ach) => (ach.id === achId ? { ...ach, unlocked: true } : ach))
    );
  };

  const handleAction = (action) => {
    soundFx.playClick();

    const newMental = Math.min(100, Math.max(0, mentalHealth + action.mentalEffect));
    const newRage = Math.min(100, Math.max(0, rageLevel + action.rageEffect));

    if (action.rageEffect > 20) soundFx.playRage();

    setMentalHealth(newMental);
    setRageLevel(newRage);

    const timeStamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setGameLogs((prev) => [`[${timeStamp}] ${action.log}`, ...prev.slice(0, 5)]);
  };

  const useItem = (item) => {
    if (item.count <= 0) return;
    soundFx.playHeal();

    setInventory((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i))
    );

    setMentalHealth((prev) => Math.min(100, prev + item.healMental));
    setRageLevel((prev) => Math.max(0, prev + item.healRage));

    // Track Item Usage for Achievement
    const updatedUsed = new Set(usedItemTypes).add(item.id);
    setUsedItemTypes(updatedUsed);
    if (updatedUsed.size >= INITIAL_ITEMS.length) {
      unlockAchievement('item_user');
    }

    setGameLogs((prev) => [
      `Предмет использован: ${item.name}. (Менталка: +${item.healMental}, Ярость: ${item.healRage})`,
      ...prev.slice(0, 5)
    ]);
  };

  const nextNeighbor = () => {
    soundFx.playClick();
    const nextIdx = (neighborIndex + 1) % NEIGHBORS.length;
    setNeighborIndex(nextIdx);
    setGameLogs((prev) => [
      `Станция! Поезд тронулся. Рядом с вами теперь: ${NEIGHBORS[nextIdx].name}`,
      ...prev.slice(0, 5)
    ]);
  };

  const startGame = (route) => {
    soundFx.playClick();
    setSelectedRoute(route);
    setMentalHealth(100);
    setRageLevel(15);
    setDistanceKm(0);
    setGameLogs(['Поездка началась. Желаем вам крепких нервов!']);
    setInventory(INITIAL_ITEMS.map((item) => ({ ...item })));
    setNeighborIndex(0);
    setCurrentScreen('game');
  };

  // --- Меню в духе PS1: курсор, стрелки ↑/↓, цифры 1–3, подсказка рюкзака ---
  const [menuIdx, setMenuIdx] = useState(0);
  const [hintItem, setHintItem] = useState(null);
  const menuRefs = useRef([]);

  useEffect(() => {
    setMenuIdx(0);
  }, [currentScreen, neighborIndex]);

  useEffect(() => {
    if (currentScreen !== 'game' && currentScreen !== 'route_select') return;
    const list = currentScreen === 'game' ? neighbor.actions : TRAIN_ROUTES;
    const confirm = (i) => (currentScreen === 'game' ? handleAction(list[i]) : startGame(list[i]));

    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (i >= list.length || e.repeat) return;
        e.preventDefault();
        setMenuIdx(i);
        confirm(i);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const next = (menuIdx + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length;
        setMenuIdx(next);
        const el = menuRefs.current[next];
        if (el) el.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Предупреждающие состояния (без прыжков и пульсации — только ступенчатое мигание)
  const isRaging = rageLevel > 70;
  const isMentalLow = mentalHealth < 30;
  const hintObj = inventory.find((i) => i.id === hintItem);

  return (
    <div className="ps1">
      <header className="win titlebar">
        <div className="titlebar-name">
          <PixelIcon name="train" scale={2} />
          <span>ЭЛЕКТРИЧКА DOOMER-EDITION</span>
        </div>

        <div className="titlebar-tools">
          {currentScreen === 'game' && (
            <div className="chip">{distanceKm} / {selectedRoute.distanceGoal} км</div>
          )}
          <button
            type="button"
            onClick={toggleSound}
            className={`btn btn--small ${isAudioActive ? 'is-on' : ''}`}
            title="Звуковое сопровождение (стук колес)"
            aria-pressed={isAudioActive}
          >
            {isAudioActive ? 'ЗВУК ВКЛ' : 'ЗВУК ВЫКЛ'}
          </button>
        </div>
      </header>

      <main className="ps1-main">

        {/* SCREEN 1: FIGHT INTRO */}
        {currentScreen === 'intro' && (
          <section className="intro-screen" aria-label="Заставка Симулятора худшего соседа">
            <div className="intro-art-wrap">
              <img className="intro-art" src={fightScreen} alt="Баба Зина и пассажир готовятся к битве в электричке. BABUSHKA CHUD — FIGHT!" />
              <div className="intro-art-vignette" aria-hidden="true" />
              <div className="intro-caption">
                <span className="intro-eyebrow">ЭЛЕКТРИЧКА DOOMER-EDITION · 1982–∞</span>
                <h1>СИМУЛЯТОР ХУДШЕГО СОСЕДА</h1>
                <p>Сохрани менталку. Не доводи Бабу Зину.</p>
                <button
                  type="button"
                  autoFocus
                  onClick={() => { soundFx.playClick(); setCurrentScreen('route_select'); }}
                  className="btn btn--start"
                >
                  <Cursor />
                  <span className="blink">НАЧАТЬ ПОЕЗДКУ</span>
                </button>
              </div>
            </div>
            <p className="intro-footnote">Пиксельная драма в пригородной электричке. Все персонажи вымышлены, все ситуации подозрительно знакомы.</p>
          </section>
        )}

        {/* SCREEN 2: ROUTE SELECTION */}
        {currentScreen === 'route_select' && (
          <section className="win screen">
            <div className="screen-head">
              <h2 className="win-title win-title--big">ВЫБЕРИТЕ ПОЕЗД И МАРШРУТ</h2>
              <p className="dim">Сложность влияет на скорость падения ментального здоровья</p>
            </div>

            <div className="menu">
              {TRAIN_ROUTES.map((route, i) => (
                <button
                  key={route.id}
                  type="button"
                  ref={(el) => { menuRefs.current[i] = el; }}
                  className={`menu-item ${menuIdx === i ? 'is-active' : ''}`}
                  onMouseEnter={() => setMenuIdx(i)}
                  onFocus={() => setMenuIdx(i)}
                  onClick={() => startGame(route)}
                >
                  <span className="menu-cursor">{menuIdx === i && <Cursor />}</span>
                  <span className="menu-body">
                    <span className="menu-text">
                      <span className="menu-key">{i + 1}</span>
                      {route.name}
                      <span className={`tag tag--${route.tone}`}>{route.difficulty}</span>
                    </span>
                    <span className="menu-sub">{route.description}</span>
                    <span className="menu-fx">
                      <span>Цель: <b>{route.distanceGoal} км</b></span>
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="screen-foot">
              <button
                type="button"
                onClick={() => { soundFx.playClick(); setCurrentScreen('intro'); }}
                className="btn btn--small"
              >
                Вернуться в главное меню
              </button>
            </div>
          </section>
        )}

        {/* SCREEN 3: GAMEPLAY */}
        {currentScreen === 'game' && (
          <div className="game">

            {/* Pixel-art train scene: the landscape moves behind the transparent carriage */}
            <div className="stage win win--thin">
              <section className="train-scene" aria-label={`Вагон электрички. Пассажир: ${neighbor.name}`}>
                <div className="scene-landscape" aria-hidden="true">
                  <img src={landscape} alt="" />
                  <img src={landscape} alt="" />
                </div>
                <img className="scene-train" src={trainInside} alt="Интерьер старой электрички" />
                <img className="scene-player" src={playerSprite} alt="Пассажир с рюкзаком" />
                {neighbor.sprite && (
                  <img
                    key={neighbor.id}
                    className={`scene-neighbor scene-neighbor--${neighbor.id}`}
                    src={neighbor.sprite}
                    alt={neighbor.name}
                  />
                )}
                {(isRaging || isMentalLow) && <div className="scene-alert" aria-hidden="true" />}
                <span className="scene-stamp">ЭЛЕКТРИЧКА · 07:42</span>
              </section>
            </div>

            {/* Диалоговое окно: портрет, имя, реплика */}
            <section className="win dialog" aria-live="polite">
              <div className="portrait" aria-hidden="true">
                {neighbor.sprite && <img src={neighbor.sprite} alt="" />}
              </div>
              <div className="dialog-body">
                <h2 className="dialog-name">{neighbor.name}</h2>
                <p className="dialog-title">{neighbor.title}</p>
                <p className="dialog-text">«{neighbor.phrase}»</p>
              </div>
            </section>

            <div className="game-grid">
              <div className="col">

                {/* Status Gauges */}
                <section className="win hud col-item hud-slot" aria-label="Состояние">
                  <div className="hud-item">
                    <div className="hud-head">
                      <span className="hud-label hud-label--mental">Менталка</span>
                      <span className={`hud-val ${isMentalLow ? 'is-warn' : ''}`}>{Math.round(mentalHealth)}%</span>
                    </div>
                    <Gauge value={mentalHealth} tone="mental" label="Менталка" />
                  </div>
                  <div className="hud-item">
                    <div className="hud-head">
                      <span className="hud-label hud-label--rage">Уровень Ярости</span>
                      <span className={`hud-val ${isRaging ? 'is-warn' : ''}`}>{Math.round(rageLevel)}%</span>
                    </div>
                    <Gauge value={rageLevel} tone="rage" label="Уровень Ярости" />
                  </div>
                </section>

                {/* Neighbor description and stats */}
                <section className="win col-item dossier-slot">
                  <p className="dossier-desc">{neighbor.description}</p>
                  <dl className="stats">
                    {[
                      ['Раздражение', neighbor.stats.annoyance, 'red'],
                      ['Шум', neighbor.stats.noise, 'amber'],
                      ['Запах', neighbor.stats.odor, 'green'],
                    ].map(([label, val, tone]) => (
                      <div className="stat" key={label}>
                        <dt>{label}:</dt>
                        <dd>{val}%</dd>
                        <Gauge value={val} tone={tone} label={label} />
                      </div>
                    ))}
                  </dl>
                </section>
              </div>

              <div className="col">

                {/* Action Buttons */}
                <section className="win col-item commands-slot" aria-label="Действия">
                  <div className="menu">
                    {neighbor.actions.map((act, i) => (
                      <button
                        key={i}
                        type="button"
                        ref={(el) => { menuRefs.current[i] = el; }}
                        className={`menu-item ${menuIdx === i ? 'is-active' : ''}`}
                        onMouseEnter={() => setMenuIdx(i)}
                        onFocus={() => setMenuIdx(i)}
                        onClick={() => handleAction(act)}
                      >
                        <span className="menu-cursor">{menuIdx === i && <Cursor />}</span>
                        <span className="menu-body">
                          <span className="menu-text"><span className="menu-key">{i + 1}</span>{act.text}</span>
                          <span className="menu-fx">
                            <span>Психика: <b className={act.mentalEffect >= 0 ? 'pos' : 'neg'}>{signed(act.mentalEffect)}</b></span>
                            <span>Ярость: <b className={act.rageEffect > 0 ? 'neg' : 'pos'}>{signed(act.rageEffect)}</b></span>
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Inventory Section */}
                <section className="win col-item bag-slot" aria-label="Рюкзак">
                  <h3 className="win-title">
                    <PixelIcon name="backpack" scale={2} />
                    ВАШ РЮКЗАК И ПРЕДМЕТЫ:
                  </h3>
                  <div className="menu menu--items">
                    {inventory.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-disabled={item.count <= 0}
                        title={item.desc}
                        onClick={() => useItem(item)}
                        onMouseEnter={() => setHintItem(item.id)}
                        onFocus={() => setHintItem(item.id)}
                        className={`menu-item menu-item--hover ${item.count <= 0 ? 'is-empty' : ''}`}
                      >
                        <span className="menu-cursor"><Cursor /></span>
                        <PixelIcon name={item.icon} scale={2} className="item-icon" />
                        <span className="menu-body"><span className="menu-text">{item.name}</span></span>
                        <span className="item-count">{item.count}x</span>
                      </button>
                    ))}
                  </div>
                  <p className="help">{hintObj ? hintObj.desc : 'Выберите предмет.'}</p>
                </section>
              </div>
            </div>

            {/* Event Logs & Change Seat Controls */}
            <div className="log-row">
              <section className="win log" aria-label="Журнал событий" aria-live="polite">
                {gameLogs.length === 0 ? (
                  <p className="dim">Поезд равномерно покачивается...</p>
                ) : (
                  gameLogs.map((log, idx) => (
                    <p key={idx} className={idx === 0 ? 'log-new' : 'log-old'}>
                      • {log}
                    </p>
                  ))
                )}
              </section>

              <button type="button" onClick={nextNeighbor} className="btn btn--wide">
                СМЕНИТЬ МЕСТО / СТАНЦИЯ
              </button>
            </div>

          </div>
        )}

        {/* SCREEN 4: GAME OVER */}
        {currentScreen === 'gameover' && (
          <section className="win screen result result--bad">
            <PixelIcon name="skull" scale={6} className="result-icon" />

            <h2 className="result-title">ПОЕЗДКА СОПРОВОЖДАЛАСЬ СКАНДАЛОМ!</h2>
            <p className="result-text">
              {rageLevel >= 100
                ? 'Вы не сдержали эмоций, сорвались на крик, и проводник высадил вас на полустанке в тайге.'
                : 'Ваше ментальное здоровье упало до нуля. Вы сошли с поезда в абсолютный туман doomer-реальности.'}
            </p>

            <dl className="result-stats">
              <div><dt>Пройдено пути:</dt><dd className="gold">{distanceKm} км</dd></div>
              <div><dt>Маршрут:</dt><dd>{selectedRoute.name}</dd></div>
            </dl>

            <button
              type="button"
              autoFocus
              onClick={() => { soundFx.playClick(); setCurrentScreen('route_select'); }}
              className="btn btn--start"
            >
              <Cursor />
              <span>КУПИТЬ НОВЫЙ БИЛЕТ (НАЧАТЬ ЗАНОВО)</span>
            </button>
          </section>
        )}

        {/* SCREEN 5: VICTORY */}
        {currentScreen === 'victory' && (
          <section className="win screen result result--good">
            <PixelIcon name="trophy" scale={6} className="result-icon" />

            <h2 className="result-title">КОНЕЧНАЯ СТАНЦИЯ! ВЫ ВЫЖИЛИ!</h2>
            <p className="result-text">
              Поезд прибыл на конечную станцию. Вы прошли весь маршрут, выдержав курицу в фольге, громкие динамики и душный вагон!
            </p>

            <dl className="result-stats">
              <div><dt>Пройденное расстояние:</dt><dd className="gold">{distanceKm} км</dd></div>
              <div><dt>Остаток менталки:</dt><dd>{Math.round(mentalHealth)}%</dd></div>
            </dl>

            <button
              type="button"
              autoFocus
              onClick={() => { soundFx.playClick(); setCurrentScreen('route_select'); }}
              className="btn btn--start"
            >
              <Cursor />
              <span>ВЫБРАТЬ НОВЫЙ МАРШРУТ</span>
            </button>
          </section>
        )}

        {/* Achievements */}
        <section className="win trophies" aria-label="Достижения">
          <h3 className="win-title">
            <PixelIcon name="trophy" scale={2} />
            ДОСТИЖЕНИЯ И АЧИВКИ ПОЕЗДКИ:
          </h3>
          <div className="trophy-grid">
            {achievements.map((ach) => (
              <div key={ach.id} className={`trophy ${ach.unlocked ? 'is-on' : ''}`}>
                <PixelIcon name={ach.icon} scale={2} className="trophy-icon" />
                <div>
                  <div className="trophy-name">{ach.title}</div>
                  <div className="trophy-desc">{ach.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="ps1-foot">
        Симулятор плацкарта • Doomer Retro Atmosphere • React Standalone Edition
      </footer>

      {/* Сканлайны, зерно и виньетка — цветокоррекция «CRT-телевизор» */}
      <div className="crt" aria-hidden="true" />
    </div>
  );
}
