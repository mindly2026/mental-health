CREATE TYPE "public"."user_role" AS ENUM('customer', 'clinic');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'customer' NOT NULL;