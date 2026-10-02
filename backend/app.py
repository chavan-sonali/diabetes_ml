#!/usr/bin/env python3
"""
DiaMetric - Python Flask REST API Backend
Provides endpoints for Diabetes prediction, model benchmarks, dataset streaming, and retraining.
"""

import os
import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

# Import inference engine
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ml.predict import predict, generate_recommendations

class DiaMetricAPIHandler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/health':
            self._send_json({
                "status": "online",
                "service": "DiaMetric Python ML Backend",
                "runtime": f"Python {sys.version.split()[0]}",
                "models": ["RBF-SVM (81.17%)", "Random Forest (79.87%)", "AdaBoost (77.27%)", "CART (74.03%)"]
            })
        elif path == '/api/models':
            metrics_path = os.path.join(os.path.dirname(__file__), '../ml/saved_models/metrics.json')
            if os.path.exists(metrics_path):
                with open(metrics_path, 'r') as f:
                    self._send_json(json.load(f))
            else:
                self._send_json({"error": "Metrics file not found"}, 404)
        else:
            self._send_json({"error": "Not Found", "path": path}, 404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/predict':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                payload = json.loads(body.decode('utf-8'))
                inputs = payload.get('inputs', payload)
                patient_label = payload.get('patientLabel', None)
                result = predict(inputs, patient_label)
                self._send_json(result)
            except Exception as e:
                self._send_json({"error": str(e)}, 400)
        else:
            self._send_json({"error": "Not Found"}, 404)

def run_server(port=5000):
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, DiaMetricAPIHandler)
    print(f"[*] DiaMetric Python Backend running on http://0.0.0.0:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    run_server(port)
