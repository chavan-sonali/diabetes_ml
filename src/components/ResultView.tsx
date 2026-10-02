import React, { useState } from 'react';
import { PredictionResult } from '../types';
import { GlucoseVisualizer } from './GlucoseVisualizer';
import { ClinicalRadarChart } from './ClinicalRadarChart';
import { ExportReportModal } from './ExportReportModal';
import {
  CheckCircle2,
  Sliders,
  Layers,
  FileText,
  Activity,
  ArrowRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';

interface ResultViewProps {
  result: PredictionResult;
  theme: 'dark' | 'light';
  onNewAssessment: () => void;
  onOpenSimulator: () => void;
  onOpenConsensus: () => void;
  onViewBenchmarks: () => void;
  onViewInsights: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  theme,
  onNewAssessment,
  onOpenSimulator,
  onOpenConsensus,
  onViewBenchmarks,
  onViewInsights,
}) => {
  const [showExportModal, setShowExportModal] = useState(false);

  const {
    is_risk,
    confidence,
    verdict_text,
    prob_diabetes,
    prob_no_disease,
    recap_rows,
    recommendations,
    raw_inputs,
    multi_model_predictions,
    consensus_agreement,
    axis_scores,
  } = result;

  return (
    <div className="result-container">
      {/* EXPORT MODAL */}
      {showExportModal && (
        <ExportReportModal result={result} onClose={() => setShowExportModal(false)} />
      )}

      {/* HEADER */}
      <section className="page-header">
        <div className="page-eyebrow">Diagnostic Assessment Report</div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">Diabetes Phenotype & Glycemic Stratification</h1>
            <p className="page-subtitle">
              Inference computed via RBF Support Vector Machine classifier with StandardScaler normalization on
              clinical cohort features.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="btn btn-secondary text-xs flex items-center gap-1.5 py-2 px-4 shadow-sm"
          >
            <FileText className="w-4 h-4 text-rose-400" /> Export Clinical Memorandum
          </button>
        </div>
      </section>

      {/* HERO VERDICT */}
      <section className={`verdict-hero ${is_risk ? 'risk' : 'clear'}`} aria-live="polite">
        <div className="verdict-meta">
          <span className="verdict-pill">
            {is_risk ? 'Type 2 Diabetes Risk Indicated' : 'Negative / Normoglycemic Profile'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Record ID: <strong className="text-slate-300 font-mono">{result.id}</strong> ·{' '}
            {result.patientLabel || 'Patient Profile'} · Staging:{' '}
            <strong className="text-rose-300">{recommendations.glycemic_status}</strong>
          </span>
        </div>

        <h2 className="verdict-headline">
          {confidence}% Confidence — {verdict_text}
        </h2>

        <p className="verdict-sub">
          {is_risk
            ? 'The multivariate profile exhibits characteristic patterns of progressive beta-cell decompensation and severe peripheral insulin resistance — elevated plasma glucose, shifted glycated hemoglobin, and adiposity. Formal clinical confirmatory testing is advised.'
            : 'The multivariate profile indicates healthy glycemic regulation, physiological insulin responsiveness, and minimal hereditary risk markers.'}
        </p>

        {/* Confidence bar */}
        <div className="confidence-bar-wrap">
          <div className="confidence-labels">
            <span>Primary Model (RBF-SVM) Confidence</span>
            <strong
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.95rem',
              }}
            >
              {confidence}%
            </strong>
          </div>
          <div className="confidence-track">
            <div className="confidence-fill" style={{ width: `${confidence}%` }}></div>
          </div>
        </div>

        {/* Probability cards */}
        <div className="prob-row">
          <div className="prob-card risk-card">
            <div className="prob-card-label">P(Diabetes Mellitus)</div>
            <div className="prob-card-value">{prob_diabetes}%</div>
          </div>
          <div className="prob-card clear-card">
            <div className="prob-card-label">P(Normoglycemic)</div>
            <div className="prob-card-value">{prob_no_disease}%</div>
          </div>
        </div>
      </section>

      {/* DUAL VISUALIZATION: 24-HR CGM GLUCOSE CURVE + RADAR SPIDER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continuous Glucose Profile */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              Continuous Glucose Monitoring (CGM) Synthesis
            </h3>
            <span className="text-xs text-slate-400 font-mono">24-Hr Diurnal Profile</span>
          </div>
          <GlucoseVisualizer
            glucose={raw_inputs.glucose}
            hba1c={raw_inputs.hba1c}
            insulin={raw_inputs.insulin}
            bmi={raw_inputs.bmi}
          />
        </div>

        {/* 5-Axis Clinical Radar */}
        <div className="p-5 rounded-2xl bg-[#0D1322] border border-white/10 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              5-Axis Glycemic & Metabolic Spider
            </h3>
            <span className="text-xs text-rose-300 font-mono">Phenotype Space</span>
          </div>
          <ClinicalRadarChart axisScores={axis_scores} theme={theme} />
        </div>
      </div>

      {/* MULTI-MODEL CONSENSUS STRIP */}
      <div className="p-5 rounded-2xl bg-[#121A2F] border border-rose-500/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-300">Ensemble Consensus:</span>
              <strong className="text-slate-100">{consensus_agreement}% Agreement Across 4 ML Models</strong>
            </div>
            <div className="flex gap-1.5 mt-1">
              {multi_model_predictions.map((m) => (
                <span
                  key={m.modelKey}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    m.isRisk ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
                  }`}
                >
                  {m.modelKey.toUpperCase()}: {m.isRisk ? 'Diabetic' : 'Clear'} ({m.probability}%)
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenConsensus}
            className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1"
          >
            Ensemble Details <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onOpenSimulator}
            className="btn btn-primary text-xs py-2 px-3 flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5" /> Test in What-If Lab
          </button>
        </div>
      </div>

      {/* CLINICAL CONTRAINDICATIONS & SAFETY LIMITS (if any) */}
      {recommendations.contraindications.length > 0 && (
        <div className="rec-callout-block contraindication">
          <div className="rec-callout-title">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Clinical Exertion & Safety Contraindications</span>
          </div>
          <ul className="rec-callout-list">
            {recommendations.contraindications.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* POSITIVE BIOMARKERS (if any) */}
      {recommendations.positive_markers.length > 0 && (
        <div className="rec-callout-block positive">
          <div className="rec-callout-title">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Favorable Measured Indicators (Preserve These Habits)</span>
          </div>
          <ul className="rec-callout-list">
            {recommendations.positive_markers.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* CLINICAL DIRECTIVES & EXERCISE PROTOCOLS (ZERO FOOD CARDS) */}
      <section className="rec-section" aria-label="Personalised Clinical Guidelines">
        <div
          className="section-header"
          style={{
            marginBottom: '0.75rem',
            paddingBottom: '0.875rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span className="section-num">•</span>
          <h3 className="section-title">Clinical Directives & Glycemic Protocols</h3>
          <span className="section-desc">Formulated to address measured insulin resistance & glycemic excursions</span>
        </div>

        {/* Severity Banner */}
        <div className={`rec-summary-banner severity-${recommendations.overall_severity}`}>
          <div className="rec-summary-top">
            <div className={`rec-severity-badge ${recommendations.overall_severity}`}>
              {recommendations.overall_severity === 'critical' && 'Critical Precaution'}
              {recommendations.overall_severity === 'high' && 'High Priority'}
              {recommendations.overall_severity === 'moderate' && 'Moderate Action Required'}
              {recommendations.overall_severity === 'positive' && 'Optimal Profile'}
            </div>
            <span className="rec-directive-tag">ADA Clinical Directive</span>
          </div>
          <p className="rec-summary-text">{recommendations.summary_line}</p>
        </div>

        {/* Clinical Action Guidelines */}
        <div className="rec-group">
          <div className="rec-subheading">
            <span className="rec-subheading-icon">🩺</span>
            <div>
              <h4 className="rec-subheading-title">Targeted Clinical Action Directives</h4>
              <p className="rec-subheading-desc">
                Derived from standard ADA Standards of Medical Care in Diabetes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.clinical_guidelines.map((guide, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#0D1322] border border-white/10 shadow-md flex flex-col gap-3 justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                      {guide.domain}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        guide.priority === 'critical'
                          ? 'text-rose-400'
                          : guide.priority === 'high'
                          ? 'text-rose-300'
                          : guide.priority === 'moderate'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {guide.priority}
                    </span>
                  </div>
                  <h5 className="text-base font-bold text-slate-100">{guide.headline}</h5>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{guide.clinicalAction}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex flex-col gap-1 text-[11px] text-slate-400">
                  <span className="font-mono font-bold text-slate-300">Target Glycemic Milestones:</span>
                  {guide.biomarkerTargets.map((target, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-rose-400">›</span> {target}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Physical Activity & GLUT4 Protocols */}
        <div className="rec-group" style={{ marginTop: '1rem' }}>
          <div className="rec-subheading">
            <span className="rec-subheading-icon">🏃</span>
            <div>
              <h4 className="rec-subheading-title">Physical Activity & GLUT4 Translocation Protocols</h4>
              <p className="rec-subheading-desc">
                Targeting muscular glucose extraction, mitochondrial biogenesis, and insulin sensitization
              </p>
            </div>
          </div>

          <div className="rec-cards-grid">
            {recommendations.exercise_cards.map((card, idx) => (
              <div key={idx} className={`rec-card severity-${card.severity}`}>
                <div className="rec-card-meta">
                  <span className="rec-category-badge">{card.type}</span>
                  {card.contraindicated ? (
                    <span className="rec-pill pill-critical">RESTRICTED</span>
                  ) : (
                    <span className={`rec-pill pill-${card.severity}`}>{card.severity.toUpperCase()}</span>
                  )}
                </div>
                <h5 className="rec-card-title">{card.title}</h5>
                <p className="rec-card-rationale">{card.rationale}</p>

                <div
                  className={`rec-protocol-box ${card.contraindicated ? 'rec-protocol-contraindicated' : ''}`}
                >
                  <span className="rec-protocol-label">Recommended Activity Protocol</span>
                  <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.55 }}>{card.protocol}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INPUT RECAP TABLE */}
      <section className="recap-section">
        <div
          className="section-header"
          style={{
            marginBottom: '1.25rem',
            paddingBottom: '0.875rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span className="section-num">•</span>
          <h3 className="section-title">Evaluated Clinical Profile — 9 Parameters</h3>
          <span className="section-desc">Values recorded for this patient cycle</span>
        </div>

        <div className="table-scroll">
          <table className="recap-table" aria-label="Input Recap Table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Clinical Parameter</th>
                <th>Variable</th>
                <th>Value Entered</th>
              </tr>
            </thead>
            <tbody>
              {recap_rows.map((row) => (
                <tr key={row.key}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {row.section}
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{row.label}</td>
                  <td>
                    <code className="mono" style={{ color: 'var(--pink-light)', fontSize: '0.82rem' }}>
                      {row.key}
                    </code>
                  </td>
                  <td className="val">{row.displayValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ACTIONS FOOTER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="form-actions" style={{ paddingTop: 0, marginTop: 0, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNewAssessment}
            id="btnNewAssessment"
          >
            Evaluate Another Patient
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onViewBenchmarks}
            id="btnViewBenchmarks"
          >
            View Classifier Benchmarks
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onViewInsights}
            id="btnViewInsights"
          >
            Feature Weights & PCA
          </button>
        </div>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-faint)',
            maxWidth: '400px',
            textAlign: 'right',
            lineHeight: 1.5,
          }}
        >
          Academic demonstration tool based on PIMA / CDC Diabetes ML repository. Statistical inference only.
        </p>
      </div>
    </div>
  );
};
