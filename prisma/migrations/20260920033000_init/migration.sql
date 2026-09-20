-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "websites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "tracking_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "websites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "website_id" TEXT NOT NULL,
    "anonymous_id" TEXT NOT NULL,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "website_id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "referrer" TEXT,
    "device" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "country" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "website_id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "referrer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "websites_tracking_id_key" ON "websites"("tracking_id");

-- CreateIndex
CREATE INDEX "websites_user_id_idx" ON "websites"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_website_id_anonymous_id_key" ON "visitors"("website_id", "anonymous_id");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_id_website_id_key" ON "visitors"("id", "website_id");

-- CreateIndex
CREATE INDEX "sessions_website_id_started_at_idx" ON "sessions"("website_id", "started_at");

-- CreateIndex
CREATE INDEX "sessions_visitor_id_website_id_idx" ON "sessions"("visitor_id", "website_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_id_website_id_visitor_id_key" ON "sessions"("id", "website_id", "visitor_id");

-- CreateIndex
CREATE INDEX "page_views_website_id_created_at_idx" ON "page_views"("website_id", "created_at");

-- CreateIndex
CREATE INDEX "page_views_website_id_path_idx" ON "page_views"("website_id", "path");

-- CreateIndex
CREATE INDEX "page_views_visitor_id_website_id_idx" ON "page_views"("visitor_id", "website_id");

-- CreateIndex
CREATE INDEX "page_views_session_id_website_id_visitor_id_idx" ON "page_views"("session_id", "website_id", "visitor_id");

-- AddForeignKey
ALTER TABLE "websites" ADD CONSTRAINT "websites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_visitor_id_website_id_fkey" FOREIGN KEY ("visitor_id", "website_id") REFERENCES "visitors"("id", "website_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_visitor_id_website_id_fkey" FOREIGN KEY ("visitor_id", "website_id") REFERENCES "visitors"("id", "website_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_session_id_website_id_visitor_id_fkey" FOREIGN KEY ("session_id", "website_id", "visitor_id") REFERENCES "sessions"("id", "website_id", "visitor_id") ON DELETE CASCADE ON UPDATE CASCADE;
