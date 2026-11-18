import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./themeContext";

const STORAGE_KEY = "lu-theme";

function getInitialTheme() {
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (stored === "light" || stored === "dark") return stored;
	} catch {
		// Storage may be disabled; fall through to the system preference.
	}
	if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
		return "dark";
	}
	return "light";
}

/**
 * Class-based light/dark theme for Tailwind v4. Persists the choice and
 * applies it to <html> so every `dark:` utility works across the app.
 */
export default function ThemeProvider({ children }) {
	const [theme, setTheme] = useState(getInitialTheme);

	useEffect(() => {
		const root = document.documentElement;
		root.classList.toggle("dark", theme === "dark");
		root.style.colorScheme = theme;
		try {
			window.localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			// Ignore storage errors (private browsing).
		}
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme((current) => (current === "dark" ? "light" : "dark"));
	}, []);

	const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
