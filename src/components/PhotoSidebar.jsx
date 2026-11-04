function CheckIcon() {
  return <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
}

export default function PhotoSidebar({ photos, activeId, inputRef, onActivate, onToggleSelected, onRemove, onAddFiles, onSelectAll, onClear, dragging }) {
  const allSelected = photos.length > 0 && photos.every((photo) => photo.selected)
  return (
    <aside className="rail rail--left">
      <div className="rail-head">
        <h2>照片 <span>{photos.length} 张</span></h2>
        <div className="sidebar-actions">
          <button className="btn btn--quiet" onClick={onSelectAll}>{allSelected ? '取消全选' : '全选'}</button>
          <button className="btn btn--quiet" onClick={onClear}>清空</button>
        </div>
      </div>
      <label className={`drop${dragging ? ' is-over' : ''}`} htmlFor="fileInput">
        <div className="plus">+</div>
        <b>拖入照片或点击选择</b>
        <span>JPG · PNG · WEBP　支持多选</span>
      </label>
      <input ref={inputRef} id="fileInput" type="file" accept="image/*" multiple hidden onChange={(event) => {
        onAddFiles(event.target.files)
        event.target.value = ''
      }} />
      <div className="photo-list">
        {photos.map((photo) => (
          <div
            className="ph"
            key={photo.id}
            data-active={photo.id === activeId}
            tabIndex={0}
            onClick={(event) => {
              if (event.target.closest('.tick')) {
                onToggleSelected(photo.id)
                return
              }
              if (event.target.closest('.del')) return
              onActivate(photo.id)
            }}
            onKeyDown={(event) => {
              if (event.target.closest('button')) return
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onActivate(photo.id)
              }
            }}
          >
            <button className="tick" data-on={photo.selected} role="checkbox" aria-checked={photo.selected} aria-label={`选中 ${photo.name}`} onClick={(event) => { event.stopPropagation(); onToggleSelected(photo.id) }}><CheckIcon /></button>
            <img className="thumb" src={photo.url} alt="" draggable="false" />
            <span className="meta"><b>{photo.name}</b><span>{photo.width} × {photo.height}</span></span>
            <button className="del" aria-label={`移除 ${photo.name}`} onClick={(event) => { event.stopPropagation(); onRemove(photo.id) }}>×</button>
          </div>
        ))}
      </div>
      <div className="rail-foot">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
        图片只在你的浏览器内处理
      </div>
    </aside>
  )
}
