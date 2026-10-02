import React from 'react';
import { Sun, Moon, Activity, Sliders, Layers, BarChart3, LineChart, History, Database } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'result' | 'simulator' | 'consensus' | 'models' | 'insights' | 'dataset' | 'history';
  onNavigate: (tab: 'home' | 'simulator' | 'consensus' | 'models' | 'insights' | 'dataset' | 'history') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigate,
  theme,
  onToggleTheme,
  historyCount,
}) => {
  return (
    <header className="site-header">
      <div className="app-container">
        <div className="header-inner">
          {/* Brand */}
          <div
            className="brand-section"
            onClick={() => onNavigate('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}
          >
            <div className="brand-icon" aria-hidden="true">
              ⚕
            </div>
            <div className="brand-text">
              <span className="brand-name">DiaMetric</span>
              <span className="brand-sub">Clinical Diabetes & Glycemic Suite</span>
            </div>
          </div>

          {/* Navigation and Controls */}
          <div className="header-right-group">
            <nav className="main-nav" aria-label="Main Navigation">
              <button
                type="button"
                className={`nav-link flex items-center gap-1.5 ${
                  activeTab === 'home' || activeTab === 'result' ? 'active' : ''
                }`}
                onClick={() => onNavigate('home')}
                id="nav-home"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Intake & Diagnosis</span>
              </button>
              <button
                type="button"
                className={`nav-link flex items-center gap-1.5 ${
                  activeTab === 'simulator' ? 'active' : ''
                }`}
                onClick={() => onNavigate('simulator')}
                id="nav-simulator"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>What-If Lab</span>
              </button>
              <button
                type="button"
                className={`nav-link flex items-center gap-1.5 ${
                  activeTab === 'consensus' ? 'active' : ''
                }`}
                onClick={() => onNavigate('consensus')}
                id="nav-consensus"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Consensus</span>
              </button>
              <button
                type="button"
                className={`nav-link flex items-center gap-1.5 ${
                  activeTab === 'models' ? 'active' : ''
                }`}
                onClick={() => onNavigate('models')}
                id="nav-models"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Benchmarks</span>
              </button>
              <button
                type="button"
                className={`nav-link flex items-center gap-1.5 ${
                  activeTab === 'insights' ? 'active' : ''
                }`}
                onClick={() => onNavigate('insights')}
                id="nav-insights"
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Insights & PCA</span>
              </button>
              <button
                type="button"
                className={`nav-link flex items-center gap-1.5 ${
                  activeTab === 'dataset' ? 'active' : ''
                }`}
                onClick={() => onNavigate('dataset')}
                id="nav-dataset"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Dataset & CSV</span>
              </button>
              <button
                type="button"
                className={`nav-link flex items-center gap-1.5 ${
                  activeTab === 'history' ? 'active' : ''
                }`}
                onClick={() => onNavigate('history')}
                id="nav-history"
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
                {historyCount > 0 && (
                  <span className="text-[10px] font-mono bg-rose-500 text-white rounded-full px-1.5 py-0.2">
                    {historyCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Dark / Light Mode Switcher */}
            <button
              id="themeToggleBtn"
              className="theme-toggle-btn"
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className="theme-icon-container" aria-hidden="true">
                {theme === 'light' ? (
                  <Sun className="w-4 h-4 text-rose-600" />
                ) : (
                  <Moon className="w-4 h-4 text-rose-400" />
                )}
              </span>
              <span className="theme-toggle-text">
                {theme === 'light' ? 'Light' : 'Dark'}
              </span>
            </button>
          </div>
        </div>

        {/* Pink Glycemic Wave Motif */}
        <div className="vitals-trace-wrap" aria-hidden="true">
          <svg className="vitals-svg vitals-animated" viewBox="0 0 1440 20" preserveAspectRatio="none">
            <polyline
              points="
              0,10 200,10 230,10 250,2 263,18 276,4 289,13 302,10
              520,10 550,10 570,2 583,18 596,4 609,13 622,10
              840,10 870,10 890,2 903,18 916,4 929,13 942,10
              1160,10 1190,10 1210,2 1223,18 1236,4 1249,13 1262,10
              1440,10"
            />
          </svg>
        </div>
      </div>
    </header>
  );
};
