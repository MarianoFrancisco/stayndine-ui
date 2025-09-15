export function normalizeRoles(roles) {
    const arr = Array.isArray(roles) ? roles : (roles ? [roles] : []);
    return arr
        .filter(Boolean)
        .map(r => String(r).trim().toUpperCase());
}

export function isManagerLike(roles) {
    const R = normalizeRoles(roles);
    return R.some(r => ['MANAGER', 'EMPLOYEE'].includes(r));
}

export function isCustomerLike(roles) {
    const R = normalizeRoles(roles);
    if (R.length === 0) return true;
    return R.some(r => ['CUSTOMER'].includes(r)) && !isManagerLike(R);
}

export function expandRequired(rolesRequired = []) {
    const expanded = new Set();
    for (const r of rolesRequired) {
        const k = String(r).trim().toUpperCase();
        if (k === 'CUSTOMER') ['CUSTOMER'].forEach(x => expanded.add(x));
        else if (k === 'MANAGER') ['MANAGER', 'EMPLOYEE'].forEach(x => expanded.add(x));
        else expanded.add(k);
    }
    return Array.from(expanded);
}
