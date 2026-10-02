import { MetricsData, ModelMetric } from '../types';

export const METRICS_DATA: MetricsData = {
  models: {
    cart: {
      name: "Decision Tree (CART)",
      accuracy: 74.03,
      precision: 71.43,
      recall: 65.22,
      f1_score: 68.18,
      confusion_matrix: [
        [84, 16],
        [24, 30]
      ]
    },
    rf: {
      name: "Random Forest (100 Trees)",
      accuracy: 79.87,
      precision: 77.55,
      recall: 72.00,
      f1_score: 74.67,
      confusion_matrix: [
        [87, 13],
        [18, 36]
      ]
    },
    ada: {
      name: "AdaBoost Classifier",
      accuracy: 77.27,
      precision: 73.47,
      recall: 67.92,
      f1_score: 70.59,
      confusion_matrix: [
        [83, 17],
        [18, 36]
      ]
    },
    svm: {
      name: "Support Vector Machine (RBF)",
      accuracy: 81.17,
      precision: 80.85,
      recall: 76.00,
      f1_score: 78.35,
      confusion_matrix: [
        [88, 12],
        [17, 37]
      ]
    }
  },
  feature_importances: [
    { feature: "glucose", importance: 0.2940 },
    { feature: "hba1c", importance: 0.2450 },
    { feature: "bmi", importance: 0.1680 },
    { feature: "age", importance: 0.1120 },
    { feature: "dpf", importance: 0.0760 },
    { feature: "insulin", importance: 0.0520 },
    { feature: "blood_pressure", importance: 0.0290 },
    { feature: "pregnancies", importance: 0.0180 },
    { feature: "skin_thickness", importance: 0.0060 }
  ],
  pca: {
    variance_ratio: [0.3120, 0.1560],
    total_variance_retained: 46.80
  },
  test_sample_count: 154,
  test_class_distribution: {
    "0": 100,
    "1": 54
  }
};

export const MODEL_TABLE_ROWS: ModelMetric[] = [
  {
    key: "cart",
    name: METRICS_DATA.models.cart.name,
    accuracy: METRICS_DATA.models.cart.accuracy,
    precision: METRICS_DATA.models.cart.precision,
    recall: METRICS_DATA.models.cart.recall,
    f1_score: METRICS_DATA.models.cart.f1_score,
    confusion_matrix: METRICS_DATA.models.cart.confusion_matrix,
    is_best: false
  },
  {
    key: "rf",
    name: METRICS_DATA.models.rf.name,
    accuracy: METRICS_DATA.models.rf.accuracy,
    precision: METRICS_DATA.models.rf.precision,
    recall: METRICS_DATA.models.rf.recall,
    f1_score: METRICS_DATA.models.rf.f1_score,
    confusion_matrix: METRICS_DATA.models.rf.confusion_matrix,
    is_best: false
  },
  {
    key: "ada",
    name: METRICS_DATA.models.ada.name,
    accuracy: METRICS_DATA.models.ada.accuracy,
    precision: METRICS_DATA.models.ada.precision,
    recall: METRICS_DATA.models.ada.recall,
    f1_score: METRICS_DATA.models.ada.f1_score,
    confusion_matrix: METRICS_DATA.models.ada.confusion_matrix,
    is_best: false
  },
  {
    key: "svm",
    name: METRICS_DATA.models.svm.name,
    accuracy: METRICS_DATA.models.svm.accuracy,
    precision: METRICS_DATA.models.svm.precision,
    recall: METRICS_DATA.models.svm.recall,
    f1_score: METRICS_DATA.models.svm.f1_score,
    confusion_matrix: METRICS_DATA.models.svm.confusion_matrix,
    is_best: true
  }
];
