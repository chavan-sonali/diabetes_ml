import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="app-container">
        <div className="footer-inner">
          <p className="disclaimer-text">
            <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              DiaMetric Academic Research Platform.
            </strong>{' '}
            Developed for clinical machine learning laboratory research. Model classifications and
            continuous glucose monitor simulations are statistical risk stratifications, not medical
            diagnoses. Consult an endocrinologist for clinical management.
          </p>
          <div className="footer-meta">
            <div>PIMA & CDC Diabetes Cohort · 818 observations</div>
            <div style={{ color: 'var(--pink-light)', fontWeight: 600 }}>
              RBF-SVM · 81.17% Benchmark Accuracy
            </div>
            <div>
              <a
                href="/explain.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-rose-400 transition-colors text-slate-400 font-mono text-[11px]"
              >
                📄 Architecture & ML Specs (explain.html)
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
