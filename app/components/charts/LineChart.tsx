'use client';

import React from 'react';
import { LineChart as TremorLineChart } from '@tremor/react';
import { convertColorsForTremor, DEFAULT_TREMOR_COLORS, defaultKRWFormatter } from '@/app/utils';

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

export function LineChart({
  data,
  index,
  categories,
  colors = DEFAULT_TREMOR_COLORS,
  valueFormatter = defaultKRWFormatter,
  height = 'h-64',
  showLegend = true,
  showTooltip = true,
  showGridLines = true,
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 100,
  className = '',
}: LineChartProps) {
  // 색상 변환 적용
  const convertedColors = convertColorsForTremor(colors);

  return (
    <div className={`w-full ${height} ${className}`}>
      <TremorLineChart
        data={data}
        index={index}
        categories={categories}
        colors={convertedColors}
        valueFormatter={valueFormatter}
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

export default LineChart;
