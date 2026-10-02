import React, { useState } from 'react';
import { METRICS_DATA, MODEL_TABLE_ROWS } from '../data/metrics';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3, ShieldCheck } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ModelComparisonViewProps {
  theme: 'dark' | 'light';
}

export const ModelComparisonView: React.FC<ModelComparisonViewProps> = ({ theme }) => {
  const { test_sample_count, test_class_distribution } = METRICS_DATA;
  const svmData = MODEL_TABLE_ROWS.find((m) => m.is_best) || MODEL_TABLE_ROWS[3];
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'precision' | 'recall' | 'f1_score'>('accuracy');

  const isLight = theme === 'light';
  const gridColor = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(248, 250, 252, 0.06)';
  const tickColorY = isLight ? '#64748B' : '#94A3B8';
  const tickColorX = isLight ? '#334155' : '#E2E8F0';
  const tooltipBg = isLight ? '#FFFFFF' : '#121A2F';
  const tooltipBorder = isLight ? '#CBD5E1' : '#202E50';
  const tooltipText = isLight ? '#0F172A' : '#F8FAFC';

  const metricLabel = {
    accuracy: 'Test Accuracy (%)',
    precision: 'Precision (Diabetes Positive) (%)',
    recall: 'Recall / Sensitivity (%)',
    f1_score: 'F1-Score Harmonic Mean (%)',
  }[selectedMetric];

  const chartData = {
    labels: MODEL_TABLE_ROWS.map((m) => m.name),
    datasets: [
      {
        label: metricLabel,
        data: MODEL_TABLE_ROWS.map((m) => m[selectedMetric]),
        backgroundColor: [
          isLight ? 'rgba(148, 163, 184, 0.35)' : 'rgba(71, 85, 105, 0.35)',
          isLight ? 'rgba(148, 163, 184, 0.35)' : 'rgba(71, 85, 105, 0.35)',
          isLight ? 'rgba(148, 163, 184, 0.35)' : 'rgba(71, 85, 105, 0.35)',
          isLight ? 'rgba(219, 39, 119, 0.85)' : 'rgba(236, 72, 153, 0.85)',
        ],
        borderColor: [
          isLight ? 'rgba(100, 116, 139, 0.6)' : 'rgba(100, 116, 139, 0.7)',
          isLight ? 'rgba(100, 116, 139, 0.6)' : 'rgba(100, 116, 139, 0.7)',
          isLight ? 'rgba(100, 116, 139, 0.6)' : 'rgba(100, 116, 139, 0.7)',
          isLight ? '#BE185D' : '#F472B6',
        ],
        borderWidth: 1.5,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx: any) => ` ${metricLabel}: ${ctx.raw}%`,
        },
      },
    },
    scales: {
      y: {
        min: 60,
        max: 88,
        grid: { color: gridColor },
        ticks: {
          color: tickColorY,
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
          callback: (v: number) => `${v}%`,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: tickColorX,
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' },
          maxRotation: 15,
        },
      },
    },
  };

  return (
    <>
      <section className="page-header">
        <div className="page-eyebrow">Classifier Validation Suite</div>
        <h1 className="page-title">Supervised Learning Benchmarks</h1>
        <p className="page-subtitle">
          Stratified 80/20 holdout evaluation on the 302-sample UCI Heart Disease cohort. Test partition
          contains {test_sample_count} observations ({test_class_distribution['0']} negative,{' '}
          {test_class_distribution['1']} positive).
        </p>
      </section>

      {/* METRICS TABLE */}
      <section className="recap-section" style={{ marginBottom: '2rem' }}>
        <div
          className="section-header"
          style={{
            marginBottom: '1.25rem',
            paddingBottom: '0.875rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span className="section-num">01</span>
          <h2 className="section-title">Comparative Performance Metrics Matrix</h2>
          <span className="section-desc">Stratified test set (N = {test_sample_count})</span>
        </div>

        <div className="table-scroll">
          <table className="clinical-table" aria-label="Model Comparison Table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall (Sensitivity)</th>
                <th>F1-Score</th>
                <th style={{ fontSize: '0.68rem' }}>
                  Confusion Matrix <span style={{ fontWeight: 400, opacity: 0.7 }}>[[TN,FP],[FN,TP]]</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {MODEL_TABLE_ROWS.map((m) => (
                <tr key={m.key} className={m.is_best ? 'highlight-best' : ''}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</span>
                    {m.is_best && <span className="badge-best">Deployed</span>}
                  </td>
                  <td
                    className="numeral"
                    style={{
                      fontSize: '1.05rem',
                      color: m.is_best ? 'var(--pink-light)' : 'var(--text-primary)',
                      fontWeight: 800,
                    }}
                  >
                    {m.accuracy}%
                  </td>
                  <td className="numeral" style={{ color: 'var(--text-secondary)' }}>
                    {m.precision}%
                  </td>
                  <td className="numeral" style={{ color: 'var(--text-secondary)' }}>
                    {m.recall}%
                  </td>
                  <td className="numeral" style={{ color: 'var(--text-secondary)' }}>
                    {m.f1_score}%
                  </td>
                  <td>
                    <code className="mono" style={{ color: 'var(--pink-light)', fontSize: '0.82rem' }}>
                      {`[[${m.confusion_matrix[0][0]},${m.confusion_matrix[0][1]}],[${m.confusion_matrix[1][0]},${m.confusion_matrix[1][1]}]]`}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          ✦ <strong style={{ color: 'var(--text-secondary)' }}>Key Clinical Finding:</strong> The RBF-SVM achieves
          the highest test accuracy (<strong>{svmData.accuracy}%</strong>) and recall (
          <strong>{svmData.recall}%</strong>), minimizing critical Type-II false negatives in clinical
          screening.
        </p>
      </section>

      {/* INTERACTIVE METRIC SELECTOR + CHARTS */}
      <div className="card-grid">
        <section className="panel-card">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div>
              <div className="panel-card-title flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-rose-400" />
                Benchmark Metric Explorer
              </div>
              <p className="panel-card-sub" style={{ marginBottom: 0 }}>
                Select metric to compare classifier distributions
              </p>
            </div>
            <div className="flex gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
              {(['accuracy', 'recall', 'precision', 'f1_score'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer capitalize ${
                    selectedMetric === metric
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {metric.replace('_', '-')}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-container" style={{ height: '280px', marginTop: '1rem' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-card-title flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            SVM Confusion Matrix Analysis
          </div>
          <p className="panel-card-sub">
            Ground-truth vs. predicted on the {test_sample_count}-sample test set
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.875rem',
              marginTop: '0.5rem',
            }}
          >
            <div className="stat-cell">
              <span className="stat-cell-label" style={{ color: 'var(--clear-light)' }}>
                True Negatives (TN)
              </span>
              <span className="stat-cell-value" style={{ color: 'var(--text-primary)' }}>
                {svmData.confusion_matrix[0][0]}
              </span>
              <span className="stat-cell-sub">Correctly identified clear</span>
            </div>
            <div className="stat-cell">
              <span className="stat-cell-label" style={{ color: 'var(--risk-light)' }}>
                False Positives (FP)
              </span>
              <span className="stat-cell-value" style={{ color: 'var(--text-primary)' }}>
                {svmData.confusion_matrix[0][1]}
              </span>
              <span className="stat-cell-sub">Type I Error</span>
            </div>
            <div className="stat-cell">
              <span className="stat-cell-label" style={{ color: 'var(--risk-light)' }}>
                False Negatives (FN)
              </span>
              <span className="stat-cell-value" style={{ color: 'var(--risk-light)' }}>
                {svmData.confusion_matrix[1][0]}
              </span>
              <span className="stat-cell-sub">Type II (Minimised)</span>
            </div>
            <div className="stat-cell">
              <span className="stat-cell-label" style={{ color: 'var(--clear-light)' }}>
                True Positives (TP)
              </span>
              <span className="stat-cell-value" style={{ color: 'var(--pink-light)' }}>
                {svmData.confusion_matrix[1][1]}
              </span>
              <span className="stat-cell-sub">Correctly identified disease</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
