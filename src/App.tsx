import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { IntakeForm } from './components/IntakeForm';
import { ResultView } from './components/ResultView';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { MultiModelConsensusView } from './components/MultiModelConsensusView';
import { ModelComparisonView } from './components/ModelComparisonView';
import { FeatureInsightsView } from './components/FeatureInsightsView';
import { DatasetExplorerView } from './components/DatasetExplorerView';
import { PatientHistoryView } from './components/PatientHistoryView';
import { PatientInputs, PredictionResult } from './types';
import { predictDiabetes, predictDiabetesAsync } from './utils/predictor';

const INITIAL_PATIENT: PatientInputs = {
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

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'result' | 'simulator' | 'consensus' | 'models' | 'insights' | 'dataset' | 'history'
  >('home');

  const [currentInputs, setCurrentInputs] = useState<PatientInputs>(INITIAL_PATIENT);
  const [predictionResult, setPredictionResult] = useState<PredictionResult>(() =>
    predictDiabetes(INITIAL_PATIENT, 'Sample Patient (Pre-Diabetes Screening)')
  );

  const [history, setHistory] = useState<PredictionResult[]>(() => {
    try {
      const saved = localStorage.getItem('diametric_history_log');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [predictDiabetes(INITIAL_PATIENT, 'Initial Baseline Assessment')];
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('diametric_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('diametric_theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('diametric_history_log', JSON.stringify(history));
    } catch {}
  }, [history]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handlePredict = async (inputs: PatientInputs, patientLabel?: string) => {
    setCurrentInputs(inputs);
    const result = await predictDiabetesAsync(inputs, patientLabel);
    setPredictionResult(result);
    setHistory((prev) => [result, ...prev.slice(0, 19)]); // Keep last 20
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplySimulated = async (modulatedInputs: PatientInputs) => {
    setCurrentInputs(modulatedInputs);
    const result = await predictDiabetesAsync(
      modulatedInputs,
      `Simulated (${new Date().toLocaleTimeString()})`
    );
    setPredictionResult(result);
    setHistory((prev) => [result, ...prev.slice(0, 19)]);
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistorical = (selected: PredictionResult) => {
    setPredictionResult(selected);
    setCurrentInputs(selected.raw_inputs);
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('diametric_history_log');
    } catch {}
  };

  const handleNavigate = (
    tab: 'home' | 'simulator' | 'consensus' | 'models' | 'insights' | 'dataset' | 'history'
  ) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        activeTab={activeTab}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={toggleTheme}
        historyCount={history.length}
      />

      <main className="main-content" id="main-content">
        <div className="app-container">
          {activeTab === 'home' && (
            <IntakeForm onSubmit={handlePredict} initialValues={currentInputs} />
          )}

          {activeTab === 'result' && (
            <ResultView
              result={predictionResult}
              theme={theme}
              onNewAssessment={() => handleNavigate('home')}
              onOpenSimulator={() => handleNavigate('simulator')}
              onOpenConsensus={() => handleNavigate('consensus')}
              onViewBenchmarks={() => handleNavigate('models')}
              onViewInsights={() => handleNavigate('insights')}
            />
          )}

          {activeTab === 'simulator' && (
            <WhatIfSimulator
              initialInputs={currentInputs}
              onApplyToPatient={handleApplySimulated}
            />
          )}

          {activeTab === 'consensus' && (
            <MultiModelConsensusView currentResult={predictionResult} theme={theme} />
          )}

          {activeTab === 'models' && <ModelComparisonView theme={theme} />}

          {activeTab === 'insights' && <FeatureInsightsView theme={theme} />}

          {activeTab === 'dataset' && <DatasetExplorerView />}

          {activeTab === 'history' && (
            <PatientHistoryView
              history={history}
              onSelectPatient={handleSelectHistorical}
              onClearHistory={handleClearHistory}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
