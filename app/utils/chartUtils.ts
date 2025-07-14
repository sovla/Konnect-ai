/* eslint-disable @typescript-eslint/no-explicit-any */
// Tremor Raw chartColors [v0.1.0]

export type ColorUtility = 'bg' | 'stroke' | 'fill' | 'text';

export const chartColors = {
  blue: {
    bg: 'bg-blue-500',
    stroke: 'stroke-blue-500',
    fill: 'fill-blue-500',
    text: 'text-blue-500',
  },
  emerald: {
    bg: 'bg-emerald-500',
    stroke: 'stroke-emerald-500',
    fill: 'fill-emerald-500',
    text: 'text-emerald-500',
  },
  violet: {
    bg: 'bg-violet-500',
    stroke: 'stroke-violet-500',
    fill: 'fill-violet-500',
    text: 'text-violet-500',
  },
  amber: {
    bg: 'bg-amber-500',
    stroke: 'stroke-amber-500',
    fill: 'fill-amber-500',
    text: 'text-amber-500',
  },
  gray: {
    bg: 'bg-gray-500',
    stroke: 'stroke-gray-500',
    fill: 'fill-gray-500',
    text: 'text-gray-500',
  },
  cyan: {
    bg: 'bg-cyan-500',
    stroke: 'stroke-cyan-500',
    fill: 'fill-cyan-500',
    text: 'text-cyan-500',
  },
  pink: {
    bg: 'bg-pink-500',
    stroke: 'stroke-pink-500',
    fill: 'fill-pink-500',
    text: 'text-pink-500',
  },
  lime: {
    bg: 'bg-lime-500',
    stroke: 'stroke-lime-500',
    fill: 'fill-lime-500',
    text: 'text-lime-500',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500',
    stroke: 'stroke-fuchsia-500',
    fill: 'fill-fuchsia-500',
    text: 'text-fuchsia-500',
  },
} as const satisfies {
  [color: string]: {
    [key in ColorUtility]: string;
  };
};

export type AvailableChartColorsKeys = keyof typeof chartColors;

export const AvailableChartColors: AvailableChartColorsKeys[] = Object.keys(
  chartColors,
) as Array<AvailableChartColorsKeys>;

export const constructCategoryColors = (
  categories: string[],
  colors: AvailableChartColorsKeys[],
): Map<string, AvailableChartColorsKeys> => {
  const categoryColors = new Map<string, AvailableChartColorsKeys>();
  categories.forEach((category, index) => {
    categoryColors.set(category, colors[index % colors.length]);
  });
  return categoryColors;
};

export const getColorClassName = (color: AvailableChartColorsKeys, type: ColorUtility): string => {
  const fallbackColor = {
    bg: 'bg-gray-500',
    stroke: 'stroke-gray-500',
    fill: 'fill-gray-500',
    text: 'text-gray-500',
  };
  return chartColors[color]?.[type] ?? fallbackColor[type];
};

// Tremor Raw getYAxisDomain [v0.0.0]

export const getYAxisDomain = (autoMinValue: boolean, minValue: number | undefined, maxValue: number | undefined) => {
  const minDomain = autoMinValue ? 'auto' : minValue ?? 0;
  const maxDomain = maxValue ?? 'auto';
  return [minDomain, maxDomain];
};

// Tremor Raw hasOnlyOneValueForKey [v0.1.0]

export function hasOnlyOneValueForKey(array: any[], keyToCheck: string): boolean {
  const val: any[] = [];

  for (const obj of array) {
    if (Object.prototype.hasOwnProperty.call(obj, keyToCheck)) {
      val.push(obj[keyToCheck]);
      if (val.length > 1) {
        return false;
      }
    }
  }

  return true;
}

// 차트 관련 유틸리티 함수들

// Tailwind CSS 색상을 Tremor 호환 색상으로 변환하는 매핑
const colorMapping: Record<string, string> = {
  // Blue 계열
  'blue-400': 'blue',
  'blue-500': 'blue',
  'blue-600': 'blue',
  'blue-700': 'blue',
  // Emerald 계열
  'emerald-400': 'emerald',
  'emerald-500': 'emerald',
  'emerald-600': 'emerald',
  'emerald-700': 'emerald',
  // Violet 계열
  'violet-400': 'violet',
  'violet-500': 'violet',
  'violet-600': 'violet',
  'violet-700': 'violet',
  // Orange 계열
  'orange-400': 'orange',
  'orange-500': 'orange',
  'orange-600': 'orange',
  'orange-700': 'orange',
  // Red 계열
  'red-400': 'red',
  'red-500': 'red',
  'red-600': 'red',
  'red-700': 'red',
  // Green 계열
  'green-400': 'green',
  'green-500': 'green',
  'green-600': 'green',
  'green-700': 'green',
  // Amber 계열
  'amber-400': 'amber',
  'amber-500': 'amber',
  'amber-600': 'amber',
  'amber-700': 'amber',
  // Rose 계열
  'rose-400': 'rose',
  'rose-500': 'rose',
  'rose-600': 'rose',
  'rose-700': 'rose',
  // Cyan 계열
  'cyan-400': 'cyan',
  'cyan-500': 'cyan',
  'cyan-600': 'cyan',
  'cyan-700': 'cyan',
  // Purple 계열
  'purple-400': 'purple',
  'purple-500': 'purple',
  'purple-600': 'purple',
  'purple-700': 'purple',
};

// Tremor 기본 색상 목록
const TREMOR_COLORS = ['blue', 'emerald', 'violet', 'orange', 'red', 'amber', 'rose', 'green', 'cyan', 'purple'];

/**
 * Tailwind CSS 색상 클래스를 Tremor 호환 색상으로 변환
 * @param colors - 변환할 색상 배열
 * @returns Tremor 호환 색상 배열
 */
export const convertColorsForTremor = (colors: string[]): string[] => {
  return colors.map((color) => {
    // 이미 Tremor 기본 색상이면 그대로 반환
    if (TREMOR_COLORS.includes(color)) {
      return color;
    }
    // 헥스 코드면 그대로 반환
    if (color.startsWith('#')) {
      return color;
    }
    // Tailwind 색상 클래스면 매핑된 색상 반환
    return colorMapping[color] || 'blue';
  });
};

/**
 * Tremor 권장 기본 색상 배열
 */
export const DEFAULT_TREMOR_COLORS = [
  'blue',
  'emerald',
  'violet',
  'orange',
  'red',
  'amber',
  'rose',
  'green',
  'cyan',
  'purple',
];

/**
 * 한국 원화 형식의 기본 값 포맷터
 * @param value - 포맷할 숫자 값
 * @returns 포맷된 문자열
 */
export const defaultKRWFormatter = (value: number): string => {
  if (value >= 10000) {
    // 만원 이상은 만원 단위로 표시
    return `${(value / 10000).toFixed(0)}만원`;
  }
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value);
};

/**
 * 배달 건수 포맷터
 * @param value - 포맷할 건수
 * @returns 포맷된 문자열
 */
export const deliveryCountFormatter = (value: number): string => {
  return `${value}건`;
};
