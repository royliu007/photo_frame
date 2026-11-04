import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { drawBlurBackground, drawFrame } from '../lib/canvasRenderer.js'
import WorkspaceToolbar from './WorkspaceToolbar.jsx'

export default function PreviewStage({ photo, style, watermark, presetName, zoom, onFitScale, onZoomChange, onFit, onPickFiles, onExportCurrent, onBatchExport, selectedCount, busy }) {
  const canvasRef = useRef(null)
  const backgroundCanvasRef = useRef(null)
  const innerRef = useRef(null)
  const [fitScale, setFitScale] = useState(1)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!photo) {
      if (canvas) {
        canvas.width = 10
        canvas.height = 10
      }
      if (backgroundCanvasRef.current) {
        backgroundCanvasRef.current.width = 10
        backgroundCanvasRef.current.height = 10
      }
      return
    }
    if (style.blurBackground) {
      drawBlurBackground(backgroundCanvasRef.current, photo, style, 1500)
    }
    drawFrame(canvas, photo, style, watermark, 1500, { drawBackground: !style.blurBackground })
    setSize({ width: canvas.width, height: canvas.height })
  }, [photo, style, watermark])

  useLayoutEffect(() => {
    const element = innerRef.current
    if (!element) return undefined
    const measure = () => {
      const canvas = canvasRef.current
      if (!canvas?.width || !canvas?.height) return
      const nextScale = Math.min(Math.max(120, element.clientWidth - 12) / canvas.width, Math.max(120, element.clientHeight - 12) / canvas.height)
      setFitScale((current) => Math.abs(current - nextScale) < 0.001 ? current : nextScale)
      onFitScale(nextScale)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    measure()
    return () => observer.disconnect()
  }, [onFitScale, size])

  const scale = zoom ?? fitScale
  const outputWidth = Math.round(size.width * scale)
  const outputHeight = Math.round(size.height * scale)
  const blurPixels = Math.min(outputWidth, outputHeight) * (style.blurStrength || 0)
  const backdropStyle = {
    '--preview-dim': style.darken ?? 0.58,
  }

  return (
    <section className="stage-col">
      <div className="stage">
        <div className="stage-tag"><span>{presetName}</span><span className="tag-divider">·</span><b>{photo ? `${photo.width} × ${photo.height}` : '1600 × 1100'}</b></div>
        <div className="stage-inner" ref={innerRef}>
          {photo && (
            <div className="preview-stack" style={{ width: `${outputWidth}px`, height: `${outputHeight}px` }}>
              {style.blurBackground && (
                <div className="preview-backdrop" style={backdropStyle} aria-hidden="true">
                  <svg className="preview-filter-defs" focusable="false" aria-hidden="true">
                    <filter id="preview-gaussian-blur" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
                      <feGaussianBlur stdDeviation={blurPixels} edgeMode="duplicate" />
                    </filter>
                  </svg>
                  <canvas ref={backgroundCanvasRef} className="preview-background-canvas" />
                  <div className="preview-backdrop-shade" />
                </div>
              )}
              <canvas
                id="preview"
                ref={canvasRef}
                aria-label="边框水印实时预览"
                style={{ width: `${outputWidth}px`, height: `${outputHeight}px` }}
              />
            </div>
          )}
        </div>
        {!photo && (
          <div className="empty">
            <div className="empty-frame"><div className="empty-photo" /></div>
            <h2>把照片放进来</h2>
            <p>拖拽照片到此处，或从本地选择文件开始。所有渲染都在本机完成，不上传任何图片。</p>
            <button className="btn btn--primary" onClick={onPickFiles}>选择照片</button>
          </div>
        )}
      </div>
      <WorkspaceToolbar
        photo={photo}
        style={style}
        zoom={zoom}
        fitScale={fitScale}
        onZoomChange={onZoomChange}
        onFit={onFit}
        onExportCurrent={onExportCurrent}
        onBatchExport={onBatchExport}
        selectedCount={selectedCount}
        busy={busy}
      />
    </section>
  )
}
