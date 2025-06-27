
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import ChartDisplay from './components/ChartDisplay';
import DailyBreakdownList from './components/DailyBreakdownList'; // Import the new component
import { ChatData, ProcessedStats, ChartDataItem, PeriodOption, ChartTypeOption, DailyBreakdownItem } from './types';
import { APP_TITLE, DEFAULT_PERIOD, DEFAULT_CHART_TYPE } from './constants';
import { processChatData, generateChartData } from './services/dataProcessor';
import { exportToExcel, exportChartImage } from './services/exportService';
import { BarChart2, /* TrendingUp, */ PieChart as PieIcon, MessageSquare, Link2, Edit3 } from 'lucide-react'; // Removed TrendingUp

const App: React.FC = () => {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [processedStats, setProcessedStats] = useState<ProcessedStats>({ totalMessages: 0, prMessages: 0, directMessages: 0 });
  const [chartDataForDisplay, setChartDataForDisplay] = useState<ChartDataItem[]>([]);
  const [dailyBreakdownData, setDailyBreakdownData] = useState<DailyBreakdownItem[]>([]);
  
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(DEFAULT_PERIOD);
  const [selectedChartType, setSelectedChartType] = useState<ChartTypeOption>(DEFAULT_CHART_TYPE);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedData = JSON.parse(content) as ChatData;
          if (!parsedData.messages || !Array.isArray(parsedData.messages)) {
            throw new Error("Invalid JSON format: 'messages' array not found or not an array.");
          }
          if (parsedData.messages.length > 0) {
            const firstMessage = parsedData.messages[0];
            if (typeof firstMessage.id !== 'number' || typeof firstMessage.date_unixtime !== 'string' || !Array.isArray(firstMessage.text_entities)) {
               throw new Error("Invalid message structure in JSON data.");
            }
          }
          setChatData(parsedData);
        } catch (err) {
          console.error("Error parsing JSON:", err);
          setError(`Failed to parse JSON: ${err instanceof Error ? err.message : String(err)}`);
          setChatData(null);
          setFileName(null);
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setIsLoading(false);
        setChatData(null);
        setFileName(null);
      };
      reader.readAsText(file);
    }
  }, []);

  useEffect(() => {
    if (chatData) {
      setIsLoading(true);
      try {
        const { stats, chartData: dailyData } = processChatData(chatData, selectedPeriod);
        setProcessedStats(stats);
        setDailyBreakdownData(dailyData); 
        
        const finalChartData = generateChartData(stats, dailyData, selectedChartType);
        setChartDataForDisplay(finalChartData);

      } catch (err) {
        console.error("Error processing chat data:", err);
        setError(`Error processing data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      setProcessedStats({ totalMessages: 0, prMessages: 0, directMessages: 0 });
      setChartDataForDisplay([]);
      setDailyBreakdownData([]);
    }
  }, [chatData, selectedPeriod, selectedChartType]);

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(event.target.value as PeriodOption);
  };

  const handleChartTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChartType(event.target.value as ChartTypeOption);
  };

  const handleExportChart = useCallback(() => {
    if (chartContainerRef.current && chartDataForDisplay.length > 0) {
      exportChartImage(chartContainerRef, `${fileName || 'chat_analysis'}_${selectedPeriod}_${selectedChartType}`);
    } else {
      alert("Chart is not available or has no data to export.");
    }
  }, [fileName, selectedPeriod, selectedChartType, chartDataForDisplay.length]);

  const handleExportExcel = useCallback(() => {
    if (chatData && processedStats && dailyBreakdownData.length > 0) {
      exportToExcel(fileName || 'chat_analysis', chatData, selectedPeriod, processedStats, dailyBreakdownData);
    } else {
      alert("No data loaded or available for the selected period to export.");
    }
  }, [chatData, fileName, processedStats, selectedPeriod, dailyBreakdownData]);

  return (
    <div className="flex h-screen bg-slate-800 text-slate-100">
      <Sidebar
        onFileUpload={handleFileUpload}
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        selectedChartType={selectedChartType}
        onChartTypeChange={handleChartTypeChange}
        onExportChart={handleExportChart}
        onExportExcel={handleExportExcel}
        fileName={fileName}
        isDataLoaded={!!chatData}
      />
      <main className="flex-1 p-8 ml-64 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-100 mb-8">{APP_TITLE}</h1>
        
        {error && <div className="bg-red-600 text-white p-4 rounded-md mb-6 shadow-lg">{error}</div>}
        
        {!chatData && !isLoading && !error && (
          <div className="text-center text-slate-400 py-20 mt-10 bg-slate-700 rounded-lg shadow-md">
            <MessageSquare size={48} className="mx-auto mb-4 text-sky-500" />
            <p className="text-xl font-semibold">Welcome to {APP_TITLE}</p>
            <p className="text-md mt-2">Please upload a JSON chat export file to begin analysis.</p>
            <p className="text-sm mt-1 text-slate-500">(e.g., result.json from Telegram)</p>
          </div>
        )}

        {isLoading && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                 <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg">Loading and processing data...</p>
            </div>
        )}

        {!isLoading && chatData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Total Messages" value={processedStats.totalMessages} description={`In ${selectedPeriod}`} icon={<MessageSquare size={24} className="text-sky-500"/>} />
              <StatCard title="PR Messages" value={processedStats.prMessages} description="Messages with URLs" icon={<Link2 size={24} className="text-emerald-500"/>} />
              <StatCard title="Direct Messages" value={processedStats.directMessages} description="Messages without URLs" icon={<Edit3 size={24} className="text-amber-500"/>} />
            </div>

            <div className="bg-slate-700 p-6 rounded-lg shadow-md" ref={chartContainerRef}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-100">
                  Message Activity - {selectedChartType} Chart ({selectedPeriod})
                </h2>
                <div className="text-slate-400">
                    {selectedChartType === ChartTypeOption.BAR && <BarChart2 size={24} />}
                    {/* {selectedChartType === ChartTypeOption.LINE && <TrendingUp size={24} />} */}
                    {selectedChartType === ChartTypeOption.PIE && <PieIcon size={24} />}
                </div>
              </div>
              {chartDataForDisplay.length > 0 ? (
                <ChartDisplay chartType={selectedChartType} data={chartDataForDisplay} />
              ) : (
                <div className="text-center text-slate-400 py-10">
                  No data available for this period or chart type.
                </div>
              )}
            </div>
            
            {dailyBreakdownData.length > 0 && (
              <div className="mt-8">
                <DailyBreakdownList dailyData={dailyBreakdownData} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;