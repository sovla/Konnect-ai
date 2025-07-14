'use client';

import React from 'react';
import { BarChart as TremorBarChart } from '@tremor/react';
import { convertColorsForTremor, DEFAULT_TREMOR_COLORS, defaultKRWFormatter } from '@/app/utils';

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

export function BarChart({
  data,
  index,
  categories,
  colors = DEFAULT_TREMOR_COLORS,
  valueFormatter = defaultKRWFormatter,
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
  // 색상 변환 적용
  const convertedColors = convertColorsForTremor(colors);

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
        colors={convertedColors}
        valueFormatter={valueFormatter}
        layout={layout}
        showLegend={showLegend}
        showTooltip={showTooltip}
        showGridLines={showGridLines}
        showXAxis={showXAxis}
        showYAxis={showYAxis}
        yAxisWidth={yAxisWidth}
        className="h-full text-tremor-default dark:text-dark-tremor-content"
      />
    </div>
  );
}

export default BarChart;
