CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"textColor" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
