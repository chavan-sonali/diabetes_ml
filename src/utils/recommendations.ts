import { ExerciseCard, ClinicalGuideline, Recommendations, PatientInputs } from '../types';

export function generateDiabetesRecommendations(inputs: PatientInputs, is_risk: boolean): Recommendations {
  const glucose = inputs.glucose ?? 100;
  const hba1c = inputs.hba1c ?? 5.4;
  const bmi = inputs.bmi ?? 24.5;
  const age = inputs.age ?? 45;
  const insulin = inputs.insulin ?? 80;
  const dpf = inputs.dpf ?? 0.35;
  const bp = inputs.blood_pressure ?? 72;

  const exercise_cards: ExerciseCard[] = [];
  const clinical_guidelines: ClinicalGuideline[] = [];
  const contraindications: string[] = [];
  const positive_markers: string[] = [];

  // Glycemic Status Classification (ADA Standards of Care)
  let glycemic_status: Recommendations['glycemic_status'] = 'Normoglycemic';
  if (glucose >= 200 || hba1c >= 8.5) {
    glycemic_status = 'Severe Hyperglycemia';
  } else if (glucose >= 126 || hba1c >= 6.5) {
    glycemic_status = 'Type 2 Diabetes Mellitus';
  } else if (glucose >= 100 || hba1c >= 5.7) {
    glycemic_status = 'Impaired Fasting Glucose (Pre-Diabetes)';
  } else {
    glycemic_status = 'Normoglycemic';
  }

  // 1. CLINICAL CONTRAINDICATIONS & SAFETY LIMITS
  if (glucose >= 250) {
    contraindications.push(
      `Extreme hyperglycemia detected (Glucose = ${glucose} mg/dL): Check for urinary ketones and avoid vigorous high-intensity exercise until glucose is stabilized below 250 mg/dL to prevent diabetic ketoacidosis (DKA) / hyperosmolar state.`
    );
  }
  if (glucose < 70) {
    contraindications.push(
      `Hypoglycemic range (Glucose = ${glucose} mg/dL < 70 mg/dL): Do NOT initiate exercise without consuming 15–20g of fast-acting carbohydrates (Rule of 15s) and rechecking blood glucose.`
    );
  }
  if (bp >= 100) {
    contraindications.push(
      `Severe diastolic pressure (${bp} mm Hg): Strictly avoid heavy isometric straining, Valsalva maneuver, or inverted exercises that exacerbate ocular retinal microvascular shear.`
    );
  }
  if (bmi >= 40 && age >= 60) {
    contraindications.push(
      "Class III Severe Obesity with Advanced Age: Avoid high-impact running or ballistic jumping to protect weight-bearing knee/hip joints; substitute with aquatic or recumbent modalities."
    );
  }

  // 2. POSITIVE BIOMARKERS
  if (glucose < 100) {
    positive_markers.push(
      `Optimal fasting plasma glucose (${glucose} mg/dL < 100 mg/dL) — balanced hepatic gluconeogenesis.`
    );
  }
  if (hba1c < 5.7) {
    positive_markers.push(
      `Ideal non-diabetic glycated hemoglobin (HbA1c = ${hba1c}% < 5.7%) — zero chronic glycemic tissue exposure.`
    );
  }
  if (bmi >= 18.5 && bmi < 25.0) {
    positive_markers.push(
      `Healthy Body Mass Index (BMI = ${bmi.toFixed(1)} kg/m²) — minimal visceral adipose lipotoxicity.`
    );
  }
  if (insulin >= 30 && insulin <= 120) {
    positive_markers.push(
      `Physiological baseline serum insulin (${insulin} μU/mL) — preserved pancreatic beta-cell responsiveness without hyperinsulinemic overcompensation.`
    );
  }
  if (dpf < 0.3) {
    positive_markers.push(
      `Low genetic pedigree score (DPF = ${dpf.toFixed(3)}) — minimal hereditary familial polygenic risk.`
    );
  }
  if (bp < 80) {
    positive_markers.push(
      `Optimal diastolic arterial pressure (${bp} mm Hg < 80 mm Hg) — low microvascular renal capillary stress.`
    );
  }

  // 3. TARGETED CLINICAL ACTION DIRECTIVES
  if (glycemic_status === 'Severe Hyperglycemia' || glycemic_status === 'Type 2 Diabetes Mellitus') {
    clinical_guidelines.push({
      domain: "Endocrinology & Glycemic Control",
      priority: "critical",
      headline: "Comprehensive Diabetes Management Protocol",
      clinicalAction: "Immediate referral to an endocrinologist for formalized diabetes staging, anti-hyperglycemic pharmacological evaluation (Metformin, SGLT2i, or GLP-1 RA), and diabetes self-management education (DSMES).",
      biomarkerTargets: [
        "Target individualized HbA1c < 7.0% (or < 6.5% for newly diagnosed)",
        "Preprandial capillary glucose: 80–130 mg/dL",
        "Postprandial peak glucose < 180 mg/dL",
      ],
    });
  } else if (glycemic_status === 'Impaired Fasting Glucose (Pre-Diabetes)') {
    clinical_guidelines.push({
      domain: "Diabetes Prevention Program (DPP)",
      priority: "high",
      headline: "Pre-Diabetes Interventional Reversal",
      clinicalAction: "Initiate structured lifestyle modification targeting 5–7% sustained body weight reduction and 150 min/week moderate physical exertion to halt progression to overt diabetes.",
      biomarkerTargets: [
        `Target Fasting Glucose < 100 mg/dL (current: ${glucose} mg/dL)`,
        `Target HbA1c < 5.7% (current: ${hba1c}%)`,
        "Repeat Oral Glucose Tolerance Test (OGTT) in 6 months",
      ],
    });
  }

  if (bmi >= 28.0) {
    clinical_guidelines.push({
      domain: "Adiposity & Insulin Resistance",
      priority: bmi >= 35 ? "critical" : "high",
      headline: "Visceral Fat & Metabolic De-Stressing",
      clinicalAction: "Address adiposity-induced peripheral insulin resistance in skeletal muscle and liver tissue through negative energy balance and resistance conditioning.",
      biomarkerTargets: [
        `Achieve 5–10% body mass reduction (Current BMI: ${bmi.toFixed(1)} kg/m²)`,
        "Target waist circumference < 94 cm (men) / < 80 cm (women)",
        "Assess baseline liver enzymes (ALT/AST) for MASLD / hepatic steatosis",
      ],
    });
  }

  if (is_risk || dpf > 0.6) {
    clinical_guidelines.push({
      domain: "Microvascular & End-Organ Surveillance",
      priority: "high",
      headline: "Target Organ Damage Screening",
      clinicalAction: "Annual surveillance for microvascular diabetic complications: dilated retinal fundoscopy, urinary albumin-to-creatinine ratio (uACR), and monofilament foot sensory testing.",
      biomarkerTargets: [
        "Urinary Albumin-to-Creatinine Ratio (uACR) < 30 mg/g",
        "Annual dilated comprehensive eye examination (DR screening)",
        "Comprehensive 10g Semmes-Weinstein monofilament neuropathy check",
      ],
    });
  }

  if (clinical_guidelines.length === 0) {
    clinical_guidelines.push({
      domain: "Preventive Metabolic Longevity",
      priority: "optimal",
      headline: "Normoglycemic Maintenance & Annual Screening",
      clinicalAction: "All metabolic parameters are within ideal physiological thresholds. Maintain high physical activity and repeat annual glycemic testing.",
      biomarkerTargets: [
        "Maintain fasting glucose < 100 mg/dL and HbA1c < 5.7%",
        "Annual fasting lipid and metabolic panel",
      ],
    });
  }

  // 4. PHYSICAL ACTIVITY PROTOCOLS FOR DIABETES & GLUT4 UPREGULATION
  const hasSevereRestriction = (glucose >= 250 || glucose < 70 || bp >= 100);

  if (hasSevereRestriction) {
    exercise_cards.push({
      type: "Clinical Exertion Precaution",
      title: "Medically Monitored Glycemic Restabilization",
      rationale: `Out-of-range metabolic parameter detected (${glucose >= 250 ? `Glucose=${glucose} mg/dL` : glucose < 70 ? `Hypoglycemia ${glucose} mg/dL` : `BP=${bp} mm Hg`}). Strenuous physical training presents acute metabolic or hemodynamic decompensation risk.`,
      protocol: "Stabilize blood glucose within 100–180 mg/dL range prior to initiation. Light seated stretching or slow flat walking for 10 minutes only after verifying stable capillary readings.",
      severity: "critical",
      contraindicated: true,
    });
  }

  // Postprandial GLUT4 walk protocol (Universal diabetes intervention)
  exercise_cards.push({
    type: "Postprandial Glycemic Clearing",
    title: "15-Minute Post-Meal Muscular Glucose Extraction",
    rationale: "Contracting skeletal muscles trigger insulin-independent GLUT4 transporter translocation to the cell membrane, clearing circulating glucose without demanding extra beta-cell insulin secretion.",
    protocol: "10–15 minutes of continuous brisk walking initiated 20–30 minutes after major meals. Proven to reduce postprandial glucose peaks by up to 25–40%.",
    severity: is_risk ? "high" : "positive",
    contraindicated: false,
  });

  if (bmi >= 25.0 || is_risk) {
    exercise_cards.push({
      type: "Insulin Sensitivity Conditioning",
      title: "Progressive Hypertrophy & Muscle Mass Sarcopenia Defense",
      rationale: "Skeletal muscle accounts for > 80% of all postprandial glucose disposal in the human body. Increasing lean muscle mass creates a larger glucose sink.",
      protocol: "2–3 sessions weekly of multi-joint resistance exercises (leg press, seated row, chest press, lat pulldowns) at 65–75% 1RM for 2–3 sets of 10–12 repetitions. Rest 90 seconds between sets.",
      severity: "moderate",
      contraindicated: false,
    });
  }

  if (!hasSevereRestriction) {
    if (is_risk) {
      exercise_cards.push({
        type: "Mitochondrial Aerobic Protocol",
        title: "Zone 2 Steady-State Lipid & Glucose Oxidation",
        rationale: "Sustained Zone 2 cardio stimulates mitochondrial biogenesis, increasing fat oxidation capacity and alleviating intramuscular lipid accumulation that blocks insulin receptors.",
        protocol: "30–45 minutes of continuous low-impact cycling, incline walking, or rowing, 4–5 days/week at 60–70% maximum heart rate (conversational pace).",
        severity: "moderate",
        contraindicated: false,
      });
    } else {
      exercise_cards.push({
        type: "Metabolic Fitness & Longevity",
        title: "Combined Moderate-to-Vigorous Interval & Strength Training",
        rationale: "Preserves high insulin sensitivity, robust mitochondrial enzyme activity, and ideal body composition.",
        protocol: "150–300 minutes of moderate aerobic activity weekly + 2 weekly full-body strength sessions adhering to ADA/ACSM guidelines.",
        severity: "positive",
        contraindicated: false,
      });
    }
  }

  // 5. OVERALL SEVERITY & CLINICAL DIRECTIVE
  let overall_severity: 'critical' | 'high' | 'moderate' | 'positive';
  let summary_line: string;

  if (glucose >= 200 || hba1c >= 8.5 || (is_risk && bmi >= 38)) {
    overall_severity = "critical";
    summary_line =
      "High-Priority Clinical Action Required: Pronounced hyperglycemia and metabolic syndrome markers present. Consult an endocrinologist for comprehensive diagnostic confirmation and pharmacological management.";
  } else if (is_risk || glucose >= 126 || hba1c >= 6.5 || bmi >= 32.0 || dpf >= 1.0) {
    overall_severity = "high";
    summary_line =
      "Significant Diabetes Risk Profile: Measured biomarkers indicate impaired glucose tolerance and marked insulin resistance. Implement structured lifestyle interventions and targeted medical monitoring.";
  } else if (glucose >= 100 || hba1c >= 5.7 || bmi >= 25.0 || age >= 55) {
    overall_severity = "moderate";
    summary_line =
      "Pre-Diabetes / Borderline Metabolic Alert: Early insulin resistance and borderline glycemic levels detected. Early intervention can successfully restore normoglycemia.";
  } else {
    overall_severity = "positive";
    summary_line =
      "Optimal Normoglycemic Profile: Key metabolic indicators demonstrate healthy insulin sensitivity and robust beta-cell homeostasis.";
  }

  return {
    summary_line,
    overall_severity,
    glycemic_status,
    exercise_cards,
    clinical_guidelines,
    contraindications,
    positive_markers,
  };
}
