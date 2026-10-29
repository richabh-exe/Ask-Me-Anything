CREATE TABLE "answers" (
	"question_id" uuid PRIMARY KEY NOT NULL,
	"host_id" text NOT NULL,
	"body" text NOT NULL,
	"template" text NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "answers_body_length" CHECK (char_length("answers"."body") between 1 and 500),
	CONSTRAINT "answers_template_valid" CHECK ("answers"."template" in ('notebook', 'ink', 'haldi', 'margin', 'chalk'))
);
--> statement-breakpoint
CREATE TABLE "ask_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"host_id" text NOT NULL,
	"asker_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"handle" text NOT NULL,
	"display_name" text NOT NULL,
	"prompt" text NOT NULL,
	"mode" text DEFAULT 'anonymous' NOT NULL,
	"filter_level" text DEFAULT 'standard' NOT NULL,
	"blocked_words" text[] DEFAULT '{}'::text[] NOT NULL,
	"paused" boolean DEFAULT false NOT NULL,
	"age_confirmed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_handle_unique" UNIQUE("handle"),
	CONSTRAINT "profiles_handle_format" CHECK ("profiles"."handle" ~ '^[a-z0-9_]{3,20}$'),
	CONSTRAINT "profiles_display_name_length" CHECK (char_length("profiles"."display_name") between 1 and 40),
	CONSTRAINT "profiles_prompt_length" CHECK (char_length("profiles"."prompt") between 1 and 80),
	CONSTRAINT "profiles_mode_valid" CHECK ("profiles"."mode" in ('anonymous', 'named', 'choice')),
	CONSTRAINT "profiles_filter_level_valid" CHECK ("profiles"."filter_level" in ('relaxed', 'standard', 'strict'))
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host_id" text NOT NULL,
	"body" text NOT NULL,
	"asker_name" text,
	"status" text NOT NULL,
	"moderation" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questions_body_length" CHECK (char_length("questions"."body") between 1 and 300),
	CONSTRAINT "questions_asker_name_length" CHECK ("questions"."asker_name" is null or char_length("questions"."asker_name") between 1 and 40),
	CONSTRAINT "questions_status_valid" CHECK ("questions"."status" in ('new', 'answered', 'filtered'))
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_host_id_profiles_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ask_log" ADD CONSTRAINT "ask_log_host_id_profiles_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_host_id_profiles_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "answers_host_public_idx" ON "answers" USING btree ("host_id","is_public","answered_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ask_log_host_hash_created_idx" ON "ask_log" USING btree ("host_id","asker_hash","created_at");--> statement-breakpoint
CREATE INDEX "questions_host_status_created_idx" ON "questions" USING btree ("host_id","status","created_at" DESC NULLS LAST);