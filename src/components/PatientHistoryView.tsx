import React, { useState } from 'react';
import { PredictionResult } from '../types';
import { History, ArrowRight, Trash2, Scale } from 'lucide-react';

interface PatientHistoryViewProps {
  history: PredictionResult[];
  onSelectPatient: (result: PredictionResult) => void;
  onClearHistory: () => void;
}

export const PatientHistoryView: React.FC<PatientHistoryViewProps> = ({
  history,
  onSelectPatient,
  onClearHistory,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectForCompare = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const comparePatientA = history.find((h) => h.id === selectedIds[0]);
  const comparePatientB = history.find((h) => h.id === selectedIds[1]);

  return (
    <div className="flex flex-col gap-6">
      <section className="page-header">
        <div className="page-eyebrow">Session Clinical Records</div>
        <h1 className="page-title">Patient Intake History & Audit Log</h1>
        <p className="page-subtitle">
          Review saved diabetes risk assessments evaluated during this session. Compare two patient profiles
          side-by-side to inspect biomarker differentials and classification shifts.
        </p>
      </section>

      {history.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0D1322] border border-white/10 text-center flex flex-col items-center gap-3">
          <History className="w-12 h-12 text-slate-500" />
          <h3 className="text-lg font-bold text-slate-200">No Patient Records in Session Log</h3>
          <p className="text-sm text-slate-400 max-w-md">
            Execute predictions from the Patient Intake tab or What-If Simulator to automatically record
            evaluations here.
          </p>
        </div>
      ) : (
        <>
          {/* ACTION TOOLBAR */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs font-mono text-slate-400">
              Total Recorded Assessments: <strong className="text-rose-300">{history.length}</strong>
            </span>
            <div className="flex items-center gap-3">
              {selectedIds.length === 2 && (
                <span className="text-xs font-mono text-rose-300 bg-rose-950 px-2.5 py-1 rounded border border-rose-500/30">
                  ✓ 2 Patients Selected for Side-by-Side Diff
                </span>
              )}
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 p-2 rounded hover:bg-white/5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Session Log
              </button>
            </div>
          </div>

          {/* HISTORY TABLE */}
          <div className="recap-section">
            <div className="table-scroll">
              <table className="clinical-table" aria-label="Patient History Table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>Diff</th>
                    <th>Record ID</th>
                    <th>Timestamp</th>
                    <th>Age</th>
                    <th>Glucose</th>
                    <th>Est. HbA1c</th>
                    <th>BMI</th>
                    <th>Insulin</th>
                    <th>Diabetes Risk</th>
                    <th>Confidence</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr key={item.id} className={isSelected ? 'highlight-best' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectForCompare(item.id)}
                            className="accent-rose-500 cursor-pointer"
                            title="Select to compare side-by-side"
                          />
                        </td>
                        <td>
                          <span className="font-mono font-bold text-slate-100">{item.patientLabel}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">{item.id}</span>
                        </td>
                        <td className="font-mono text-xs text-slate-400">{item.timestamp}</td>
                        <td className="font-mono text-xs text-slate-200">{item.raw_inputs.age} yrs</td>
                        <td className="font-mono text-xs font-bold text-rose-300">
                          {item.raw_inputs.glucose} mg/dL
                        </td>
                        <td className="font-mono text-xs text-slate-200">
                          {item.raw_inputs.hba1c}%
                        </td>
                        <td className="font-mono text-xs text-slate-200">
                          {item.raw_inputs.bmi.toFixed(1)} kg/m²
                        </td>
                        <td className="font-mono text-xs text-slate-300">
                          {item.raw_inputs.insulin} μU/mL
                        </td>
                        <td>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              item.is_risk
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {item.is_risk ? 'Diabetic' : 'Clear'} ({item.prob_diabetes}%)
                          </span>
                        </td>
                        <td className="font-mono text-xs text-rose-300 font-bold">
                          {item.confidence}%
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => onSelectPatient(item)}
                            className="text-xs text-rose-300 hover:text-white font-bold inline-flex items-center gap-1 cursor-pointer bg-rose-500/10 hover:bg-rose-500 px-2.5 py-1 rounded transition-colors"
                          >
                            View Report <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIDE-BY-SIDE COMPARATOR */}
          {comparePatientA && comparePatientB && (
            <div className="p-6 rounded-2xl bg-[#121A2F] border-2 border-rose-500/40 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Scale className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Side-by-Side Diabetes Biomarker Differential
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0D1322] border border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-100">{comparePatientA.patientLabel}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        comparePatientA.is_risk
                          ? 'bg-rose-950 text-rose-300'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {comparePatientA.verdict_text} ({comparePatientA.prob_diabetes}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-2">
                    <div>Glucose: {comparePatientA.raw_inputs.glucose} mg/dL</div>
                    <div>HbA1c: {comparePatientA.raw_inputs.hba1c}%</div>
                    <div>BMI: {comparePatientA.raw_inputs.bmi.toFixed(1)} kg/m²</div>
                    <div>Insulin: {comparePatientA.raw_inputs.insulin} μU/mL</div>
                    <div>Pedigree (DPF): {comparePatientA.raw_inputs.dpf.toFixed(3)}</div>
                    <div>Diastolic BP: {comparePatientA.raw_inputs.blood_pressure} mm Hg</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0D1322] border border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-100">{comparePatientB.patientLabel}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        comparePatientB.is_risk
                          ? 'bg-rose-950 text-rose-300'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {comparePatientB.verdict_text} ({comparePatientB.prob_diabetes}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-2">
                    <div>Glucose: {comparePatientB.raw_inputs.glucose} mg/dL</div>
                    <div>HbA1c: {comparePatientB.raw_inputs.hba1c}%</div>
                    <div>BMI: {comparePatientB.raw_inputs.bmi.toFixed(1)} kg/m²</div>
                    <div>Insulin: {comparePatientB.raw_inputs.insulin} μU/mL</div>
                    <div>Pedigree (DPF): {comparePatientB.raw_inputs.dpf.toFixed(3)}</div>
                    <div>Diastolic BP: {comparePatientB.raw_inputs.blood_pressure} mm Hg</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
