import React from "react";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AppToaster from "./components/AppToaster.jsx";
import ThemeProvider from "./theme/ThemeProvider.jsx";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ThemeProvider>
			<BrowserRouter>
				<App />
				<AppToaster />
			</BrowserRouter>
		</ThemeProvider>
	</StrictMode>,
);
