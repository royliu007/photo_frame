export default function Toast({ message, visible }) {
  return <div className={`toast${visible ? ' show' : ''}`} role="status" aria-live="polite"><span className="dot" /><span>{message}</span></div>
}
