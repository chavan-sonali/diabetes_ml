import React, { useState } from 'react';
import { PatientInputs } from '../types';
import { predictDiabetes } from '../utils/predictor';
import { Sliders, RefreshCw, ArrowRight, Activity, CheckCircle2, AlertTriangle, Info, User } from 'lucide-react';

interface WhatIfSimulatorProps {
  initialInputs: PatientInputs;
  onApplyToPatient: (inputs: PatientInputs) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  initialInputs,
  onApplyToPatient,
}) => {
  const [inputs, setInputs] = useState<PatientInputs>(initialInputs);
  const baselineResult = predictDiabetes(initialInputs);
  const simulatedResult = predictDiabetes(inputs);

  const deltaProbability = simulatedResult.prob_diabetes - baselineResult.prob_diabetes;

  const handleSliderChange = (key: keyof PatientInputs, val: number) => {
    setInputs((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleGenderChange = (gender: 'female' | 'male' | 'other') => {
    setInputs((prev) => ({
      ...prev,
      gender,
      pregnancies: gender === 'male' ? 0 : prev.pregnancies,
    }));
  };

  const resetToBaseline = () => {
    setInputs(initialInputs);
  };

  const isMale = inputs.gender === 'male';

  return (
    <div className="flex flex-col gap-6">
      <section className="page-header">
        <div className="page-eyebrow">Interactive Glycemic Sensitivity Lab</div>
        <h1 className="page-title">What-If Diabetes Risk Simulator</h1>
        <p className="page-subtitle">
          Modulate clinical variables to simulate how therapeutic interventions (e.g. glucose stabilization,
          weight reduction, insulin sensitization) alter Type 2 Diabetes probability and staging in real-time.
        </p>
      </section>

      {/* COMPARISON METRIC BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D1322] border border-white/10 flex flex-col justify-between">
          <span className="text-xs uppercase font-mono text-slate-400">Baseline Patient State</span>
          <div className="flex items-baseline gap-2 my-2">
            <span
              className={`text-3xl font-extrabold ${
                baselineResult.is_risk ? 'text-pink-400' : 'text-emerald-400'
              }`}
            >
              {baselineResult.prob_diabetes}%
            </span>
            <span className="text-xs text-slate-400">P(Diabetes)</span>
          </div>
          <span className="text-xs font-semibold text-slate-300">
            {baselineResult.is_risk ? '⚠ Type 2 Diabetes Risk Indicated' : '✓ Negative / Normoglycemic'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#121A2F] border-2 border-pink-500/40 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-pink-300 font-bold">Simulated Trajectory</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                deltaProbability < 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : deltaProbability > 0
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              {deltaProbability < 0
                ? `${deltaProbability.toFixed(1)}% Risk Reduced`
                : deltaProbability > 0
                ? `+${deltaProbability.toFixed(1)}% Risk Increase`
                : 'No Change'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span
              className={`text-4xl font-extrabold ${
                simulatedResult.is_risk ? 'text-pink-400' : 'text-emerald-400'
              }`}
            >
              {simulatedResult.prob_diabetes}%
            </span>
            <span className="text-xs text-slate-400">Simulated P(Diabetes)</span>
          </div>
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            {simulatedResult.is_risk ? (
              <AlertTriangle className="w-3.5 h-3.5 text-pink-400 inline" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
            )}
            {simulatedResult.verdict_text} ({simulatedResult.recommendations.glycemic_status})
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1322] border border-white/10 flex flex-col justify-between">
          <span className="text-xs uppercase font-mono text-slate-400">Ensemble Consensus</span>
          <div className="flex items-center gap-2 my-2">
            <span className="text-3xl font-extrabold text-slate-100">
              {simulatedResult.consensus_agreement}%
            </span>
            <span className="text-xs text-slate-400">Ensemble Agreement</span>
          </div>
          <div className="flex gap-1.5">
            {simulatedResult.multi_model_predictions.map((m) => (
              <span
                key={m.modelKey}
                title={`${m.modelName}: ${m.isRisk ? 'Diabetic' : 'Clear'} (${m.probability}%)`}
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  m.isRisk ? 'bg-pink-950 text-pink-300' : 'bg-emerald-950 text-emerald-300'
                }`}
              >
                {m.modelKey.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CONTROLS SLIDERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Glycemic & Metabolic Sliders */}
        <div className="p-6 rounded-2xl bg-[#121A2F] border border-white/10 shadow-lg flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-pink-400" />
              Glycemic & Glucose Parameters
            </h3>
            <button
              onClick={resetToBaseline}
              className="text-xs text-slate-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Plasma Glucose */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Plasma Glucose Concentration</span>
              <span className="font-mono font-bold text-pink-300 bg-pink-950/60 px-2 py-0.5 rounded border border-pink-500/30">
                {inputs.glucose} mg/dL
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="280"
              step="1"
              value={inputs.glucose}
              onChange={(e) => handleSliderChange('glucose', parseInt(e.target.value, 10))}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>70 (Normal)</span>
              <span>100 (Pre-DM)</span>
              <span>126 (Diabetes)</span>
              <span>280 (Severe)</span>
            </div>
          </div>

          {/* HbA1c */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Estimated HbA1c (%)</span>
              <span className="font-mono font-bold text-pink-300 bg-pink-950/60 px-2 py-0.5 rounded border border-pink-500/30">
                {inputs.hba1c.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="4.5"
              max="12.0"
              step="0.1"
              value={inputs.hba1c}
              onChange={(e) => handleSliderChange('hba1c', parseFloat(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>4.5% (Normal)</span>
              <span>5.7% (Pre-DM)</span>
              <span>6.5% (Diabetic)</span>
              <span>12.0%</span>
            </div>
          </div>

          {/* Serum Insulin */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">2-Hour Serum Insulin</span>
              <span className="font-mono font-bold text-pink-300 bg-pink-950/60 px-2 py-0.5 rounded border border-pink-500/30">
                {inputs.insulin} μU/mL
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="450"
              step="5"
              value={inputs.insulin}
              onChange={(e) => handleSliderChange('insulin', parseInt(e.target.value, 10))}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>15 (Basal)</span>
              <span>80 (Postprandial)</span>
              <span>200+ (Hyperinsulinemia)</span>
            </div>
          </div>
        </div>

        {/* Adiposity, Demographics, Gender & Pedigree */}
        <div className="p-6 rounded-2xl bg-[#121A2F] border border-white/10 shadow-lg flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-pink-400" />
              Sex, Adiposity & Pedigree
            </h3>
          </div>

          {/* Biological Sex / Gender Selector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-pink-400" /> Biological Sex / Gender:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => handleGenderChange('female')}
                className={`py-1.5 px-2 rounded text-xs font-bold transition-all ${
                  inputs.gender === 'female' || !inputs.gender
                    ? 'bg-pink-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ♀ Female
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange('male')}
                className={`py-1.5 px-2 rounded text-xs font-bold transition-all ${
                  inputs.gender === 'male'
                    ? 'bg-pink-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ♂ Male
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange('other')}
                className={`py-1.5 px-2 rounded text-xs font-bold transition-all ${
                  inputs.gender === 'other'
                    ? 'bg-pink-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚧ Other
              </button>
            </div>
          </div>

          {/* BMI */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Body Mass Index (BMI)</span>
              <span className="font-mono font-bold text-pink-300 bg-pink-950/60 px-2 py-0.5 rounded border border-pink-500/30">
                {inputs.bmi.toFixed(1)} kg/m²
              </span>
            </div>
            <input
              type="range"
              min="18.0"
              max="52.0"
              step="0.2"
              value={inputs.bmi}
              onChange={(e) => handleSliderChange('bmi', parseFloat(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>18.5 (Normal)</span>
              <span>25.0 (Overweight)</span>
              <span>30.0 (Obese)</span>
              <span>52.0</span>
            </div>
          </div>

          {/* Pregnancies (Conditional on Gender) */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Number of Pregnancies</span>
              <span className="font-mono font-bold text-pink-300 bg-pink-950/60 px-2 py-0.5 rounded border border-pink-500/30">
                {isMale ? '0 (Locked for Male)' : `${inputs.pregnancies ?? 0} Pregnancies`}
              </span>
            </div>
            {isMale ? (
              <div className="p-2 rounded bg-black/20 border border-white/5 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-pink-400" /> Gravidity locked to 0 for male patient profile.
              </div>
            ) : (
              <>
                <input
                  type="range"
                  min="0"
                  max="14"
                  step="1"
                  value={inputs.pregnancies ?? 0}
                  onChange={(e) => handleSliderChange('pregnancies', parseInt(e.target.value, 10))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 (Nulliparous)</span>
                  <span>4 (Moderate)</span>
                  <span>10+ (High Risk)</span>
                </div>
              </>
            )}
          </div>

          {/* Genetic Pedigree */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Diabetes Pedigree Function (DPF)</span>
              <span className="font-mono font-bold text-pink-300 bg-pink-950/60 px-2 py-0.5 rounded border border-pink-500/30">
                {inputs.dpf.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min="0.08"
              max="2.00"
              step="0.01"
              value={inputs.dpf}
              onChange={(e) => handleSliderChange('dpf', parseFloat(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.10 (Low Genetic Risk)</span>
              <span>0.50 (Average)</span>
              <span>1.50+ (High Pedigree)</span>
            </div>
          </div>

          {/* Diastolic BP */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Diastolic Blood Pressure</span>
              <span className="font-mono font-bold text-pink-300 bg-pink-950/60 px-2 py-0.5 rounded border border-pink-500/30">
                {inputs.blood_pressure} mm Hg
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="120"
              step="1"
              value={inputs.blood_pressure}
              onChange={(e) => handleSliderChange('blood_pressure', parseInt(e.target.value, 10))}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>60 (Normal)</span>
              <span>80 (Pre-HTN)</span>
              <span>90 (Stage 1 HTN)</span>
              <span>120</span>
            </div>
          </div>
        </div>
      </div>

      {/* APPLY SIMULATION BUTTON */}
      <div className="p-5 rounded-2xl bg-[#0D1322] border border-white/10 flex items-center justify-between flex-wrap gap-4 shadow-lg">
        <div>
          <h4 className="text-sm font-bold text-slate-100">Commit Simulated Biomarkers to Primary Report</h4>
          <p className="text-xs text-slate-400">
            Re-evaluates RBF-SVM, 24-hr Diurnal Glucose Simulator, and Multi-Model Consensus with the modulated parameters.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onApplyToPatient(inputs)}
          className="btn btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
        >
          <span>Apply Changes to Patient</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
