import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LanguageProvider } from "@/i18n/language";
import { ChatWorkspace } from "./hero";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("ChatWorkspace request timeout", () => {
  it("aborts after 75 seconds and displays the timeout message", async () => {
    vi.useFakeTimers();
    const completeStream = `${JSON.stringify({ message: { content: "أنا مكملة معاك." }, done: true, done_reason: "stop" })}\n`;
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      if (fetchMock.mock.calls.length > 1) return Promise.resolve(new Response(completeStream));
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("The request was aborted", "AbortError"));
        });
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const onMessagesChange = vi.fn();

    render(
      <LanguageProvider>
        <ChatWorkspace
          conversations={[]}
          activeConversation={null}
          sessionKey={0}
          onHome={vi.fn()}
          onStartNew={vi.fn()}
          onOpenConversation={vi.fn()}
          onMessagesChange={onMessagesChange}
        />
      </LanguageProvider>,
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "عندي مشكلة" } });
    fireEvent.click(screen.getByRole("button", { name: "إرسال" }));

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(74_999);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "المساعد اتأخر في الرد. جرّب تاني بعد شوية.",
    );
    expect(screen.getByRole("status")).not.toHaveClass("text-destructive");

    vi.useRealTimers();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "رسالة بعد المهلة" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "إرسال" }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onMessagesChange).toHaveBeenCalledOnce();
    expect(onMessagesChange.mock.calls[0]?.[1]).toEqual([
      { role: "user", content: "رسالة بعد المهلة" },
      { role: "assistant", content: "أنا مكملة معاك." },
    ]);
  });
});

it("keeps streamed text visible when a timed-out response is incomplete", async () => {
  vi.useFakeTimers();
  const onMessagesChange = vi.fn();
  const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(`${JSON.stringify({ message: { content: "إجابة بدأت" } })}\n`),
        );
        init?.signal?.addEventListener("abort", () => {
          controller.error(new DOMException("The request was aborted", "AbortError"));
        });
      },
    });
    return Promise.resolve(new Response(stream));
  });
  vi.stubGlobal("fetch", fetchMock);

  render(
    <LanguageProvider>
      <ChatWorkspace
        conversations={[]}
        activeConversation={null}
        sessionKey={0}
        onHome={vi.fn()}
        onStartNew={vi.fn()}
        onOpenConversation={vi.fn()}
        onMessagesChange={onMessagesChange}
      />
    </LanguageProvider>,
  );

  fireEvent.change(screen.getByRole("textbox"), { target: { value: "سؤال أثري" } });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "إرسال" }));
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(screen.getByRole("log")).toHaveTextContent("إجابة بدأت");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(75_000);
    await Promise.resolve();
  });

  expect(screen.getByRole("log")).toHaveTextContent("إجابة بدأت");
  expect(screen.getByRole("status")).toHaveTextContent("المساعد اتأخر في الرد.");
  expect(onMessagesChange).not.toHaveBeenCalled();
});

describe("ChatWorkspace source links", () => {
  it("renders cited HTTP sources as safe clickable links", () => {
    render(
      <LanguageProvider>
        <ChatWorkspace
          conversations={[
            {
              id: "saqqara",
              title: "سقارة",
              messages: [
                {
                  role: "assistant",
                  content:
                    "[اليونسكو](https://whc.unesco.org/en/list/86/)\n[رابط غير آمن](javascript:alert(1))",
                },
              ],
            },
          ]}
          activeConversation={{
            id: "saqqara",
            title: "سقارة",
            messages: [
              {
                role: "assistant",
                content:
                  "[اليونسكو](https://whc.unesco.org/en/list/86/)\n[رابط غير آمن](javascript:alert(1))",
              },
            ],
          }}
          sessionKey={0}
          onHome={vi.fn()}
          onStartNew={vi.fn()}
          onOpenConversation={vi.fn()}
          onMessagesChange={vi.fn()}
        />
      </LanguageProvider>,
    );

    expect(screen.getByRole("link", { name: "اليونسكو" })).toHaveAttribute(
      "href",
      "https://whc.unesco.org/en/list/86/",
    );
    expect(screen.queryByRole("link", { name: "رابط غير آمن" })).not.toBeInTheDocument();
  });
});

describe("ChatWorkspace response completion", () => {
  it("saves a response only after its completion marker arrives", async () => {
    const onMessagesChange = vi.fn();
    const completeStream = [
      { message: { content: "خلينا نفهم الموقف." }, done: false },
      { message: { content: " إيه اللي حصل بعدها؟" }, done: true, done_reason: "stop" },
    ]
      .map((chunk) => JSON.stringify(chunk))
      .join("\n")
      .concat("\n");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(completeStream)),
    );

    render(
      <LanguageProvider>
        <ChatWorkspace
          conversations={[]}
          activeConversation={null}
          sessionKey={0}
          onHome={vi.fn()}
          onStartNew={vi.fn()}
          onOpenConversation={vi.fn()}
          onMessagesChange={onMessagesChange}
        />
      </LanguageProvider>,
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "عندي مشكلة" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "إرسال" }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(onMessagesChange).toHaveBeenCalledOnce();
    expect(onMessagesChange.mock.calls.at(0)?.[1]).toEqual([
      { role: "user", content: "عندي مشكلة" },
      { role: "assistant", content: "خلينا نفهم الموقف. إيه اللي حصل بعدها؟" },
    ]);
  });

  it("keeps the streamed answer anchored at its beginning instead of following every token", async () => {
    let streamController: ReadableStreamDefaultController<Uint8Array> | undefined;
    const fetchMock = vi.fn(
      async () =>
        new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              streamController = controller;
            },
          }),
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      const top = this.getAttribute("role") === "log" ? 100 : 160;
      return {
        x: 0,
        y: top,
        top,
        left: 0,
        right: 400,
        bottom: top + 400,
        width: 400,
        height: 400,
        toJSON: () => ({}),
      };
    });

    render(
      <LanguageProvider>
        <ChatWorkspace
          conversations={[]}
          activeConversation={null}
          sessionKey={0}
          onHome={vi.fn()}
          onStartNew={vi.fn()}
          onOpenConversation={vi.fn()}
          onMessagesChange={vi.fn()}
        />
      </LanguageProvider>,
    );

    const log = screen.getByRole("log");
    Object.defineProperty(log, "scrollHeight", { configurable: true, value: 300 });
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "سؤال أثري" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "إرسال" }));
      await Promise.resolve();
    });

    await act(async () => {
      streamController?.enqueue(
        new TextEncoder().encode(`${JSON.stringify({ message: { content: "بداية الإجابة" } })}\n`),
      );
      await Promise.resolve();
    });
    const scrollTopAtReplyStart = log.scrollTop;

    await act(async () => {
      streamController?.enqueue(
        new TextEncoder().encode(
          `${JSON.stringify({ message: { content: " وبقية الإجابة", done: true, done_reason: "stop" } })}\n`,
        ),
      );
      streamController?.close();
      await Promise.resolve();
    });

    expect(scrollTopAtReplyStart).toBe(336);
    expect(log.scrollTop).toBe(scrollTopAtReplyStart);
  });

  it("replaces a rejected streamed draft with the validated fallback before saving", async () => {
    const onMessagesChange = vi.fn();
    const completeStream = [
      { message: { content: "مسودة غير صالحة" }, done: false },
      { reset: true },
      { message: { content: "الرد البديل الصحيح." }, done: false },
      { done: true, done_reason: "stop" },
    ]
      .map((chunk) => JSON.stringify(chunk))
      .join("\n")
      .concat("\n");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(completeStream)),
    );

    render(
      <LanguageProvider>
        <ChatWorkspace
          conversations={[]}
          activeConversation={null}
          sessionKey={0}
          onHome={vi.fn()}
          onStartNew={vi.fn()}
          onOpenConversation={vi.fn()}
          onMessagesChange={onMessagesChange}
        />
      </LanguageProvider>,
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "اشرحلي" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "إرسال" }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(onMessagesChange.mock.calls.at(0)?.[1]).toEqual([
      { role: "user", content: "اشرحلي" },
      { role: "assistant", content: "الرد البديل الصحيح." },
    ]);
  });

  it.each([
    ["missing completion marker", { message: { content: "رد توقف بدري" } }],
    [
      "generation limit reached",
      {
        message: { content: "رد وصل لحد التوليد" },
        done: true,
        done_reason: "length",
      },
    ],
  ])("does not save an incomplete response (%s)", async (_caseName, chunk) => {
    const onMessagesChange = vi.fn();
    const fetchMock = vi.fn(async () => new Response(`${JSON.stringify(chunk)}\n`));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <LanguageProvider>
        <ChatWorkspace
          conversations={[]}
          activeConversation={null}
          sessionKey={0}
          onHome={vi.fn()}
          onStartNew={vi.fn()}
          onOpenConversation={vi.fn()}
          onMessagesChange={onMessagesChange}
        />
      </LanguageProvider>,
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "عندي مشكلة" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "إرسال" }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onMessagesChange).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("مربع الرسالة");
    expect(screen.getByRole("textbox")).toHaveValue("عندي مشكلة");
    expect(screen.getByText(/رد توقف بدري|رد وصل لحد التوليد/u)).toBeInTheDocument();
  });

  it.each([
    [
      "connection failure",
      () => Promise.reject(new TypeError("fetch failed")),
      "حصلت مشكلة في الاتصال. جرّب تاني.",
    ],
    [
      "invalid NDJSON",
      () => Promise.resolve(new Response("{invalid json}\n")),
      "حصلت مشكلة مؤقتة في الاتصال بالمساعد. رسالتك لسه موجودة في مربع الكتابة؛ جرّبي الإرسال تاني بعد لحظة.",
    ],
    [
      "incomplete response",
      () =>
        Promise.resolve(new Response(`${JSON.stringify({ message: { content: "جزء ناقص" } })}\n`)),
      "الرد ماكملش دلوقتي. سؤالك لسه مكتوب في مربع الرسالة؛ جرّبي الإرسال تاني من غير ما تعيدي كتابته.",
    ],
  ])(
    "recovers and keeps the existing conversation after a %s",
    async (_caseName, failure, error) => {
      const priorMessages = [
        { role: "user" as const, content: "موقف سابق محفوظ" },
        { role: "assistant" as const, content: "رد سابق محفوظ." },
      ];
      const conversation = {
        id: "conversation-1",
        title: "محادثة محفوظة",
        messages: priorMessages,
      };
      const onMessagesChange = vi.fn();
      const completeStream = `${JSON.stringify({ message: { content: "رد ناجح بعد التعافي." }, done: true, done_reason: "stop" })}\n`;
      const fetchMock = vi
        .fn<typeof fetch>()
        .mockImplementationOnce(failure)
        .mockResolvedValueOnce(new Response(completeStream));
      vi.stubGlobal("fetch", fetchMock);

      render(
        <LanguageProvider>
          <ChatWorkspace
            conversations={[conversation]}
            activeConversation={conversation}
            sessionKey={0}
            onHome={vi.fn()}
            onStartNew={vi.fn()}
            onOpenConversation={vi.fn()}
            onMessagesChange={onMessagesChange}
          />
        </LanguageProvider>,
      );

      fireEvent.change(screen.getByRole("textbox"), { target: { value: "رسالة فشلت" } });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "إرسال" }));
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(screen.getByRole("status")).toHaveTextContent(error);
      expect(screen.getByRole("status")).not.toHaveClass("text-destructive");
      expect(screen.getByRole("log")).toHaveTextContent("رد سابق محفوظ.");
      if (error.includes("مربع الرسالة")) {
        expect(screen.getByText("جزء ناقص")).toBeInTheDocument();
      } else {
        expect(screen.queryByText("جزء ناقص")).not.toBeInTheDocument();
      }
      expect(onMessagesChange).not.toHaveBeenCalled();

      fireEvent.change(screen.getByRole("textbox"), { target: { value: "رسالة جديدة" } });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "إرسال" }));
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(onMessagesChange).toHaveBeenCalledOnce();
      expect(onMessagesChange.mock.calls[0]?.[1]).toEqual([
        ...priorMessages,
        { role: "user", content: "رسالة جديدة" },
        { role: "assistant", content: "رد ناجح بعد التعافي." },
      ]);
    },
  );
});
