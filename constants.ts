
import { PeriodOption, ChartTypeOption } from './types';

export const PERIOD_OPTIONS: PeriodOption[] = [
  PeriodOption.ALL_TIME,
  PeriodOption.LAST_7_DAYS,
  PeriodOption.LAST_30_DAYS,
  PeriodOption.LAST_90_DAYS,
  PeriodOption.THIS_MONTH,
  PeriodOption.LAST_MONTH,
];

export const CHART_TYPE_OPTIONS: ChartTypeOption[] = [
  ChartTypeOption.BAR,
  // ChartTypeOption.LINE, // Removed
  ChartTypeOption.PIE,
];

export const DEFAULT_PERIOD = PeriodOption.ALL_TIME;
export const DEFAULT_CHART_TYPE = ChartTypeOption.BAR;

export const APP_TITLE = "Telegram Chat Analyzer";

export const CHART_ITEM_COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']; // Sky, Emerald, Amber, Red, Violet
