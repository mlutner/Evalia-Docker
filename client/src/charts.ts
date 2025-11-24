/**
 * EVALIA CHART COLOR SYSTEM
 * Consistent colors for all data visualizations
 * Matches brand illustration colors
 */

export const ChartColors = {
  // Primary data visualization
  primaryLine: '#1F6F78',      // Teal - main data line, primary bar
  secondaryBar: '#C3F33C',     // Lime - comparison data, secondary bar
  
  // Structure
  gridlines: '#E2E7EF',        // Light border for gridlines/axes
  labelText: '#6A7789',        // Secondary text for axis labels
  
  // Derived/alternative shades
  primaryLineDark: '#155A62',
  secondaryBarDark: '#A8D92F',
  
  // Common patterns
  patterns: {
    singleMetric: {
      stroke: '#1F6F78',
      fill: '#E1F6F3',
    },
    comparison: {
      primary: '#1F6F78',
      secondary: '#C3F33C',
    },
    timeSeriesStack: {
      colors: ['#1F6F78', '#C3F33C'],
    },
  },
} as const;

/**
 * Get chart color by type
 * @param type - 'primary' | 'secondary' | 'gridline' | 'label'
 */
export const getChartColor = (type: 'primary' | 'secondary' | 'gridline' | 'label' = 'primary') => {
  switch (type) {
    case 'primary':
      return ChartColors.primaryLine;
    case 'secondary':
      return ChartColors.secondaryBar;
    case 'gridline':
      return ChartColors.gridlines;
    case 'label':
      return ChartColors.labelText;
    default:
      return ChartColors.primaryLine;
  }
};

/**
 * Recharts configuration with Evalia colors
 */
export const rechartConfig = {
  primaryLine: {
    stroke: ChartColors.primaryLine,
    fill: ChartColors.primaryLine,
  },
  secondaryBar: {
    fill: ChartColors.secondaryBar,
  },
  grid: {
    stroke: ChartColors.gridlines,
    strokeDasharray: '0',
  },
  axis: {
    tick: {
      fill: ChartColors.labelText,
      fontSize: 12,
    },
    label: {
      fill: ChartColors.labelText,
      fontSize: 12,
    },
  },
  tooltip: {
    backgroundColor: '#FFFFFF',
    border: `1px solid ${ChartColors.gridlines}`,
    color: '#1C2635',
  },
};
