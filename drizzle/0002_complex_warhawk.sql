ALTER TABLE "messages" ADD COLUMN "updatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "edited_at";