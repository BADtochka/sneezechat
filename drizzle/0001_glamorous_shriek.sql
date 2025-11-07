CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author" text NOT NULL,
	"message" text NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	"edited_at" date
);
--> statement-breakpoint
DROP TABLE "todos" CASCADE;