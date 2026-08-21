// Shared types for the sticker generator UI (client-side).

export type StickerStatus =
  | "pending"
  | "generating"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface StickerAssetDTO {
  id: string;
  itemId: string;
  filename: string;
  width: number;
  height: number;
  mime: string;
}

export interface StickerItemDTO {
  id: string;
  name: string;
  instructions?: string | null;
  negativeInstructions?: string | null;
  status: StickerStatus;
  error?: string | null;
  sortOrder: number;
  asset?: StickerAssetDTO | null;
}

export interface StickerPackDTO {
  id: string;
  name: string;
  theme: string;
  style: string;
  provider?: string;
  count: number;
  size: number;
  transparent: boolean;
  outline: boolean;
  batchInstructions?: string | null;
  negativePrompt?: string | null;
  items: StickerItemDTO[];
}

export interface PackConfig {
  name: string;
  theme: string;
  style: string;
  provider: string;
  count: number;
  size: number;
  transparent: boolean;
  outline: boolean;
  batchInstructions: string;
  negativePrompt: string;
}

export const DEFAULT_PACK_CONFIG: PackConfig = {
  name: "My Sticker Pack",
  theme: "coffee",
  style: "kawaii",
  provider: "mock",
  count: 6,
  size: 1024,
  transparent: true,
  outline: false,
  batchInstructions: "",
  negativePrompt: "",
};

export interface ClientItem {
  key: string;
  id?: string | null;
  name: string;
  instructions: string;
  negativeInstructions: string;
  status: StickerStatus;
  error?: string | null;
  asset?: StickerAssetDTO | null;
  destroyed?: boolean;
}