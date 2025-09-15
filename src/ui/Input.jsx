import { forwardRef } from 'react';

const Input = forwardRef(function Input(
    { id, label, placeholder, type = 'text', hint, error, required, ...props },
    ref
) {
    const describedBy = [];
    if (hint) describedBy.push(`${id}-hint`);
    if (error) describedBy.push(`${id}-error`);

    return (
        <div className="field">
            {label && (
                <label htmlFor={id} className="field__label">
                    {label}{' '}
                    {required && <span className="field__req" aria-hidden>*</span>}
                </label>
            )}
            <input
                id={id}
                ref={ref}
                type={type}
                className={`field__control ${error ? 'field__control--error' : ''}`}
                placeholder={placeholder}
                aria-invalid={!!error}
                aria-describedby={describedBy.join(' ') || undefined}
                {...props}
            />
            {hint && <div id={`${id}-hint`} className="field__hint">{hint}</div>}
            {error && (
                <div id={`${id}-error`} className="field__error" role="alert">
                    {error}
                </div>
            )}
        </div>
    );
});

export default Input;
