CREATE TYPE "public"."class_type_change_status" AS ENUM('none', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."coverage_request_status" AS ENUM('open', 'claimed', 'pending_approval', 'approved');--> statement-breakpoint
CREATE TYPE "public"."notification_preference" AS ENUM('email', 'sms');--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "class_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "coverage_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_class_type_id" integer NOT NULL,
	"current_class_type_id" integer NOT NULL,
	"location_id" integer NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"requested_by_instructor_id" uuid NOT NULL,
	"claimed_by_instructor_id" uuid,
	"reason" text,
	"status" "coverage_request_status" DEFAULT 'open' NOT NULL,
	"class_type_change_status" "class_type_change_status" DEFAULT 'none' NOT NULL,
	"approved_by_admin_id" uuid,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instructor_qualifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"instructor_id" uuid NOT NULL,
	"class_type_id" integer NOT NULL,
	"certification_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instructor_qualifications_instructor_id_class_type_id_unique" UNIQUE("instructor_id","class_type_id")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address_line1" text,
	"city" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "locations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"bio" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notification_preference" "notification_preference" DEFAULT 'email' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "coverage_requests" ADD CONSTRAINT "coverage_requests_original_class_type_id_class_types_id_fk" FOREIGN KEY ("original_class_type_id") REFERENCES "public"."class_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage_requests" ADD CONSTRAINT "coverage_requests_current_class_type_id_class_types_id_fk" FOREIGN KEY ("current_class_type_id") REFERENCES "public"."class_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage_requests" ADD CONSTRAINT "coverage_requests_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage_requests" ADD CONSTRAINT "coverage_requests_requested_by_instructor_id_profiles_id_fk" FOREIGN KEY ("requested_by_instructor_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage_requests" ADD CONSTRAINT "coverage_requests_claimed_by_instructor_id_profiles_id_fk" FOREIGN KEY ("claimed_by_instructor_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage_requests" ADD CONSTRAINT "coverage_requests_approved_by_admin_id_profiles_id_fk" FOREIGN KEY ("approved_by_admin_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_qualifications" ADD CONSTRAINT "instructor_qualifications_instructor_id_profiles_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_qualifications" ADD CONSTRAINT "instructor_qualifications_class_type_id_class_types_id_fk" FOREIGN KEY ("class_type_id") REFERENCES "public"."class_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coverage_requests_start_at_idx" ON "coverage_requests" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "coverage_requests_requested_by_instructor_id_idx" ON "coverage_requests" USING btree ("requested_by_instructor_id");--> statement-breakpoint
CREATE INDEX "coverage_requests_claimed_by_instructor_id_idx" ON "coverage_requests" USING btree ("claimed_by_instructor_id");--> statement-breakpoint
CREATE INDEX "instructor_qualifications_instructor_id_idx" ON "instructor_qualifications" USING btree ("instructor_id");--> statement-breakpoint
CREATE INDEX "instructor_qualifications_class_type_id_idx" ON "instructor_qualifications" USING btree ("class_type_id");