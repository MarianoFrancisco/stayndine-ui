export default function Button({
    as: Tag = 'button',
    variant = 'primary',
    size = 'md',
    full = false,
    ...props
}) {
    const classes = ['btn', `btn--${variant}`, `btn--${size}`];
    if (full) classes.push('btn--full');
    return <Tag className={classes.join(' ')} {...props} />;
}