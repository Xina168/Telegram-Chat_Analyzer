
export interface TextEntity {
  type: string;
  text: string;
  href?: string;
}

export interface Message {
  id: number;
  type: string;
  date: string;
  date_unixtime: string;
  from?: string;
  from_id?: string;
  photo?: string;
  photo_file_size?: number;
  width?: number;
  height?: number;
  text: (string | TextEntity)[];
  text_entities: TextEntity[];
}

export interface ChatData {
  name: string;
  type: string;
  id: number;
  messages: Message[];
}

export interface ProcessedStats {
  totalMessages: number;
  prMessages: number;
  directMessages: number;
}

export enum PeriodOption {
  ALL_TIME = "All Time",
  LAST_7_DAYS = "Last 7 Days",
  LAST_30_DAYS = "Last 30 Days",
  LAST_90_DAYS = "Last 90 Days",
  THIS_MONTH = "This Month",
  LAST_MONTH = "Last Month",
}

export enum ChartTypeOption {
  BAR = "Bar",
  LINE = "Line",
  PIE = "Pie",
}

export interface ChartDataItem {
  name: string;
  value?: number; // Used for Pie charts primarily
  total?: number; // Optional for general chart data items
  pr?: number;    // Optional
  direct?: number;// Optional
  [key: string]: any; 
}

export interface DailyBreakdownItem {
  name: string; // Typically a date string
  total: number;
  pr: number;
  direct: number;
}
