import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { formatDate } from "../admin/format";
import { useMessages } from "./portalStore";
import { EmptyState, PageHeading, Panel } from "./PortalUI";

/** Inbox with a list and detail view; read state persists in localStorage. */
export default function MessagesPage({ role = "admin", data }) {
	const hook = useMessages(role, { sync: role === "admin" && !data });
	const { messages, unreadCount, markRead, markUnread } = data || hook;
	const [selectedId, setSelectedId] = useState(null);

	const selected = useMemo(
		() => messages.find((message) => message.id === selectedId) || null,
		[messages, selectedId]
	);

	const openMessage = (message) => {
		setSelectedId(message.id);
		if (!message.read) markRead(message.id);
	};

	return (
		<div className="flex flex-col gap-4">
			<PageHeading
				title="Messages"
				description={`Inbox for ${role === "admin" ? "administrators" : "employees"}. Select a message to read it.`}
				badge={
					<span className="rounded-full bg-lu-yellow/40 px-3 py-1 text-xs font-bold text-lu-dark">
						{unreadCount} unread
					</span>
				}
			/>

			{selected ? (
				<Panel
					title={selected.subject}
					subtitle={`From ${selected.sender} · ${formatDate(selected.date, true)}`}
					action={
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => {
									markUnread(selected.id);
									toast.success("Message marked as unread.");
								}}
								className="text-xs font-semibold text-lu-green underline"
							>
								Mark unread
							</button>
							<button
								type="button"
								onClick={() => setSelectedId(null)}
								className="text-xs font-semibold text-lu-green underline"
							>
								Back to inbox
							</button>
						</div>
					}
				>
					<div className="rounded-lg border border-lu-green/15 bg-lu-cream/50 p-4">
						<p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-lu-ink/50">
							{selected.senderEmail}
						</p>
						<p className="whitespace-pre-line text-sm leading-relaxed text-lu-ink/85">
							{selected.body}
						</p>
					</div>
				</Panel>
			) : (
				<Panel>
					{!messages.length ? (
						<EmptyState>No messages for this role yet.</EmptyState>
					) : (
						<ul className="divide-y divide-black/5">
							{messages.map((message) => (
								<li key={message.id}>
									<button
										type="button"
										onClick={() => openMessage(message)}
										aria-label={`Open message: ${message.subject}`}
										className="flex w-full items-start gap-3 px-1 py-3 text-left transition-colors hover:bg-lu-green/5"
									>
										<span
											className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
												message.read ? "bg-transparent" : "bg-lu-yellow ring-2 ring-lu-green/30"
											}`}
											aria-label={message.read ? "Read" : "Unread"}
										/>
										<span className="min-w-0 flex-1">
											<span className="flex flex-wrap items-baseline justify-between gap-x-3">
												<span
													className={`truncate text-sm ${
														message.read
															? "font-medium text-lu-ink/75"
															: "font-bold text-lu-dark"
													}`}
												>
													{message.subject}
												</span>
												<span className="whitespace-nowrap text-xs text-lu-ink/50">
													{formatDate(message.date)}
												</span>
											</span>
											<span className="mt-1 block text-xs text-lu-ink/55">
												From {message.sender}
												{!message.read && (
													<span className="ml-2 rounded-full bg-lu-yellow/40 px-1.5 py-0.5 text-[10px] font-bold uppercase text-lu-dark">
														New
													</span>
												)}
											</span>
										</span>
									</button>
								</li>
							))}
						</ul>
					)}
				</Panel>
			)}
		</div>
	);
}
