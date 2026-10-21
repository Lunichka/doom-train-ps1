import React from 'react';

/**
 * Пиксельные элементы интерфейса (вместо эмодзи и иконок lucide).
 * Каждая иконка — битмап: символ = цвет из палитры, "." = прозрачный пиксель.
 * Рисуется как SVG с crispEdges, поэтому края остаются жёсткими при любом масштабе.
 */

type Bitmap = { rows: string[]; pal: Record<string, string> };

const OUT = '#0a0a12';
const WHITE = '#ecebf2';

export const BITMAPS: Record<string, Bitmap> = {
  // Курсор-стрелка меню
  cursor: {
    pal: { k: OUT, w: WHITE },
    rows: [
      'k......',
      'kk.....',
      'kwk....',
      'kwwk...',
      'kwwwk..',
      'kwwwwk.',
      'kwwwwwk',
      'kwwwwk.',
      'kwwwk..',
      'kwwk...',
      'kwk....',
      'kk.....',
      'k......',
    ],
  },
  headphones: {
    pal: { k: OUT, G: '#8a8fa8', R: '#4a62c4' },
    rows: [
      '...kkkkkk...',
      '..kGGGGGGk..',
      '.kGkkkkkkGk.',
      '.kGk....kGk.',
      'kGGk....kGGk',
      'kRRk....kRRk',
      'kRRk....kRRk',
      'kRRk....kRRk',
      'kkkk....kkkk',
    ],
  },
  noodles: {
    pal: { k: OUT, s: '#b8b8c4', Y: '#e6c24e', y: '#b8902c', R: '#c4442e', W: '#f0e6d0' },
    rows: [
      '..s..s..s...',
      '.s..s..s....',
      '............',
      '.kkkkkkkkkk.',
      'kYyYYyYYyYYk',
      'kYYyYYyYYyYk',
      '.kRRRRRRRRk.',
      '.kRWRWRWRWk.',
      '..kRRRRRRk..',
      '...kkkkkk...',
    ],
  },
  balm: {
    pal: { k: OUT, R: '#b83a2c', Y: '#e8c64a' },
    rows: [
      '...kkkkkk...',
      '..kRRRRRRk..',
      '.kRRRYRRRRk.',
      '.kRRYYYRRRk.',
      '.kRYYYYYRRk.',
      '.kRRYYYRRRk.',
      '.kRRYRYRRRk.',
      '..kRRRRRRk..',
      '...kkkkkk...',
    ],
  },
  bottle: {
    pal: { k: OUT, W: '#d8d8e0', B: '#4f8a52', w: '#a9d6a6', Y: '#e8d49a' },
    rows: [
      '....kkkk....',
      '....kWWk....',
      '...kkkkkk...',
      '..kBBBBBBk..',
      '..kBwBBBBk..',
      '..kBwBBBBk..',
      '..kBBYYBBk..',
      '..kBBYYBBk..',
      '..kBBBBBBk..',
      '..kBBBBBBk..',
      '...kkkkkk...',
    ],
  },
  train: {
    pal: { k: OUT, G: '#5f8a58', w: '#b9d4e0', y: '#e8c64a' },
    rows: [
      '...kkkkkk...',
      '..kGGGGGGk..',
      '.kGGGGGGGGk.',
      '.kGwwwwwwGk.',
      '.kGwwwwwwGk.',
      '.kGGGGGGGGk.',
      '.kGyGGGGyGk.',
      '.kGGGGGGGGk.',
      '.kkkkkkkkkk.',
      '..kk....kk..',
      'kkkkkkkkkkkk',
    ],
  },
  heart: {
    pal: { k: OUT, R: '#cf4338', w: '#f2a79e' },
    rows: [
      '............',
      '.kkk....kkk.',
      'kRRRk..kRRRk',
      'kRwRRkkRRRRk',
      'kRwRRRRRRRRk',
      'kRRRRRRRRRRk',
      '.kRRRRRRRRk.',
      '..kRRRRRRk..',
      '...kRRRRk...',
      '....kRRk....',
      '.....kk.....',
    ],
  },
  flame: {
    pal: { k: OUT, O: '#d8582a', o: '#f08a3c', y: '#f4d04e' },
    rows: [
      '.....kk.....',
      '....koOk....',
      '....kOOk.k..',
      '...kOOOOkk..',
      '.k.kOOyOOk..',
      'kOkkOOyyOOk.',
      'kOOkOyyyOOk.',
      'kOOOOyyyyOk.',
      '.kOOOyyyyOk.',
      '.kOOOOyyOOk.',
      '..kOOOOOOk..',
      '...kkkkkk...',
    ],
  },
  backpack: {
    pal: { k: OUT, G: '#5d7048', Y: '#a88a58' },
    rows: [
      '...kkkkkk...',
      '..kGGGGGGk..',
      '.kGGGGGGGGk.',
      '.kGGGGGGGGk.',
      'kGGGGGGGGGGk',
      'kGGkkkkkkGGk',
      'kGkYYYYYYkGk',
      'kGkYkkkkYkGk',
      'kGkYYYYYYkGk',
      'kGGkkkkkkGGk',
      '.kGGGGGGGGk.',
      '..kkkkkkkk..',
    ],
  },
  trophy: {
    pal: { k: OUT, Y: '#e4bd42', w: '#f6e49a', B: '#8a5e30' },
    rows: [
      '.kkkkkkkkkk.',
      'kkYYYYYYYYkk',
      'kYkYwYYYYkYk',
      'kYkYwYYYYkYk',
      '.kkYYYYYYkk.',
      '...kYYYYk...',
      '....kYYk....',
      '....kYYk....',
      '...kkkkkk...',
      '..kBBBBBBk..',
      '.kBBBBBBBBk.',
      '.kkkkkkkkkk.',
    ],
  },
  skull: {
    pal: { k: OUT, W: '#dcdce4' },
    rows: [
      '..kkkkkkkk..',
      '.kWWWWWWWWk.',
      'kWWWWWWWWWWk',
      'kWWkkWWkkWWk',
      'kWWkkWWkkWWk',
      'kWWWWkkWWWWk',
      '.kWWWkkWWWk.',
      '..kWkWkWkWk.',
      '..kWkWkWkWk.',
      '...kkkkkkk..',
    ],
  },
};

type PixelIconProps = {
  name: string;
  /** целый множитель: 1 пиксель битмапа = scale экранных пикселей */
  scale?: number;
  className?: string;
};

export function PixelIcon({ name, scale = 2, className = '' }: PixelIconProps) {
  const bm = BITMAPS[name];
  if (!bm) return null;
  const h = bm.rows.length;
  const w = bm.rows[0].length;
  const rects: React.ReactNode[] = [];
  bm.rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const fill = bm.pal[ch];
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
    });
  });
  return (
    <svg
      className={`px-icon ${className}`}
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
}

/** Курсор меню: стрелка слева от выбранного пункта */
export function Cursor() {
  return <PixelIcon name="cursor" scale={2} className="cursor" />;
}

type GaugeProps = {
  value: number;
  tone: 'mental' | 'rage' | 'red' | 'amber' | 'green';
  label: string;
};

/** Сегментная шкала в стиле файтингов 90-х (золотая рамка, ячейки). Без плавных переходов. */
export function Gauge({ value, tone, label }: GaugeProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`gauge gauge--${tone}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
    >
      <div className="gauge-fill" style={{ width: `${v}%` }} />
      <div className="gauge-cells" />
    </div>
  );
}

/** Знак для эффектов: +15 / -25 / 0 (в оригинале выводилось «+-25» и «10» без плюса) */
export const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);
