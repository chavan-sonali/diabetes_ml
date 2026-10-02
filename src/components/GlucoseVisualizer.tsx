import React, { useEffect, useRef } from 'react';

interface GlucoseVisualizerProps {
  glucose: number; // Fasting / 2-Hr Glucose in mg/dL
  hba1c: number; // HbA1c in %
  insulin: number; // Insulin in μU/mL
  bmi: number;
}

export const GlucoseVisualizer: React.FC<GlucoseVisualizerProps> = ({
  glucose,
  hba1c,
  insulin,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate Time-In-Range (TIR 70–180 mg/dL) estimation
  const estTimeInRange = Math.max(10, Math.min(100, Math.round(100 - (Math.max(0, glucose - 120) * 0.45 + Math.max(0, hba1c - 5.5) * 8))));
  const isHighRisk = glucose >= 140 || hba1c >= 6.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let scanX = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Scale definitions: Y axis from 40 mg/dL (bottom) to 300 mg/dL (top)
      const getY = (val: number) => {
        const clamped = Math.max(40, Math.min(300, val));
        return height - ((clamped - 40) / 260) * height;
      };

      // 1. Draw Target In-Range Zone (70 - 180 mg/dL)
      const y180 = getY(180);
      const y70 = getY(70);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.fillRect(0, y180, width, y70 - y180);

      // Target bounds lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // 180 mg/dL line
      ctx.beginPath();
      ctx.moveTo(0, y180);
      ctx.lineTo(width, y180);
      ctx.stroke();

      // 70 mg/dL line
      ctx.beginPath();
      ctx.moveTo(0, y70);
      ctx.lineTo(width, y70);
      ctx.stroke();

      // Reset dashed line
      ctx.setLineDash([]);

      // Draw horizontal grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      [100, 140, 220].forEach((level) => {
        const y = getY(level);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      });

      // 2. Generate 24-hour diurnal glucose curve based on patient's metrics
      const points: { x: number; y: number; val: number }[] = [];
      const numPoints = 120;
      const baseline = glucose || 110;
      const postprandialAmplitude = Math.max(25, (glucose - 80) * 0.75 + (hba1c - 5.0) * 12);

      for (let i = 0; i <= numPoints; i++) {
        const x = (i / numPoints) * width;
        const hour = (i / numPoints) * 24; // 0:00 to 24:00

        // 3 meal spikes: Breakfast ~ 08:00, Lunch ~ 13:00, Dinner ~ 19:30
        const bFastSpike = Math.exp(-Math.pow(hour - 8.5, 2) / 2.0) * postprandialAmplitude * 1.0;
        const lunchSpike = Math.exp(-Math.pow(hour - 13.5, 2) / 2.5) * postprandialAmplitude * 0.85;
        const dinnerSpike = Math.exp(-Math.pow(hour - 20.0, 2) / 3.0) * postprandialAmplitude * 1.15;
        const dawnPhenomenon = hour >= 4 && hour <= 7 ? (hour - 4) * 4.5 : 0;

        // Mild random physiological micro-fluctuation
        const noise = Math.sin(hour * 3) * 3 + Math.cos(hour * 5) * 2;
        const calculatedGlucose = Math.max(55, baseline + bFastSpike + lunchSpike + dinnerSpike + dawnPhenomenon + noise);

        points.push({ x, y: getY(calculatedGlucose), val: calculatedGlucose });
      }

      // Draw Glucose Trend Area Fill
      ctx.beginPath();
      ctx.moveTo(points[0].x, height);
      for (let i = 0; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.lineTo(points[points.length - 1].x, height);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(236, 72, 153, 0.35)');
      gradient.addColorStop(0.7, 'rgba(236, 72, 153, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw Continuous Glucose Curve Line
      ctx.beginPath();
      ctx.strokeStyle = isHighRisk ? '#EC4899' : '#34D399';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.shadowColor = isHighRisk ? 'rgba(236, 72, 153, 0.6)' : 'rgba(52, 211, 153, 0.5)';
      ctx.shadowBlur = 10;

      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y);
        else ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Animated Real-Time Scan Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw current scan point circle
      const currentPointIdx = Math.min(points.length - 1, Math.floor((scanX / width) * points.length));
      const curPt = points[currentPointIdx];
      if (curPt) {
        ctx.fillStyle = isHighRisk ? '#F472B6' : '#10B981';
        ctx.beginPath();
        ctx.arc(scanX, curPt.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Increment scan line
      scanX = (scanX + 1.2) % width;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [glucose, hba1c, insulin, isHighRisk]);

  return (
    <div className="w-full bg-[#080C14] border border-[#F43F5E]/30 rounded-2xl p-4 shadow-lg flex flex-col gap-2.5">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          <span className="text-xs font-mono font-bold tracking-wider text-rose-400 uppercase">
            24-Hour Continuous Glucose Monitor (CGM) Profile
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
          <span>
            Fasting: <strong className="text-rose-300">{glucose} mg/dL</strong>
          </span>
          <span>
            HbA1c: <strong className="text-rose-300">{hba1c}%</strong>
          </span>
          <span>
            Time in Range (70-180):{' '}
            <strong className={estTimeInRange >= 70 ? 'text-emerald-400' : 'text-rose-400'}>
              {estTimeInRange}%
            </strong>
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full h-[150px] overflow-hidden rounded-xl bg-[#060A10]">
        <canvas ref={canvasRef} width={800} height={150} className="w-full h-full block" />
        <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
          Target Range (70–180 mg/dL)
        </div>
        {glucose >= 180 && (
          <div className="absolute top-2 right-2 px-2.5 py-1 bg-rose-950/80 border border-rose-500/50 rounded text-[11px] font-mono font-bold text-rose-300 backdrop-blur-sm">
            ⚠ Postprandial Excursion Alert
          </div>
        )}
      </div>

      {/* 24-Hour Timeline Markers */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
        <span>00:00 (Fasting)</span>
        <span>08:00 (Breakfast)</span>
        <span>13:00 (Lunch)</span>
        <span>19:30 (Dinner)</span>
        <span>24:00 (Nocturnal)</span>
      </div>
    </div>
  );
};
