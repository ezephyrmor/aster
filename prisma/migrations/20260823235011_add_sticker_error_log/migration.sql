-- CreateTable
CREATE TABLE "sticker_error_logs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pack_id" TEXT,
    "item_id" TEXT,
    "pack_name" VARCHAR(120),
    "theme" VARCHAR(80),
    "provider" VARCHAR(40) NOT NULL DEFAULT 'mock',
    "sticker" VARCHAR(120) NOT NULL,
    "error" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sticker_error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sticker_error_logs_company_id_idx" ON "sticker_error_logs"("company_id");

-- AddForeignKey
ALTER TABLE "sticker_error_logs" ADD CONSTRAINT "sticker_error_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
