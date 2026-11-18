import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "./useTheme";

/**
 * Light/dark theme toggle. Uses the project's lu-yellow accent so it reads on
 * both the light cream surfaces and the dark green navigation surfaces.
 */
export default function ThemeToggle({ variant = "default", className = "" }) {
	const { theme, toggleTheme } = useTheme();
	const isDark = theme === "dark";

	const accent =
		variant === "admin"
			? "border-lu-yellow/60 text-lu-yellow hover:bg-lu-yellow hover:text-lu-dark"
			: "border-lu-yellow/50 text-lu-yellow hover:bg-lu-yellow hover:text-lu-green";

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${accent} ${className}`}
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			title={isDark ? "Switch to light mode" : "Switch to dark mode"}
		>
			<FontAwesomeIcon icon={isDark ? faSun : faMoon} aria-hidden="true" />
			<span className="hidden lg:inline">{isDark ? "Light" : "Dark"}</span>
		</button>
	);
}
