'use client';

interface HeatmapOverlayProps {
  weight: number;
  onClick: () => void;
}

export default function HeatmapOverlay({ weight, onClick }: HeatmapOverlayProps) {
  const size = Math.max(20, weight * 50); // 가중치에 따른 크기 조절
  const opacity = Math.max(0.3, weight); // 가중치에 따른 투명도 조절

  return (
    <div
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: weight > 0.7 ? '#ff4444' : weight > 0.4 ? '#ffaa00' : '#4488ff',
        opacity,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
      }}
    />
  );
}
