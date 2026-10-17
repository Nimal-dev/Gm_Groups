/**
 * Helpers shared by the dashboard pages.
 */

/** Fields that must never leave the server unless the viewer is an admin. */
const SENSITIVE_EMPLOYEE_FIELDS = ['mpin', 'loginId', 'bankAccountNo'] as const;

/**
 * Strip credential / banking fields from employee records for non-admin viewers.
 * Admins keep the full record because the Employee Management tab edits these fields.
 */
export function sanitizeEmployeesForRole(employees: any[] | undefined, role: string): any[] {
    if (!employees) return [];
    if (role === 'admin') return employees;
    return employees.map((employee) => {
        const copy: Record<string, any> = { ...employee };
        for (const field of SENSITIVE_EMPLOYEE_FIELDS) delete copy[field];
        return copy;
    });
}

/** Escape a string so it can be embedded in a RegExp without acting as a pattern. */
export function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
