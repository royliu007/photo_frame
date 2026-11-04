export default function TopBar({ photoCount, selectedCount, onBatchExport, busy }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="seal">留</div>
        <div className="brand-txt"><b>留白</b><span>LIUBAI STUDIO</span></div>
      </div>
      <div className="vline" />
      <div className="crumb"><b>边框水印工坊</b><i>/</i><em>{photoCount} 张照片</em></div>
      <div className="spacer" />
      <div className="chip"><i />本地处理 · 不上传</div>
      <button className="btn btn--primary" onClick={onBatchExport} disabled={busy}>
        批量导出 <span className="kbd">{selectedCount || '全'}</span>
      </button>
    </header>
  )
}
