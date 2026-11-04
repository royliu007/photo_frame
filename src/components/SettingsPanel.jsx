import { PRESETS } from '../data/presets.js'
import { CAMERA_BRANDS } from '../data/cameraBrands.js'

function SectionHeading({ title, subtitle }) {
  return <div className="sec-head"><h3>{title}</h3><span>{subtitle}</span></div>
}

function RangeField({ id, label, value, min, max, step, onChange, suffix = '%' }) {
  const display = Math.round(value * 10) / 10
  return (
    <div className="field">
      <div className="field-top"><label htmlFor={id}>{label}</label><em>{display}{suffix}</em></div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  )
}

function Toggle({ label, checked, onChange, className = 'row', disabled = false }) {
  return <button type="button" className={className} role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}><span className="lbl">{label}</span><span className="switch" /></button>
}

function PresetGrid({ presetId, onSelect }) {
  return (
    <div className="presets">
      {PRESETS.map((preset) => {
        const top = preset.border / 2.2
        const bottom = preset.bottom / 2.2
        return (
          <button className="preset" key={preset.id} aria-pressed={preset.id === presetId} onClick={() => onSelect(preset.id)}>
            <div className={`mini${preset.blurBackground ? ' is-blur' : ''}`} style={{ background: preset.bg }}>
              <span className={`ph-in${preset.dark ? ' dark' : ''}`} style={{ left: `${top}%`, right: `${top}%`, top: `${top}%`, bottom: `${top + bottom}%`, borderRadius: preset.radius > 1.4 ? 3 : undefined }} />
            </div>
            <b>{preset.name}</b><small>{preset.note}</small>
          </button>
        )
      })}
    </div>
  )
}

function SpacingSection({ style, onStyleChange }) {
  const swatches = [
    { color: '#FFFFFF', label: '纸白' },
    { color: '#FAF7F0', label: '象牙' },
    { color: '#F1EDE4', label: '暖灰' },
    { color: '#14130F', label: '墨黑' },
  ]
  return (
    <div className="sec">
      <SectionHeading title="留白与底色" subtitle="Spacing" />
      <RangeField id="borderRange" label="留白宽度" value={style.border} min={0} max={20} step={0.5} onChange={(border) => onStyleChange({ border })} />
      <RangeField id="bottomRange" label="下方留白" value={style.bottom} min={0} max={28} step={0.5} onChange={(bottom) => onStyleChange({ bottom })} />
      <RangeField id="radiusRange" label="圆角" value={style.radius} min={0} max={8} step={0.2} onChange={(radius) => onStyleChange({ radius })} />
      <div className="field">
        <div className="field-top"><label>底色</label></div>
        <div className="swatches">
          {swatches.map(({ color, label }) => <button key={color} type="button" className="sw" data-on={style.bg.toLowerCase() === color.toLowerCase()} style={{ background: color }} aria-label={label} onClick={() => onStyleChange({ bg: color })} />)}
          <label className="sw-pick" title="自定义颜色">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18" /></svg>
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(style.bg) ? style.bg : '#ffffff'} onChange={(event) => onStyleChange({ bg: event.target.value })} />
          </label>
        </div>
      </div>
      <Toggle label="压边细线" checked={style.hairline} onChange={(hairline) => onStyleChange({ hairline })} />
      <Toggle label="投影" checked={style.shadow > 0} onChange={(enabled) => onStyleChange({ shadow: enabled ? 0.7 : 0 })} />
    </div>
  )
}

function BlurSection({ style, onStyleChange }) {
  if (!style.blurBackground) return null
  return (
    <div className="sec">
      <SectionHeading title="背景模糊" subtitle="Blur" />
      <RangeField
        id="blurStrengthRange"
        label="模糊程度"
        value={style.blurStrength * 100}
        min={0}
        max={12}
        step={0.5}
        onChange={(value) => onStyleChange({ blurStrength: value / 100 })}
      />
      <RangeField
        id="backgroundDarkenRange"
        label="背景压暗"
        value={(style.darken ?? 0.58) * 100}
        min={0}
        max={75}
        step={5}
        onChange={(value) => onStyleChange({ darken: value / 100 })}
      />
      <p className="hint">压暗模糊背景并加强主体投影，让清晰照片更突出。</p>
    </div>
  )
}

function WatermarkSection({ watermark, bottom, onWatermarkChange }) {
  const positions = [
    ['tl', '左上'], ['tc', '上中'], ['tr', '右上'],
    ['ml', '左中'], ['mc', '居中'], ['mr', '右中'],
    ['bl', '左下'], ['bc', '下中'], ['br', '右下'],
  ]
  return (
    <div className="sec">
      <SectionHeading title="水印" subtitle="Watermark" />
      <Toggle className="wm-top" label="启用水印内容" checked={watermark.on} onChange={(on) => onWatermarkChange({ on })} />
      <div className="field" style={{ opacity: watermark.on ? 1 : 0.45 }}>
        <div className="field-top"><label htmlFor="cameraBrand">相机品牌标识</label></div>
        <select id="cameraBrand" className="input select" value={watermark.brand} disabled={!watermark.on} onChange={(event) => onWatermarkChange({ brand: event.target.value })}>
          <option value="">不显示品牌标识</option>
          {CAMERA_BRANDS.map((brand) => <option key={brand.id} value={brand.id}>{brand.label}</option>)}
        </select>
      </div>
      <div className="field" style={{ opacity: watermark.on ? 1 : 0.45, pointerEvents: watermark.on ? undefined : 'none' }}>
        <input className="input" value={watermark.text} placeholder="输入署名 / 品牌 / 日期" maxLength={48} onChange={(event) => onWatermarkChange({ text: event.target.value })} aria-label="水印文字" />
      </div>
      <div className="field">
        <div className="field-top"><label>位置</label><span className="pos-hint">{bottom > 0 ? '文字在下方留白区' : '叠加在照片内'}</span></div>
        <div className="posgrid">
          {positions.map(([position, label]) => <button key={position} type="button" data-pos={position} aria-label={label} aria-pressed={watermark.pos === position} onClick={() => onWatermarkChange({ pos: position })} />)}
        </div>
      </div>
      <RangeField id="wmOpacity" label="不透明度" value={Math.round(watermark.opacity * 100)} min={10} max={100} step={1} onChange={(value) => onWatermarkChange({ opacity: value / 100 })} />
      <RangeField id="wmSize" label="字号" value={watermark.size} min={50} max={200} step={2} onChange={(size) => onWatermarkChange({ size })} />
      <Toggle label="显示尺寸信息" checked={watermark.meta} onChange={(meta) => onWatermarkChange({ meta })} />
      <Toggle label="显示拍摄参数（快门 · 光圈 · ISO）" checked={watermark.showExposure} disabled={!watermark.on} onChange={(showExposure) => onWatermarkChange({ showExposure })} />
      <p className="hint">拍摄参数从照片的 EXIF 信息读取；未记录的项目会显示为 —。</p>
    </div>
  )
}

export default function SettingsPanel({ presetId, style, watermark, format, onPresetChange, onStyleChange, onWatermarkChange, onFormatChange, onReset }) {
  return (
    <aside className="rail rail--right">
      <div className="rail-head"><h2>样式设置</h2><span className="live-label">LIVE</span></div>
      <div className="right-scroll">
        <div className="sec"><SectionHeading title="边框样式" subtitle="Frame" /><PresetGrid presetId={presetId} onSelect={onPresetChange} /></div>
        <SpacingSection style={style} onStyleChange={onStyleChange} />
        <BlurSection style={style} onStyleChange={onStyleChange} />
        <WatermarkSection watermark={watermark} bottom={style.bottom} onWatermarkChange={onWatermarkChange} />
        <div className="sec">
          <SectionHeading title="导出" subtitle="Output" />
          <div className="field">
            <div className="field-top"><label>格式</label></div>
            <div className="seg">
              <button aria-pressed={format === 'jpeg'} onClick={() => onFormatChange('jpeg')}>JPG</button>
              <button aria-pressed={format === 'png'} onClick={() => onFormatChange('png')}>PNG</button>
            </div>
          </div>
          <p className="hint">导出保持原始像素尺寸，边框按短边比例追加。批量导出会依次下载每个文件，浏览器若询问「允许下载多个文件」请选择允许。</p>
          <p className="hint"><kbd>←</kbd> <kbd>→</kbd> 切换照片　<kbd>E</kbd> 导出当前</p>
          <div className="reset-row"><button className="btn btn--quiet" onClick={onReset}>重置为样式默认值</button></div>
        </div>
      </div>
    </aside>
  )
}
