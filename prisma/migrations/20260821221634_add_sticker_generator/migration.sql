-- CreateTable
CREATE TABLE "sticker_packs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "theme" VARCHAR(80) NOT NULL,
    "style" VARCHAR(80) NOT NULL,
    "provider" VARCHAR(40) NOT NULL DEFAULT 'mock',
    "count" INTEGER NOT NULL DEFAULT 6,
    "size" INTEGER NOT NULL DEFAULT 1024,
    "transparent" BOOLEAN NOT NULL DEFAULT true,
    "outline" BOOLEAN NOT NULL DEFAULT false,
    "batch_instructions" TEXT,
    "negative_prompt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sticker_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sticker_items" (
    "id" TEXT NOT NULL,
    "pack_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "instructions" TEXT,
    "negative_instructions" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sticker_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sticker_assets" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "pack_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "filename" VARCHAR(200) NOT NULL,
    "mime" VARCHAR(40) NOT NULL DEFAULT 'image/png',
    "width" INTEGER NOT NULL DEFAULT 1024,
    "height" INTEGER NOT NULL DEFAULT 1024,
    "data" BYTEA NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sticker_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sticker_packs_company_id_idx" ON "sticker_packs"("company_id");

-- CreateIndex
CREATE INDEX "sticker_items_company_id_idx" ON "sticker_items"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "sticker_items_pack_id_name_key" ON "sticker_items"("pack_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "sticker_assets_item_id_key" ON "sticker_assets"("item_id");

-- CreateIndex
CREATE INDEX "sticker_assets_pack_id_idx" ON "sticker_assets"("pack_id");

-- CreateIndex
CREATE INDEX "sticker_assets_company_id_idx" ON "sticker_assets"("company_id");

-- AddForeignKey
ALTER TABLE "sticker_packs" ADD CONSTRAINT "sticker_packs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticker_packs" ADD CONSTRAINT "sticker_packs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticker_items" ADD CONSTRAINT "sticker_items_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "sticker_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticker_items" ADD CONSTRAINT "sticker_items_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticker_assets" ADD CONSTRAINT "sticker_assets_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "sticker_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticker_assets" ADD CONSTRAINT "sticker_assets_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "sticker_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticker_assets" ADD CONSTRAINT "sticker_assets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
