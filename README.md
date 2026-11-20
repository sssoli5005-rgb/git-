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
   - Chat-only secrets: `CHAT_GROQ_API_KEY`, `CHAT_GEMINI_API_KEY`, and `CHAT_OPENROUTER_API_KEY` (third research provider)
   - Scanner-only secrets: `SCANNER_GEMINI_API_KEY`, `SCANNER_GROQ_API_KEY`, and optional `SCANNER_OPENROUTER_API_KEY`
   - Optional chat model overrides: `CHAT_GROQ_MODEL` and `CHAT_GEMINI_MODEL`
   - Optional scanner model overrides: `SCANNER_GEMINI_VISION_MODEL`, `SCANNER_GROQ_VISION_MODEL`, and related `SCANNER_*` settings

Never put private keys in frontend variables, source files, or GitHub commits. If the current Vercel deployment has working login settings, copy those values directly into Cloudflare's Worker secrets without sharing them in chat.

Store the new chat and scanner secrets as GitHub Actions repository secrets. The deploy workflow writes them to the Worker under separate names. For backward compatibility, the old `GROQ_API_KEY` and `GEMINI_API_KEY` secrets are still accepted as temporary fallbacks for both paths, and `OPENROUTER_API_KEY` is accepted as the scanner's fallback. To give chat and scanning fully independent provider quotas, set distinct values for the new `CHAT_*` and `SCANNER_*` secrets rather than relying on those legacy fallbacks. GitHub Actions secrets are not available to local development; configure the matching names in the root `.env.local` file.

The Cloudflare Workers Free plan has a daily request allowance. AI providers also apply their own free-tier usage limits; a free hosted AI API cannot be promised as unlimited. Groq's free tier may return HTTP 429 when its account/model limits are reached. Cloudflare Web Search uses the selected provider's list price through AI Gateway credits, or a provider key configured on the gateway; Exa, Linkup, and Ceramic searches are not automatically free or unlimited.

## AI provider configuration

ATHARA now has two independent AI pipelines. The chat uses only `CHAT_GROQ_API_KEY`, `CHAT_GEMINI_API_KEY`, and `CHAT_OPENROUTER_API_KEY` for its language models. Before asking a model to draft a factual answer, the server queries Cloudflare Web Search through three independent indexes — Exa, Linkup, and Ceramic — in parallel, validates returned HTTPS hosts against the categorized trusted-source directory, and retrieves approved source pages where possible. When a trusted institution blocks direct retrieval, its provider-returned snippet may be used only as explicitly labelled limited evidence. The results are combined and deduplicated; a page surfaced by multiple search indexes is not treated as independent factual corroboration. If this three-index pass yields no usable evidence, Groq browser search, Gemini Google Search grounding, and OpenRouter web search remain separate fallback checks. Factual answers must be grounded in retrieved approved sources or directly relevant reviewed knowledge entries. If none is available, the chat withholds unsupported details rather than asking the scanner or its vision models to answer. Chat does not call the scanner's Cloudflare Workers AI binding.

The image scanner has its own image/vision and research chain: Cloudflare Workers AI vision, Gemini Vision, Groq Vision, and optional OpenRouter vision models. Its trusted-source search attempts Cloudflare Web Search first, Gemini Google Search second, and Groq browser search third. Each provider is skipped on errors, limits, or if it cannot lead to a readable allowlisted institutional page. A title or snippet alone is never returned as confirmed evidence. It uses only `SCANNER_GEMINI_API_KEY`, `SCANNER_GROQ_API_KEY`, `SCANNER_OPENROUTER_API_KEY`, and `SCANNER_*` model/index settings. Scanner failures never route a request to the chat endpoint or chat models. The two routes and settings are kept separate; one pipeline's prompts, image inputs, and provider selection do not enter the other.

For genuinely separate provider quotas, configure different API keys under the `CHAT_*` and `SCANNER_*` names. Old `GROQ_API_KEY` and `GEMINI_API_KEY` GitHub secrets remain as a migration fallback, but using them for both paths means the provider account's quota is still shared even though the app pipelines are isolated. A provider fallback can reduce interruptions, but it cannot bypass account-wide limits or provider outages. Keep all keys server-side only. Local Ollama settings are split into `CHAT_OLLAMA_*` and `SCANNER_OLLAMA_*`; deployed Workers cannot call Ollama at `localhost` on your personal computer.

Questions about Egyptian history and heritage trigger live retrieval from approved government, university, museum, and archaeological-mission websites. Wikipedia may be used only as a public index to discover links to those sites; its article text is not used as answer evidence. Source links are shown when the user asks for them. If live retrieval fails, the request continues to the configured AI provider with relevant curated knowledge and an instruction to answer cautiously, distinguish generally established context from facts verified during that turn, and never invent sources. Search failure alone does not stop the conversation. Topics with a reviewed, directly answerable entry in `src/lib/knowledge-base.ts` can use that answer instead of generated text, protecting those answers from provider hallucinations and allowing them to work during provider outages. The verified response about deity iconography separates style, symbolism, religion, and political patronage, and uses the UCL Amarna-period evidence rather than an invented sequence of Amun depictions.

### Persistent chat behavior

The chat's response style and evidence rules are stored in the project itself, not in an individual Copilot account:

- `src/lib/chat-instructions.ts` defines the runtime assistant behavior.
- `src/routes/api.chat.ts` controls trusted-source search, provider fallback, and handling when search is unavailable.
- `src/lib/knowledge-base.ts` contains curated heritage answers and references.
- `src/lib/trusted-source-catalog.ts` contains a categorized directory of 50+ official institutions, museums, universities, archives, scientific/health agencies, and specialist references, plus topic routing and conservative entity-spelling correction.
- `AGENTS.md` records project-local guidance for future coding sessions.
- `src/routes/-api.chat.test.ts` and `src/lib/chat-instructions.test.ts` protect these behaviors with regression tests.

The provider choices, model defaults, and failover implementation are stored in `.env.example`, `src/routes/api.chat.ts`, and `.github/workflows/deploy-cloudflare.yml`. Keep these files together when copying or backing up the project. Changing the AI-provider account or key does not copy project files; it may change provider availability, but should not change these saved provider choices or response rules. API keys are intentionally excluded from project files; securely add both keys to the new machine's ignored `.env.local` file or to the deployment platform's secret store.

For local development, add `CHAT_GROQ_API_KEY` and `CHAT_GEMINI_API_KEY` for chat, and `SCANNER_GEMINI_API_KEY`, `SCANNER_GROQ_API_KEY`, and optionally `SCANNER_OPENROUTER_API_KEY` for scanning to the root `.env.local` file. The Vite server loads these server-side settings only; they are not exposed as frontend variables. Never paste a key into chat or commit it.

### Image scanner engines

The scanner's optional recognition path uses an OpenCLIP `ViT-B-32` image embedding index and FAISS. The index builder only includes Met Public Domain records, Cleveland CC0 records, and Wikimedia Commons files with an allowlisted free license; Wikidata records must have a P18 image and P195 collection in Egypt. Google Vision, SerpApi, Smithsonian, and Europeana connectors are not included, so this setup needs no paid API or credit balance. The legacy vision fallback can still describe a photo, but it does not establish an artifact identity.

#### Build the index locally

Use Python 3.12 on Linux for local builds. The current Windows Python 3.15 environment cannot install FAISS; on Windows use WSL2 Ubuntu, or build in Colab below. All packages and sources are free. The first run downloads OpenCLIP weights; later runs reuse them and resume from SQLite checkpoints.

```sh
python3.12 -m venv .venv
. .venv/bin/activate
python -m pip install -r scanner/requirements.txt
python scanner/build_index.py --device auto
```

Use the same build command again to resume. Add `--max-items 20` for a small connectivity test; that capped index is not suitable for real identification. Generated files live under `scanner/index_data/` and are ignored by Git.

#### Build in Google Colab

Use a free Colab runtime with GPU enabled, clone/upload the repository, install `scanner/requirements.txt`, and run:

```python
!pip install -r scanner/requirements.txt
!python scanner/build_index.py --device cuda --output /content/athara-index
```

Zip and download the complete `/content/athara-index` directory, then extract it as `scanner/index_data/` in the project. Keep `index.faiss`, `index-map.json`, `manifest.json`, and `metadata.sqlite` together. The same script runs in Colab; no paid search connector is used.

#### Run the local FAISS service

Keep this service running beside the Vite app. On Windows, run it inside WSL2 Ubuntu with Python 3.12; WSL2 forwards its localhost port to the Windows host. Set `SCANNER_INDEX_URL=http://127.0.0.1:8765` in the root `.env.local`, then start the sidecar:

```sh
source .venv/bin/activate
python scanner/search_server.py
```

In a second terminal, start the app:

```powershell
npm run dev
```

With the index and app running, verify the mask, Nefertiti, and Sphinx using:

```sh
python scanner/smoke_test.py --app-url http://127.0.0.1:4173
```

The scanner resizes and validates each upload before querying the index for five nearest records. It returns `confirmed` only when the best score is at least `SCANNER_INDEX_MATCH_THRESHOLD` (default `0.85`), the first two hits share the same entity, and the record URL belongs to an allowed source domain. A supported source-backed candidate above `SCANNER_PROBABLE_THRESHOLD` (default `0.65`) is `probable`; otherwise it remains `unverified`. A failed or unconfigured local index falls through without exposing internal errors to visitors. Restart Vite after changing `.env.local`.

FAISS and SQLite run in this local Python sidecar; a Cloudflare Worker cannot load local FAISS files. For Cloudflare deployment, the index service must be hosted separately at an HTTPS `SCANNER_INDEX_URL`; do not point a deployed Worker at your computer's `localhost`. The public museum, Commons, Wikipedia, and Wikidata APIs used for source lookup are free but may rate-limit requests. Source details and license information are retained with each indexed record and shown as links in results.
