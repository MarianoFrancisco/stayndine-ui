export default function Field({ label, error, children }) {
    return (
        <div style={{ width: '100%' }}>
            {label && <label className="label">{label}</label>}
            {children}
            {error && <div className="error">{error}</div>}
        </div>
    )
}
