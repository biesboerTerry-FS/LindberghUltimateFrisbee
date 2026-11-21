import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import ultimateLogoTransparent from "../assets/ultimateLogoTransparent.png";
import { formatDate } from "../admin/format";
import MessagesPage from "../portal/MessagesPage";
import OrdersPage from "../portal/OrdersPage";
import PendingWidget from "../portal/PendingWidget";
import SchedulePage from "../portal/SchedulePage";
import { useMessages, useOrders, useSchedule } from "../portal/portalStore";
import ThemeToggle from "../theme/ThemeToggle";
import {
	DEMO_EMPLOYEES,
	getEmployee,
	getSessionEmployeeId,
	saveEmployeeProfile,
	signInDemoEmployee,
	signOutEmployee,
} from "./employeeStore";

const EDITABLE_FIELDS = ["name", "address", "phone", "email"];

function profileFields(employee) {
	return EDITABLE_FIELDS.reduce((acc, key) => {
		acc[key] = employee?.[key] || "";
		return acc;
	}, {});
}

/** Sign-in panel for the employee portal. Only a local demo login is offered. */
function EmployeeSignIn({ onSignIn }) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-lu-green px-6 py-16 font-body text-lu-cream">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<img src={ultimateLogoTransparent} alt="Lindbergh Ultimate" className="mx-auto mb-4 w-40" />
					<p className="font-roboto text-sm uppercase tracking-[0.3em] text-lu-yellow">
						Lindbergh Ultimate
					</p>
					<h1 className="font-display text-3xl font-bold uppercase">Employee Self-Service</h1>
					<p className="mt-3 text-sm text-lu-cream/70">
						View your own profile and upcoming schedule. No admin data is available here.
					</p>
				</div>
				<div className="flex flex-col gap-5 rounded-2xl border border-lu-yellow/50 bg-white/10 p-6">
					<p className="text-sm text-lu-cream/80">
						Try the demo as <strong>{DEMO_EMPLOYEES[0].name}</strong>, {DEMO_EMPLOYEES[0].position}.
					</p>
					<button
						type="button"
						onClick={onSignIn}
						className="rounded-full border border-lu-yellow px-6 py-3 font-bold text-lu-yellow transition-all hover:bg-lu-yellow hover:text-lu-green"
					>
						Try demo employee
					</button>
					<p className="text-xs text-lu-cream/60">
						Demo employee data is stored in this browser only.
					</p>
				</div>
				<p className="mt-6 text-center">
					<Link to="/" className="inline-flex items-center gap-2 text-sm text-lu-yellow hover:text-white">
						<FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
						Back to the website
					</Link>
				</p>
			</div>
		</div>
	);
}

/**
 * Limited self-service portal for demo employees.
 * Shows only the signed-in employee's own basic info and schedule.
 */
export default function EmployeePortal() {
	const [employee, setEmployee] = useState(() => {
		const id = getSessionEmployeeId();
		return id ? getEmployee(id) : null;
	});
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState(() => profileFields(employee));
	const [activeTab, setActiveTab] = useState("overview");
	const ordersData = useOrders();
	const messagesData = useMessages("employee");
	const scheduleData = useSchedule();

	const TABS = [
		{ id: "overview", label: "Overview" },
		{ id: "orders", label: "Orders" },
		{ id: "messages", label: "Messages" },
		{ id: "schedule", label: "Schedule" },
	];

	if (!employee) {
		return (
			<EmployeeSignIn
				onSignIn={() => {
					const id = signInDemoEmployee();
					setEmployee(getEmployee(id));
					toast.success("Demo employee session started.");
				}}
			/>
		);
	}

	const openEdit = () => {
		setForm(profileFields(employee));
		setEditing(true);
	};

	const handleSave = (event) => {
		event.preventDefault();
		setEmployee(saveEmployeeProfile(employee.id, form));
		setEditing(false);
		toast.success("Your contact details were updated.");
	};

	const handleSignOut = () => {
		signOutEmployee();
		setEmployee(null);
		setEditing(false);
	};

	return (
		<div className="min-h-screen bg-lu-cream font-body text-lu-ink">
			<header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-lu-yellow/30 bg-lu-green px-4 py-3 text-lu-cream sm:px-6">
				<div className="min-w-0 flex-1">
					<p className="text-[10px] uppercase tracking-[0.25em] text-lu-yellow">Lindbergh Ultimate</p>
					<h2 className="font-display truncate text-lg font-bold">Employee Self-Service</h2>
				</div>
				<ThemeToggle variant="admin" />
				<button
					type="button"
					onClick={handleSignOut}
					className="rounded-full border border-lu-yellow px-4 py-2 text-sm font-semibold text-lu-yellow transition-colors hover:bg-lu-yellow hover:text-lu-dark"
				>
					Sign out
				</button>
			</header>

			<nav aria-label="Employee portal sections" className="border-b border-lu-green/15 bg-lu-cream px-4 sm:px-6">
				<div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto">
					{TABS.map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							aria-current={activeTab === tab.id ? "page" : undefined}
							className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
								activeTab === tab.id
									? "border-lu-green text-lu-green"
									: "border-transparent text-lu-ink/55 hover:text-lu-dark"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</nav>

			<main className="mx-auto flex max-w-5xl flex-col gap-4 p-4 sm:p-6">
				{activeTab === "overview" && (
					<>
				<section>
					<h1 className="font-display text-2xl font-bold text-lu-dark">Welcome back, {employee.name}</h1>
					<p className="mt-1 text-sm text-lu-ink/55">
						Your details, pending orders, messages, and schedule. Demo data is stored in this browser.
					</p>
				</section>

				<PendingWidget orders={ordersData.orders} onOpen={() => setActiveTab("orders")} />

				<div className="grid gap-4 md:grid-cols-2">
					<section className="rounded-xl border border-lu-green/15 bg-white p-4">
						<div className="mb-3 flex items-center justify-between gap-3">
							<h3 className="font-roboto font-bold">My information</h3>
							{!editing && (
								<button
									type="button"
									onClick={openEdit}
									className="text-xs font-semibold text-lu-green underline"
								>
									Edit my info
								</button>
							)}
						</div>

						{editing ? (
							<form onSubmit={handleSave} className="flex flex-col gap-3">
								{EDITABLE_FIELDS.map((key) => (
									<div key={key}>
										<label htmlFor={`employee-${key}`} className="mb-1 block text-xs font-semibold capitalize">
											{key === "email" ? "Email" : key === "phone" ? "Phone" : key}
										</label>
										<input
											id={`employee-${key}`}
											type={key === "email" ? "email" : "text"}
											required={key === "name"}
											value={form[key]}
											onChange={(event) => setForm({ ...form, [key]: event.target.value })}
											className="w-full rounded-lg border border-lu-ink/15 bg-lu-cream/50 px-3 py-2 font-body text-sm text-lu-ink focus:border-lu-green focus:bg-white focus:outline-none"
										/>
									</div>
								))}
								<div className="flex gap-2">
									<button
										type="submit"
										className="rounded-full bg-lu-green px-4 py-2 text-sm font-bold text-white hover:bg-lu-dark"
									>
										Save changes
									</button>
									<button
										type="button"
										onClick={() => setEditing(false)}
										className="rounded-full border border-lu-ink/15 px-4 py-2 text-sm font-semibold hover:bg-lu-green/5"
									>
										Cancel
									</button>
								</div>
							</form>
						) : (
							<dl className="divide-y divide-black/5 text-sm">
								{[
									["Name", employee.name],
									["Role / position", employee.position],
									["Email", employee.email],
									["Phone", employee.phone],
									["Address", employee.address],
								].map(([label, value]) => (
									<div key={label} className="flex flex-wrap justify-between gap-2 py-2">
										<dt className="text-lu-ink/50">{label}</dt>
										<dd className="text-right font-medium">{value || "—"}</dd>
									</div>
								))}
							</dl>
						)}
					</section>

					<section className="rounded-xl border border-lu-green/15 bg-white p-4">
						<h3 className="font-roboto mb-3 font-bold">Upcoming schedule</h3>
						<ul className="divide-y divide-black/5">
							{employee.schedule.map((item) => (
								<li key={`${item.date}-${item.title}`} className="py-2">
									<p className="font-medium">{item.title}</p>
									<p className="text-xs text-lu-ink/55">
										{formatDate(item.date)} · {item.time}
									</p>
									<p className="text-xs text-lu-ink/45">{item.location}</p>
								</li>
							))}
						</ul>
					</section>
				</div>

				<p className="text-xs text-lu-ink/45">
					Demo data is stored in this browser. Admin records and settings remain in the Admin Panel.
				</p>
					</>
				)}

				{activeTab === "orders" && (
					<OrdersPage role="employee" data={ordersData} />
				)}

				{activeTab === "messages" && (
					<MessagesPage role="employee" data={messagesData} />
				)}

				{activeTab === "schedule" && (
					<SchedulePage role="employee" employee={employee} data={scheduleData} />
				)}
			</main>
		</div>
	);
}
