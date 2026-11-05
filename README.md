# Ekhtaberha Gentle Reflection

Create a multilingual web app called "Ekhtaberha | اختبرها", an AI-powered emotional support, self-reflection, and decision-making assistant.

IMPORTANT: Build the visual interface first. Do not connect paid APIs or add complicated backend features yet.

Languages

Support these six languages:

Arabic (العربية) — default language, full RTL layout.

English — full LTR layout.

French (Français).

Spanish (Español).

German (Deutsch).

Chinese (中文, Simplified Chinese).

Add a visible language selector in the header. When a user changes the language, translate ALL interface text into the selected language and switch the layout direction correctly between RTL and LTR. Do not simply translate the title while leaving other interface elements in the previous language. Store the selected language locally so it remains selected on the next visit when possible.

Visual design

Modern, calming, welcoming, professional.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2920592b-92bb-4a0a-80ca-d4bcfbf0e5f6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back to Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and Bun — [install Bun](https://bun.sh/).

```sh
git clone <this-repository-url>
cd <repository-name>
bun install
bun run dev
```

## Free Cloudflare deployment

The repository includes a GitHub Actions workflow named **Deploy to Cloudflare Workers**.

1. Create/sign in to a Cloudflare account and open **Workers & Pages**.
2. In GitHub, open this repository's **Settings → Secrets and variables → Actions**.
3. Add repository secrets named `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Create the API token in Cloudflare with permission to deploy Workers.
4. Open GitHub **Actions → Deploy to Cloudflare Workers → Run workflow**. The workflow runs the tests, builds the Cloudflare Worker, and deploys it. Later pushes to `main` deploy automatically once both secrets exist.
5. After the first deployment, open the Worker in Cloudflare and add the runtime variables/secrets under **Settings → Variables and Secrets**:
   - `APP_USERNAME`
   - `APP_PASSWORD_HASH` or `ADMIN_PASSWORD`
   - `APP_SESSION_SECRET`
   - Both AI provider keys: `GROQ_API_KEY` and `GEMINI_API_KEY` (Groq is tried first; Gemini is the fallback)
   - Optional model overrides: `GROQ_MODEL` or `GEMINI_MODEL`

Never put private keys in frontend variables, source files, or GitHub commits. If the current Vercel deployment has working login settings, copy those values directly into Cloudflare's Worker secrets without sharing them in chat.

Store both `GROQ_API_KEY` and `GEMINI_API_KEY` as GitHub Actions repository secrets. The deploy workflow copies them to the Cloudflare Worker as Worker secrets after deployment. GitHub Actions secrets are not available to local development; for local testing, configure both keys in the root `.env.local` file as described below.

The Cloudflare Workers Free plan has a daily request allowance. AI providers also apply their own free-tier usage limits; a free hosted AI API cannot be promised as unlimited. Groq's free tier may return HTTP 429 when its account/model limits are reached.

## AI provider configuration

The selected hosted chat providers are Groq first, then Gemini as its backup. Defaults are `qwen/qwen3.8-27b`, then `openai/gpt-oss-20b` on Groq; if Groq cannot answer, Gemini tries `gemini-3.8-flash`, then `gemini-3.6-flash`. Set both `GROQ_API_KEY` and `GEMINI_API_KEY` to enable both providers. Optional primary-model overrides are `GROQ_MODEL` and `GEMINI_MODEL`; the source-controlled fallback code keeps the alternate models. If a model is throttled, unavailable, returns invalid-language text, or reaches its output limit, the server tries its configured alternate before moving to the next provider, then uses Cloudflare Workers AI when available. These fallbacks reduce interruptions but do not bypass provider-wide quotas or outages; replacing a key is not a remedy for HTTP 429 or 503. Keep keys server-side only. The image scanner uses Gemini first, retries with a backup Gemini model, then uses Cloudflare Workers AI when available. It also searches Wikipedia for related article summaries; those text results are references, not proof that the photographed object was identified. Optional scanner model overrides are `GEMINI_VISION_MODEL` and `GEMINI_VISION_FALLBACK_MODEL`. Free-tier usage is subject to provider quotas and availability. Local Ollama is supported for development only when the server can reach the Ollama host; a deployed Cloudflare Worker cannot call Ollama at `localhost` on your personal computer.

Questions about Egyptian history and heritage trigger live retrieval from approved government, university, museum, and archaeological-mission websites. Wikipedia may be used only as a public index to discover links to those sites; its article text is not used as answer evidence. Source links are shown when the user asks for them. If live retrieval fails, the request continues to the configured AI provider with relevant curated knowledge and an instruction to answer cautiously, distinguish generally established context from facts verified during that turn, and never invent sources. Search failure alone does not stop the conversation. Topics with a reviewed, directly answerable entry in `src/lib/knowledge-base.ts` can use that answer instead of generated text, protecting those answers from provider hallucinations and allowing them to work during provider outages. The verified response about deity iconography separates style, symbolism, religion, and political patronage, and uses the UCL Amarna-period evidence rather than an invented sequence of Amun depictions.

### Persistent chat behavior

The chat's response style and evidence rules are stored in the project itself, not in an individual Copilot account:

- `src/lib/chat-instructions.ts` defines the runtime assistant behavior.
- `src/routes/api.chat.ts` controls trusted-source search, provider fallback, and handling when search is unavailable.
- `src/lib/knowledge-base.ts` contains curated heritage answers and references.
- `AGENTS.md` records project-local guidance for future coding sessions.
- `src/routes/-api.chat.test.ts` and `src/lib/chat-instructions.test.ts` protect these behaviors with regression tests.

The provider choices, model defaults, and failover implementation are stored in `.env.example`, `src/routes/api.chat.ts`, and `.github/workflows/deploy-cloudflare.yml`. Keep these files together when copying or backing up the project. Changing the AI-provider account or key does not copy project files; it may change provider availability, but should not change these saved provider choices or response rules. API keys are intentionally excluded from project files; securely add both keys to the new machine's ignored `.env.local` file or to the deployment platform's secret store.

For local development, add `GROQ_API_KEY` and/or `GEMINI_API_KEY` to the root `.env.local` file and restart `npm run dev`. The Vite server loads provider keys and model overrides for server-side use only; they are not exposed as frontend variables. Never paste a key into chat or commit it.

### Image scanner engines

The scanner uses independent free vision engines when they are configured: Gemini with a free-tier API key, plus local Qwen2.5-VL and InternVL3 through Ollama. Qwen2.5-VL 7B is available through Ollama as `qwen2.5vl`; InternVL3 availability depends on the local Ollama build/tag catalog, so verify the exact installed tag with `ollama list` before setting `INTERNVL_VISION_MODEL`. Set `OLLAMA_BASE_URL=http://127.0.0.1:11434`. Override `QWEN_VISION_MODEL` or `INTERNVL_VISION_MODEL` when using different installed tags. Qwen2.5-VL 7B and InternVL3-8B list Apache-2.0-compatible model metadata, but deployments must retain and review each model repository's license terms. The worker combines only agreed observations and records unavailable engines instead of presenting unsupported guesses as facts. Search references remain public web results or official collection records, not proof of visual identity.
