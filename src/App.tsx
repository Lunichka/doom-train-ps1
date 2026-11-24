import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import trainInside from './assets/pixel/wagon.png';
import landscape from './assets/pixel/forest.png';
import playerSprite from './assets/pixel/player.png';
import babaZinaNormal from './assets/pixel/baba-zina-normal.png';
import babaZinaAngry from './assets/pixel/baba-zina-angry.png';
import olegNormal from './assets/pixel/oleg-normal.png';
import olegAngry from './assets/pixel/oleg-angry.png';
import artemNormal from './assets/pixel/artem-normal.png';
import artemAngry from './assets/pixel/artem-angry.png';
import valeraNormal from './assets/pixel/valera-normal.png';
import valeraAngry from './assets/pixel/valera-angry.png';
import dimonNormal from './assets/pixel/dimon-normal.png';
import dimonAngry from './assets/pixel/dimon-angry.png';
import uncleTolyaNormal from './assets/pixel/uncle-tolya-normal.png';
import uncleTolyaAngry from './assets/pixel/uncle-tolya-angry.png';
import motherAndIlyaNormal from './assets/pixel/ilya-and-mother-normal.png';
import motherAndIlyaAngry from './assets/pixel/ilya-and-mother-angry.png';
import coverArt from './assets/pixel/cover.png';
import coverForest from './assets/pixel/forest-cover.png';
import itemHeadphones from './assets/pixel/item-headphones.png';
import itemDoshik from './assets/pixel/item-doshik.png';
import itemZvezdochka from './assets/pixel/item-zvezdochka.png';
import itemValerian from './assets/pixel/item-valerian.png';

// Предметы нарисованы вручную. Масштаб — наибольшее целое, при котором иконка влезает в 34×32
const ITEM_ART = {
  headphones: { src: itemHeadphones, w: 34, h: 30, scale: 1 },
  doshik: { src: itemDoshik, w: 24, h: 20, scale: 1 },
  zvezdochka: { src: itemZvezdochka, w: 10, h: 6, scale: 3 },
  valerian: { src: itemValerian, w: 10, h: 20, scale: 1 },
};
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

// Логическое разрешение экрана (4:3), как у телевизора с PS1. Масштабируется целиком.
const SCREEN_W = 1024;
const SCREEN_H = 768;

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
    title: 'Хозяйка четырёх сумок и форточки',
    sprites: { normal: babaZinaNormal, angry: babaZinaAngry },
    // Пиксельный спрайт (нарисован вручную): портрет — голова спрайта в 3x
    portrait: { w: 108, left: -19, top: -15 },
    bgAccent: 'from-emerald-950 to-slate-900',
    description: 'Везёт рассаду и стратегический запас варёных яиц. Уверена, что сквозняк хуже радиации.',
    phrase: 'Закройте форточку, меня продует!',
    stats: { annoyance: 85, noise: 70, odor: 90 },
    actions: [
      { text: 'Сдаться и закрыть окно', mood: 'normal', mentalEffect: -15, rageEffect: -25, log: 'Баба Зина довольна и щедро угостила вас мятым огурцом.' },
      { text: 'Надеть наушники и сделать вид, что вы глухонемой', mood: 'angry', mentalEffect: -10, rageEffect: +15, log: 'Баба Зина тяжело вздыхает и крестит ваше сиденье.' },
      { text: 'Открыть форточку настежь', mood: 'angry', mentalEffect: -35, rageEffect: +40, log: 'Скандал: включился режим нон-стоп бухтения на весь вагон.' }
    ]
  },
  {
    id: 'tiktok_kid',
    name: 'Димон (8 лет)',
    title: 'Любитель рилсов без наушников',
    sprites: { normal: dimonNormal, angry: dimonAngry },
    portrait: { w: 102, left: -27, top: 3 },
    bgAccent: 'from-amber-950 to-slate-900',
    description: 'Гоняет рилсы и Skibidi Toilet на полной громкости. Каждые две минуты проверяет спинку вашего кресла ногами.',
    phrase: 'МААААМ, купи чипсы, а этот чо злой сидит?',
    stats: { annoyance: 95, noise: 100, odor: 20 },
    actions: [
      { text: 'Попросить родителей усмирить мелкого', mood: 'angry', mentalEffect: -10, rageEffect: +20, log: 'Мама ответила: «Он же ребёнок, вам сложно потерпеть?!»' },
      { text: 'Врубить тяжёлый рок в ответ', mood: 'angry', mentalEffect: -20, rageEffect: +30, log: 'Вагон разделился на два лагеря. Началась звуковая вакханалия.' },
      { text: 'Сунуть ему жвачку', mood: 'normal', mentalEffect: -5, rageEffect: -15, log: 'Димон затих на 3 минуты, прилепив жвачку под ваш столик.' }
    ]
  },
  {
    id: 'dmb_man',
    name: 'Дядя Толя',
    title: 'Ветеран дембеля-1994',
    sprites: { normal: uncleTolyaNormal, angry: uncleTolyaAngry },
    portrait: { w: 132, left: -36, top: -6 },
    bgAccent: 'from-blue-950 to-slate-900',
    description: 'Запах чеснока и газеты «МК». Сидит и повторяет, что раньше страна одна была — от Бреста до Владивостока, ни тебе границ, ни таможен, ни дармоедов этих.',
    phrase: 'Уважение имеешь? Ну-ка подвинься, братишка!',
    stats: { annoyance: 75, noise: 85, odor: 95 },
    actions: [
      { text: 'Выслушать часовую историю про армию', mood: 'normal', mentalEffect: -15, rageEffect: -30, log: 'Толя похлопал вас по плечу и назвал сыном полка.' },
      { text: 'Сказать, что вы удалили госуслуги и не пьёте', mood: 'angry', mentalEffect: -25, rageEffect: +35, log: 'Толя тяжело смотрит и качает головой.' },
      { text: 'Притвориться мёртвым', mood: 'normal', mentalEffect: -10, rageEffect: +10, log: 'Толя захрапел так, что зазвенели стаканы в подстаканниках.' }
    ]
  },
  {
    id: 'crying_baby',
    name: 'Малыш Илюша и Мама',
    title: 'Сирена на 120 децибел',
    sprites: { normal: motherAndIlyaNormal, angry: motherAndIlyaAngry },
    portrait: { w: 102, left: -19, top: -3 },
    bgAccent: 'from-purple-950 to-slate-900',
    description: 'Крик, который пробивает любые шумоподавляющие наушники. У мамы на лице чистая усталость.',
    phrase: 'УААААА! ААААААААА!',
    stats: { annoyance: 99, noise: 99, odor: 40 },
    actions: [
      { text: 'Кинуть укоризненный взгляд в сторону ребёнка', mood: 'angry', mentalEffect: -20, rageEffect: +25, log: 'Мама посмотрела так, будто вы лично отобрали у неё коляску.' },
      { text: 'Показать малышу фокус с пальцем', mood: 'normal', mentalEffect: +10, rageEffect: -10, log: 'Илюша внезапно икнул и уставился на палец.' },
      { text: 'Уйти в тамбур к курящим', mood: 'normal', mentalEffect: -5, rageEffect: -15, log: 'В тамбуре пахнет дымом и сыростью, зато хоть тихо.' }
    ]
  },
  {
    id: 'scanword_vendor',
    name: 'Валера-Бригадир',
    title: 'Король сканвордов и носков',
    sprites: { normal: valeraNormal, angry: valeraAngry },
    portrait: { w: 180, left: -58, top: -3 },
    bgAccent: 'from-yellow-950 to-slate-900',
    description: 'Каждые 15 минут появляется в проходе с криком: «Сканворды, кроссворды, носки бамбук!»',
    phrase: 'Мужик, бери три пары, на год забудешь про дырки!',
    stats: { annoyance: 60, noise: 80, odor: 30 },
    actions: [
      { text: 'Купить сканворд ради кроссворда про антилопу', mood: 'normal', mentalEffect: +15, rageEffect: -20, log: 'Вы застряли на слове «Африканское животное, 5 букв».' },
      { text: 'Резко ответить: «Ничего не надо!»', mood: 'angry', mentalEffect: -10, rageEffect: +15, log: 'Валера обиделся и пробурчал что-то про зануд.' },
      { text: 'Поджать ноги под себя', mood: 'angry', mentalEffect: -5, rageEffect: +5, log: 'Валера всё равно задел коленку баулом с носками.' }
    ]
  },
  {
    id: 'bard_guitarist',
    name: 'Олег «Шестая струна»',
    title: 'Мастер трёх блатных аккордов',
    sprites: { normal: olegNormal, angry: olegAngry },
    portrait: { w: 144, left: -45, top: -3 },
    bgAccent: 'from-orange-950 to-slate-900',
    description: 'Таскает гитару без чехла. В репертуаре — песни у костра, часто мимо нот.',
    phrase: 'А давайте «Батарейку» хором, а?',
    stats: { annoyance: 70, noise: 90, odor: 30 },
    actions: [
      { text: 'Затянуть что-нибудь из репертуара Горшка', mood: 'normal', mentalEffect: +10, rageEffect: -20, log: 'Полвагона подхватило. Внезапно даже душевно.' },
      { text: 'Попросить играть потише или убрать гитару', mood: 'angry', mentalEffect: -15, rageEffect: +25, log: 'Олег заявил, что вы ничего не понимаете в музыке.' },
      { text: 'Начать фальшивить ещё громче в противофазе', mood: 'angry', mentalEffect: +5, rageEffect: -10, log: 'Вы перекричали гитару своей какофонией.' }
    ]
  },
  {
    id: 'tech_bro',
    name: 'Артём Senior IT',
    title: 'Лид созвонов на раздаче с телефона',
    sprites: { normal: artemNormal, angry: artemAngry },
    portrait: { w: 120, left: -21, top: -3 },
    bgAccent: 'from-cyan-950 to-slate-900',
    description: 'Проводит дейли по зуму с мобильного интернета и обсуждает выкатку на прод прямо из вагона.',
    phrase: 'Коллеги, у меня отвалился VPN, давайте ретаргетнём спринт!',
    stats: { annoyance: 80, noise: 85, odor: 10 },
    actions: [
      { text: 'Подсказать ему правильный синтаксис SQL', mood: 'normal', mentalEffect: +15, rageEffect: -15, log: 'Артём проникся и пообещал рефералку в стартап.' },
      { text: 'Прикрыть крышку его макбука рукой', mood: 'angry', mentalEffect: -40, rageEffect: +50, log: 'Созвон сорван, раздача легла, а вы на грани нервного срыва.' },
      { text: 'Включить тяжёлую закачку на торренте', mood: 'angry', mentalEffect: -10, rageEffect: +20, log: 'У Артёма умер созвон прямо посреди фразы про прод.' }
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

// Игровое время: поезд выезжает в 07:42 и идёт ~60 км/ч, т. е. 1 км = 1 минута
function trainTime(km: number) {
  const m = 7 * 60 + 42 + Math.floor(km);
  return String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}

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
  // Настроение текущего соседа: 'normal' | 'angry'. Меняется реакцией на действие игрока (поле mood у действия).
  const [neighborMood, setNeighborMood] = useState('normal');

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
    if (action.mood) setNeighborMood(action.mood);

    setMentalHealth(newMental);
    setRageLevel(newRage);

    const timeStamp = trainTime(distanceKm);
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
    setNeighborMood('normal');
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
    setNeighborMood('normal');
    setCurrentScreen('game');
  };

  // --- Один экран 4:3 (1024×768), масштабируется под окно целиком, без прокрутки ---
  const [zoom, setZoom] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);
  useLayoutEffect(() => {
    const fit = () => {
      const z = Math.min(window.innerWidth / SCREEN_W, window.innerHeight / SCREEN_H);
      setZoom(Math.max(0.3, z));
      setIsPortrait(window.innerWidth < 720 && window.innerHeight > window.innerWidth);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // --- Ачивки: отдельное окно поверх экрана + короткое уведомление о новой ---
  const [showTrophies, setShowTrophies] = useState(false);
  const [toast, setToast] = useState(null);
  const unlockedRef = useRef(new Set());
  useEffect(() => {
    const fresh = achievements.filter((a) => a.unlocked && !unlockedRef.current.has(a.id));
    if (!fresh.length) return;
    fresh.forEach((a) => unlockedRef.current.add(a.id));
    setToast(fresh[fresh.length - 1]);
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [achievements]);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const openTrophies = () => { soundFx.playClick(); setShowTrophies(true); };
  const closeTrophies = () => { soundFx.playClick(); setShowTrophies(false); };

  // --- Вкладки нижнего правого окна: рюкзак / сосед / журнал ---
  const [tab, setTab] = useState('bag');
  const TABS = [
    { id: 'bag', label: 'Рюкзак' },
    { id: 'neighbor', label: 'Сосед' },
    { id: 'log', label: 'Журнал' },
  ];

  // --- Меню в духе PS1: курсор, стрелки ↑/↓, цифры 1–4, подсказка рюкзака ---
  const [menuIdx, setMenuIdx] = useState(0);
  const [hintItem, setHintItem] = useState(null);
  const menuRefs = useRef([]);

  useEffect(() => {
    setMenuIdx(0);
  }, [currentScreen, neighborIndex]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape' && showTrophies) { e.preventDefault(); setShowTrophies(false); }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showTrophies]);

  useEffect(() => {
    if (showTrophies) return;
    if (currentScreen !== 'game' && currentScreen !== 'route_select') return;
    // В игре последний пункт меню — «Сменить место»
    const count = currentScreen === 'game' ? neighbor.actions.length + 1 : TRAIN_ROUTES.length;
    const confirm = (i) => {
      if (currentScreen === 'route_select') return startGame(TRAIN_ROUTES[i]);
      if (i === neighbor.actions.length) return nextNeighbor();
      return handleAction(neighbor.actions[i]);
    };

    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (i >= count || e.repeat) return;
        e.preventDefault();
        setMenuIdx(i);
        confirm(i);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const next = (menuIdx + (e.key === 'ArrowDown' ? 1 : -1) + count) % count;
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
  const lastLog = gameLogs[0];

  return (
    <div className="viewport">
      <div className="ps1" style={{ zoom }}>
        <header className="win titlebar">
          <div className="titlebar-name">
            <PixelIcon name="train" scale={2} />
            <span>ЭЛЕКТРИЧКА DOOMER-EDITION</span>
          </div>

          <div className="titlebar-tools">
            {currentScreen === 'game' && (
              <div className="chip">{distanceKm} / {selectedRoute.distanceGoal} км</div>
            )}
            <button type="button" onClick={openTrophies} className="btn btn--small" title="Достижения поездки">
              <PixelIcon name="trophy" scale={1} />
              АЧИВКИ {unlockedCount}/{achievements.length}
            </button>
            <button
              type="button"
              onClick={toggleSound}
              className={`btn btn--small ${isAudioActive ? 'is-on' : ''}`}
              title="Звук (стук колёс)"
              aria-pressed={isAudioActive}
            >
              {isAudioActive ? 'ЗВУК ВКЛ' : 'ЗВУК ВЫКЛ'}
            </button>
          </div>
        </header>

        <main className="ps1-main">

          {/* SCREEN 1: ОБЛОЖКА — нарисована вручную (320×180, увеличена ровно ×3) */}
          {currentScreen === 'intro' && (
            <section className="cover" aria-label="Электричка DOOMER-EDITION">
              {/* Лес за стеклом едет, как в самой игре; стёкла на cover.png прозрачные */}
              <div className="cover-window" aria-hidden="true">
                <div className="cover-landscape"><img src={coverForest} alt="" /><img src={coverForest} alt="" /></div>
              </div>
              <img className="cover-art" src={coverArt} alt="Окно электрички, на столике валерьянка, Дошик, бальзам Звёздочка и наушники" />
              <div className="cover-side">
                <h1 className="cover-sub">DOOMER-EDITION</h1>
                <p className="cover-tag">Доедешь ли ты до конечной?</p>
                <div className="cover-bars" aria-hidden="true">
                  <div className="hud-head"><span className="hud-label hud-label--mental">МЕНТАЛКА</span><span className="hud-val">100%</span></div>
                  <Gauge value={100} tone="mental" label="Менталка" />
                  <div className="hud-head"><span className="hud-label hud-label--rage">ЯРОСТЬ</span><span className="hud-val">15%</span></div>
                  <Gauge value={15} tone="rage" label="Ярость" />
                </div>
                <button
                  type="button"
                  autoFocus
                  onClick={() => { soundFx.playClick(); setCurrentScreen('route_select'); }}
                  className="btn btn--start cover-start"
                >
                  <Cursor />
                  <span className="blink">СТАРТ</span>
                </button>
              </div>
            </section>
          )}

          {/* SCREEN 2: ROUTE SELECTION */}
          {currentScreen === 'route_select' && (
            <section className="win screen route-screen">
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

          {/* SCREEN 3: GAMEPLAY — всё на одном экране */}
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
                  <img className="scene-player is-pixel" src={playerSprite} alt="Пассажир с рюкзаком" />
                  {/* Оба состояния лежат в одной позиции и уже загружены; видимо только текущее */}
                  {['normal', 'angry'].map((mood) => (
                    <img
                      key={`${neighbor.id}-${mood}`}
                      className={`scene-neighbor scene-neighbor--${neighbor.id}${neighbor.portrait ? ' is-pixel' : ''}${mood === neighborMood ? ' is-on' : ''}`}
                      src={neighbor.sprites[mood]}
                      alt={mood === neighborMood ? neighbor.name : ''}
                      aria-hidden={mood !== neighborMood}
                    />
                  ))}
                  {(isRaging || isMentalLow) && <div className="scene-alert" aria-hidden="true" />}

                  {/* Status Gauges */}
                  <section className="win hud scene-hud" aria-label="Состояние">
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

                  {/* Сообщение о последнем событии — как строка диалога в JRPG */}
                  {lastLog && (
                    <p key={lastLog} className="win scene-msg" aria-live="polite">{lastLog}</p>
                  )}
                  <span className="scene-stamp">ЭЛЕКТРИЧКА <span className="scene-stamp-time">{trainTime(distanceKm)}</span></span>
                </section>
              </div>

              <div className="game-bottom">
                <div className="col col--left">
                  {/* Диалоговое окно: портрет, имя, реплика */}
                  <section className="win dialog">
                    <div className="portrait" aria-hidden="true">
                      {neighbor.portrait ? (
                        <img
                          className="portrait-px"
                          src={neighbor.sprites[neighborMood]}
                          alt=""
                          style={{ width: neighbor.portrait.w, left: neighbor.portrait.left, top: neighbor.portrait.top }}
                        />
                      ) : (
                        <img src={neighbor.sprites[neighborMood]} alt="" />
                      )}
                    </div>
                    <div className="dialog-body">
                      <h2 className="dialog-name">{neighbor.name}<span className="dialog-title">{neighbor.title}</span></h2>
                      <p className="dialog-text">«{neighbor.phrase}»</p>
                    </div>
                  </section>

                  {/* Action Buttons */}
                  <section className="win commands" aria-label="Действия">
                    <div className="menu menu--tight">
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
                      {(() => {
                        const i = neighbor.actions.length;
                        return (
                          <button
                            type="button"
                            ref={(el) => { menuRefs.current[i] = el; }}
                            className={`menu-item menu-item--station ${menuIdx === i ? 'is-active' : ''}`}
                            onMouseEnter={() => setMenuIdx(i)}
                            onFocus={() => setMenuIdx(i)}
                            onClick={nextNeighbor}
                          >
                            <span className="menu-cursor">{menuIdx === i && <Cursor />}</span>
                            <span className="menu-body">
                              <span className="menu-text"><span className="menu-key">{i + 1}</span>СМЕНИТЬ МЕСТО / СТАНЦИЯ</span>
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  </section>
                </div>

                <div className="col col--right">
                  {/* Вкладки: рюкзак / сосед / журнал */}
                  <section className="win tabs-win">
                    <div className="tabs" role="tablist">
                      {TABS.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          role="tab"
                          aria-selected={tab === t.id}
                          className={`tab ${tab === t.id ? 'is-on' : ''}`}
                          onClick={() => { soundFx.playClick(); setTab(t.id); }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {tab === 'bag' && (
                      <div className="tab-panel" role="tabpanel" aria-label="Рюкзак">
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
                              {ITEM_ART[item.id] ? (
                                <span className="item-icon item-art" aria-hidden="true">
                                  <img src={ITEM_ART[item.id].src} alt="" style={{ width: ITEM_ART[item.id].w * ITEM_ART[item.id].scale, height: ITEM_ART[item.id].h * ITEM_ART[item.id].scale }} />
                                </span>
                              ) : (
                                <PixelIcon name={item.icon} scale={2} className="item-icon" />
                              )}
                              <span className="menu-body"><span className="menu-text">{item.name}</span></span>
                              <span className="item-count">{item.count}x</span>
                            </button>
                          ))}
                        </div>
                        <p className="help">{hintObj ? hintObj.desc : 'Наведите на предмет, чтобы прочитать описание.'}</p>
                      </div>
                    )}

                    {tab === 'neighbor' && (
                      <div className="tab-panel" role="tabpanel" aria-label="Сосед">
                        <p className="dossier-desc">{neighbor.description}</p>
                        <dl className="stats">
                          {[
                            ['Раздражение', neighbor.stats.annoyance, 'red'],
                            ['Шум', neighbor.stats.noise, 'amber'],
                            ['Запах', neighbor.stats.odor, 'green'],
                          ].map(([label, val, tone]) => (
                            <div className="stat" key={label}>
                              <dt>{label}</dt>
                              <Gauge value={val} tone={tone} label={label} />
                              <dd>{val}%</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}

                    {tab === 'log' && (
                      <div className="tab-panel log" role="tabpanel" aria-label="Журнал событий">
                        {gameLogs.length === 0 ? (
                          <p className="dim">Поезд равномерно покачивается...</p>
                        ) : (
                          gameLogs.map((log, idx) => (
                            <p key={idx} className={idx === 0 ? 'log-new' : 'log-old'}>• {log}</p>
                          ))
                        )}
                      </div>
                    )}
                  </section>
                </div>
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

        </main>

        {/* Achievements — отдельное окно поверх экрана, как меню паузы */}
        {showTrophies && (
          <div className="overlay" role="dialog" aria-modal="true" aria-label="Достижения" onClick={closeTrophies}>
            <section className="win trophies" onClick={(e) => e.stopPropagation()}>
              <h3 className="win-title">
                <PixelIcon name="trophy" scale={2} />
                ДОСТИЖЕНИЯ И АЧИВКИ ПОЕЗДКИ: {unlockedCount}/{achievements.length}
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
              <div className="screen-foot">
                <button type="button" autoFocus onClick={closeTrophies} className="btn btn--small">
                  Закрыть (Esc)
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Уведомление о новой ачивке */}
        {toast && (
          <div className="win toast" role="status">
            <PixelIcon name={toast.icon} scale={2} />
            <div>
              <div className="toast-head">АЧИВКА ПОЛУЧЕНА</div>
              <div>{toast.title}</div>
            </div>
          </div>
        )}

        {/* Сканлайны, зерно и виньетка — цветокоррекция «CRT-телевизор» */}
        <div className="crt" aria-hidden="true" />
      </div>

      {isPortrait && (
        <div className="rotate-hint" role="status">
          <span>Поверните телефон горизонтально — игра рассчитана на экран 4:3</span>
        </div>
      )}
    </div>
  );
}
