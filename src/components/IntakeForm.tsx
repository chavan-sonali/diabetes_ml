import React, { useState } from 'react';
import { PatientInputs } from '../types';
import { Sparkles, Activity, User, Info } from 'lucide-react';

interface IntakeFormProps {
  onSubmit: (inputs: PatientInputs, patientLabel?: string) => void;
  initialValues?: PatientInputs;
}

const DEFAULT_DIABETES_VALUES: PatientInputs = {
  gender: 'female',
  glucose: 125,
  hba1c: 6.2,
  bmi: 29.4,
  age: 45,
  insulin: 110,
  dpf: 0.450,
  blood_pressure: 74,
  pregnancies: 2,
  skin_thickness: 28,
};

const DIABETES_PRESETS: { label: string; description: string; data: PatientInputs; badge: string }[] = [
  {
    label: 'Female with Insulin Resistance & Hyperglycemia (High Risk)',
    description: '52yo female, 4 pregnancies, Fasting Glucose 168 mg/dL, HbA1c 8.1%, BMI 34.5 kg/m²',
    badge: 'High Risk (F)',
    data: {
      gender: 'female',
      glucose: 168,
      hba1c: 8.1,
      bmi: 34.5,
      age: 52,
      insulin: 215,
      dpf: 0.672,
      blood_pressure: 82,
      pregnancies: 4,
      skin_thickness: 35,
    },
  },
  {
    label: 'Male with Metabolic Syndrome & Severe Adiposity (High Risk)',
    description: '54yo male, 0 pregnancies, Glucose 175 mg/dL, HbA1c 8.4%, BMI 36.2 kg/m²',
    badge: 'High Risk (M)',
    data: {
      gender: 'male',
      glucose: 175,
      hba1c: 8.4,
      bmi: 36.2,
      age: 54,
      insulin: 240,
      dpf: 0.720,
      blood_pressure: 88,
      pregnancies: 0,
      skin_thickness: 36,
    },
  },
  {
    label: 'Normoglycemic Active Female (Low Risk)',
    description: '28yo female, 1 pregnancy, Glucose 86 mg/dL, HbA1c 5.0%, BMI 22.4 kg/m²',
    badge: 'Low Risk (F)',
    data: {
      gender: 'female',
      glucose: 86,
      hba1c: 5.0,
      bmi: 22.4,
      age: 28,
      insulin: 55,
      dpf: 0.175,
      blood_pressure: 68,
      pregnancies: 1,
      skin_thickness: 18,
    },
  },
  {
    label: 'Young Active Male (Optimal Homeostasis)',
    description: '25yo male, Glucose 88 mg/dL, HbA1c 5.1%, BMI 23.0 kg/m², low pedigree',
    badge: 'Low Risk (M)',
    data: {
      gender: 'male',
      glucose: 88,
      hba1c: 5.1,
      bmi: 23.0,
      age: 25,
      insulin: 58,
      dpf: 0.160,
      blood_pressure: 64,
      pregnancies: 0,
      skin_thickness: 19,
    },
  },
  {
    label: 'Impaired Fasting Glucose / Pre-Diabetes (Moderate)',
    description: '46yo female, 3 pregnancies, Fasting Glucose 118 mg/dL, HbA1c 5.9%, BMI 28.6 kg/m²',
    badge: 'Pre-Diabetes',
    data: {
      gender: 'female',
      glucose: 118,
      hba1c: 5.9,
      bmi: 28.6,
      age: 46,
      insulin: 125,
      dpf: 0.420,
      blood_pressure: 76,
      pregnancies: 3,
      skin_thickness: 26,
    },
  },
  {
    label: 'Severe Hyperglycemia with High Genetic DPF (Critical)',
    description: '58yo, Glucose 210 mg/dL, HbA1c 9.6%, BMI 39.8 kg/m², high genetic score 1.150',
    badge: 'Critical Risk',
    data: {
      gender: 'female',
      glucose: 210,
      hba1c: 9.6,
      bmi: 39.8,
      age: 58,
      insulin: 340,
      dpf: 1.150,
      blood_pressure: 92,
      pregnancies: 6,
      skin_thickness: 44,
    },
  },
];

export const IntakeForm: React.FC<IntakeFormProps> = ({ onSubmit, initialValues }) => {
  const [formData, setFormData] = useState<PatientInputs>(initialValues || DEFAULT_DIABETES_VALUES);
  const [patientName, setPatientName] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGenderSelect = (gender: 'female' | 'male' | 'other') => {
    setFormData((prev) => ({
      ...prev,
      gender,
      pregnancies: gender === 'male' ? 0 : prev.pregnancies,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'gender'
          ? value
          : type === 'number'
          ? value === ''
            ? ''
            : parseFloat(value)
          : parseInt(value, 10),
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.glucose || formData.glucose < 40 || formData.glucose > 400) {
      newErrors.glucose = 'Plasma glucose must be between 40 and 400 mg/dL.';
    }
    if (!formData.hba1c || formData.hba1c < 4.0 || formData.hba1c > 16.0) {
      newErrors.hba1c = 'HbA1c must be between 4.0% and 16.0%.';
    }
    if (!formData.bmi || formData.bmi < 12.0 || formData.bmi > 70.0) {
      newErrors.bmi = 'BMI must be between 12.0 and 70.0 kg/m².';
    }
    if (!formData.age || formData.age < 18 || formData.age > 120) {
      newErrors.age = 'Age must be between 18 and 120 years.';
    }
    if (formData.dpf === undefined || formData.dpf < 0 || formData.dpf > 3.0) {
      newErrors.dpf = 'Pedigree score must be between 0.0 and 3.0.';
    }
    if (!formData.blood_pressure || formData.blood_pressure < 40 || formData.blood_pressure > 160) {
      newErrors.blood_pressure = 'Diastolic BP must be between 40 and 160 mm Hg.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const normalizedInputs: PatientInputs = {
        ...formData,
        pregnancies: formData.gender === 'male' ? 0 : formData.pregnancies ?? 0,
      };
      onSubmit(normalizedInputs, patientName.trim() || undefined);
    }
  };

  const applyPreset = (preset: (typeof DIABETES_PRESETS)[0]) => {
    setFormData(preset.data);
    setPatientName(preset.label.split('(')[0].trim());
    setErrors({});
  };

  const handleReset = () => {
    setFormData(DEFAULT_DIABETES_VALUES);
    setPatientName('');
    setErrors({});
  };

  const isMale = formData.gender === 'male';

  return (
    <>
      <section className="page-header">
        <div className="page-eyebrow">Endocrinology Intake Console</div>
        <h1 className="page-title">Diabetes Risk Phenotyping</h1>
        <p className="page-subtitle">
          Input standard metabolic biomarkers to assess Type 2 Diabetes Mellitus probability and glycemic
          trajectory. Features are normalized and evaluated via a high-precision Support Vector Machine (RBF
          kernel).
        </p>
      </section>

      {/* QUICK PRESETS STRIP */}
      <div className="p-4 rounded-2xl bg-[#0D1322] border border-pink-500/20 shadow-md mb-6 flex flex-col gap-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-mono font-bold text-pink-400 flex items-center gap-1.5 uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Clinical Vignette Presets:
          </span>
          <span className="text-[11px] text-slate-400">Click to test validated female and male patient profiles</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {DIABETES_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="preset-chip whitespace-nowrap flex items-center gap-2 flex-shrink-0"
              title={preset.description}
            >
              <span>{preset.label}</span>
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  preset.badge.includes('High') || preset.badge.includes('Critical')
                    ? 'bg-pink-950 text-pink-300'
                    : preset.badge.includes('Low')
                    ? 'bg-emerald-950 text-emerald-300'
                    : 'bg-amber-950 text-amber-300'
                }`}
              >
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-container" noValidate id="diabetesPredictionForm">
        {/* PATIENT IDENTIFIER & GENDER BANNER */}
        <div className="p-4 rounded-xl bg-[#0D1322] border border-white/10 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <User className="w-4 h-4 text-pink-400" />
            <span>Patient Identifier / Alias (Optional):</span>
          </div>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="e.g. Patient Case #204 / Jane Doe"
            className="form-input max-w-sm text-xs py-1.5"
          />
        </div>

        {/* SECTION 01: GLYCEMIC & METABOLIC BIOMARKERS */}
        <fieldset className="intake-section">
          <div className="section-header">
            <span className="section-num">01</span>
            <legend className="section-title">Glycemic Biomarkers</legend>
            <span className="section-desc">Primary diagnostic indicators</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="id_glucose" className="form-label">
                <span>Plasma Glucose Concentration</span>
                <span className="req-star">Required</span>
              </label>
              <input
                type="number"
                id="id_glucose"
                name="glucose"
                min="40"
                max="400"
                value={formData.glucose}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 125"
                required
              />
              <p className="form-help">2-hr oral glucose tolerance test / fasting level in mg/dL (Normal &lt; 100).</p>
              {errors.glucose && <div className="form-errors">{errors.glucose}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="id_hba1c" className="form-label">
                <span>Estimated / Lab HbA1c (%)</span>
                <span className="req-star">Required</span>
              </label>
              <input
                type="number"
                step="0.1"
                id="id_hba1c"
                name="hba1c"
                min="4.0"
                max="16.0"
                value={formData.hba1c}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 6.2"
                required
              />
              <p className="form-help">Glycated hemoglobin % (Normal &lt; 5.7%, Pre-DM: 5.7–6.4%, DM ≥ 6.5%).</p>
              {errors.hba1c && <div className="form-errors">{errors.hba1c}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="id_insulin" className="form-label">
                <span>2-Hour Serum Insulin</span>
                <span className="req-star">Required</span>
              </label>
              <input
                type="number"
                id="id_insulin"
                name="insulin"
                min="0"
                max="900"
                value={formData.insulin}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 110"
                required
              />
              <p className="form-help">2-hour post-glucose serum insulin in μU/mL (typical range: 15–300).</p>
              {errors.insulin && <div className="form-errors">{errors.insulin}</div>}
            </div>
          </div>
        </fieldset>

        {/* SECTION 02: ANTHROPOMETRICS & BODY COMPOSITION */}
        <fieldset className="intake-section">
          <div className="section-header">
            <span className="section-num">02</span>
            <legend className="section-title">Anthropometrics & Body Composition</legend>
            <span className="section-desc">Adiposity and physical parameters</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="id_bmi" className="form-label">
                <span>Body Mass Index (BMI)</span>
                <span className="req-star">Required</span>
              </label>
              <input
                type="number"
                step="0.1"
                id="id_bmi"
                name="bmi"
                min="12.0"
                max="70.0"
                value={formData.bmi}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 29.4"
                required
              />
              <p className="form-help">Weight in kg / (height in m)² (Normal: 18.5–24.9, Overweight ≥ 25, Obese ≥ 30).</p>
              {errors.bmi && <div className="form-errors">{errors.bmi}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="id_skin_thickness" className="form-label">
                <span>Triceps Skinfold Thickness</span>
                <span className="req-star">Required</span>
              </label>
              <input
                type="number"
                id="id_skin_thickness"
                name="skin_thickness"
                min="0"
                max="99"
                value={formData.skin_thickness}
                onChange={handleChange}
                className="form-input"
                placeholder="mm (e.g. 28)"
                required
              />
              <p className="form-help">Triceps skinfold measurement in mm (subcutaneous adiposity marker).</p>
              {errors.skin_thickness && <div className="form-errors">{errors.skin_thickness}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="id_blood_pressure" className="form-label">
                <span>Diastolic Blood Pressure</span>
                <span className="req-star">Required</span>
              </label>
              <input
                type="number"
                id="id_blood_pressure"
                name="blood_pressure"
                min="40"
                max="160"
                value={formData.blood_pressure}
                onChange={handleChange}
                className="form-input"
                placeholder="mm Hg (e.g. 74)"
                required
              />
              <p className="form-help">Diastolic resting blood pressure in mm Hg (optimal &lt; 80 mm Hg).</p>
              {errors.blood_pressure && <div className="form-errors">{errors.blood_pressure}</div>}
            </div>
          </div>
        </fieldset>

        {/* SECTION 03: DEMOGRAPHICS & CLINICAL HISTORY */}
        <fieldset className="intake-section">
          <div className="section-header">
            <span className="section-num">03</span>
            <legend className="section-title">Demographics & Clinical History</legend>
            <span className="section-desc">Sex, chronological age, pregnancy history, and familial pedigree</span>
          </div>
          <div className="form-grid">
            
            {/* GENDER / BIOLOGICAL SEX SELECTOR */}
            <div className="form-group">
              <label className="form-label">
                <span>Biological Sex / Gender</span>
                <span className="req-star">Required</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/20 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => handleGenderSelect('female')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    formData.gender === 'female' || !formData.gender
                      ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>♀ Female</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderSelect('male')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    formData.gender === 'male'
                      ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>♂ Male</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderSelect('other')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    formData.gender === 'other'
                      ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>⚧ Other</span>
                </button>
              </div>
              <p className="form-help">Selecting Male automatically sets pregnancies to 0.</p>
            </div>

            {/* PATIENT AGE */}
            <div className="form-group">
              <label htmlFor="id_age" className="form-label">
                <span>Patient Age</span>
                <span className="req-star">Required</span>
              </label>
              <input
                type="number"
                id="id_age"
                name="age"
                min="18"
                max="120"
                value={formData.age}
                onChange={handleChange}
                className="form-input"
                placeholder="years (e.g. 45)"
                required
              />
              <p className="form-help">Chronological age in years (dataset typical range: 21–81).</p>
              {errors.age && <div className="form-errors">{errors.age}</div>}
            </div>

            {/* NUMBER OF PREGNANCIES */}
            <div className="form-group">
              <label htmlFor="id_pregnancies" className="form-label">
                <span>Number of Pregnancies</span>
                {isMale ? (
                  <span className="text-[10px] font-mono text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded">
                    N/A (Male = 0)
                  </span>
                ) : (
                  <span className="req-star">Required</span>
                )}
              </label>
              {isMale ? (
                <div className="p-2.5 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-mono text-slate-300">
                    <Info className="w-3.5 h-3.5 text-pink-400" /> 0 Pregnancies (Locked for Male)
                  </span>
                  <span className="text-[10px] text-pink-300 font-semibold">Automatic 0 gravidity</span>
                </div>
              ) : (
                <>
                  <input
                    type="number"
                    id="id_pregnancies"
                    name="pregnancies"
                    min="0"
                    max="20"
                    value={formData.pregnancies}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. 2"
                    required
                  />
                  <p className="form-help">Total gravidity / pregnancies (0 for nulliparous; elevated count increases risk).</p>
                </>
              )}
            </div>

            {/* DIABETES PEDIGREE FUNCTION */}
            <div className="form-group">
              <label htmlFor="id_dpf" className="form-label">
                <span>Diabetes Pedigree Function (DPF)</span>
                <span className="req-star">Required</span>
              </label>
              <input
                type="number"
                step="0.001"
                id="id_dpf"
                name="dpf"
                min="0.0"
                max="3.0"
                value={formData.dpf}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 0.450"
                required
              />
              <p className="form-help">Family history genetic susceptibility score (typical range: 0.08–2.42).</p>
              {errors.dpf && <div className="form-errors">{errors.dpf}</div>}
            </div>

          </div>
        </fieldset>

        {/* ACTION BAR */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" id="btnSubmitDiabetesPrediction">
            <Activity className="w-4 h-4 mr-1 inline" /> Execute SVM Diabetes Inference
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleReset} id="btnClear">
            Reset All
          </button>
        </div>
      </form>
    </>
  );
};
