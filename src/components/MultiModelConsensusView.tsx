import React from 'react';
import { PredictionResult } from '../types';
import { METRICS_DATA } from '../data/metrics';
import { CheckCircle2, AlertTriangle, Layers, Cpu } from 'lucide-react';

interface MultiModelConsensusViewProps {
  currentResult: PredictionResult;
  theme: 'dark' | 'light';
}

export const MultiModelConsensusView: React.FC<MultiModelConsensusViewProps> = ({
  currentResult,
}) => {
  const { multi_model_predictions, consensus_agreement } = currentResult;

  return (
    <div className="flex flex-col gap-6">
      <section className="page-header">
        <div className="page-eyebrow">Multi-Classifier Ensemble</div>
        <h1 className="page-title">Model Consensus & Cross-Validation</h1>
        <p className="page-subtitle">
          Observe how all four supervised machine learning algorithms evaluate this patient&apos;s
          glycemic and metabolic clinical parameters. The deployed Support Vector Machine (RBF kernel)
          acts as the primary diagnostic standard.
        </p>
      </section>

      {/* CONSENSUS BANNER */}
      <div className="p-6 rounded-2xl bg-[#121A2F] border-2 border-rose-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center flex-shrink-0">
            <Layers className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <span className="text-xs uppercase font-mono font-bold text-rose-400">
              Ensemble Agreement Index
            </span>
            <h2 className="text-2xl font-extrabold text-slate-100">
              {consensus_agreement}% Agreement Across Classifiers
            </h2>
            <p className="text-xs text-slate-400">
              {consensus_agreement >= 75
                ? 'High consensus: Algorithms unanimously concord on patient risk classification.'
                : 'Divergent boundary: Non-linear kernel models diverge on borderline metabolic features.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Primary Verdict:</span>
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
              currentResult.is_risk
                ? 'bg-rose-950 border border-rose-500 text-rose-300'
                : 'bg-emerald-950 border border-emerald-500 text-emerald-300'
            }`}
          >
            {currentResult.is_risk ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {currentResult.verdict_text}
          </span>
        </div>
      </div>

      {/* 4 MODEL CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {multi_model_predictions.map((m) => {
          const benchmarkInfo = METRICS_DATA.models[m.modelKey] || METRICS_DATA.models.svm;
          const isDeployed = m.modelKey === 'svm';

          return (
            <div
              key={m.modelKey}
              className={`p-6 rounded-2xl bg-[#0D1322] border transition-all flex flex-col justify-between gap-5 ${
                isDeployed
                  ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className={`w-4 h-4 ${isDeployed ? 'text-rose-400' : 'text-slate-400'}`} />
                    <h3 className="text-base font-bold text-slate-100">{m.modelName}</h3>
                  </div>
                  {isDeployed && (
                    <span className="text-[11px] font-mono font-bold uppercase bg-rose-500 text-white px-2 py-0.5 rounded-full">
                      Primary Deployed
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#080C14] border border-white/5 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Patient Classification
                    </span>
                    <span
                      className={`text-base font-extrabold flex items-center gap-1.5 ${
                        m.isRisk ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {m.isRisk ? 'Elevated Cardiac Risk' : 'Negative / Clear'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Assigned Probability
                    </span>
                    <span className="text-base font-mono font-extrabold text-slate-100">
                      {m.probability}% P(CAD)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1.5 mb-4">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Model Confidence</span>
                    <span className="text-slate-200 font-bold">{m.confidence}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#080C14] rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        m.isRisk
                          ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                          : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                      }`}
                      style={{ width: `${m.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Benchmarks Footer */}
              <div className="pt-3 border-t border-white/5 grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded bg-white/5">
                  <span className="text-[10px] text-slate-400 block">Accuracy</span>
                  <strong className="text-rose-300">{benchmarkInfo.accuracy}%</strong>
                </div>
                <div className="p-2 rounded bg-white/5">
                  <span className="text-[10px] text-slate-400 block">Recall</span>
                  <strong className="text-slate-200">{benchmarkInfo.recall}%</strong>
                </div>
                <div className="p-2 rounded bg-white/5">
                  <span className="text-[10px] text-slate-400 block">Precision</span>
                  <strong className="text-slate-200">{benchmarkInfo.precision}%</strong>
                </div>
                <div className="p-2 rounded bg-white/5">
                  <span className="text-[10px] text-slate-400 block">F1-Score</span>
                  <strong className="text-slate-200">{benchmarkInfo.f1_score}%</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
