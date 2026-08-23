/**
 * AI provider abstraction for sticker generation.
 *
 * Public API barrel — all sticker-generation providers (OpenAI, Stability,
 * Google/Imagen, OpenRouter, Hugging Face, and the local mock) are implemented
 * as modular workers under `./providers/` and dispatched by `generateSticker()`.
 *
 * This file re-exports the stable public surface that routes and tests import,
 * so nothing outside the ai module needs to know about the per-provider layout.
 * API keys live only in server env vars (never shipped to the browser) and are
 * read per-provider at runtime.
 */
export * from "./providers/_common";
export * from "./providers/registry";
