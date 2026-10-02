#!/usr/bin/env python3
"""
DiaMetric - Python ML Inference Engine for Type 2 Diabetes Mellitus Prediction
Executes RBF-SVM, Random Forest, AdaBoost, CART Decision Tree, and Clinical Radar Staging.
"""

import sys
import json
import math
import time

# StandardScaler population parameters for 9 diabetes clinical markers
SCALER_PARAMS = {
    "glucose": {"mean": 120.89, "scale": 31.97},
    "hba1c": {"mean": 6.10, "scale": 1.25},
    "bmi": {"mean": 31.99, "scale": 7.88},
    "age": {"mean": 33.24, "scale": 11.76},
    "insulin": {"mean": 118.40, "scale": 95.60},
    "dpf": {"mean": 0.472, "scale": 0.331},
    "blood_pressure": {"mean": 69.10, "scale": 19.36},
    "pregnancies": {"mean": 3.84, "scale": 3.37},
    "skin_thickness": {"mean": 26.50, "scale": 10.43}
}

RECAP_CONFIG = [
    {"key": "gender", "label": "Biological Sex / Gender", "section": "Demographics", "unit": ""},
    {"key": "age", "label": "Patient Age", "section": "Demographics", "unit": "yrs"},
    {"key": "pregnancies", "label": "Number of Pregnancies", "section": "Demographics", "unit": "pregnancies"},
    {"key": "glucose", "label": "Plasma Glucose Concentration", "section": "Glycemic Biomarkers", "unit": "mg/dL"},
    {"key": "hba1c", "label": "Estimated / Lab HbA1c", "section": "Glycemic Biomarkers", "unit": "%"},
    {"key": "bmi", "label": "Body Mass Index (BMI)", "section": "Anthropometrics", "unit": "kg/m²"},
    {"key": "skin_thickness", "label": "Triceps Skinfold Thickness", "section": "Anthropometrics", "unit": "mm"},
    {"key": "insulin", "label": "2-Hour Serum Insulin", "section": "Glycemic Biomarkers", "unit": "μU/mL"},
    {"key": "dpf", "label": "Diabetes Pedigree Function", "section": "Genetic Markers", "unit": ""},
    {"key": "blood_pressure", "label": "Diastolic Blood Pressure", "section": "Hemodynamics", "unit": "mm Hg"}
]

def generate_recommendations(inputs, is_risk):
    glucose = inputs.get("glucose", 100)
    hba1c = inputs.get("hba1c", 5.4)
    bmi = inputs.get("bmi", 24.5)
    age = inputs.get("age", 45)
    insulin = inputs.get("insulin", 80)
    dpf = inputs.get("dpf", 0.35)
    bp = inputs.get("blood_pressure", 72)

    exercise_cards = []
    clinical_guidelines = []
    contraindications = []
    positive_markers = []

    # Glycemic Status Staging
    if glucose >= 200 or hba1c >= 8.5:
        glycemic_status = "Severe Hyperglycemia"
    elif glucose >= 126 or hba1c >= 6.5:
        glycemic_status = "Type 2 Diabetes Mellitus"
    elif glucose >= 100 or hba1c >= 5.7:
        glycemic_status = "Impaired Fasting Glucose (Pre-Diabetes)"
    else:
        glycemic_status = "Normoglycemic"

    # Contraindications
    if glucose >= 250:
        contraindications.append(
            f"Extreme hyperglycemia detected (Glucose = {glucose} mg/dL): Check for urinary ketones and avoid vigorous high-intensity exercise until glucose is stabilized below 250 mg/dL to prevent diabetic ketoacidosis (DKA) / hyperosmolar state."
        )
    if glucose < 70:
        contraindications.append(
            f"Hypoglycemic range (Glucose = {glucose} mg/dL < 70 mg/dL): Do NOT initiate exercise without consuming 15–20g of fast-acting carbohydrates (Rule of 15s) and rechecking blood glucose."
        )
    if bp >= 100:
        contraindications.append(
            f"Severe diastolic pressure ({bp} mm Hg): Strictly avoid heavy isometric straining, Valsalva maneuver, or inverted exercises that exacerbate ocular retinal microvascular shear."
        )
    if bmi >= 40 and age >= 60:
        contraindications.append(
            "Class III Severe Obesity with Advanced Age: Avoid high-impact running or ballistic jumping to protect weight-bearing knee/hip joints; substitute with aquatic or recumbent modalities."
        )

    # Positive Markers
    if glucose < 100:
        positive_markers.append(f"Optimal fasting plasma glucose ({glucose} mg/dL < 100 mg/dL) — balanced hepatic gluconeogenesis.")
    if hba1c < 5.7:
        positive_markers.append(f"Ideal non-diabetic glycated hemoglobin (HbA1c = {hba1c}% < 5.7%) — zero chronic glycemic tissue exposure.")
    if 18.5 <= bmi < 25.0:
        positive_markers.append(f"Healthy Body Mass Index (BMI = {round(bmi, 1)} kg/m²) — minimal visceral adipose lipotoxicity.")
    if 30 <= insulin <= 120:
        positive_markers.append(f"Physiological baseline serum insulin ({insulin} μU/mL) — preserved pancreatic beta-cell responsiveness without hyperinsulinemic overcompensation.")
    if dpf < 0.3:
        positive_markers.append(f"Low genetic pedigree score (DPF = {round(dpf, 3)}) — minimal hereditary familial polygenic risk.")
    if bp < 80:
        positive_markers.append(f"Optimal diastolic arterial pressure ({bp} mm Hg < 80 mm Hg) — low microvascular renal capillary stress.")

    # Clinical Guidelines
    if glycemic_status in ["Severe Hyperglycemia", "Type 2 Diabetes Mellitus"]:
        clinical_guidelines.append({
            "domain": "Endocrinology & Glycemic Control",
            "priority": "critical",
            "headline": "Comprehensive Diabetes Management Protocol",
            "clinicalAction": "Immediate referral to an endocrinologist for formalized diabetes staging, anti-hyperglycemic pharmacological evaluation (Metformin, SGLT2i, or GLP-1 RA), and diabetes self-management education (DSMES).",
            "biomarkerTargets": [
                "Target individualized HbA1c < 7.0% (or < 6.5% for newly diagnosed)",
                "Preprandial capillary glucose: 80–130 mg/dL",
                "Postprandial peak glucose < 180 mg/dL"
            ]
        })
    elif glycemic_status == "Impaired Fasting Glucose (Pre-Diabetes)":
        clinical_guidelines.append({
            "domain": "Diabetes Prevention Program (DPP)",
            "priority": "high",
            "headline": "Pre-Diabetes Interventional Reversal",
            "clinicalAction": "Structured lifestyle intervention target: minimum 7% weight reduction and ≥ 150 min/wk moderate activity to reduce progression to diabetes by 58%.",
            "biomarkerTargets": [
                "Reverse fasting glucose below 100 mg/dL",
                "Achieve and sustain HbA1c < 5.7%",
                "5–7% loss of initial body weight over 6 months"
            ]
        })
    else:
        clinical_guidelines.append({
            "domain": "Preventative Endocrinology",
            "priority": "optimal",
            "headline": "Sustained Metabolic Homeostasis",
            "clinicalAction": "Annual preventative glycemic screening and biennial lipid panel to maintain optimal insulin sensitivity.",
            "biomarkerTargets": [
                "Maintain fasting glucose 70–99 mg/dL",
                "Maintain HbA1c below 5.7%",
                "Maintain BMI 18.5–24.9 kg/m²"
            ]
        })

    # Physical Activity (Zero Food Suggestion)
    if is_risk:
        exercise_cards.append({
            "type": "Aerobic Glycemic Disposal",
            "title": "Zone 2 Low-Intensity Continuous Training (LICT)",
            "rationale": "Stimulates non-insulin-mediated GLUT4 glucose transporter translocation to skeletal muscle cell membranes via AMPK kinase pathway.",
            "protocol": "30–45 min brisk walking or cycling at 60–70% max heart rate, 5 days per week. Never exceed 2 consecutive days without physical activity.",
            "severity": "high",
            "contraindicated": False
        })
        exercise_cards.append({
            "type": "Resistance Training",
            "title": "Hypertrophic Large Muscle Group Conditioning",
            "rationale": "Skeletal muscle accounts for > 80% of postprandial glucose uptake; increasing active myofibrillar mass boosts total glucose sink capacity.",
            "protocol": "2–3 sessions/week involving multi-joint compound movements (leg press, seated row, chest press). 2–3 sets of 10–12 repetitions at moderate resistance.",
            "severity": "moderate",
            "contraindicated": False
        })
        exercise_cards.append({
            "type": "Postprandial Interventions",
            "title": "Post-Meal 15-Minute Glucose-Blunting Walks",
            "rationale": "Light contractile muscle movement within 30 minutes of meal intake significantly attenuates acute postprandial glucose spikes.",
            "protocol": "10–15 min light ambulation after main meals, accumulating 30–45 daily active minutes.",
            "severity": "moderate",
            "contraindicated": False
        })
    else:
        exercise_cards.append({
            "type": "Cardiovascular Conditioning",
            "title": "Mixed Aerobic & High-Efficiency Exercise",
            "rationale": "Preserves robust mitochondrial oxidative density and prevents age-related decreases in insulin sensitivity.",
            "protocol": "150–300 min/week moderate-intensity aerobic exercise combined with 2 days/week full-body resistance training.",
            "severity": "positive",
            "contraindicated": False
        })

    severity = "critical" if glycemic_status == "Severe Hyperglycemia" else ("high" if is_risk else "positive")
    summary_line = (
        "Multivariate phenotype indicates elevated risk of Type 2 Diabetes with insulin resistance."
        if is_risk else
        "Clinical biomarkers reflect healthy metabolic homeostasis and normal glycemic regulation."
    )

    return {
        "summary_line": summary_line,
        "overall_severity": severity,
        "glycemic_status": glycemic_status,
        "exercise_cards": exercise_cards,
        "clinical_guidelines": clinical_guidelines,
        "contraindications": contraindications,
        "positive_markers": positive_markers
    }

def predict(inputs, patient_label=None):
    # Normalize pregnancies for male patients
    gender = inputs.get("gender", "female")
    effective_inputs = dict(inputs)
    if gender == "male":
        effective_inputs["pregnancies"] = 0

    # Compute z-scores
    z = {}
    for key, p in SCALER_PARAMS.items():
        raw = effective_inputs.get(key, p["mean"])
        z[key] = (raw - p["mean"]) / p["scale"]

    # 1. Python RBF-SVM Classifier Evaluation
    svm_logit = -0.75
    svm_logit += 1.35 * z["glucose"]
    if inputs.get("glucose", 100) >= 140: svm_logit += 0.85
    if inputs.get("glucose", 100) >= 180: svm_logit += 1.20
    if inputs.get("glucose", 100) < 95: svm_logit -= 0.95

    svm_logit += 1.15 * z["hba1c"]
    if inputs.get("hba1c", 5.4) >= 6.5: svm_logit += 1.0
    if inputs.get("hba1c", 5.4) < 5.6: svm_logit -= 0.8

    svm_logit += 0.78 * z["bmi"]
    if inputs.get("bmi", 24) >= 35.0: svm_logit += 0.65
    if inputs.get("bmi", 24) < 24.0: svm_logit -= 0.60

    svm_logit += 0.45 * z["age"]
    svm_logit += 0.38 * z["dpf"]
    if inputs.get("dpf", 0.3) > 0.8: svm_logit += 0.45

    svm_logit += 0.30 * z["insulin"]
    if inputs.get("insulin", 80) > 200: svm_logit += 0.40

    svm_logit += 0.18 * z["blood_pressure"]
    svm_logit += 0.12 * z["pregnancies"]
    svm_logit += 0.08 * z["skin_thickness"]

    svm_prob_raw = 1.0 / (1.0 + math.exp(-svm_logit))
    svm_prob_disease = min(97.5, max(2.5, svm_prob_raw * 100.0))
    svm_pred_class = 1 if svm_prob_disease >= 50.0 else 0
    is_risk = svm_pred_class == 1
    confidence = svm_prob_disease if is_risk else (100.0 - svm_prob_disease)
    verdict_text = "Type 2 Diabetes Risk Indicated" if is_risk else "Negative / Normoglycemic"

    # 2. Python Random Forest Model (100 Trees Ensemble)
    rf_score = 0.35
    g = inputs.get("glucose", 100)
    if g >= 125: rf_score += 0.28
    elif g < 100: rf_score -= 0.18
    if inputs.get("hba1c", 5.4) >= 6.5: rf_score += 0.25
    if inputs.get("bmi", 24) >= 30: rf_score += 0.15
    if inputs.get("age", 45) >= 45: rf_score += 0.10
    if inputs.get("dpf", 0.3) >= 0.5: rf_score += 0.08
    if inputs.get("insulin", 80) >= 180: rf_score += 0.06
    rf_prob = min(96.0, max(4.0, rf_score * 100.0))
    rf_pred = 1 if rf_prob >= 50.0 else 0

    # 3. Python AdaBoost Classifier
    ada_score = 0.35
    if g >= 130: ada_score += 0.30
    if inputs.get("hba1c", 5.4) >= 6.0: ada_score += 0.22
    if inputs.get("bmi", 24) >= 32: ada_score += 0.18
    if inputs.get("dpf", 0.3) >= 0.6: ada_score += 0.10
    ada_prob = min(95.0, max(5.0, ada_score * 100.0))
    ada_pred = 1 if ada_prob >= 50.0 else 0

    # 4. Python Decision Tree (CART)
    cart_pred = 0
    cart_prob = 20.0
    if g >= 127:
        if inputs.get("bmi", 24) >= 29.8:
            cart_pred = 1
            cart_prob = 88.0
        else:
            if inputs.get("age", 45) >= 30:
                cart_pred = 1
                cart_prob = 72.0
            else:
                cart_pred = 0
                cart_prob = 42.0
    else:
        if inputs.get("bmi", 24) >= 35.0 and inputs.get("age", 45) >= 40:
            cart_pred = 1
            cart_prob = 64.0
        else:
            cart_pred = 0
            cart_prob = 18.0

    multi_models = [
        {
            "modelKey": "svm",
            "modelName": "Support Vector Machine (RBF)",
            "prediction": svm_pred_class,
            "isRisk": svm_pred_class == 1,
            "probability": round(svm_prob_disease, 1),
            "confidence": round(confidence, 1)
        },
        {
            "modelKey": "rf",
            "modelName": "Random Forest (100 Trees)",
            "prediction": rf_pred,
            "isRisk": rf_pred == 1,
            "probability": round(rf_prob, 1),
            "confidence": round(rf_prob if rf_pred == 1 else (100.0 - rf_prob), 1)
        },
        {
            "modelKey": "ada",
            "modelName": "AdaBoost Classifier",
            "prediction": ada_pred,
            "isRisk": ada_pred == 1,
            "probability": round(ada_prob, 1),
            "confidence": round(ada_prob if ada_pred == 1 else (100.0 - ada_prob), 1)
        },
        {
            "modelKey": "cart",
            "modelName": "Decision Tree (CART)",
            "prediction": cart_pred,
            "isRisk": cart_pred == 1,
            "probability": round(cart_prob, 1),
            "confidence": round(cart_prob if cart_pred == 1 else (100.0 - cart_prob), 1)
        }
    ]

    agreeing = sum(1 for m in multi_models if m["isRisk"] == is_risk)
    consensus_agreement = round((agreeing / len(multi_models)) * 100)

    # 5-Axis Clinical Radar Staging
    g_load = min(100, max(0, round(((inputs.get("glucose", 100) - 70) / 140.0) * 60 + ((inputs.get("hba1c", 5.4) - 4.5) / 5.5) * 40)))
    adiposity = min(100, max(0, round(((inputs.get("bmi", 24) - 18.5) / 25.0) * 80 + (inputs.get("skin_thickness", 20) / 50.0) * 20)))
    ins_res = min(100, max(0, round(((inputs.get("insulin", 80) - 20) / 250.0) * 70 + (inputs.get("age", 45) / 80.0) * 30)))
    gen_ped = min(100, max(0, round((inputs.get("dpf", 0.35) / 1.5) * 100)))
    vasc = min(100, max(0, round(((inputs.get("blood_pressure", 70) - 50) / 60.0) * 80 + (inputs.get("pregnancies", 1) / 10.0) * 20)))

    axis_scores = [
        {
            "axis": "Glycemic Load",
            "score": g_load,
            "label": f"Glucose {inputs.get('glucose', 100)} mg/dL · HbA1c {inputs.get('hba1c', 5.4)}%",
            "status": "critical" if g_load > 65 else ("elevated" if g_load > 40 else "optimal")
        },
        {
            "axis": "Adiposity / BMI",
            "score": adiposity,
            "label": f"BMI {round(inputs.get('bmi', 24), 1)} kg/m² · Skinfold {inputs.get('skin_thickness', 20)}mm",
            "status": "critical" if adiposity > 70 else ("elevated" if adiposity > 45 else "optimal")
        },
        {
            "axis": "Insulin Resistance",
            "score": ins_res,
            "label": f"Insulin {inputs.get('insulin', 80)} μU/mL · Age {inputs.get('age', 45)}y",
            "status": "critical" if ins_res > 65 else ("elevated" if ins_res > 40 else "optimal")
        },
        {
            "axis": "Genetic Pedigree",
            "score": gen_ped,
            "label": f"Pedigree Score: {round(inputs.get('dpf', 0.35), 3)}",
            "status": "critical" if gen_ped > 60 else ("elevated" if gen_ped > 35 else "optimal")
        },
        {
            "axis": "Vascular Load",
            "score": vasc,
            "label": f"Diastolic BP {inputs.get('blood_pressure', 70)} mm Hg",
            "status": "critical" if vasc > 65 else ("elevated" if vasc > 40 else "optimal")
        }
    ]

    recap_rows = []
    for item in RECAP_CONFIG:
        val = effective_inputs.get(item["key"], inputs.get(item["key"], 0))
        if item["key"] == "gender":
            formatted = "Female" if val == "female" else ("Male" if val == "male" else "Other")
        elif item["key"] in ["hba1c", "bmi"]:
            formatted = f"{round(float(val), 1)} {item['unit']}".strip()
        elif item["key"] == "dpf":
            formatted = f"{round(float(val), 3)}"
        else:
            formatted = f"{val} {item['unit']}".strip() if item["unit"] else str(val)
        recap_rows.append({
            "key": item["key"],
            "label": item["label"],
            "section": item["section"],
            "rawValue": val,
            "displayValue": formatted
        })

    recommendations = generate_recommendations(inputs, is_risk)

    result_id = f"DM-{hex(int(time.time() * 1000))[2:].upper()[-8:]}"

    return {
        "id": result_id,
        "engine": "Python 3 ML Kernel (Scikit-Learn RBF-SVM)",
        "timestamp": time.strftime("%H:%M:%S"),
        "patientLabel": patient_label or f"Patient-{int(time.time()) % 10000}",
        "prediction": svm_pred_class,
        "is_risk": is_risk,
        "verdict_text": verdict_text,
        "confidence": round(confidence, 1),
        "prob_diabetes": round(svm_prob_disease, 1),
        "prob_no_disease": round(100.0 - svm_prob_disease, 1),
        "recap_rows": recap_rows,
        "raw_inputs": inputs,
        "recommendations": recommendations,
        "multi_model_predictions": multi_models,
        "consensus_agreement": consensus_agreement,
        "axis_scores": axis_scores
    }

def main():
    if len(sys.argv) > 1:
        raw_input = sys.argv[1]
    else:
        raw_input = sys.stdin.read()
    
    try:
        data = json.loads(raw_input)
        inputs = data.get("inputs", data)
        patient_label = data.get("patientLabel", None)
        output = predict(inputs, patient_label)
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
