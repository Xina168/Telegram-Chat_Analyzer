
import { utils, writeFile } from 'xlsx';
import { ChatData, Message, PeriodOption, ProcessedStats, DailyBreakdownItem } from '../types';
import { getFullTextFromMessage, getMessageType } from './dataProcessor';
// For chart export, we'll rely on a library or a ref passed from App.tsx

export const exportToExcel = (
  fileName: string,
  chatData: ChatData,
  period: PeriodOption,
  processedStats: ProcessedStats,
  dailyBreakdown: DailyBreakdownItem[] // Updated type
) => {
  const wb = utils.book_new();

  // Sheet 1: Summary Stats
  const summaryData = [
    ["Period", period],
    ["Total Messages", processedStats.totalMessages],
    ["PR Messages (with URLs)", processedStats.prMessages],
    ["Direct Messages (no URLs)", processedStats.directMessages],
    [], // Empty row for spacing
    ["Daily Breakdown", ""],
    ["Date", "Total", "PR", "Direct"],
    ...dailyBreakdown.map(item => [item.name, item.total, item.pr, item.direct])
  ];
  const summaryWs = utils.aoa_to_sheet(summaryData);
  utils.book_append_sheet(wb, summaryWs, "Summary Stats");


  // Sheet 2: Filtered Messages
  let filteredMessages = chatData.messages; // Start with all messages from the original chat data
  if (period !== PeriodOption.ALL_TIME) {
    const now = new Date(); // Use a local 'now' for this function's date calculations
    let startDate: Date;
    switch (period) {
      case PeriodOption.LAST_7_DAYS: 
        startDate = new Date(now.getTime());
        startDate.setDate(now.getDate() - 7); 
        break;
      case PeriodOption.LAST_30_DAYS: 
        startDate = new Date(now.getTime());
        startDate.setDate(now.getDate() - 30); 
        break;
      case PeriodOption.LAST_90_DAYS: 
        startDate = new Date(now.getTime());
        startDate.setDate(now.getDate() - 90); 
        break;
      case PeriodOption.THIS_MONTH: 
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); 
        break;
      case PeriodOption.LAST_MONTH:
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        // Filter messages specifically for last month
        filteredMessages = chatData.messages.filter(msg => {
          const msgDate = new Date(parseInt(msg.date_unixtime, 10) * 1000);
          return msgDate >= firstDayLastMonth && msgDate <= lastDayLastMonth;
        });
        // Set startDate to prevent falling into the generic filter below,
        // though it's not strictly necessary as filteredMessages is already set.
        // For clarity, we could break here or ensure the subsequent filter doesn't run for LAST_MONTH.
        // The original logic with the `if (period !== PeriodOption.LAST_MONTH)` below handles this.
        break; 
      default: startDate = new Date(0); // Epoch for unhandled cases or ALL_TIME if it fell through (it won't due to outer if)
    }

    // Apply general startDate filter only if period is not LAST_MONTH (which has its own specific filtering logic above)
    // And also not ALL_TIME (handled by the initial if condition)
    if (period !== PeriodOption.LAST_MONTH) { 
       filteredMessages = chatData.messages.filter(
        (msg) => new Date(parseInt(msg.date_unixtime, 10) * 1000) >= startDate
      );
    }
  }
  
  const messagesForSheet = filteredMessages.map(msg => ({
    ID: msg.id,
    Date: new Date(parseInt(msg.date_unixtime) * 1000).toLocaleString(),
    From: msg.from || 'N/A',
    Text: getFullTextFromMessage(msg),
    Type: getMessageType(msg),
    Photo: msg.photo ? 'Yes' : 'No', // Simplified photo check
  }));

  const messagesWs = utils.json_to_sheet(messagesForSheet);
  utils.book_append_sheet(wb, messagesWs, "Filtered Messages");

  writeFile(wb, `${fileName}_${period.replace(/\s+/g, '_')}_Export.xlsx`);
};

// Chart export function will be more complex and might need a ref to the chart SVG
// For now, it's a placeholder. In a real app, use a library like html2canvas or save-svg-as-png.
export const exportChartImage = async (chartRef: React.RefObject<HTMLDivElement>, fileName: string) => {
  if (chartRef.current) {
    try {
      const html2canvas = (await import('html2canvas')).default; // Dynamic import
      const canvas = await html2canvas(chartRef.current, { backgroundColor: '#1e293b' }); // slate-800
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${fileName}_chart.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting chart:", error);
      alert("Failed to export chart. Ensure html2canvas is available or check console for details.");
    }
  } else {
    alert("Chart element not found for export.");
  }
};
