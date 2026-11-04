import { getFrameGeometry } from '../lib/canvasRenderer.js'

export default function WorkspaceToolbar({ photo, style, zoom, fitScale, onZoomChange, onFit, onExportCurrent, onBatchExport, selectedCount, busy }) {
  const geometry = photo ? getFrameGeometry(photo, style) : null
  const currentScale = zoom ?? fitScale
  const changeZoom = (factor) => onZoomChange(Math.min(3, Math.max(0.1, currentScale * factor)))

  return (
    <div className="toolbar">
      <div className="zoom">
        <button onClick={() => changeZoom(1 / 1.2)} aria-label="缩小">−</button>
        <span className="val">{Math.round(currentScale * 100)}%</span>
        <button onClick={() => changeZoom(1.2)} aria-label="放大">+</button>
      </div>
      <button className="btn btn--quiet" onClick={onFit}>适应窗口</button>
      <div className="vline toolbar-vline" />
      <div className="dims">
        <span>{photo ? `${photo.width} × ${photo.height}` : '1600 × 1100'}</span>
        <span className="arrow">→</span>
        <b>{geometry ? `${geometry.width} × ${geometry.height}` : '1836 × 1336'}</b>
        <span className="unit">px</span>
      </div>
      <div className="spacer" />
      <button className="btn btn--ghost" onClick={onExportCurrent} disabled={!photo}>导出当前照片</button>
      <button className="btn btn--primary" onClick={onBatchExport} disabled={busy}>批量导出 <span className="kbd">{selectedCount || '全'}</span></button>
    </div>
  )
}
