import React from 'react';
import { METRICS_DATA } from '../data/metrics';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FeatureInsightsViewProps {
  theme: 'dark' | 'light';
}

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  glucose: 'Plasma Glucose Concentration (2-Hour OGTT / Fasting mg/dL)',
  hba1c: 'Estimated / Lab Glycated Hemoglobin (% HbA1c)',
  bmi: 'Body Mass Index (Weight in kg / Height in m²)',
  age: 'Patient Chronological Age (Years)',
  dpf: 'Diabetes Pedigree Function (Family History Genetic Susceptibility Score)',
  insulin: '2-Hour Serum Insulin Concentration (μU/mL)',
  blood_pressure: 'Diastolic Resting Blood Pressure (mm Hg)',
  pregnancies: 'Total Number of Pregnancies / Gravidity',
  skin_thickness: 'Triceps Skinfold Thickness (mm, Subcutaneous Adiposity)',
};

export const FeatureInsightsView: React.FC<FeatureInsightsViewProps> = ({ theme }) => {
  const { feature_importances, pca } = METRICS_DATA;

  const isLight = theme === 'light';
  const gridColor = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(248, 250, 252, 0.06)';
  const tickColorX = isLight ? '#64748B' : '#94A3B8';
  const tickColorY = isLight ? '#334155' : '#E2E8F0';
  const tooltipBg = isLight ? '#FFFFFF' : '#121A2F';
  const tooltipBorder = isLight ? '#CBD5E1' : '#202E50';
  const tooltipText = isLight ? '#0F172A' : '#F8FAFC';

  const chartData = {
    labels: feature_importances.map((item) => item.feature),
    datasets: [
      {
        data: feature_importances.map((item) => item.importance),
        backgroundColor: isLight ? 'rgba(219, 39, 119, 0.85)' : 'rgba(236, 72, 153, 0.85)',
        borderColor: isLight ? '#BE185D' : '#F472B6',
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const chartOptions: any = {
    indexAxis: 'y' as const,
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
          label: (ctx: any) => ` Importance: ${ctx.raw.toFixed(3)}`,
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 0.35,
        grid: { color: gridColor },
        ticks: {
          color: tickColorX,
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
          callback: (v: number) => v.toFixed(2),
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: tickColorY,
          font: { family: "'JetBrains Mono', monospace", size: 12, weight: '600' },
        },
      },
    },
  };

  return (
    <>
      <section className="page-header">
        <div className="page-eyebrow">Interpretability & Dimensionality</div>
        <h1 className="page-title">Feature Weights & PCA Orthogonal Manifold</h1>
        <p className="page-subtitle">
          Exploratory analysis derived from Random Forest Gini importance rankings and Principal
          Component Analysis applied across all clinical diabetes biomarkers.
        </p>
      </section>

      {/* FEATURE IMPORTANCE + PCA SCATTER */}
      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Feature Importance */}
        <section className="panel-card">
          <div
            className="section-header"
            style={{
              marginBottom: '1rem',
              paddingBottom: '0.875rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span className="section-num">01</span>
            <h2 className="section-title">Random Forest Feature Importance</h2>
          </div>
          <p className="panel-card-sub">
            <code className="mono" style={{ color: 'var(--pink-light)', fontWeight: 700 }}>
              {feature_importances[0].feature}
            </code>{' '}
            ({feature_importances[0].importance}),&nbsp;
            <code className="mono" style={{ color: 'var(--pink-light)', fontWeight: 700 }}>
              {feature_importances[1].feature}
            </code>{' '}
            ({feature_importances[1].importance}),&nbsp;
            <code className="mono" style={{ color: 'var(--pink-light)', fontWeight: 700 }}>
              {feature_importances[2].feature}
            </code>{' '}
            ({feature_importances[2].importance}) are the dominant predictors.
            Glycemic concentration and glycated hemoglobin account for over 50% of classification variance.
          </p>
          <div className="chart-container" style={{ height: '360px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </section>

        {/* PCA Scatter */}
        <section className="panel-card">
          <div
            className="section-header"
            style={{
              marginBottom: '1rem',
              paddingBottom: '0.875rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span className="section-num">02</span>
            <h2 className="section-title">PCA 2D Projection Space</h2>
          </div>
          <p className="panel-card-sub">
            All clinical variables compressed into 2 orthogonal components, retaining{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {pca.total_variance_retained}%
            </strong>{' '}
            of total variance (PC1: {pca.variance_ratio[0].toFixed(3)}, PC2:{' '}
            {pca.variance_ratio[1].toFixed(3)}). Normoglycemic and diabetic cohorts separate
            primarily along PC1 representing the core glycemic-adiposity axis.
          </p>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="/img/pca_scatter.png"
              alt="PCA 2D projection of Diabetes Dataset — Normoglycemic (0) vs Diabetic (1)"
              className="img-asset"
              style={{ maxHeight: '360px', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/img/feature_importance.png';
              }}
            />
          </div>
        </section>
      </div>

      {/* FEATURE BREAKDOWN TABLE */}
      <section className="recap-section" style={{ marginTop: '2rem' }}>
        <div
          className="section-header"
          style={{
            marginBottom: '1.25rem',
            paddingBottom: '0.875rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span className="section-num">•</span>
          <h3 className="section-title">Full Diabetes Biomarker Importance Ranking</h3>
          <span className="section-desc">Gini impurity reduction across 100 decision trees</span>
        </div>

        <div className="table-scroll">
          <table className="clinical-table" aria-label="Feature Importance Table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Variable</th>
                <th>Clinical Description</th>
                <th>Gini Score</th>
                <th>Relative Weight</th>
              </tr>
            </thead>
            <tbody>
              {feature_importances.map((item, idx) => (
                <tr key={item.feature} className={idx < 3 ? 'highlight-best' : ''}>
                  <td
                    className="numeral"
                    style={{
                      color: idx < 3 ? 'var(--pink-light)' : 'var(--text-muted)',
                      fontWeight: 800,
                    }}
                  >
                    #{idx + 1}
                  </td>
                  <td>
                    <code className="mono" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700 }}>
                      {item.feature}
                    </code>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {FEATURE_DESCRIPTIONS[item.feature] || item.feature}
                  </td>
                  <td
                    className="numeral"
                    style={{ color: 'var(--pink-light)', fontWeight: 800, fontSize: '1rem' }}
                  >
                    {item.importance.toFixed(4)}
                  </td>
                  <td>
                    <div
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '100px',
                        height: '7px',
                        width: '160px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          background: 'linear-gradient(90deg, var(--pink-dark), var(--pink-light))',
                          height: '100%',
                          width: `${(item.importance / 0.294) * 100}%`,
                          borderRadius: '100px',
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};
