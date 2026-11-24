import { createFileRoute } from "@tanstack/react-router";
import { streamResponse, GatewayError } from "@lovable.dev/ai-gateway";

const SYSTEM = `Ты — ИИ-помощник FloodGuard по паводкам для посёлка Габидена Мустафина на реке Нура (Бухар-Жырауский район, Карагандинская область, Казахстан).
Отвечай по-русски, кратко и по делу, с пошаговыми списками.
Темы: что делать во время паводка/ЧС, как подготовиться заранее (тревожный чемоданчик, документы, защита дома), общие принципы эвакуации (уходить на возвышенности, подальше от русла Нуры и низин, не переходить поток вброд, следовать указаниям акимата и ДЧС).
Ты не знаешь официальных утверждённых маршрутов эвакуации и пунктов сбора — прямо говори, что их нужно уточнить в акимате или ДЧС, а не выдумывай адреса.
При угрозе жизни всегда в начале напоминай: звоните 112 (единая служба спасения) или 101.
Данные о воде на сайте — демонстрационные, не реальные.`;

type Msg = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: Msg[] };
        const messages = (body.messages ?? []).slice(-30).filter((m) => m.content?.trim());
        if (!messages.length) return new Response("empty", { status: 400 });
        try {
          const stream = await streamResponse({
            model: "openai/gpt-6-astra",
            instructions: SYSTEM,
            input: messages.map((m) => ({ role: m.role, content: m.content.slice(0, 4000) })),
          });
          const enc = new TextEncoder();
          const out = new ReadableStream({
            async start(c) {
              try {
                for await (const ev of stream) {
                  if (ev.type === "response.output_text.delta") c.enqueue(enc.encode(ev.delta));
                }
              } catch {
                c.enqueue(enc.encode("\n\n⚠️ Ответ прервался. Попробуйте ещё раз."));
              }
              c.close();
            },
          });
          return new Response(out, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
        } catch (e) {
          const msg = e instanceof GatewayError && e.httpStatus === 402 ? "Закончились кредиты ИИ." : "Помощник временно недоступен.";
          return new Response(msg, { status: 503 });
        }
      },
    },
  },
});
