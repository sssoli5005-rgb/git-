<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

# Architecture rules

- All user-facing strings live in `src/i18n/translations.ts` (one dictionary per language); components read text through `useLanguage()` from `src/i18n/language.tsx`. Never hardcode interface copy in components — the app must fully switch between six languages including Arabic RTL.
- Design tokens (colors, fonts, shadows, gradients) live in `src/styles.css`; use semantic utilities only, no hardcoded color classes in components.

## Chat behavior guardrails

- Preserve the Egyptian heritage guide's natural, friendly Egyptian Arabic voice and use conversation context; adapt answer depth to the user's request instead of defaulting to canned or overly long replies.
- For Egyptology questions, attempt trusted-source search first and use retrieved or curated evidence to ground concrete claims. Separate direct evidence, interpretation, general background, mythology, and unsupported modern claims.
- Trusted-source evidence is preferred, not a hard limit on every stable explanation: when live search fails, continue with cautious, well-established general knowledge for safe historical and explanatory questions, clearly distinguishing it from material verified during the turn.
- Keep actual evidence mandatory for specific artifact/mummy/tomb/image identification, exact inscription readings, provenance, contested dates, recent/current facts, exact scripture, high-impact personal advice, and explicit source requests. Never invent sources or imply a search succeeded.
- Show source links only when the user asks for references, except when the user supplied sources and specifically asked for an answer based on them; then place each supplied link beside the claim it supports.
- Preserve the selected hosted chat providers and failover order: Groq first, then Gemini. Keep both API keys server-side; model defaults and provider fallback logic live in `.env.example` and `src/routes/api.chat.ts`.
- Never claim ATHARA is affiliated with UCL or another institution. Keep these runtime behavior rules in `src/lib/chat-instructions.ts`, and cover changes to search fallbacks/source display in `src/routes/-api.chat.test.ts`.
