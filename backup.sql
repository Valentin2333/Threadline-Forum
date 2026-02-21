


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."vote_target" AS ENUM (
    'post',
    'comment'
);


ALTER TYPE "public"."vote_target" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."apply_vote_effect"("v_target_type" "public"."vote_target", "v_target_id" "uuid", "v_delta" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_author uuid;
begin
  if v_target_type = 'post' then
    update public.posts set score = score + v_delta where id = v_target_id;
    select author_id into v_author from public.posts where id = v_target_id;

  elsif v_target_type = 'comment' then
    update public.comments set score = score + v_delta where id = v_target_id;
    select author_id into v_author from public.comments where id = v_target_id;
  end if;

  if v_author is not null then
    update public.profiles set reputation = reputation + v_delta where id = v_author;
  end if;
end;
$$;


ALTER FUNCTION "public"."apply_vote_effect"("v_target_type" "public"."vote_target", "v_target_id" "uuid", "v_delta" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."apply_vote_to_score"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if tg_op = 'INSERT' then
    if new.target_type = 'post' then
      update public.posts
      set score = score + new.value
      where id = new.target_id;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.target_type = 'post' then
      update public.posts
      set score = score + (new.value - old.value)
      where id = new.target_id;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.target_type = 'post' then
      update public.posts
      set score = score - old.value
      where id = old.target_id;
    end if;
    return old;
  end if;

  return null;
end;
$$;


ALTER FUNCTION "public"."apply_vote_to_score"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."comments_count_sync"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.posts set comment_count = comment_count - 1 where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;


ALTER FUNCTION "public"."comments_count_sync"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (
    id,
    username,
    first_name,
    last_name,
    email,
    avatar_url,
    avatar_path,
    avatar_updated_at,
    is_blocked,
    reputation,
    is_active,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email,
    null,
    null,
    null,
    false,
    0,
    true,
    now(),
    now()
  );

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("uid" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = uid and ur.role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_manual_score_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- If this UPDATE is coming from a trigger, allow it
  if pg_trigger_depth() > 0 then
    return new;
  end if;

  -- Block direct score/comment_count changes from client updates
  if new.score is distinct from old.score then
    raise exception 'Score cannot be changed directly';
  end if;

  if new.comment_count is distinct from old.comment_count then
    raise exception 'Comment count cannot be changed directly';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."prevent_manual_score_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_username_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- allow setting username initially (old is null, new is not null)
  -- but block changing it afterwards
  if (old.username is not null) and (new.username is distinct from old.username) then
    raise exception 'Username cannot be changed';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."prevent_username_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_author_reputation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  affected_post_id uuid;
  affected_author_id uuid;
  new_reputation int;
BEGIN
  IF TG_OP = 'DELETE' THEN
    affected_post_id := OLD.target_id;
  ELSE
    affected_post_id := NEW.target_id;
  END IF;

  IF (TG_OP = 'DELETE' AND OLD.target_type = 'post')
     OR (TG_OP != 'DELETE' AND NEW.target_type = 'post') THEN

    SELECT author_id INTO affected_author_id
    FROM public.posts
    WHERE id = affected_post_id;

    IF affected_author_id IS NOT NULL THEN
      -- Calculate directly from votes, not from posts.score
      SELECT COALESCE(SUM(v.value), 0) INTO new_reputation
      FROM public.votes v
      JOIN public.posts p ON p.id = v.target_id
      WHERE v.target_type = 'post'
        AND p.author_id = affected_author_id;

      UPDATE public.profiles
      SET reputation = new_reputation
      WHERE id = affected_author_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_author_reputation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_reputation_on_post_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_reputation int;
BEGIN
  -- Recalculate reputation from remaining posts' votes
  SELECT COALESCE(SUM(v.value), 0) INTO new_reputation
  FROM public.votes v
  JOIN public.posts p ON p.id = v.target_id
  WHERE v.target_type = 'post'
    AND p.author_id = OLD.author_id;

  UPDATE public.profiles
  SET reputation = new_reputation
  WHERE id = OLD.author_id;

  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."update_reputation_on_post_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."votes_sync"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if (tg_op = 'INSERT') then
    perform public.apply_vote_effect(new.target_type, new.target_id, new.value);
    return new;
  elsif (tg_op = 'DELETE') then
    perform public.apply_vote_effect(old.target_type, old.target_id, -old.value);
    return old;
  elsif (tg_op = 'UPDATE') then
    perform public.apply_vote_effect(new.target_type, new.target_id, new.value - old.value);
    return new;
  end if;

  return null;
end;
$$;


ALTER FUNCTION "public"."votes_sync"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "score" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "comment_content_length" CHECK ((("char_length"("content") >= 1) AND ("char_length"("content") <= 8192)))
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "score" integer DEFAULT 0 NOT NULL,
    "comment_count" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "post_content_length" CHECK ((("char_length"("content") >= 32) AND ("char_length"("content") <= 8192))),
    CONSTRAINT "post_title_length" CHECK ((("char_length"("title") >= 16) AND ("char_length"("title") <= 64)))
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "avatar_url" "text",
    "is_blocked" boolean DEFAULT false NOT NULL,
    "reputation" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "avatar_path" "text",
    "avatar_updated_at" timestamp with time zone,
    "email" "text",
    "is_admin" boolean DEFAULT false NOT NULL,
    "phone" "text",
    CONSTRAINT "first_name_length" CHECK ((("char_length"("first_name") >= 4) AND ("char_length"("first_name") <= 32))),
    CONSTRAINT "last_name_length" CHECK ((("char_length"("last_name") >= 4) AND ("char_length"("last_name") <= 32))),
    CONSTRAINT "profiles_first_name_len" CHECK ((("char_length"("first_name") >= 4) AND ("char_length"("first_name") <= 32))),
    CONSTRAINT "profiles_last_name_len" CHECK ((("char_length"("last_name") >= 4) AND ("char_length"("last_name") <= 32))),
    CONSTRAINT "username_length" CHECK ((("char_length"("username") >= 3) AND ("char_length"("username") <= 32))),
    CONSTRAINT "username_length_check" CHECK ((("char_length"("username") >= 4) AND ("char_length"("username") <= 32)))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    CONSTRAINT "user_roles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "voter_id" "uuid" NOT NULL,
    "target_type" "public"."vote_target" NOT NULL,
    "target_id" "uuid" NOT NULL,
    "value" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "votes_value_check" CHECK (("value" = ANY (ARRAY['-1'::integer, 1])))
);


ALTER TABLE "public"."votes" OWNER TO "postgres";


ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "unique_vote" UNIQUE ("voter_id", "target_type", "target_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_comments_created_at" ON "public"."comments" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_comments_post_id" ON "public"."comments" USING "btree" ("post_id");



CREATE INDEX "idx_posts_comment_count" ON "public"."posts" USING "btree" ("comment_count" DESC);



CREATE INDEX "idx_posts_created_at" ON "public"."posts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_posts_score" ON "public"."posts" USING "btree" ("score" DESC);



CREATE UNIQUE INDEX "profiles_email_unique" ON "public"."profiles" USING "btree" ("lower"("email"));



CREATE UNIQUE INDEX "profiles_username_unique" ON "public"."profiles" USING "btree" ("lower"("username")) WHERE ("username" IS NOT NULL);



CREATE UNIQUE INDEX "profiles_username_unique_ci" ON "public"."profiles" USING "btree" ("lower"("username")) WHERE ("username" IS NOT NULL);



CREATE UNIQUE INDEX "votes_unique_user_target" ON "public"."votes" USING "btree" ("voter_id", "target_type", "target_id");



CREATE OR REPLACE TRIGGER "on_post_delete_update_reputation" AFTER DELETE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_reputation_on_post_delete"();



CREATE OR REPLACE TRIGGER "on_vote_update_reputation" AFTER INSERT OR DELETE OR UPDATE ON "public"."votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_author_reputation"();



CREATE OR REPLACE TRIGGER "trg_comments_count_delete" AFTER DELETE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."comments_count_sync"();



CREATE OR REPLACE TRIGGER "trg_comments_count_insert" AFTER INSERT ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."comments_count_sync"();



CREATE OR REPLACE TRIGGER "trg_comments_updated_at" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_prevent_manual_score_change" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_manual_score_change"();



CREATE OR REPLACE TRIGGER "trg_prevent_username_change" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_username_change"();



CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "votes_apply_score" AFTER INSERT OR DELETE OR UPDATE ON "public"."votes" FOR EACH ROW EXECUTE FUNCTION "public"."apply_vote_to_score"();



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete any comment" ON "public"."comments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can delete any post" ON "public"."posts" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can update any profile" ON "public"."profiles" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND ("profiles_1"."is_admin" = true)))));



CREATE POLICY "Profiles: delete by service" ON "public"."profiles" FOR DELETE TO "supabase_admin" USING (true);



CREATE POLICY "Profiles: delete own" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "Profiles: select own" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "Profiles: update own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can read their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "comments_delete_own_or_admin" ON "public"."comments" FOR DELETE USING ((("auth"."uid"() = "author_id") OR "public"."is_admin"("auth"."uid"())));



CREATE POLICY "comments_delete_service" ON "public"."comments" FOR DELETE TO "supabase_admin" USING (true);



CREATE POLICY "comments_delete_service_role" ON "public"."comments" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "comments_delete_supabase_admin" ON "public"."comments" FOR DELETE TO "supabase_admin" USING (true);



CREATE POLICY "comments_insert_auth_not_blocked" ON "public"."comments" FOR INSERT WITH CHECK ((("auth"."uid"() = "author_id") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."is_blocked" = false))))));



CREATE POLICY "comments_select_public" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "comments_update_own_or_admin" ON "public"."comments" FOR UPDATE USING ((("auth"."uid"() = "author_id") OR "public"."is_admin"("auth"."uid"()))) WITH CHECK ((("auth"."uid"() = "author_id") OR "public"."is_admin"("auth"."uid"())));



ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "posts_delete_own_or_admin" ON "public"."posts" FOR DELETE USING ((("auth"."uid"() = "author_id") OR "public"."is_admin"("auth"."uid"())));



CREATE POLICY "posts_delete_service" ON "public"."posts" FOR DELETE TO "supabase_admin" USING (true);



CREATE POLICY "posts_delete_service_role" ON "public"."posts" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "posts_delete_supabase_admin" ON "public"."posts" FOR DELETE TO "supabase_admin" USING (true);



CREATE POLICY "posts_insert_auth_not_blocked" ON "public"."posts" FOR INSERT WITH CHECK ((("auth"."uid"() = "author_id") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."is_blocked" = false))))));



CREATE POLICY "posts_select_public" ON "public"."posts" FOR SELECT USING (true);



CREATE POLICY "posts_update_own_or_admin" ON "public"."posts" FOR UPDATE USING ((("auth"."uid"() = "author_id") OR "public"."is_admin"("auth"."uid"()))) WITH CHECK ((("auth"."uid"() = "author_id") OR "public"."is_admin"("auth"."uid"())));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_delete_service" ON "public"."profiles" FOR DELETE TO "supabase_admin" USING (true);



CREATE POLICY "profiles_delete_service_role" ON "public"."profiles" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "profiles_delete_supabase_admin" ON "public"."profiles" FOR DELETE TO "supabase_admin" USING (true);



CREATE POLICY "profiles_select_public" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "profiles_update_self" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "roles_admin_all" ON "public"."user_roles" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_roles_delete_service" ON "public"."user_roles" FOR DELETE TO "supabase_admin" USING (true);



CREATE POLICY "user_roles_delete_service_role" ON "public"."user_roles" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "user_roles_delete_supabase_admin" ON "public"."user_roles" FOR DELETE TO "supabase_admin" USING (true);



ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "votes_delete_own" ON "public"."votes" FOR DELETE USING (("auth"."uid"() = "voter_id"));



CREATE POLICY "votes_delete_service" ON "public"."votes" FOR DELETE TO "supabase_admin" USING (true);



CREATE POLICY "votes_delete_service_role" ON "public"."votes" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "votes_delete_supabase_admin" ON "public"."votes" FOR DELETE TO "supabase_admin" USING (true);



CREATE POLICY "votes_insert_own" ON "public"."votes" FOR INSERT WITH CHECK (("auth"."uid"() = "voter_id"));



CREATE POLICY "votes_select_public" ON "public"."votes" FOR SELECT USING (true);



CREATE POLICY "votes_update_own" ON "public"."votes" FOR UPDATE USING (("auth"."uid"() = "voter_id")) WITH CHECK (("auth"."uid"() = "voter_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."apply_vote_effect"("v_target_type" "public"."vote_target", "v_target_id" "uuid", "v_delta" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."apply_vote_effect"("v_target_type" "public"."vote_target", "v_target_id" "uuid", "v_delta" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."apply_vote_effect"("v_target_type" "public"."vote_target", "v_target_id" "uuid", "v_delta" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."apply_vote_to_score"() TO "anon";
GRANT ALL ON FUNCTION "public"."apply_vote_to_score"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."apply_vote_to_score"() TO "service_role";



GRANT ALL ON FUNCTION "public"."comments_count_sync"() TO "anon";
GRANT ALL ON FUNCTION "public"."comments_count_sync"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."comments_count_sync"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_manual_score_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_manual_score_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_manual_score_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_username_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_username_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_username_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_author_reputation"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_author_reputation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_author_reputation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_reputation_on_post_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_reputation_on_post_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_reputation_on_post_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."votes_sync"() TO "anon";
GRANT ALL ON FUNCTION "public"."votes_sync"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."votes_sync"() TO "service_role";


















GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































