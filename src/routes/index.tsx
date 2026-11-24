import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Fragment, lazy, Suspense, useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowRight, BellRing, CheckCircle2, Clock, Droplets, Gauge, MapPin, Moon, Radio, Server, ShieldAlert, Sun, Thermometer, TrendingUp, TriangleAlert, X, Monitor, UserCheck } from "lucide-react";
import { ACK_TEXT, data, riskColor, THRESHOLDS, UPDATED, type RiskLevel, type ScenarioId } from "@/lib/floodguard/data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const MapView = lazy(() => import("@/components/floodguard/MapView"));

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "FloodGuard — локальный мониторинг паводкового риска" },
    { name: "description", content: "Демонстрационный MVP системы раннего предупреждения о паводках для посёлка Габидена Мустафина на реке Нура." },
    { property: "og:title", content: "FloodGuard — локальный мониторинг паводкового риска" },
    { property: "og:description", content: "Интерактивный прототип: сценарии, карта, график уровня воды, предупреждения и журнал событий (смоделированные данные)." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Page,
});

const tone: Record<RiskLevel, { text: string; bg: string; border: string; ring: string }> = {
  normal: { text: "text-safe", bg: "bg-safe/10", border: "border-safe/50", ring: "shadow-[0_0_0_1px_var(--safe)]" },
  attention: { text: "text-caution", bg: "bg-caution/10", border: "border-caution/50", ring: "shadow-[0_0_0_1px_var(--caution)]" },
  critical: { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/50", ring: "shadow-[0_0_0_1px_var(--destructive)]" },
};

function Page() {
  const [id, setId] = useState<ScenarioId>("normal");
  const [acked, setAcked] = useState(false);
  const [toast, setToast] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [light, setLight] = useState(true);
  useEffect(() => { document.documentElement.classList.toggle("dark", !light); }, [light]);

  const s = data.scenario(id);
  const series = data.series(id);
  const points = data.points(id);
  const baseLog = data.log(id);
  const t = tone[s.risk];
  const needsAck = id !== "normal";
  const lastEvent = baseLog.at(-1);
  const log = acked && needsAck && lastEvent ? [...baseLog.slice(0, -1), { time: lastEvent.time, text: ACK_TEXT }] : baseLog;

  const choose = (next: ScenarioId) => { setId(next); setAcked(false); setToast(next !== "normal"); };

  return (
    <div className="min-h-screen font-[Geneva,Helvetica,sans-serif]">
    <div className="flood-dashboard min-h-screen font-sans">
      <header className="sticky top-0 z-[1000] border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground shadow-glow"><Droplets className="size-6" /></span>
            <div><p className="font-display text-lg font-bold leading-none">FloodGuard</p><p className="text-xs text-muted-foreground">Локальный мониторинг паводкового риска</p></div>
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 text-safe"><span className="size-2 motion-safe:animate-pulse rounded-full bg-safe" />ДЕМО</span>
            <span className="hidden items-center gap-1.5 sm:flex"><Clock className="size-3.5" />Обновлено: {UPDATED}</span>
            <Button variant="ghost" size="icon" aria-label="Сменить тему" onClick={() => setLight((v) => !v)}>{light ? <Moon className="size-4" /> : <Sun className="size-4" />}</Button>
          </div>
        </div>
        <div className="border-t border-caution/30 bg-caution/10 px-4 py-2 text-center text-xs text-caution">
          <TriangleAlert className="mr-1.5 inline size-3.5" />Демонстрационный MVP. Все показатели смоделированы. Реальные датчики пока не установлены. Официальные пороги должны согласовываться с Казгидрометом и ДЧС.
        </div>
      </header>

      {toast && (
        <div className="fixed right-4 top-44 z-[1100] w-80 max-w-[calc(100vw-2rem)] animate-in slide-in-from-right fade-in rounded-lg border border-border bg-popover p-4 shadow-2xl">
          <div className="flex gap-3">
            <BellRing className={cn("size-5 shrink-0", t.text)} />
            <div className="flex-1 text-sm">
              <p className="font-semibold">Уведомление FloodGuard</p>
              <p className="mt-1 text-muted-foreground">FloodGuard обнаружил быстрое изменение уровня воды. Проверьте участок.</p>
              {id === "critical" && <Button size="sm" variant="destructive" className="mt-3" onClick={() => setEventOpen(true)}>Открыть карточку события</Button>}
            </div>
            <Button variant="ghost" size="icon" aria-label="Закрыть" onClick={() => setToast(false)} className="size-6 shrink-0 text-muted-foreground"><X className="size-4" /></Button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <section className="flex flex-col items-center gap-5 pb-2 pt-3 text-center sm:pt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary"><Activity className="size-3.5" />Локальный мониторинг паводкового риска</div>
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl font-bold text-primary sm:text-6xl">FloodGuard</h1>
            <p className="mt-4 text-lg font-semibold sm:text-2xl">пос. Габидена Мустафина · река Нура</p>
            <p className="mt-2 text-sm text-muted-foreground">Бухар-Жырауский район, Карагандинская область</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {(["normal", "rise", "critical"] as const).map((sid) => {
              const sc = data.scenario(sid); const active = sid === id;
              return <Button key={sid} variant="outline" aria-pressed={active} onClick={() => choose(sid)} className={cn("rounded-lg px-4 text-sm transition-colors", active ? cn(tone[sc.risk].bg, tone[sc.risk].border, tone[sc.risk].text) : "border-border bg-card text-muted-foreground")}>{sc.button}</Button>;
            })}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric icon={Droplets} label="Уровень воды" value={`${s.level} см`} accent="text-primary" />
          <Metric icon={TrendingUp} label="Изменение за час" value={`+${s.delta} см`} accent={t.text} />
          <Metric icon={Thermometer} label="Температура воздуха" value="+4 °C" accent="text-caution" />
          <Metric icon={Radio} label="Активные точки" value={`${points.filter((p) => p.online).length} из ${points.length}`} accent="text-safe" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5 text-sm"><span className="flex items-center gap-2 font-medium"><MapPin className="size-4 text-primary" />Предлагаемые точки наблюдения</span><span className="text-xs text-muted-foreground">Расположение условное</span></div>
            <div className="relative z-0 h-[420px]">
              <ClientOnly fallback={<div className="grid h-full place-items-center text-sm text-muted-foreground">Загрузка карты…</div>}>
                <Suspense fallback={null}><MapView points={points} /></Suspense>
              </ClientOnly>
            </div>
          </div>

          <div className="space-y-4">
            <div key={id} className={cn("animate-in fade-in zoom-in-95 rounded-xl border p-5 duration-500", t.bg, t.border)}>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Текущий уровень риска</p>
              <p className={cn("mt-1 flex items-center gap-2 font-display text-2xl font-bold", t.text)}>{s.risk === "normal" ? <CheckCircle2 className="size-6" /> : <ShieldAlert className="size-6" />}{s.status}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Рекомендуемое действие</p>
              <p className="mt-0.5 text-sm font-medium">{s.action}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric icon={Gauge} label="Скорость роста" value={s.speed} />
              <Metric icon={Clock} label="Последнее обновление" value={UPDATED} />
            </div>
            <p className="text-xs italic text-muted-foreground">Значения используются только для демонстрации интерфейса и не являются официальными гидрологическими данными.</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Activity className="size-4 text-primary" />Динамика уровня воды за 12 часов</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={series} margin={{ right: 16 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[100, 340]} unit=" см" width={58} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }} />
                  <ReferenceLine y={THRESHOLDS.normal} stroke="var(--safe)" strokeDasharray="5 4" label={{ value: "Нормальный", fill: "var(--safe)", fontSize: 10, position: "insideTopLeft" }} />
                  <ReferenceLine y={THRESHOLDS.warning} stroke="var(--caution)" strokeDasharray="5 4" label={{ value: "Предупредительный", fill: "var(--caution)", fontSize: 10, position: "insideTopLeft" }} />
                  <ReferenceLine y={THRESHOLDS.critical} stroke="var(--destructive)" strokeDasharray="5 4" label={{ value: "Критический", fill: "var(--destructive)", fontSize: 10, position: "insideTopLeft" }} />
                  <Line dataKey="level" name="Уровень, см" stroke={riskColor[s.risk]} strokeWidth={2.5} dot={false} animationDuration={800} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Пороги условные и требуют согласования со специалистами Казгидромета и ДЧС.</p>
          </div>

          <div className="flex flex-col rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Clock className="size-4 text-primary" />Журнал событий</h2>
            <ol key={id} className="flex-1 space-y-3">
              {log.map((e, i) => (
                <li key={i} style={{ animationDelay: `${i * 90}ms` }} className="flex animate-in fade-in slide-in-from-bottom-1 gap-3 fill-mode-both text-sm">
                  <span className="font-mono text-xs text-primary">{e.time}</span>
                  <span className={cn(e.text === ACK_TEXT && "font-medium text-safe")}>{e.text}</span>
                </li>
              ))}
            </ol>
            {needsAck && <Button className="mt-4" disabled={acked} onClick={() => setAcked(true)}><UserCheck className="size-4" />{acked ? "Получение подтверждено" : "Подтвердить получение"}</Button>}
          </div>
        </section>

        <Architecture />
        <Competitors />
        <About />
        <Roadmap />
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        <p className="font-medium text-foreground">FloodGuard MVP 0.1 — проектная версия</p>
        <p className="mt-1">Прототип не является официальной системой оповещения и не должен использоваться для принятия решений при чрезвычайной ситуации.</p>
      </footer>

      <Dialog open={eventOpen} onOpenChange={setEventOpen}>
        <DialogContent className="z-[1200]">
          <DialogHeader><DialogTitle>Карточка события</DialogTitle></DialogHeader>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {([
              ["Время обнаружения", "20:14"],
              ["Точка наблюдения", points[0]?.name ?? "—"],
              ["Уровень воды", `${s.level} см`],
              ["Изменение за час", `+${s.delta} см`],
              ["Статус", s.status],
              ["Ответственный", "Дежурный специалист (демо)"],
              ["Подтверждение", acked ? "Подтверждено оператором" : "Ожидается"],
            ] as const).map(([k, v]) => <Fragment key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></Fragment>)}
          </dl>
          {!acked && <Button onClick={() => setAcked(true)}>Подтвердить получение</Button>}
          <p className="text-xs text-muted-foreground">Демонстрационные данные.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ icon: Icon, label, value, accent }: { icon: typeof Droplets; label: string; value: string; accent?: string }) {
  return (
    <div className="metric-tile min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5">
      <span className={cn("mb-3 grid size-9 place-items-center rounded-lg bg-secondary", accent ?? "text-primary")}><Icon className="size-4" /></span>
      <p className={cn("break-words font-display text-2xl font-bold transition-colors duration-500", accent)}>{value}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) { return <h2 className="mb-4 text-xl font-bold">{children}</h2>; }

function Architecture() {
  const steps = [
    { icon: Droplets, label: "Датчик уровня воды" },
    { icon: Radio, label: "Передача через GSM или LoRaWAN" },
    { icon: Server, label: "Сервер FloodGuard" },
    { icon: Monitor, label: "Панель мониторинга" },
    { icon: BellRing, label: "Уведомление ответственному специалисту" },
  ];
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <SectionTitle>Архитектура будущего пилота</SectionTitle>
      <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        {steps.map((st, i) => (
          <div key={st.label} className="flex flex-1 flex-col items-center gap-2 md:flex-row">
            <div className="flex w-full flex-1 flex-col items-center gap-2 rounded-lg border border-border bg-secondary p-4 text-center text-sm"><st.icon className="size-5 text-primary" />{st.label}</div>
            {i < steps.length - 1 && <ArrowRight className="size-4 shrink-0 rotate-90 text-muted-foreground md:rotate-0" />}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Окончательный тип датчика и канал связи выбираются после обследования территории.</p>
    </section>
  );
}

function Competitors() {
  const rows = [
    ["Казгидромет", "Официальные гидрологические данные и наблюдения", "Национальный", "Государственная сеть гидропостов", "Официальные бюллетени", "Первичный официальный источник; FloodGuard дополняет, не заменяет"],
    ["Tasqyn", "Государственное прогнозирование и моделирование паводков", "Национальный / региональный", "Использует данные государственной сети", "Для госорганов", "Прогнозная модель верхнего уровня"],
    ["Hohonu", "Локальный мониторинг уровня воды", "Локальный (США, международно)", "Да", "Да", "Международный пример локального мониторинга"],
    ["SensiFlood", "Локальный мониторинг паводков датчиками", "Локальный (международно)", "Да", "Да", "Международный пример локального мониторинга"],
    ["FloodMapp", "Площадь и глубина возможного затопления", "Региональный", "Частично", "Да", "Картирование затопления; иной уровень задачи"],
    ["FloodGuard", "Гиперлокальный мониторинг конкретного посёлка", "Один населённый пункт", "Планируется", "Ответственному специалисту", "Локальное дополнение к существующим системам"],
  ];
  const cols = ["Система", "Основная функция", "Масштаб работы", "Локальные датчики", "Уведомления", "Роль относительно FloodGuard"];
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <SectionTitle>Конкуренты и альтернативы</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">{cols.map((c) => <th key={c} className="px-3 py-2 font-medium">{c}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r[0]} className={cn("border-b border-border/60", r[0] === "FloodGuard" && "bg-primary/10")}>{r.map((c, i) => <td key={i} className={cn("px-3 py-2.5 align-top", i === 0 ? "font-semibold" : "text-muted-foreground")}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <SectionTitle>О проекте</SectionTitle>
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">FloodGuard разрабатывается как локальное дополнение к существующим государственным системам мониторинга. Пилотный сценарий связан с посёлком Габидена Мустафина, который пострадал от паводка в 2015 году. Рабочая гипотеза проекта состоит в том, что ответственным службам может не хватать оперативной информации о локальных направлениях поступления талой воды к жилой территории.</p>
      <p className="mt-4 max-w-3xl rounded-lg border-l-4 border-caution bg-caution/10 px-4 py-3 text-sm font-medium">Эта гипотеза требует проверки через интервью с ДЧС, акиматом, Казгидрометом, гидрологами и жителями.</p>
    </section>
  );
}

function Roadmap() {
  const steps = ["Интервью с ответственными службами и жителями", "Проверка предполагаемых точек на местности", "Выбор одного тестового датчика", "Подключение реальных данных", "Проведение пилотного испытания", "Анализ точности и полезности предупреждений"];
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <SectionTitle>Следующие этапы</SectionTitle>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((st, i) => <li key={st} className="flex gap-3 rounded-lg border border-border bg-secondary p-4 text-sm"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">{i + 1}</span>{st}</li>)}
      </ol>
    </section>
  );
}
