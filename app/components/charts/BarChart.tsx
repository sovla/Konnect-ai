'use client';

import React from 'react';
import { BarChart as TremorBarChart } from '@tremor/react';

export interface BarChartData {
  [key: string]: string | number;
}

export interface BarChartProps {
  data: BarChartData[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  height?: string;
  layout?: 'vertical' | 'horizontal';
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
    return `${(value / 10000).toFixed(0)}만원`;
  }
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value);
};

export function BarChart({
  data,
  index,
  categories,
  colors = defaultColors,
  valueFormatter = defaultValueFormatter,
  height = 'h-64',
  layout = 'vertical',
  showLegend = true,
  showTooltip = true,
  showGridLines = true,
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 100,
  className = '',
}: BarChartProps) {
  return (
    <div
      className={`w-full ${height} ${className}`}
      style={
        {
          '--recharts-bar-fill-opacity': '1',
        } as React.CSSProperties
      }
    >
      <TremorBarChart
        data={data}
        index={index}
        categories={categories}
        colors={colors}
        valueFormatter={valueFormatter}
        layout={layout}
        showLegend={showLegend}
        showTooltip={showTooltip}
        showGridLines={showGridLines}
        showXAxis={showXAxis}
        showYAxis={showYAxis}
        yAxisWidth={yAxisWidth}
        className="h-full text-tremor-default dark:text-dark-tremor-content [&_.recharts-bar]:fill-current"
      />
    </div>
  );
}

export default BarChart;
