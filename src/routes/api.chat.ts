import { createFileRoute } from "@tanstack/react-router";
import { isValidSession } from "@/lib/auth";
import {
  chatInput,
  createArabicFallbackRequest,
  createOllamaChatRequest,
  hasArabicLanguageMix,
} from "@/lib/chat.functions";
import { getRelevantKnowledgeAnswer } from "@/lib/knowledge-base";
import { translations, type LangCode } from "@/i18n/translations";
import { isSourceRequest } from "@/lib/source-request";
import {
  buildHeritageSearchQuery,
  formatHeritageSearchContext,
  isEgyptianHeritageQuery,
  searchTrustedEgyptianHeritage,
} from "@/lib/heritage-search";

type CloudflareAI = {
  run(
    model: string,
    input: {
      messages: { role: "system" | "user" | "assistant"; content: string }[];
      max_tokens: number;
      temperature: number;
    },
  ): Promise<unknown>;
};

type RequestWithCloudflareRuntime = Request & {
  runtime?: { cloudflare?: { env?: { AI?: CloudflareAI } } };
};

type ChatProviderEnv = Record<string, string | undefined>;

function readProviderEnv(env: ChatProviderEnv | undefined, key: string): string | undefined {
  const value = env?.[key];
  if (typeof value === "string") return value;
  return typeof process !== "undefined" ? process.env?.[key] : undefined;
}

function createContinuationMessages(
  messages: { role: string; content: string }[],
  partialAnswer: string,
  language: LangCode,
): { role: string; content: string }[] {
  const instructions: Record<LangCode, string> = {
    ar: "كمّل إجابتك السابقة من حيث توقفت بالضبط. لا تكرر ما كُتب بالفعل. أكمل الفكرة وأنهِ إجابة مكتملة باللغة العربية.",
    en: "Continue your previous answer from exactly where it stopped. Do not repeat what is already written. Finish the thought and give a complete answer in English.",
    fr: "Continue ta réponse précédente exactement là où elle s’est arrêtée. Ne répète pas ce qui est déjà écrit. Termine l’idée et donne une réponse complète en français.",
    es: "Continúa tu respuesta anterior exactamente donde se detuvo. No repitas lo que ya está escrito. Termina la idea y ofrece una respuesta completa en español.",
    it: "Continua la risposta precedente esattamente da dove si è interrotta. Non ripetere ciò che è già scritto. Completa il pensiero e dai una risposta completa in italiano.",
    de: "Setze deine vorherige Antwort genau an der Stelle fort, an der sie abgebrochen wurde. Wiederhole nichts bereits Geschriebenes. Beende den Gedanken und gib eine vollständige Antwort auf Deutsch.",
    ru: "Продолжи предыдущий ответ точно с того места, где он остановился. Не повторяй уже написанное. Заверши мысль и дай полный ответ на русском языке.",
    ja: "前の回答が途切れたところから正確に続けてください。すでに書かれた内容は繰り返さず、話を完結させ、日本語で回答を仕上げてください。",
    zh: "从上次回答中断的地方准确继续，不要重复已经写过的内容。完成当前思路，并用中文给出完整回答。",
  };
  return [
    ...messages,
    { role: "assistant", content: partialAnswer },
    {
      role: "user",
      content: instructions[language],
    },
  ];
}

type OllamaChunk = {
  message?: { content?: string };
  error?: string;
  done?: boolean;
  done_reason?: string;
};

function parseOllamaReply(raw: string): { content: string; doneReason: string | undefined } {
  const lines = raw.split(/\r?\n/u).filter((line) => line.trim());
  let content = "";
  let done = false;
  let doneReason: string | undefined;

  for (const line of lines) {
    if (done) throw new Error("Ollama sent data after its completion marker.");

    let chunk: OllamaChunk;
    try {
      chunk = JSON.parse(line) as OllamaChunk;
    } catch {
      throw new Error("Ollama returned invalid NDJSON.");
    }

    if (chunk.error) throw new Error("Ollama returned an error in its response stream.");
    if (typeof chunk.message?.content === "string") content += chunk.message.content;
    if (chunk.done === true) {
      done = true;
      doneReason = chunk.done_reason;
    }
  }

  if (!done) throw new Error("Ollama response ended before its completion marker.");
  if (!content.trim()) throw new Error("Ollama returned an empty response.");

  return { content, doneReason };
}

function asChatStream(
  content: string,
  sources: Array<{ title: string; organization: string; url: string }> = [],
  language: LangCode = "ar",
): Response {
  const sourceSection = sources.length
    ? `\n\n${translations[language].chat.sourcesLabel}:\n${sources
        .map((source) => `- [${source.title} — ${source.organization}](${source.url})`)
        .join("\n")}`
    : "";
  return new Response(
    `${JSON.stringify({ message: { content: `${content}${sourceSection}` }, done: true, done_reason: "stop" })}\n`,
    {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "X-Accel-Buffering": "no",
      },
    },
  );
}

type ChatStreamEvent = {
  message?: { content?: string };
  done?: boolean;
  done_reason?: string;
  reset?: boolean;
  error?: string;
};

function asProgressiveChatStream(
  produce: (emit: (event: ChatStreamEvent) => void) => Promise<void>,
): Response {
  const encoder = new TextEncoder();
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const emit = (event: ChatStreamEvent) => {
        if (!cancelled) controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      void produce(emit)
        .catch((error: unknown) => {
          console.error("[Chat] Progressive response failed", {
            reason: error instanceof Error ? error.message : "unknown",
          });
          emit({ error: "provider_error" });
        })
        .finally(() => {
          if (!cancelled) controller.close();
        });
    },
    cancel() {
      cancelled = true;
    },
  });
  return new Response(body, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}

async function consumeOllamaStream(
  response: Response,
  onContent: (content: string) => void,
): Promise<{ content: string; doneReason: string | undefined }> {
  if (!response.body) throw new Error("Ollama response has no body.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffered = "";
  let content = "";
  let done = false;
  let doneReason: string | undefined;

  const processLine = (line: string) => {
    if (!line.trim()) return;
    if (done) throw new Error("Ollama sent data after its completion marker.");
    let chunk: OllamaChunk;
    try {
      chunk = JSON.parse(line) as OllamaChunk;
    } catch {
      throw new Error("Ollama returned invalid NDJSON.");
    }
    if (chunk.error) throw new Error("Ollama returned an error in its response stream.");
    if (typeof chunk.message?.content === "string") {
      content += chunk.message.content;
      onContent(chunk.message.content);
    }
    if (chunk.done === true) {
      done = true;
      doneReason = chunk.done_reason;
    }
  };

  try {
    while (true) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;
      buffered += decoder.decode(value, { stream: true });
      const lines = buffered.split("\n");
      buffered = lines.pop() ?? "";
      for (const line of lines) {
        processLine(line);
        if (done) break;
      }
      if (done) {
        buffered = "";
        await reader.cancel();
        break;
      }
    }
    buffered += decoder.decode();
    processLine(buffered);
  } finally {
    reader.releaseLock();
  }

  if (!done) throw new Error("Ollama response ended before its completion marker.");
  if (!content.trim()) throw new Error("Ollama returned an empty response.");
  return { content, doneReason };
}

function formatSourceSection(
  sources: Array<{ title: string; organization: string; url: string }>,
  language: LangCode,
): string {
  return sources.length
    ? `\n\n${translations[language].chat.sourcesLabel}:\n${sources
        .map((source) => `- [${source.title} — ${source.organization}](${source.url})`)
        .join("\n")}`
    : "";
}

function removeRepeatedSentences(content: string): {
  content: string;
  repetitionsRemoved: number;
} {
  const fragments = content.match(/[^.!?؟\n]+[.!?؟]?|\n+/gu) ?? [content];
  const kept: string[] = [];
  let previousSentence = "";
  let repetitionsRemoved = 0;

  for (const fragment of fragments) {
    const sentence = fragment.replace(/\s+/gu, " ").trim().toLocaleLowerCase();
    if (sentence.length >= 30 && sentence === previousSentence) {
      repetitionsRemoved += 1;
      continue;
    }
    kept.push(fragment);
    if (sentence.length >= 30) previousSentence = sentence;
  }

  return { content: kept.join("").trim(), repetitionsRemoved };
}

function createArabicTourismQuickReply(data: {
  language: string;
  messages: { role: string; content: string }[];
}): string | undefined {
  if (data.language !== "ar") return undefined;
  const raw = data.messages.at(-1)?.content?.trim() ?? "";
  const normalized = raw
    .toLocaleLowerCase("ar")
    .replace(/[أإآ]/gu, "ا")
    .replace(/[ىي]/gu, "ي")
    .replace(/[؟?!.,،؛:]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
  const greetings =
    /^(?:(?:هاي|هاى|هلا|اهلا|اهلين|اهلا وسهلا|مرحبا|مرحبتين)(?: (?:ازيك|ازيكم|عامل ايه|عامله ايه|عاملة ايه|اخبارك ايه))?|السلام عليكم|سلام عليكم|صباح الخير|مساء الخير|صباح النور|مساء النور|ازيك|ازيكم|عامل ايه|عامله ايه|عاملة ايه|عاملين ايه|اخبارك ايه|ايه الاخبار|كيفك|كيف الحال|hello|hi)$/u;
  if (greetings.test(normalized)) {
    if (/السلام عليكم|سلام عليكم/u.test(normalized))
      return "وعليكم السلام ورحمة الله 😊 أهلًا بيك في دليل مصر الذكي.";
    if (/صباح/u.test(normalized)) return "صباح النور 😊 أهلًا بيك في دليل مصر الذكي.";
    if (/مساء/u.test(normalized)) return "مساء النور 😊 أهلًا بيك في دليل مصر الذكي.";
    if (/(?:ازيك|ازيكم|عامل|عامله|اخبارك|الاخبار|كيف)/u.test(normalized))
      return "أهلًا بيك 😊 أنا تمام، ومستعد أساعدك تكتشف حكايات مصر وآثارها.";
    return "أهلًا وسهلًا بيك 😊 نورت دليل مصر الذكي!";
  }
  if (/(?:مين انت|انت مين|انتي مين|مين انتي|اسمك ايه|ايه اسمك|ما اسمك|من انت)/u.test(normalized)) {
    return "أنا دليل مصر الذكي، مرشد سياحي رقمي بيساعدك تكتشف الآثار والنقوش والحكايات والتراث المصري بلغتك.";
  }
  if (
    /(?:محتواك ايه|بتقدم ايه|بتعمل ايه|بتعرف تعمل ايه|هدفك ايه|تخصصك ايه|ايه خدماتك|تقدر تساعدني في ايه|هتفيدني في ايه)/u.test(
      normalized,
    )
  ) {
    return "محتوايا عن السياحة والتراث المصري: أساعدك تتعرف على الآثار والقطع القديمة، تفهم النقوش والكتابة الهيروغليفية، وتسمع الحكايات والخلفية التاريخية. وبوضح الفرق بين المعلومة الموثقة والرواية أو الأسطورة، وبقدر أتكلم بتسع لغات: العربية والإنجليزية والفرنسية والإسبانية والألمانية والإيطالية والروسية واليابانية والصينية.";
  }
  if (/(?:انت ذكاء اصطناعي|انتي ذكاء اصطناعي|انت انسان|انتي انسان|انت برنامج)/u.test(normalized)) {
    return "أيوه، أنا مرشد سياحي رقمي بيعتمد على الذكاء الاصطناعي. مش إنسان، ومش بخمّن هوية الأثر أو ترجمة النقوش لو المعلومة مش مؤكدة.";
  }
  return undefined;
}

export async function handleChatPost(
  request: Request,
  fetcher: typeof fetch = fetch,
  suppliedAI?: CloudflareAI,
  suppliedEnv?: ChatProviderEnv,
): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = chatInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ code: "invalid_request" }, { status: 400 });
  }

  const localReply = createArabicTourismQuickReply(parsed.data);
  if (localReply) return asChatStream(localReply);
  const recentMessages = parsed.data.messages.slice(-4);
  const localKnowledgeAnswer = getRelevantKnowledgeAnswer(recentMessages, 1);
  const localKnowledgeSources = localKnowledgeAnswer.sources;
  const wantsSources = isSourceRequest(recentMessages.at(-1)?.content ?? "");
  let searchContext = "";
  let searchedSources: Array<{ title: string; organization: string; url: string }> = [];
  let liveSearchUnavailable = false;
  const heritageQuestion = isEgyptianHeritageQuery(parsed.data.messages);

  if (heritageQuestion) {
    const searchTimeout = AbortSignal.timeout(4_000);
    const searchSignal = AbortSignal.any([request.signal, searchTimeout]);
    try {
      const results = await searchTrustedEgyptianHeritage(
        buildHeritageSearchQuery(parsed.data.messages),
        parsed.data.language,
        fetcher,
        searchSignal,
        localKnowledgeSources,
      );
      if (!results.length) {
        liveSearchUnavailable = true;
        if (!localKnowledgeSources.length) {
          console.warn(
            "[Heritage search] No trusted live sources or matching citations; refusing an ungrounded answer",
          );
        } else {
          console.warn(
            "[Heritage search] No live source excerpts; using curated knowledge with strict evidence limits",
          );
        }
      } else {
        searchContext = formatHeritageSearchContext(results);
        searchedSources = results.map(({ title, organization, url }) => ({
          title,
          organization,
          url,
        }));
      }
    } catch (error) {
      console.error("[Heritage search] Request failed", {
        reason: error instanceof Error ? error.message : "unknown",
        timedOut: searchTimeout.aborted,
      });
      liveSearchUnavailable = true;
      if (!localKnowledgeSources.length) {
        console.warn(
          "[Heritage search] No matching local citations; refusing an ungrounded answer",
        );
      } else {
        console.warn("[Heritage search] Using curated references after live search failed");
      }
    }
  }

  const knowledgeSources = [...searchedSources, ...localKnowledgeSources]
    .filter(
      (source, index, sources) =>
        sources.findIndex((candidate) => candidate.url === source.url) === index,
    )
    .slice(0, 8);
  const responseSources = heritageQuestion && wantsSources ? knowledgeSources : [];
  if (parsed.data.language === "ar" && localKnowledgeAnswer.directAnswer) {
    console.info("[Chat] Answering with a curated, source-backed heritage response");
    return asChatStream(localKnowledgeAnswer.directAnswer, responseSources, parsed.data.language);
  }
  const searchFallbackContext =
    heritageQuestion && liveSearchUnavailable
      ? "LIVE SEARCH LIMITATION: The search attempt for this turn did not retrieve any approved source excerpt. Do not stop or return a generic search-unavailable message. Answer naturally and helpfully using any directly relevant curated knowledge already supplied in the system context. If that knowledge does not cover the question, give only a cautious, concise explanation from well-established general knowledge, clearly distinguish it from facts verified during this turn, avoid precise unsupported names, dates, readings, and disputed claims, and state briefly that live verification was unavailable when that limitation matters. Never invent or imply a source, citation, or successful search. If the user asks for references, provide only references actually retrieved or clearly say that none could be verified."
      : "";
  const chatRequest = createOllamaChatRequest(
    parsed.data,
    [searchContext, searchFallbackContext].filter(Boolean).join("\n\n"),
  );

  // Groq is primary. If it is temporarily unavailable, continue to Gemini
  // rather than immediately returning a generic server-busy error.
  const groqApiKey = readProviderEnv(suppliedEnv, "GROQ_API_KEY")?.trim();
  let providerFailureCode: "provider_error" | "incomplete_response" = "provider_error";
  if (groqApiKey) {
    const localPayload = JSON.parse(chatRequest.body) as {
      messages: { role: string; content: string }[];
    };
    const primaryModel = readProviderEnv(suppliedEnv, "GROQ_MODEL")?.trim() || "qwen/qwen3.8-27b";
    const groqModels = [...new Set([primaryModel, "openai/gpt-oss-20b"])];
    for (const [index, model] of groqModels.entries()) {
      const providerTimeout = AbortSignal.timeout(8_000);
      const providerSignal = AbortSignal.any([request.signal, providerTimeout]);
      try {
        const headers = new Headers({ "Content-Type": "application/json" });
        headers.set("authorization", "Bearer " + groqApiKey);
        const groqResponse = await fetcher("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers,
          signal: providerSignal,
          body: JSON.stringify({
            model,
            messages: localPayload.messages,
            max_completion_tokens: 4096,
            ...(heritageQuestion ? { temperature: 0.2 } : {}),
            reasoning_effort: "medium",
            reasoning_format: "hidden",
          }),
        });
        if (groqResponse.ok) {
          const groqPayload = (await groqResponse.json().catch(() => null)) as {
            choices?: Array<{
              finish_reason?: string;
              message?: { content?: string | null };
            }>;
          } | null;
          const choice = groqPayload?.choices?.[0];
          const answer = choice?.message?.content?.trim();
          if (choice?.finish_reason === "length") {
            providerFailureCode = "incomplete_response";
            console.warn("[Groq] Response reached its generation limit", { model });
            if (answer && (parsed.data.language !== "ar" || !hasArabicLanguageMix(answer))) {
              const continuationTimeout = AbortSignal.timeout(15_000);
              const continuationSignal = AbortSignal.any([request.signal, continuationTimeout]);
              try {
                const continuationResponse = await fetcher(
                  "https://api.groq.com/openai/v1/chat/completions",
                  {
                    method: "POST",
                    headers,
                    signal: continuationSignal,
                    body: JSON.stringify({
                      model,
                      messages: createContinuationMessages(
                        localPayload.messages,
                        answer,
                        parsed.data.language,
                      ),
                      max_completion_tokens: 4096,
                      ...(heritageQuestion ? { temperature: 0.2 } : {}),
                      reasoning_effort: "medium",
                      reasoning_format: "hidden",
                    }),
                  },
                );
                if (continuationResponse.ok) {
                  const continuationPayload = (await continuationResponse
                    .json()
                    .catch(() => null)) as {
                    choices?: Array<{
                      finish_reason?: string;
                      message?: { content?: string | null };
                    }>;
                  } | null;
                  const continuationChoice = continuationPayload?.choices?.[0];
                  const continuation = continuationChoice?.message?.content?.trim();
                  if (
                    continuation &&
                    continuationChoice?.finish_reason !== "length" &&
                    (parsed.data.language !== "ar" || !hasArabicLanguageMix(continuation))
                  ) {
                    console.info("[Groq] Completed a truncated response", { model });
                    const cleaned = removeRepeatedSentences(`${answer}\n\n${continuation}`);
                    if (cleaned.repetitionsRemoved) {
                      console.warn(
                        "[Groq] Removed repeated sentences from the completed response",
                        {
                          count: cleaned.repetitionsRemoved,
                        },
                      );
                    }
                    return asChatStream(cleaned.content, responseSources, parsed.data.language);
                  }
                } else {
                  console.warn("[Groq] Response continuation failed", {
                    model,
                    httpStatus: continuationResponse.status,
                  });
                }
              } catch (error) {
                console.warn("[Groq] Response continuation request failed", {
                  model,
                  timedOut: continuationTimeout.aborted,
                  reason: error instanceof Error ? error.message : "unknown",
                });
              }
            }
          }
          if (answer && (parsed.data.language !== "ar" || !hasArabicLanguageMix(answer))) {
            if (choice?.finish_reason !== "length") {
              const cleaned = removeRepeatedSentences(answer);
              if (cleaned.repetitionsRemoved) {
                console.warn("[Groq] Removed repeated sentences from the response", {
                  model,
                  count: cleaned.repetitionsRemoved,
                });
              }
              return asChatStream(cleaned.content, responseSources, parsed.data.language);
            }
          }
          console.warn("[Groq] Discarded incomplete or invalid-language response", { model });
        } else {
          console.error("[Groq] Request failed", { model, httpStatus: groqResponse.status });
          if (index === 0 && (groqResponse.status === 401 || groqResponse.status === 403)) break;
        }
      } catch (error) {
        console.error("[Groq] Provider request failed", {
          model,
          timedOut: providerTimeout.aborted,
          reason: error instanceof Error ? error.message : "unknown",
        });
        if (request.signal.aborted) break;
      }
      if (index < groqModels.length - 1) {
        console.info("[Groq] Trying alternate model", { model: groqModels[index + 1] });
      }
    }
  }

  // Gemini is the second hosted provider. Try a stable, lightweight model when
  // the primary is unavailable or cannot produce a valid answer.
  const geminiApiKey = readProviderEnv(suppliedEnv, "GEMINI_API_KEY")?.trim();
  let geminiFailureCode = "provider_error";
  let geminiFailureStatus = 502;
  if (geminiApiKey) {
    const localPayload = JSON.parse(chatRequest.body) as {
      messages: { role: string; content: string }[];
    };
    const systemText =
      localPayload.messages.find((message) => message.role === "system")?.content ?? "";
    const contents = localPayload.messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      }));
    const primaryModel = readProviderEnv(suppliedEnv, "GEMINI_MODEL")?.trim() || "gemini-3.8-flash";
    const geminiModels = [...new Set([primaryModel, "gemini-3.6-flash"])];
    for (const [index, model] of geminiModels.entries()) {
      const providerTimeout = AbortSignal.timeout(12_000);
      const providerSignal = AbortSignal.any([request.signal, providerTimeout]);
      try {
        const geminiResponse = await fetcher(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": geminiApiKey,
            },
            signal: providerSignal,
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemText }] },
              contents,
              generationConfig: {
                maxOutputTokens: 4096,
                ...(heritageQuestion ? { temperature: 0.2 } : {}),
              },
            }),
          },
        );

        if (geminiResponse.ok) {
          const geminiPayload = (await geminiResponse.json().catch(() => null)) as {
            candidates?: Array<{
              finishReason?: string;
              content?: { parts?: Array<{ text?: string }> };
            }>;
          } | null;
          const candidate = geminiPayload?.candidates?.[0];
          const answer = candidate?.content?.parts
            ?.map((part) => part.text ?? "")
            .join("")
            .trim();
          if (candidate?.finishReason === "MAX_TOKENS") {
            providerFailureCode = "incomplete_response";
            geminiFailureCode = "incomplete_response";
            if (answer && (parsed.data.language !== "ar" || !hasArabicLanguageMix(answer))) {
              const continuationTimeout = AbortSignal.timeout(15_000);
              const continuationSignal = AbortSignal.any([request.signal, continuationTimeout]);
              try {
                const continuationResponse = await fetcher(
                  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "x-goog-api-key": geminiApiKey,
                    },
                    signal: continuationSignal,
                    body: JSON.stringify({
                      systemInstruction: { parts: [{ text: systemText }] },
                      contents: createContinuationMessages(
                        localPayload.messages
                          .filter((message) => message.role !== "system")
                          .map((message) => ({
                            role: message.role === "assistant" ? "model" : "user",
                            content: message.content,
                          })),
                        answer,
                        parsed.data.language,
                      ).map((message) => ({
                        role: message.role === "assistant" ? "model" : "user",
                        parts: [{ text: message.content }],
                      })),
                      generationConfig: {
                        maxOutputTokens: 4096,
                        ...(heritageQuestion ? { temperature: 0.2 } : {}),
                      },
                    }),
                  },
                );
                if (continuationResponse.ok) {
                  const continuationPayload = (await continuationResponse
                    .json()
                    .catch(() => null)) as {
                    candidates?: Array<{
                      finishReason?: string;
                      content?: { parts?: Array<{ text?: string }> };
                    }>;
                  } | null;
                  const continuationCandidate = continuationPayload?.candidates?.[0];
                  const continuation = continuationCandidate?.content?.parts
                    ?.map((part) => part.text ?? "")
                    .join("")
                    .trim();
                  if (
                    continuation &&
                    continuationCandidate?.finishReason !== "MAX_TOKENS" &&
                    (parsed.data.language !== "ar" || !hasArabicLanguageMix(continuation))
                  ) {
                    console.info("[Gemini] Completed a truncated response", { model });
                    const cleaned = removeRepeatedSentences(`${answer}\n\n${continuation}`);
                    if (cleaned.repetitionsRemoved) {
                      console.warn(
                        "[Gemini] Removed repeated sentences from the completed response",
                        { count: cleaned.repetitionsRemoved },
                      );
                    }
                    return asChatStream(cleaned.content, responseSources, parsed.data.language);
                  }
                } else {
                  console.warn("[Gemini] Response continuation failed", {
                    model,
                    httpStatus: continuationResponse.status,
                  });
                }
              } catch (error) {
                console.warn("[Gemini] Response continuation request failed", {
                  model,
                  timedOut: continuationTimeout.aborted,
                  reason: error instanceof Error ? error.message : "unknown",
                });
              }
            }
          }
          if (
            answer &&
            candidate?.finishReason !== "MAX_TOKENS" &&
            (parsed.data.language !== "ar" || !hasArabicLanguageMix(answer))
          ) {
            const cleaned = removeRepeatedSentences(answer);
            if (cleaned.repetitionsRemoved) {
              console.warn("[Gemini] Removed repeated sentences from the response", {
                model,
                count: cleaned.repetitionsRemoved,
              });
            }
            return asChatStream(cleaned.content, responseSources, parsed.data.language);
          }
          if (candidate?.finishReason !== "MAX_TOKENS") {
            geminiFailureCode = answer ? "language_validation_failed" : "provider_error";
          }
          console.error("[Gemini] Discarded incomplete or invalid-language response", { model });
        } else {
          geminiFailureCode = geminiResponse.status === 429 ? "rate_limited" : "provider_error";
          geminiFailureStatus = geminiResponse.status === 429 ? 429 : 502;
          console.error("[Gemini] Request failed", {
            model,
            httpStatus: geminiResponse.status,
          });
          if (index === 0 && (geminiResponse.status === 401 || geminiResponse.status === 403))
            break;
        }
      } catch {
        geminiFailureCode = "provider_error";
        geminiFailureStatus = 502;
        console.error("[Gemini] Provider request failed", {
          model,
          timedOut: providerTimeout.aborted,
        });
        if (request.signal.aborted) break;
      }
      if (index < geminiModels.length - 1) {
        console.info("[Gemini] Trying alternate model", { model: geminiModels[index + 1] });
      }
    }
  }

  // Cloudflare Workers AI is the production safety net. It uses the Worker binding,
  // so it remains reachable when a third-party provider is down or rate-limited.
  const cloudflareAI =
    suppliedAI ?? (request as RequestWithCloudflareRuntime).runtime?.cloudflare?.env?.AI;
  if (cloudflareAI) {
    const localPayload = JSON.parse(chatRequest.body) as {
      messages: { role: "system" | "user" | "assistant"; content: string }[];
    };
    try {
      const result = (await cloudflareAI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
        messages: localPayload.messages,
        max_tokens: 2048,
        temperature: heritageQuestion ? 0.2 : 0.35,
      })) as { response?: unknown };
      const answer = typeof result?.response === "string" ? result.response.trim() : "";
      if (answer && (parsed.data.language !== "ar" || !hasArabicLanguageMix(answer))) {
        console.info("[Chat] Recovered response with Cloudflare Workers AI");
        const cleaned = removeRepeatedSentences(answer);
        if (cleaned.repetitionsRemoved) {
          console.warn("[Chat] Removed repeated sentences from the response", {
            count: cleaned.repetitionsRemoved,
          });
        }
        return asChatStream(cleaned.content, responseSources, parsed.data.language);
      }
      console.error("[Chat] Cloudflare Workers AI returned an empty or invalid-language response");
    } catch (error) {
      console.error("[Chat] Cloudflare Workers AI fallback failed", {
        reason: error instanceof Error ? error.name : "unknown",
      });
    }
  }

  if (
    parsed.data.language === "ar" &&
    heritageQuestion &&
    (groqApiKey || geminiApiKey || readProviderEnv(suppliedEnv, "NODE_ENV") === "production") &&
    localKnowledgeAnswer.content &&
    localKnowledgeSources.length
  ) {
    console.warn("[Chat] Using a directly relevant sourced answer after provider failures");
    return asChatStream(localKnowledgeAnswer.content, responseSources, parsed.data.language);
  }

  // Do not silently route hosted-provider failures to the local default model.
  // Ollama is available only when explicitly configured, or as the sole local provider.
  const ollamaBaseUrl = readProviderEnv(suppliedEnv, "OLLAMA_BASE_URL")?.trim();
  const production = readProviderEnv(suppliedEnv, "NODE_ENV") === "production";
  if (!ollamaBaseUrl && (production || groqApiKey || geminiApiKey)) {
    console.error("[Chat] All configured hosted AI providers are unavailable", {
      groqConfigured: Boolean(groqApiKey),
      geminiConfigured: Boolean(geminiApiKey),
      cloudflareAIConfigured: Boolean(cloudflareAI),
      geminiFailureCode,
      geminiFailureStatus,
    });
    return Response.json(
      {
        code: groqApiKey || geminiApiKey ? providerFailureCode : "not_configured",
      },
      { status: 503 },
    );
  }

  const requestPayload = JSON.parse(chatRequest.body) as {
    model: string;
    stream: boolean;
    options: {
      temperature: number;
      top_p: number;
      repeat_penalty: number;
      num_ctx: number;
      num_predict: number;
    };
    messages: { role: string; content: string }[];
  };
  console.info(
    "[Ollama request]",
    JSON.stringify(
      {
        url: chatRequest.url,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        model: requestPayload.model,
        stream: requestPayload.stream,
        options: requestPayload.options,
        systemPromptPresent: requestPayload.messages[0]?.role === "system",
        systemPromptLength: requestPayload.messages[0]?.content.length ?? 0,
        conversationMessageCount: requestPayload.messages.length - 1,
      },
      null,
      2,
    ),
  );
  let response: Response;
  const providerTimeout = AbortSignal.timeout(35_000);
  const providerSignal = AbortSignal.any([request.signal, providerTimeout]);
  try {
    response = await fetcher(chatRequest.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: providerSignal,
      body: chatRequest.body,
    });
  } catch {
    if (providerTimeout.aborted) {
      console.error("[Ollama] Request timed out", { model: requestPayload.model });
      return Response.json({ code: "timeout" }, { status: 504 });
    }
    console.error("[Ollama] Request could not reach server", {
      model: requestPayload.model,
      reason: "network_failure",
    });
    return Response.json({ code: "not_configured" }, { status: 503 });
  }

  if (!response) {
    console.error("[Ollama] Provider returned no response");
    return Response.json({ code: "provider_error" }, { status: 502 });
  }

  if (!response.ok) {
    let providerMessage = "";
    try {
      const errorPayload = (await response.json()) as { error?: string };
      providerMessage = errorPayload.error?.toLowerCase() ?? "";
    } catch {
      // Keep provider errors generic when the response is not JSON.
    }

    const code =
      response.status === 404 ||
      providerMessage.includes("not found") ||
      providerMessage.includes("model")
        ? "model_unavailable"
        : response.status === 429 ||
            providerMessage.includes("rate limit") ||
            providerMessage.includes("too many requests")
          ? "rate_limited"
          : response.status === 400 ||
              providerMessage.includes("invalid") ||
              providerMessage.includes("malformed")
            ? "invalid_request"
            : "provider_error";

    console.error("[Ollama] Request failed", {
      model: requestPayload.model,
      httpStatus: response.status,
      code,
    });
    return Response.json({ code }, { status: response.status });
  }

  if (!response.body) {
    return Response.json({ code: "unavailable" }, { status: 502 });
  }

  if (parsed.data.language === "ar") {
    return asProgressiveChatStream(async (emit) => {
      const finishReply = () => {
        const sourceSection = formatSourceSection(responseSources, parsed.data.language);
        if (sourceSection) emit({ message: { content: sourceSection } });
        emit({ done: true, done_reason: "stop" });
      };
      let reply: string;
      let doneReason: string | undefined;
      let streamedReply = "";
      let repetitionDetected = false;
      try {
        ({ content: reply, doneReason } = await consumeOllamaStream(response, (content) => {
          streamedReply += content;
          const cleaned = removeRepeatedSentences(streamedReply);
          if (cleaned.repetitionsRemoved) {
            if (!repetitionDetected) {
              emit({ reset: true });
              emit({ message: { content: cleaned.content } });
              repetitionDetected = true;
            }
            return;
          }
          if (!repetitionDetected) emit({ message: { content } });
        }));
      } catch (error) {
        console.error("[Ollama] Arabic response stream could not be parsed", {
          model: requestPayload.model,
          reason: error instanceof Error ? error.message : "unknown",
        });
        if (providerTimeout.aborted && !request.signal.aborted) {
          emit({ error: "timeout" });
        } else {
          emit({ error: "provider_error" });
        }
        return;
      }

      if (repetitionDetected) {
        const cleaned = removeRepeatedSentences(reply);
        console.warn("[Ollama] Removed repeated sentences from the response", {
          count: cleaned.repetitionsRemoved,
        });
        emit({ reset: true });
        emit({ message: { content: cleaned.content } });
      }

      if (doneReason === "length") {
        console.warn("[Ollama] Arabic response stopped at the generation limit", {
          model: requestPayload.model,
          doneReason,
        });
        emit({ error: "incomplete_response" });
        return;
      }

      if (hasArabicLanguageMix(reply)) {
        console.warn("[Ollama] Non-Arabic output detected; retrying with qwen3:8b.");
        const fallbackRequest = createArabicFallbackRequest(chatRequest);
        let fallbackResponse: Response;
        try {
          fallbackResponse = await fetcher(fallbackRequest.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: request.signal,
            body: fallbackRequest.body,
          });
        } catch {
          console.error("[Ollama] Arabic fallback request could not reach server", {
            model: "qwen3:8b",
            reason: "network_failure",
          });
          finishReply();
          return;
        }

        if (!fallbackResponse.ok) {
          console.error("[Ollama] Arabic fallback request failed", {
            model: "qwen3:8b",
            httpStatus: fallbackResponse.status,
          });
          finishReply();
          return;
        }

        let fallbackReply: string;
        let fallbackDoneReason: string | undefined;
        try {
          ({ content: fallbackReply, doneReason: fallbackDoneReason } = parseOllamaReply(
            await fallbackResponse.text(),
          ));
        } catch (error) {
          console.error("[Ollama] Arabic fallback response stream could not be parsed", {
            model: "qwen3:8b",
            reason: error instanceof Error ? error.message : "unknown",
          });
          finishReply();
          return;
        }
        if (fallbackDoneReason === "length") {
          console.warn("[Ollama] Arabic fallback response stopped at the generation limit", {
            model: "qwen3:8b",
            doneReason: fallbackDoneReason,
          });
          finishReply();
          return;
        }
        if (!fallbackReply.trim() || hasArabicLanguageMix(fallbackReply)) {
          console.error("[Ollama] Arabic fallback response failed validation", {
            model: "qwen3:8b",
            empty: !fallbackReply.trim(),
            languageMix: hasArabicLanguageMix(fallbackReply),
          });
          finishReply();
          return;
        }

        emit({ reset: true });
        console.info("[Ollama] Arabic fallback response completed", {
          model: "qwen3:8b",
          doneReason: fallbackDoneReason,
        });
        emit({ message: { content: fallbackReply } });
      }

      finishReply();
    });
  }

  return asProgressiveChatStream(async (emit) => {
    let reply: string;
    let doneReason: string | undefined;
    try {
      ({ content: reply, doneReason } = await consumeOllamaStream(response, (content) => {
        emit({ message: { content } });
      }));
    } catch (error) {
      console.error("[Ollama] Response stream could not be completed", {
        model: requestPayload.model,
        reason: error instanceof Error ? error.message : "unknown",
      });
      emit({ error: providerTimeout.aborted ? "timeout" : "provider_error" });
      return;
    }

    if (doneReason === "length") {
      emit({ error: "incomplete_response" });
      return;
    }

    const sourceSection = formatSourceSection(responseSources, parsed.data.language);
    if (sourceSection) emit({ message: { content: sourceSection } });
    emit({ done: true, done_reason: "stop" });
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: ({ request }) =>
        isValidSession(request.headers.get("cookie"))
          ? handleChatPost(request)
          : Response.json({ code: "unauthorized" }, { status: 401 }),
    },
  },
});
