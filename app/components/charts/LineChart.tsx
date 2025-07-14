'use client';

import React from 'react';
import { LineChart as TremorLineChart } from '@tremor/react';

export interface LineChartData {
  [key: string]: string | number;
}

export interface LineChartProps {
  data: LineChartData[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  height?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGridLines?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  yAxisWidth?: number;
  className?: string;
}

// Tremor 권장 색상 - 다크모드에서도 잘 보이는 색상들
const defaultColors = ['blue', 'emerald', 'violet', 'orange', 'red', 'amber', 'rose', 'green', 'cyan', 'purple'];

const defaultValueFormatter = (value: number) => {
  if (value >= 10000) {
    // 만원 이상은 만원 단위로 표시
    return `${(value / 10000).toFixed(0)}만원`;
  }
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value);
};

export function LineChart({
  data,
  index,
  categories,
  colors = defaultColors,
  valueFormatter = defaultValueFormatter,
  height = 'h-64',
  showLegend = true,
  showTooltip = true,
  showGridLines = true,
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 100,
  className = '',
}: LineChartProps) {
  return (
    <div className={`w-full ${height} ${className}`}>
      <TremorLineChart
        data={data}
        index={index}
        categories={categories}
        colors={colors}
        valueFormatter={valueFormatter}
        showLegend={showLegend}
        showTooltip={showTooltip}
        showGridLines={showGridLines}
        showXAxis={showXAxis}
        showYAxis={showYAxis}
        yAxisWidth={yAxisWidth}
        className="h-full text-tremor-default dark:text-dark-tremor-content [&_.recharts-line-curve]:stroke-current [&_.recharts-line-curve]:stroke-2"
      />
    </div>
  );
}

export default LineChart;
