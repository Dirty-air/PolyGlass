import { memo } from "react";

interface VolumeBarProps {
  value: number;
  denom: number;
}

/**
 * 轨道+填充 进度条组件
 * @param value - 原始数值
 * @param denom - 全局尺度（p95 或 max）
 */
export const VolumeBar = memo(function VolumeBar({ value, denom }: VolumeBarProps) {
  // clamp 到 0..100，确保不会超出轨道
  const rawPct = denom > 0 ? (value / denom) * 100 : 0;
  const pct = Math.max(0, Math.min(rawPct, 100));

  return (
    // 外层 track：w-full + overflow-hidden 确保填充不会溢出
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
      {/* 内层 fill：不使用 w-full，仅靠 style.width 控制 */}
      <div
        className="h-full rounded-full bg-gradient-to-r from-teal-400 to-indigo-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
});
