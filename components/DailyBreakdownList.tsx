
import React from 'react';
import { DailyBreakdownItem } from '../types';
import { CHART_ITEM_COLORS } from '../constants'; // Import shared colors

interface DailyBreakdownListProps {
  dailyData: DailyBreakdownItem[];
}

const DailyBreakdownList: React.FC<DailyBreakdownListProps> = ({ dailyData }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    // Adjust for timezone offset to prevent day shifts when formatting
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    
    const year = adjustedDate.getFullYear();
    const month = (adjustedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = adjustedDate.getDate().toString().padStart(2, '0');
    const dayOfWeek = adjustedDate.toLocaleDateString('en-US', { weekday: 'long' });
    return `${year}.${month}.${day} ${dayOfWeek}`;
  };

  return (
    <div className="bg-slate-700 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-sky-400 mb-4">Daily URL Data</h2>
      <div className="flex justify-between text-xs text-slate-400 uppercase pb-2 border-b border-slate-600 mb-2 px-3">
        <span>Date / Day</span>
        <span>Total per day</span>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {dailyData.length > 0 ? (
          dailyData.map((item, index) => {
            const bgColor = CHART_ITEM_COLORS[index % CHART_ITEM_COLORS.length];
            return (
              <div
                key={index}
                className="flex justify-between items-center p-3 hover:bg-slate-600 rounded-md transition-colors duration-150"
                aria-label={`Data for ${formatDate(item.name)}: ${item.total} messages`}
              >
                <span className="text-sm text-slate-200">{formatDate(item.name)}</span>
                <span 
                  className="text-white text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: bgColor }}
                >
                  {item.total}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-slate-400 text-center py-4">No daily data available.</p>
        )}
      </div>
    </div>
  );
};

export default DailyBreakdownList;
