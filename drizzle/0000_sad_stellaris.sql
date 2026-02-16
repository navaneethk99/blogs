CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(180) NOT NULL,
	"content" text NOT NULL,
	"image_url" varchar(1024) NOT NULL,
	"author_id" uuid NOT NULL,
	"author_name" varchar(160) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
