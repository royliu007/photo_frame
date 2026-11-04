import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PhotoSidebar from './components/PhotoSidebar.jsx'
import PreviewStage from './components/PreviewStage.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import Toast from './components/Toast.jsx'
import TopBar from './components/TopBar.jsx'
import { INITIAL_STYLE, INITIAL_WATERMARK, PRESETS, styleForPreset } from './data/presets.js'
import { drawFrame } from './lib/canvasRenderer.js'
import { usePhotoLibrary } from './hooks/usePhotoLibrary.js'

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration))

function downloadPhoto(photo, style, watermark, format, presetName) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    drawFrame(canvas, photo, style, watermark)
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(false)
        return
      }
      const base = photo.name.replace(/\.[^.]+$/, '')
      const extension = format === 'png' ? 'png' : 'jpg'
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `留白-${presetName}-${base}.${extension}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 4000)
      resolve(true)
    }, format === 'png' ? 'image/png' : 'image/jpeg', 0.94)
  })
}

export default function App() {
  const toastTimer = useRef(null)
  const demoToastShown = useRef(false)
  const fileInputRef = useRef(null)
  const [toast, setToast] = useState({ message: '', visible: false })
  const [presetId, setPresetId] = useState('gallery')
  const [style, setStyle] = useState(INITIAL_STYLE)
  const [watermark, setWatermark] = useState(INITIAL_WATERMARK)
  const [format, setFormat] = useState('jpeg')
  const [zoom, setZoom] = useState(null)
  const [fitScale, setFitScale] = useState(1)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const preset = useMemo(() => PRESETS.find((item) => item.id === presetId) || PRESETS[0], [presetId])

  const showToast = useCallback((message, duration = 2200) => {
    setToast({ message, visible: true })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast((current) => ({ ...current, visible: false })), duration)
  }, [])

  const library = usePhotoLibrary(showToast)
  const activePhoto = library.photos.find((photo) => photo.id === library.activeId) || null
  const selectedCount = library.photos.filter((photo) => photo.selected).length

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  useEffect(() => {
    if (!demoToastShown.current && library.photos.some((photo) => photo.id === 'demo-0')) {
      demoToastShown.current = true
      showToast('已载入 3 张示例素材，可直接替换为你的照片')
    }
  }, [library.photos, showToast])

  const selectPhoto = useCallback((id) => {
    library.setActiveId(id)
    setZoom(null)
  }, [library.setActiveId])

  const applyPreset = useCallback((id) => {
    const nextPreset = PRESETS.find((item) => item.id === id)
    if (!nextPreset) return
    setPresetId(id)
    setStyle(styleForPreset(nextPreset))
    setWatermark((current) => ({ ...current, ink: nextPreset.ink, pos: nextPreset.pos }))
  }, [])

  const updateStyle = useCallback((patch) => setStyle((current) => ({ ...current, ...patch })), [])
  const updateWatermark = useCallback((patch) => setWatermark((current) => ({ ...current, ...patch })), [])

  const exportCurrent = useCallback(async () => {
    if (!activePhoto) {
      showToast('先添加一张照片')
      return
    }
    showToast('正在导出…', 1200)
    const succeeded = await downloadPhoto(activePhoto, style, watermark, format, preset.name)
    showToast(succeeded ? `已导出 ${activePhoto.name}` : '导出失败，请重试')
  }, [activePhoto, style, watermark, format, preset.name, showToast])

  const exportBatch = useCallback(async () => {
    if (busy) return
    const selected = library.photos.filter((photo) => photo.selected)
    const photosToExport = selected.length ? selected : library.photos
    if (!photosToExport.length) {
      showToast('先添加照片')
      return
    }
    setBusy(true)
    for (let index = 0; index < photosToExport.length; index += 1) {
      const photo = photosToExport[index]
      showToast(`正在导出 ${index + 1} / ${photosToExport.length} · ${photo.name}`, 3000)
      const succeeded = await downloadPhoto(photo, style, watermark, format, preset.name)
      if (!succeeded) showToast(`导出失败：${photo.name}`)
      await wait(420)
    }
    setBusy(false)
    showToast(`已导出 ${photosToExport.length} 张照片`)
  }, [busy, library.photos, showToast, style, watermark, format, preset.name])

  useEffect(() => {
    const onDragEnter = (event) => {
      if (!event.dataTransfer?.types.includes('Files')) return
      event.preventDefault()
      setDragging(true)
    }
    const onDragOver = (event) => {
      if (event.dataTransfer?.types.includes('Files')) event.preventDefault()
    }
    const onDragLeave = (event) => {
      if (!event.relatedTarget || !document.documentElement.contains(event.relatedTarget)) setDragging(false)
    }
    const onDrop = (event) => {
      event.preventDefault()
      setDragging(false)
      if (event.dataTransfer?.files.length) library.addFiles(event.dataTransfer.files)
    }
    const onPaste = (event) => {
      const files = event.clipboardData?.files
      if (files?.length) library.addFiles(files)
    }
    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    window.addEventListener('paste', onPaste)
    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
      window.removeEventListener('paste', onPaste)
    }
  }, [library.addFiles])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target.matches('input, textarea, select, [contenteditable="true"]')) return
      if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && library.photos.length) {
        const index = library.photos.findIndex((photo) => photo.id === library.activeId)
        const offset = event.key === 'ArrowRight' ? 1 : -1
        const next = (index + offset + library.photos.length) % library.photos.length
        selectPhoto(library.photos[next].id)
      }
      if (event.key === 'e' || event.key === 'E') exportCurrent()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [library.photos, library.activeId, selectPhoto, exportCurrent])

  const handlePhotoRemoval = useCallback((id) => {
    if (library.activeId === id) setZoom(null)
    library.removePhoto(id)
  }, [library.activeId, library.removePhoto])

  const handleClear = useCallback(() => {
    library.clearPhotos()
    setZoom(null)
  }, [library.clearPhotos])

  const handleZoom = useCallback((value) => setZoom(value), [])
  const handleFitScale = useCallback((value) => setFitScale(value), [])

  return (
    <div className="app" onDragOver={(event) => { if (event.dataTransfer.types.includes('Files')) event.preventDefault() }}>
      <TopBar photoCount={library.photos.length} selectedCount={selectedCount} onBatchExport={exportBatch} busy={busy} />
      <main className="workspace">
        <PhotoSidebar
          photos={library.photos}
          activeId={library.activeId}
          inputRef={fileInputRef}
          dragging={dragging}
          onActivate={selectPhoto}
          onToggleSelected={library.toggleSelected}
          onRemove={handlePhotoRemoval}
          onAddFiles={library.addFiles}
          onSelectAll={library.toggleSelectAll}
          onClear={handleClear}
        />
        <PreviewStage
          photo={activePhoto}
          style={style}
          watermark={watermark}
          presetName={preset.name}
          zoom={zoom}
          onFitScale={handleFitScale}
          onZoomChange={handleZoom}
          onFit={() => setZoom(null)}
          onPickFiles={() => fileInputRef.current?.click()}
          onExportCurrent={exportCurrent}
          onBatchExport={exportBatch}
          selectedCount={selectedCount}
          busy={busy}
        />
        <SettingsPanel
          presetId={presetId}
          style={style}
          watermark={watermark}
          format={format}
          onPresetChange={applyPreset}
          onStyleChange={updateStyle}
          onWatermarkChange={updateWatermark}
          onFormatChange={setFormat}
          onReset={() => {
            applyPreset(presetId)
            showToast('已恢复该样式的默认参数')
          }}
        />
      </main>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  )
}
