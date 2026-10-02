import React from 'react';
import { ClinicalAxisScore } from '../types';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface ClinicalRadarChartProps {
  axisScores: ClinicalAxisScore[];
  theme: 'dark' | 'light';
}

export const ClinicalRadarChart: React.FC<ClinicalRadarChartProps> = ({ axisScores, theme }) => {
  const isLight = theme === 'light';

  const chartData = {
    labels: axisScores.map((s) => s.axis),
    datasets: [
      {
        label: 'Patient Phenotype Risk Score (%)',
        data: axisScores.map((s) => s.score),
        backgroundColor: isLight ? 'rgba(219, 39, 119, 0.25)' : 'rgba(236, 72, 153, 0.30)',
        borderColor: isLight ? '#DB2777' : '#F472B6',
        borderWidth: 2,
        pointBackgroundColor: '#EC4899',
        pointBorderColor: '#FFFFFF',
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: '#EC4899',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isLight ? '#FFFFFF' : '#121A2F',
        titleColor: isLight ? '#0F172A' : '#F8FAFC',
        bodyColor: isLight ? '#0F172A' : '#F8FAFC',
        borderColor: isLight ? '#CBD5E1' : '#202E50',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx: any) => ` Risk Burden: ${ctx.raw}/100`,
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: isLight ? '#64748B' : '#64748B',
          backdropColor: 'transparent',
          font: { family: "'JetBrains Mono', monospace", size: 10 },
        },
        grid: {
          color: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(248, 250, 252, 0.08)',
        },
        angleLines: {
          color: isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(248, 250, 252, 0.12)',
        },
        pointLabels: {
          color: isLight ? '#334155' : '#E2E8F0',
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' },
        },
      },
    },
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="h-[280px] relative w-full">
        <Radar data={chartData} options={chartOptions} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs">
        {axisScores.map((item, idx) => (
          <div
            key={idx}
            className="p-2 rounded-lg bg-black/20 border border-white/5 flex flex-col gap-0.5"
          >
            <span className="text-[11px] text-slate-400 truncate">{item.axis}</span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-rose-300">{item.score}%</span>
              <span
                className={`text-[10px] font-bold uppercase ${
                  item.status === 'critical'
                    ? 'text-rose-500'
                    : item.status === 'elevated'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
