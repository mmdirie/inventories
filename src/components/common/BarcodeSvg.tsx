import React from 'react';

interface BarcodeSvgProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
}

/**
 * Generates an SVG Barcode pattern based on the alphanumeric code
 */
export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  value,
  width = 160,
  height = 50,
  showText = true,
  className = '',
}) => {
  // Simple deterministic Code-128 style bar width generator
  const bars: { x: number; width: number }[] = [];
  let currentX = 10;
  
  // Start pattern
  bars.push({ x: currentX, width: 2 });
  currentX += 3;
  bars.push({ x: currentX, width: 1 });
  currentX += 2;
  bars.push({ x: currentX, width: 3 });
  currentX += 5;

  // Encode characters
  const cleanVal = (value || '0000000000').toUpperCase();
  for (let i = 0; i < cleanVal.length; i++) {
    const code = cleanVal.charCodeAt(i);
    const b1 = (code % 3) + 1;
    const b2 = ((code >> 1) % 2) + 1;
    const b3 = ((code >> 2) % 3) + 1;

    bars.push({ x: currentX, width: b1 });
    currentX += b1 + 1;
    bars.push({ x: currentX, width: b2 });
    currentX += b2 + 2;
    bars.push({ x: currentX, width: b3 });
    currentX += b3 + 1;
  }

  // Stop pattern
  bars.push({ x: currentX, width: 3 });
  currentX += 4;
  bars.push({ x: currentX, width: 1 });
  currentX += 2;
  bars.push({ x: currentX, width: 2 });
  currentX += 10;

  const totalWidth = Math.max(width, currentX);

  return (
    <div className={`inline-flex flex-col items-center bg-white p-1.5 rounded border border-slate-200 ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full h-auto max-h-12"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width={totalWidth} height={height} fill="#FFFFFF" />
        {bars.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y={2}
            width={bar.width}
            height={height - (showText ? 14 : 4)}
            fill="#0F172A"
          />
        ))}
      </svg>
      {showText && (
        <span className="font-mono text-[10px] tracking-widest text-slate-700 font-semibold mt-0.5 select-all">
          {value}
        </span>
      )}
    </div>
  );
};
