import React from 'react';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChartTypeOption, ChartDataItem } from '../types';
import { CHART_ITEM_COLORS } from '../constants'; // Import shared colors

interface ChartDisplayProps {
  chartType: ChartTypeOption;
  data: ChartDataItem[];
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ chartType, data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-slate-400 py-10">No data to display for the selected chart.</div>;
  }

  const renderChart = () => {
    switch (chartType) {
      case ChartTypeOption.BAR:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '0.375rem' }} 
              labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }}/>
            <Bar dataKey="total" fill={CHART_ITEM_COLORS[0]} name="Total Messages">
              {data.map((entry, index) => (
                <Cell key={`cell-total-${index}`} fill={CHART_ITEM_COLORS[index % CHART_ITEM_COLORS.length]} />
              ))}
            </Bar>
            {data.length > 0 && data[0]?.pr !== undefined && <Bar dataKey="pr" fill={CHART_ITEM_COLORS[1]} name="PR Messages" />}
            {data.length > 0 && data[0]?.direct !== undefined && <Bar dataKey="direct" fill={CHART_ITEM_COLORS[2]} name="Direct Messages" />}
          </BarChart>
        );
      case ChartTypeOption.PIE:
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8" // Default fill, overridden by Cell
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_ITEM_COLORS[index % CHART_ITEM_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '0.375rem' }} 
              labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }}/>
          </PieChart>
        );
      default:
        return <div className="text-center text-slate-400 py-10">Invalid chart type selected.</div>;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

export default ChartDisplay;