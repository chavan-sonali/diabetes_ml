import React, { useState } from 'react';
import { PredictionResult } from '../types';
import { Copy, Check, Printer, X, FileText } from 'lucide-react';

interface ExportReportModalProps {
  result: PredictionResult;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ result, onClose }) => {
  const [copied, setCopied] = useState(false);

  const reportMarkdown = `
======================================================
DIAMETRIC CLINICAL DIABETES DECISION SUPPORT MEMO
======================================================
Record ID: ${result.id}
Evaluation Timestamp: ${result.timestamp}
Patient Profile: ${result.patientLabel || 'Patient Profile'}
Biological Sex: ${result.raw_inputs.gender === 'male' ? 'Male (Pregnancies = 0)' : result.raw_inputs.gender === 'other' ? 'Other' : 'Female'}
Staging Category: ${result.recommendations.glycemic_status}

DIAGNOSTIC INFERENCE OUTCOME:
------------------------------------------------------
Primary Classification: ${result.is_risk ? 'POSITIVE (Type 2 Diabetes Mellitus Risk)' : 'NEGATIVE (Normoglycemic / Low Risk)'}
SVM Model Confidence: ${result.confidence}%
Assigned Diabetes Probability: ${result.prob_diabetes}%
Assigned Normoglycemic Probability: ${result.prob_no_disease}%
Multi-Classifier Consensus: ${result.consensus_agreement}% Agreement

EVALUATED CLINICAL PARAMETERS:
------------------------------------------------------
- Biological Sex / Gender: ${result.raw_inputs.gender === 'male' ? 'Male' : result.raw_inputs.gender === 'other' ? 'Other' : 'Female'}
- Patient Age: ${result.raw_inputs.age} years
- Total Pregnancies: ${result.raw_inputs.gender === 'male' ? '0 (N/A for Male)' : result.raw_inputs.pregnancies}
- Plasma Glucose Concentration: ${result.raw_inputs.glucose} mg/dL
- Glycated Hemoglobin (HbA1c): ${result.raw_inputs.hba1c}%
- Body Mass Index (BMI): ${result.raw_inputs.bmi.toFixed(1)} kg/m²
- 2-Hour Serum Insulin: ${result.raw_inputs.insulin} μU/mL
- Diabetes Pedigree Function (DPF): ${result.raw_inputs.dpf.toFixed(3)}
- Diastolic Blood Pressure: ${result.raw_inputs.blood_pressure} mm Hg
- Triceps Skinfold Thickness: ${result.raw_inputs.skin_thickness} mm

CLINICAL SAFETY ALERTS & EXERTION CONTRAINDICATIONS:
------------------------------------------------------
${result.recommendations.contraindications.length > 0
  ? result.recommendations.contraindications.map((c, i) => `${i + 1}. ${c}`).join('\n')
  : 'No acute exertion contraindications detected.'}

TARGETED CLINICAL ACTION DIRECTIVES (ADA STANDARDS):
------------------------------------------------------
${result.recommendations.clinical_guidelines.map((g, i) => `${i + 1}. [${g.domain}] ${g.headline}: ${g.clinicalAction}`).join('\n')}

PHYSICAL ACTIVITY & GLUT4 TRANSLOCATION PROTOCOLS:
------------------------------------------------------
${result.recommendations.exercise_cards.map((e, i) => `${i + 1}. [${e.type}] ${e.title}: ${e.protocol}`).join('\n')}

DISCLAIMER: Academic research platform based on PIMA/CDC Diabetes ML repository. Statistical inference only.
======================================================
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-[#0D1322] border border-pink-500/40 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-bold text-slate-100">Clinical Diabetes Evaluation Memo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-300 bg-[#080C14] whitespace-pre-wrap leading-relaxed">
          {reportMarkdown}
        </div>

        <div className="p-4 px-6 border-t border-white/10 flex items-center justify-between gap-3 bg-[#0D1322]">
          <span className="text-xs text-slate-400">Formatted for EHR clinical chart systems</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="btn btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Text'}
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
