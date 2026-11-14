"use client";

import { Pin, PinOff, Plus, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteChat, pinChat } from "@/app/(app)/vidhi/actions";
import { formatDayMonth } from "@/lib/desk/format";
import { routes } from "@/lib/navigation";

export type ChatListItem = { id: string; title: string; pinned: boolean; updatedAt: string };

function Row({ chat, active }: { chat: ChatListItem; active: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const iconBtn =
    "grid size-7 place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-foreground focus:opacity-100 disabled:opacity-40";
  return (
    <li className="group relative">
      <Link
        href={`${routes.vidhi}?c=${chat.id}`}
        className={`flex flex-col rounded-lg px-3 py-2 pr-16 text-sm transition ${
          active ? "bg-accent/12 text-accent" : "text-foreground/85 hover:bg-surface-2"
        }`}
      >
        <span className="truncate font-medium">{chat.title}</span>
        <span className="text-xs text-muted">{formatDayMonth(chat.updatedAt)}</span>
      </Link>
      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 gap-0.5 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          disabled={pending}
          aria-label={chat.pinned ? `Unpin ${chat.title}` : `Pin ${chat.title}`}
          title={chat.pinned ? "Unpin" : "Pin"}
          onClick={() => start(() => pinChat(chat.id, !chat.pinned))}
          className={iconBtn}
        >
          {chat.pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
        </button>
        <button
          type="button"
          disabled={pending}
          aria-label={`Delete ${chat.title}`}
          title="Delete"
          onClick={() => {
            if (!confirm("Delete this conversation?")) return;
            start(async () => {
              await deleteChat(chat.id);
              if (active) router.push(routes.vidhi);
            });
          }}
          className={`${iconBtn} hover:text-red-400`}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </li>
  );
}

function Group({ title, chats, activeId }: { title: string; chats: ChatListItem[]; activeId: string }) {
  if (chats.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="mt-2 px-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{title}</p>
      <ul className="flex flex-col gap-0.5">
        {chats.map((c) => (
          <Row key={c.id} chat={c} active={c.id === activeId} />
        ))}
      </ul>
    </div>
  );
}

export function ChatHistory({ chats, activeId }: { chats: ChatListItem[]; activeId: string }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? chats.filter((c) => c.title.toLowerCase().includes(q)) : chats;
  }, [chats, query]);

  return (
    <aside className="sticky top-20 hidden max-h-[calc(100dvh-6rem)] w-64 shrink-0 flex-col gap-3 lg:flex">
      <Link
        href={routes.vidhi}
        className="flex h-10 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-black transition hover:brightness-110"
      >
        <Plus className="size-4" /> New conversation
      </Link>
      {chats.length > 0 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="h-9 w-full rounded-lg border border-border bg-surface pl-8 pr-8 text-sm outline-none transition placeholder:text-muted focus:border-accent/60"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded text-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}
      <div className="flex min-h-0 flex-col gap-2 overflow-y-auto pb-2">
        {chats.length === 0 ? (
          <p className="px-2 text-sm text-muted">Your conversations will appear here.</p>
        ) : filtered.length === 0 ? (
          <p className="px-2 text-sm text-muted">No conversations match “{query.trim()}”.</p>
        ) : (
          <>
            <Group title="Pinned" chats={filtered.filter((c) => c.pinned)} activeId={activeId} />
            <Group title="Recent" chats={filtered.filter((c) => !c.pinned)} activeId={activeId} />
          </>
        )}
      </div>
    </aside>
  );
}
