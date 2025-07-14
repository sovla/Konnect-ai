'use client';

import React from 'react';
import { DonutChart as TremorDonutChart } from '@tremor/react';
import { convertColorsForTremor, DEFAULT_TREMOR_COLORS, defaultKRWFormatter } from '@/app/utils';

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

export function DonutChart({
  data,
  category,
  index,
  colors = DEFAULT_TREMOR_COLORS,
  valueFormatter = defaultKRWFormatter,
  height = 'h-64',
  variant = 'donut',
  showLabel = true,
  showTooltip = true,
  showAnimation = true,
  className = '',
}: DonutChartProps) {
  // 색상 변환 적용
  const convertedColors = convertColorsForTremor(colors);

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
        colors={convertedColors}
        valueFormatter={valueFormatter}
        variant={variant}
        showLabel={showLabel}
        showTooltip={showTooltip}
        showAnimation={showAnimation}
        className="h-full text-tremor-default dark:text-dark-tremor-content"
      />
    </div>
  );
}

export default DonutChart;
