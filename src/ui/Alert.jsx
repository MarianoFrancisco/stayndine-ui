export default function Alert({ variant = 'info', title, children, onClose }) {
    return (
        <div className={`alert alert--${variant}`} role="alert" aria-live="polite">
            <div className="alert__icon" aria-hidden>!</div>
            <div className="alert__body">
                {title && <div className="alert__title">{title}</div>}
                {children && <div className="alert__content">{children}</div>}
            </div>
            {onClose && (
                <button
                    className="alert__close"
                    onClick={onClose}
                    aria-label="Close alert"
                >
                    ×
                </button>
            )}
        </div>
    )
}