import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	clearStoredToken,
	fetchMe,
	getStoredToken,
	login as loginRequest,
	storeToken,
} from "../lib/api";
import { AdminAuthContext } from "./AdminAuthContext";

/**
 * Provides admin authentication state to descendant routes.
 * Restores an existing token on mount, validates it, and exposes sign-in/out actions.
 */
export default function AdminAuthProvider({ children }) {
	const [token, setToken] = useState(() => getStoredToken());
	const [user, setUser] = useState(null);
	const [checking, setChecking] = useState(Boolean(token));

	useEffect(() => {
		let cancelled = false;

		if (!token) return undefined;

		fetchMe(token)
			.then((payload) => {
				if (!cancelled) setUser(payload.data);
			})
			.catch(() => {
				if (cancelled) return;
				clearStoredToken();
				setUser(null);
				setToken(null);
			})
			.finally(() => {
				if (!cancelled) setChecking(false);
			});

		return () => {
			cancelled = true;
		};
	}, [token]);

	/** Authenticate with credentials and persist the returned session token. */
	const signIn = useCallback(async (email, password) => {
		const data = await loginRequest(email, password);
		storeToken(data.token);
		setUser(data.user);
		setToken(data.token);
		setChecking(false);
		return data.user;
	}, []);

	/** Clear local session state and remove the stored auth token. */
	const signOut = useCallback(() => {
		clearStoredToken();
		setUser(null);
		setToken(null);
		setChecking(false);
	}, []);

	const value = useMemo(
		() => ({ token, user, checking, signIn, signOut }),
		[token, user, checking, signIn, signOut]
	);

	return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
