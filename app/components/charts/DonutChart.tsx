'use client';

import React from 'react';
import { DonutChart as TremorDonutChart } from '@tremor/react';

export interface DonutChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface DonutChartProps {
  data: DonutChartData[];
  category: string;
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  height?: string;
  variant?: 'donut' | 'pie';
  showLabel?: boolean;
  showTooltip?: boolean;
  showAnimation?: boolean;
  className?: string;
}

// Tremor 권장 색상 - 다크모드에서도 잘 보이는 색상들
const defaultColors = ['blue', 'emerald', 'violet', 'orange', 'red', 'amber', 'rose', 'green', 'cyan', 'purple'];

const defaultValueFormatter = (value: number) => {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}만원`;
  }
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value);
};

export function DonutChart({
  data,
  category,
  index,
  colors = defaultColors,
  valueFormatter = defaultValueFormatter,
  height = 'h-64',
  variant = 'donut',
  showLabel = true,
  showTooltip = true,
  showAnimation = true,
  className = '',
}: DonutChartProps) {
  return (
    <div
      className={`w-full ${height} ${className}`}
      style={
        {
          '--recharts-sector-fill-opacity': '1',
        } as React.CSSProperties
      }
    >
      <TremorDonutChart
        data={data}
        category={category}
        index={index}
        colors={colors}
        valueFormatter={valueFormatter}
        variant={variant}
        showLabel={showLabel}
        showTooltip={showTooltip}
        showAnimation={showAnimation}
        className="h-full text-tremor-default dark:text-dark-tremor-content [&_.recharts-sector]:fill-current"
      />
    </div>
  );
}

export default DonutChart;
