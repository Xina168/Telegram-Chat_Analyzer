
import React from 'react';
import { PERIOD_OPTIONS, CHART_TYPE_OPTIONS } from '../constants';
import { PeriodOption, ChartTypeOption } from '../types';

interface SidebarProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedPeriod: PeriodOption;
  onPeriodChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedChartType: ChartTypeOption;
  onChartTypeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onExportChart: () => void;
  onExportExcel: () => void;
  fileName: string | null;
  isDataLoaded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  onFileUpload,
  selectedPeriod,
  onPeriodChange,
  selectedChartType,
  onChartTypeChange,
  onExportChart,
  onExportExcel,
  fileName,
  isDataLoaded,
}) => {
  return (
    <div className="w-64 bg-slate-900 p-6 space-y-6 h-full fixed top-0 left-0 shadow-lg">
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Upload File</h2>
        <div className="flex items-center space-x-2">
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-150"
          >
            Choose File
          </label>
          <input id="file-upload" type="file" className="hidden" onChange={onFileUpload} accept=".json" />
          {fileName && <span className="text-slate-400 text-sm truncate" title={fileName}>{fileName}</span>}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Period</h2>
        <select
          value={selectedPeriod}
          onChange={onPeriodChange}
          className="w-full p-2 bg-slate-700 text-slate-100 rounded-md text-sm focus:ring-sky-500 focus:border-sky-500"
          disabled={!isDataLoaded}
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Chart Type</h2>
        <select
          value={selectedChartType}
          onChange={onChartTypeChange}
          className="w-full p-2 bg-slate-700 text-slate-100 rounded-md text-sm focus:ring-sky-500 focus:border-sky-500"
          disabled={!isDataLoaded}
        >
          {CHART_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Export Data</h2>
        <div className="space-y-3">
          <button
            onClick={onExportChart}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-150 disabled:opacity-50"
            disabled={!isDataLoaded}
          >
            Chart
          </button>
          <button
            onClick={onExportExcel}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-150 disabled:opacity-50"
            disabled={!isDataLoaded}
          >
            Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
