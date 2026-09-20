CREATE TABLE "ingestion_rate_limits" (
    "id" TEXT NOT NULL,
    "website_id" TEXT NOT NULL,
    "identity_hash" TEXT NOT NULL,
    "window_start" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "ingestion_rate_limits_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ingestion_rate_limits_website_id_identity_hash_window_start_key"
ON "ingestion_rate_limits"("website_id", "identity_hash", "window_start");

CREATE INDEX "ingestion_rate_limits_window_start_idx"
ON "ingestion_rate_limits"("window_start");

ALTER TABLE "ingestion_rate_limits"
ADD CONSTRAINT "ingestion_rate_limits_website_id_fkey"
FOREIGN KEY ("website_id") REFERENCES "websites"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
