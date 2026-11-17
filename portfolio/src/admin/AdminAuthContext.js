import { createContext, useContext } from "react";

/** React context holding admin session state and auth actions. */
export const AdminAuthContext = createContext(null);

/**
 * Access the current admin auth context.
 * @throws {Error} When used outside `AdminAuthProvider`.
 * @returns {{ token: string|null, user: object|null, checking: boolean, signIn: Function, signOut: Function }}
 */
export function useAdminAuth() {
	const context = useContext(AdminAuthContext);
	if (!context) {
		throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
	}
	return context;
}
