import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { LifeBuoy, RotateCcw, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Msg = { role: "user" | "assistant"; content: string };
const SUGGEST = ["Вода подходит к дому — что делать?", "Как подготовиться к паводку заранее?", "Куда эвакуироваться?"];

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs]);
  useEffect(() => { if (open && !busy) input.current?.focus(); }, [open, busy]);

  async function send(q: string) {
    if (!q.trim() || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q.trim() }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setText("");
    setBusy(true);
    try {
      const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      if (!r.ok || !r.body) throw new Error(await r.text());
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: "assistant", content: acc }]);
      }
    } catch (e) {
      setMsgs([...next, { role: "assistant", content: `⚠️ ${(e as Error).message || "Ошибка связи"}. При угрозе жизни звоните **112**.` }]);
    } finally {
      setBusy(false);
    }
  }

  if (!open)
    return (
      <Button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-[1000] h-12 gap-2 rounded-full px-5 shadow-glow">
        <LifeBuoy className="size-5" /> ИИ-помощник ЧС
      </Button>
    );

  return (
    <div className="fixed bottom-4 right-4 z-[1000] flex h-[min(620px,calc(100vh-2rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-glow">
      <header className="flex items-center gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
        <LifeBuoy className="size-5" />
        <div className="flex-1">
          <p className="text-sm font-semibold">ИИ-помощник FloodGuard</p>
          <p className="text-[11px] opacity-80">Всегда на связи · мгновенный ответ · экспертные советы</p>
        </div>
        <button aria-label="Новый разговор" onClick={() => setMsgs([])} className="rounded p-1 hover:bg-primary-foreground/15"><RotateCcw className="size-4" /></button>
        <button aria-label="Закрыть" onClick={() => setOpen(false)} className="rounded p-1 hover:bg-primary-foreground/15"><X className="size-4" /></button>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">При угрозе жизни сразу звоните <b>112</b>. Советы ИИ не заменяют указания ДЧС и акимата.</p>
        {msgs.length === 0 && (
          <div className="space-y-2">
            <p className="text-muted-foreground">Спросите, как защититься от паводка, что делать в ЧС или как эвакуироваться.</p>
            {SUGGEST.map((s) => (
              <button key={s} onClick={() => send(s)} className="block w-full rounded-md border border-border px-3 py-2 text-left hover:bg-accent">{s}</button>
            ))}
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-primary-foreground">{m.content}</div>
          ) : (
            <div key={i} className="prose prose-sm max-w-none text-foreground [&_li]:my-0.5 [&_ol]:pl-5 [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal">
              {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : <span className="animate-pulse text-muted-foreground">Помощник печатает…</span>}
            </div>
          ),
        )}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-end gap-2 border-t border-border p-3">
        <Textarea ref={input} value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder="Ваш вопрос…" className="max-h-28 min-h-10 resize-none"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }} />
        <Button type="submit" size="icon" disabled={busy || !text.trim()} aria-label="Отправить"><Send className="size-4" /></Button>
      </form>
    </div>
  );
}
