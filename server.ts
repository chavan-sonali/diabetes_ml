import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// 1. Python ML Health & Status Endpoint
app.get('/api/health', (req, res) => {
  const pythonProcess = spawn('python3', ['--version']);
  let pyVersion = 'Python 3';
  pythonProcess.stdout.on('data', (data) => {
    pyVersion = data.toString().trim();
  });
  pythonProcess.on('close', () => {
    res.json({
      status: 'online',
      service: 'DiaMetric Python Full-Stack Clinical Suite',
      backend_engine: 'Python ML Inference Kernel (Scikit-Learn RBF-SVM)',
      runtime: pyVersion,
      models: [
        'Support Vector Machine (RBF) - 81.17%',
        'Random Forest (100 Trees) - 79.87%',
        'AdaBoost Classifier - 77.27%',
        'Decision Tree (CART) - 74.03%',
      ],
      features: 9,
      cohort_size: 818,
    });
  });
});

// 2. Python ML Prediction Endpoint
app.post('/api/predict', (req, res) => {
  const payload = JSON.stringify(req.body);
  const pythonScript = path.join(__dirname, 'ml', 'predict.py');

  const pyProcess = spawn('python3', [pythonScript, payload]);

  let stdoutData = '';
  let stderrData = '';

  pyProcess.stdout.on('data', (data) => {
    stdoutData += data.toString();
  });

  pyProcess.stderr.on('data', (data) => {
    stderrData += data.toString();
  });

  pyProcess.on('close', (code) => {
    if (code !== 0 || !stdoutData) {
      console.error('Python execution error:', stderrData);
      return res.status(500).json({
        error: 'Python inference process failed',
        details: stderrData,
      });
    }

    try {
      const parsed = JSON.parse(stdoutData.trim());
      res.json(parsed);
    } catch (e: any) {
      res.status(500).json({
        error: 'Failed to parse Python ML output',
        raw: stdoutData,
      });
    }
  });
});

// 3. Model Comparison Metrics
app.get('/api/models', (req, res) => {
  const metricsFile = path.join(__dirname, 'ml', 'saved_models', 'metrics.json');
  if (fs.existsSync(metricsFile)) {
    const raw = fs.readFileSync(metricsFile, 'utf-8');
    return res.json(JSON.parse(raw));
  }
  res.status(404).json({ error: 'Metrics file not found' });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[+] DiaMetric Server (Node.js + Python ML Backend) running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
