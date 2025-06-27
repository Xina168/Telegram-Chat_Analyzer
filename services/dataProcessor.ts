
import { Message, ChatData, ProcessedStats, PeriodOption, ChartDataItem, ChartTypeOption, DailyBreakdownItem } from '../types';

export const processChatData = (
  data: ChatData,
  period: PeriodOption
): { stats: ProcessedStats; chartData: DailyBreakdownItem[] } => {
  const originalNow = new Date(); // Use this for calculations needing "today"
  let filteredMessages = data.messages;

  if (period !== PeriodOption.ALL_TIME) {
    let startDate: Date;
    switch (period) {
      case PeriodOption.LAST_7_DAYS:
        startDate = new Date(originalNow.getTime());
        startDate.setDate(originalNow.getDate() - 7);
        break;
      case PeriodOption.LAST_30_DAYS:
        startDate = new Date(originalNow.getTime());
        startDate.setDate(originalNow.getDate() - 30);
        break;
      case PeriodOption.LAST_90_DAYS:
        startDate = new Date(originalNow.getTime());
        startDate.setDate(originalNow.getDate() - 90);
        break;
      case PeriodOption.THIS_MONTH:
        startDate = new Date(originalNow.getFullYear(), originalNow.getMonth(), 1);
        break;
      case PeriodOption.LAST_MONTH:
        const firstDayLastMonth = new Date(originalNow.getFullYear(), originalNow.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(originalNow.getFullYear(), originalNow.getMonth(), 0); // Day 0 of current month is last day of previous
        filteredMessages = filteredMessages.filter(msg => {
          const msgDate = new Date(parseInt(msg.date_unixtime, 10) * 1000);
          return msgDate >= firstDayLastMonth && msgDate <= lastDayLastMonth;
        });
        // early return for last month as it has specific start/end and filtering logic
         return calculateStatsAndChartData(filteredMessages);
      default:
        // This case should ideally not be hit if all PeriodOptions are handled explicitly
        // or if PeriodOption.ALL_TIME is the only one not covered by specific cases.
        // Setting to Epoch as a fallback, consistent with original logic.
        startDate = new Date(0); // Epoch
        break;
    }
    // This filter applies to: LAST_7_DAYS, LAST_30_DAYS, LAST_90_DAYS, THIS_MONTH, and default cases from switch.
    // It does not apply to ALL_TIME (handled by the outer if) or LAST_MONTH (which returned early).
    // The redundant 'if (period !== PeriodOption.LAST_MONTH)' has been removed.
    filteredMessages = filteredMessages.filter(
      (msg) => new Date(parseInt(msg.date_unixtime, 10) * 1000) >= startDate
    );
  }
  
  return calculateStatsAndChartData(filteredMessages);
};


const calculateStatsAndChartData = (messages: Message[]): { stats: ProcessedStats; chartData: DailyBreakdownItem[] } => {
  let prMessages = 0;
  let directMessages = 0;

  const messagesByDay: { [key: string]: { total: number; pr: number; direct: number } } = {};

  messages.forEach((msg) => {
    const hasLink = msg.text_entities.some(
      (entity) => entity.type === 'link' || entity.type === 'text_link'
    );
    if (hasLink) {
      prMessages++;
    } else {
      directMessages++;
    }

    const dateStr = new Date(parseInt(msg.date_unixtime, 10) * 1000).toLocaleDateString('en-CA'); // YYYY-MM-DD
    if (!messagesByDay[dateStr]) {
      messagesByDay[dateStr] = { total: 0, pr: 0, direct: 0 };
    }
    messagesByDay[dateStr].total++;
    if (hasLink) {
      messagesByDay[dateStr].pr++;
    } else {
      messagesByDay[dateStr].direct++;
    }
  });

  const stats: ProcessedStats = {
    totalMessages: messages.length,
    prMessages,
    directMessages,
  };

  const chartData: DailyBreakdownItem[] = Object.entries(messagesByDay)
    .map(([date, counts]) => ({
      name: date,
      total: counts.total,
      pr: counts.pr,
      direct: counts.direct,
    }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()); // Sort by date

  return { stats, chartData };
}


export const generateChartData = (
  stats: ProcessedStats,
  dailyChartData: DailyBreakdownItem[], // Changed to DailyBreakdownItem for more specific input type
  chartType: ChartTypeOption
): ChartDataItem[] => { // Output remains ChartDataItem as it's more general for recharts
  switch (chartType) {
    case ChartTypeOption.BAR:
    case ChartTypeOption.LINE:
      // DailyBreakdownItem is compatible with ChartDataItem for these chart types
      return dailyChartData.map(item => ({ ...item })); // Create new objects to ensure ChartDataItem structure if needed by downstream
    case ChartTypeOption.PIE:
      return [
        { name: 'PR Messages', value: stats.prMessages },
        { name: 'Direct Messages', value: stats.directMessages },
      ];
    default:
      return [];
  }
};

export const getFullTextFromMessage = (message: Message): string => {
  return message.text_entities.map(entity => entity.text).join('');
};

export const getMessageType = (message: Message): 'PR' | 'Direct' => {
  return message.text_entities.some(
    (entity) => entity.type === 'link' || entity.type === 'text_link'
  ) ? 'PR' : 'Direct';
}
