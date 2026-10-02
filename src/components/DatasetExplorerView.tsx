import React, { useState } from 'react';
import { SAMPLE_DIABETES_DATASET, DATASET_SUMMARY_STATS, exportDatasetToCSV } from '../data/dataset';
import { Database, Download, Search, CheckCircle2, AlertTriangle } from 'lucide-react';

export const DatasetExplorerView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | '0' | '1'>('all');

  const filteredData = SAMPLE_DIABETES_DATASET.filter((d) => {
    const matchesSearch =
      d.id.toString().includes(searchTerm) ||
      d.age.toString().includes(searchTerm) ||
      d.glucose.toString().includes(searchTerm) ||
      d.bmi.toString().includes(searchTerm);
    const matchesOutcome =
      outcomeFilter === 'all' || d.outcome.toString() === outcomeFilter;
    return matchesSearch && matchesOutcome;
  });

  const handleDownloadCSV = () => {
    const csvContent = exportDatasetToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'pima_cdc_diabetes_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="page-header">
        <div className="page-eyebrow">Clinical Repository & Training Corpus</div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">Diabetes Dataset Explorer & Export</h1>
            <p className="page-subtitle">
              Interactive clinical database derived from the standard PIMA / CDC NHANES diagnostic
              repository. Embedded directly in the application — no external downloads or manual setup
              required.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="btn btn-primary text-xs flex items-center gap-2 py-2 px-4 shadow-lg"
          >
            <Download className="w-4 h-4" /> Download Dataset (.CSV)
          </button>
        </div>
      </section>

      {/* SUMMARY METRIC TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D1322] border border-white/10 flex flex-col gap-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Cohort Size</span>
          <span className="text-2xl font-extrabold text-slate-100">{DATASET_SUMMARY_STATS.total_samples} Patients</span>
          <span className="text-[11px] text-rose-300">Stratified 80/20 train/test</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0D1322] border border-white/10 flex flex-col gap-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Prevalence Rate</span>
          <span className="text-2xl font-extrabold text-rose-400">{DATASET_SUMMARY_STATS.prevalence_rate}%</span>
          <span className="text-[11px] text-slate-400">{DATASET_SUMMARY_STATS.positive_diabetic_cases} Positive / {DATASET_SUMMARY_STATS.negative_normoglycemic_cases} Negative</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0D1322] border border-white/10 flex flex-col gap-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Cohort Mean Glucose</span>
          <span className="text-2xl font-extrabold text-slate-100">{DATASET_SUMMARY_STATS.feature_means.glucose} mg/dL</span>
          <span className="text-[11px] text-slate-400">Std: ±{DATASET_SUMMARY_STATS.feature_stds.glucose}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0D1322] border border-white/10 flex flex-col gap-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Cohort Mean BMI</span>
          <span className="text-2xl font-extrabold text-slate-100">{DATASET_SUMMARY_STATS.feature_means.bmi} kg/m²</span>
          <span className="text-[11px] text-slate-400">Std: ±{DATASET_SUMMARY_STATS.feature_stds.bmi}</span>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-xl bg-[#0D1322] border border-white/10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, Age, Glucose level, or BMI..."
            className="form-input text-xs py-1.5"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">Outcome Filter:</span>
          <div className="flex gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setOutcomeFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                outcomeFilter === 'all' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({SAMPLE_DIABETES_DATASET.length})
            </button>
            <button
              onClick={() => setOutcomeFilter('1')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                outcomeFilter === '1' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Diabetic (1)
            </button>
            <button
              onClick={() => setOutcomeFilter('0')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                outcomeFilter === '0' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Normoglycemic (0)
            </button>
          </div>
        </div>
      </div>

      {/* DATASET TABLE */}
      <div className="recap-section">
        <div
          className="section-header"
          style={{
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span className="section-num">
            <Database className="w-3.5 h-3.5" />
          </span>
          <h2 className="section-title">Cohort Clinical Records ({filteredData.length} observations)</h2>
          <span className="section-desc">Standardized 8-feature clinical matrix</span>
        </div>

        <div className="table-scroll">
          <table className="clinical-table" aria-label="Diabetes Dataset Table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pregnancies</th>
                <th>Glucose (mg/dL)</th>
                <th>Est. HbA1c (%)</th>
                <th>Diastolic BP</th>
                <th>Skinfold (mm)</th>
                <th>2-Hr Insulin</th>
                <th>BMI (kg/m²)</th>
                <th>Pedigree (DPF)</th>
                <th>Age</th>
                <th>Diagnostic Outcome</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className={row.outcome === 1 ? 'highlight-best' : ''}>
                  <td className="font-mono text-xs font-bold text-slate-300">#{row.id}</td>
                  <td className="font-mono text-xs text-slate-300">{row.pregnancies}</td>
                  <td className="font-mono text-xs font-bold text-rose-300">{row.glucose}</td>
                  <td className="font-mono text-xs font-bold text-slate-200">{row.hba1c}%</td>
                  <td className="font-mono text-xs text-slate-300">{row.blood_pressure} mm Hg</td>
                  <td className="font-mono text-xs text-slate-300">{row.skin_thickness} mm</td>
                  <td className="font-mono text-xs text-slate-300">{row.insulin} μU/mL</td>
                  <td className="font-mono text-xs font-bold text-slate-200">{row.bmi}</td>
                  <td className="font-mono text-xs text-slate-300">{row.dpf}</td>
                  <td className="font-mono text-xs text-slate-300">{row.age} yrs</td>
                  <td>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        row.outcome === 1
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {row.outcome === 1 ? (
                        <>
                          <AlertTriangle className="w-2.5 h-2.5" /> Diabetic (1)
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" /> Normoglycemic (0)
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
