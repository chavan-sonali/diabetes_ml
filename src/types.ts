export interface PatientInputs {
  gender?: 'female' | 'male' | 'other'; // Biological sex / Gender
  glucose: number; // Plasma Glucose Concentration (mg/dL) - standard range: 70–250
  hba1c: number; // Glycated Hemoglobin (%) - standard range: 4.5–12.0%
  bmi: number; // Body Mass Index (kg/m²) - standard range: 18.5–55.0
  age: number; // Patient Age (years) - standard range: 18–90
  insulin: number; // 2-Hour Serum Insulin (μU/mL) - standard range: 15–400
  dpf: number; // Diabetes Pedigree Function (genetic score) - range: 0.08–2.42
  blood_pressure: number; // Diastolic Blood Pressure (mm Hg) - range: 50–130
  pregnancies: number; // Number of pregnancies (0–17, 0 for males)
  skin_thickness: number; // Triceps Skinfold Thickness (mm) - range: 5–60
}

export interface RecapRow {
  key: keyof PatientInputs;
  label: string;
  section: string;
  rawValue: number | string;
  displayValue: string;
}

export interface ExerciseCard {
  type: string;
  title: string;
  rationale: string;
  protocol: string;
  severity: 'critical' | 'high' | 'moderate' | 'positive';
  contraindicated: boolean;
}

export interface ClinicalGuideline {
  domain: string;
  priority: 'critical' | 'high' | 'moderate' | 'optimal';
  headline: string;
  clinicalAction: string;
  biomarkerTargets: string[];
}

export interface Recommendations {
  summary_line: string;
  overall_severity: 'critical' | 'high' | 'moderate' | 'positive';
  glycemic_status: 'Normoglycemic' | 'Impaired Fasting Glucose (Pre-Diabetes)' | 'Type 2 Diabetes Mellitus' | 'Severe Hyperglycemia';
  exercise_cards: ExerciseCard[];
  clinical_guidelines: ClinicalGuideline[];
  contraindications: string[];
  positive_markers: string[];
}

export interface ModelPredictionDetail {
  modelKey: string;
  modelName: string;
  prediction: number; // 0 = Negative / Clear, 1 = Positive / Diabetes
  isRisk: boolean;
  probability: number;
  confidence: number;
}

export interface ClinicalAxisScore {
  axis: string;
  score: number; // 0 to 100
  label: string;
  status: 'optimal' | 'moderate' | 'elevated' | 'critical';
}

export interface PredictionResult {
  id: string;
  timestamp: string;
  patientLabel?: string;
  prediction: number; // 0 = Non-Diabetic, 1 = Diabetic
  is_risk: boolean;
  verdict_text: string;
  confidence: number;
  prob_diabetes: number;
  prob_no_disease: number;
  recap_rows: RecapRow[];
  raw_inputs: PatientInputs;
  recommendations: Recommendations;
  multi_model_predictions: ModelPredictionDetail[];
  consensus_agreement: number; // % agreement (e.g. 100%, 75%)
  axis_scores: ClinicalAxisScore[];
}

export interface ModelMetric {
  key: string;
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
  is_best: boolean;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface MetricsData {
  models: Record<string, {
    name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    confusion_matrix: number[][];
  }>;
  feature_importances: FeatureImportance[];
  pca: {
    variance_ratio: number[];
    total_variance_retained: number;
  };
  test_sample_count: number;
  test_class_distribution: {
    '0': number;
    '1': number;
  };
}

export interface DatasetPatient {
  id: number;
  pregnancies: number;
  glucose: number;
  hba1c: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  bmi: number;
  dpf: number;
  age: number;
  outcome: 0 | 1;
}
