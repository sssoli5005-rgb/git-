import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { ChatWorkspace, type ChatMessage, type Conversation } from "@/components/hero";
import { TouristHome } from "@/components/tourist-home";
import { Login } from "@/components/login";
import { ProjectFooter } from "@/components/project-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "دليل مصر الذكي | Egypt Smart Guide" },
      {
        name: "description",
        content:
          "ATHARA is a multilingual digital guide to Egyptian heritage, artifacts, inscriptions and history.",
      },
      { property: "og:title", content: "دليل مصر الذكي | Egypt Smart Guide" },
      {
        property: "og:description",
        content: "Explore Egyptian heritage through your camera and a multilingual digital guide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ATHARA | أثَرة" },
      {
        name: "twitter:description",
        content:
          "Explore Egyptian heritage, artifacts and stories with a multilingual digital guide.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    void fetch("/api/auth", { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { authenticated?: boolean }) => {
        setAuthenticated(payload.authenticated === true);
      })
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    // The server session cookie lasts 12 hours. Check it periodically instead
    // of logging the user out after an unrelated five-minute UI timer.
    const interval = window.setInterval(() => {
      void fetch("/api/auth", {
        credentials: "same-origin",
        cache: "no-store",
      })
        .then((response) => (response.ok ? response.json() : { authenticated: false }))
        .then((payload: { authenticated?: boolean }) => {
          if (payload.authenticated !== true) setAuthenticated(false);
        })
        .catch(() => undefined);
    }, 60 * 1000);

    return () => window.clearInterval(interval);
  }, [authenticated]);

  if (authenticated === null) return null;
  if (!authenticated) return <Login onAuthenticated={() => setAuthenticated(true)} />;

  async function logout() {
    await fetch("/api/auth", {
      method: "DELETE",
      credentials: "same-origin",
      cache: "no-store",
    }).catch(() => undefined);
    setAuthenticated(false);
  }

  return <PrivateApp onLogout={logout} />;
}

function PrivateApp({ onLogout }: { onLogout: () => void }) {
  const [screen, setScreen] = useState<"welcome" | "chat">("welcome");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  function startConversation() {
    setActiveConversationId(null);
    setSessionKey((current) => current + 1);
    setScreen("chat");
  }

  function openConversation(id: string) {
    setActiveConversationId(id);
    setSessionKey((current) => current + 1);
  }

  function updateConversation(id: string | null, messages: ChatMessage[]) {
    const conversationId = id ?? crypto.randomUUID();

    if (messages.length === 0) {
      setConversations((current) =>
        current.filter((conversation) => conversation.id !== conversationId),
      );
      setActiveConversationId((current) => (current === conversationId ? null : current));
      return conversationId;
    }

    setConversations((current) => {
      const previous = current.find((conversation) => conversation.id === conversationId);
      const firstUserMessage = messages.find((message) => message.role === "user");
      const updated: Conversation = {
        id: conversationId,
        title: previous?.title ?? firstUserMessage?.content.slice(0, 48) ?? "",
        messages,
      };
      return [updated, ...current.filter((conversation) => conversation.id !== conversationId)];
    });

    if (!id) setActiveConversationId(conversationId);
    return conversationId;
  }

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeConversationId) ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <SiteHeader showNavigation={false} onLogout={onLogout} />
      <main className="flex-1">
        {screen === "welcome" ? (
          <TouristHome onStartChat={startConversation} />
        ) : (
          <ChatWorkspace
            conversations={conversations}
            activeConversation={activeConversation}
            sessionKey={sessionKey}
            onHome={() => setScreen("welcome")}
            onStartNew={startConversation}
            onOpenConversation={openConversation}
            onMessagesChange={updateConversation}
          />
        )}
      </main>
      <ProjectFooter />
    </div>
  );
}
