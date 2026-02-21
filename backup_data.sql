SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict OtfwOene1tkGJUb05EF9cHNjjK02WEVbaB5rDcXkaYucs7cJCgxzoebVrOfSNrc

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'fcf9802e-3e54-481b-81bd-56960fcc39ac', 'authenticated', 'authenticated', 'shpeev@gmail.com', '$2a$10$E6brXUUr8UkPT9OB.8ze1.ic9rxH4M6Hwe2ppZBq7.Gi98WgNeGoy', '2026-02-10 21:16:07.988464+00', NULL, '', '2026-02-10 21:15:51.99976+00', '', NULL, '', '', NULL, '2026-02-18 15:55:10.135989+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "fcf9802e-3e54-481b-81bd-56960fcc39ac", "email": "shpeev@gmail.com", "username": "Smisl", "last_name": "Peev", "first_name": "Stanimir", "email_verified": true, "phone_verified": false}', NULL, '2026-02-10 21:15:51.958719+00', '2026-02-18 15:55:10.221191+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6d4f3b14-cc36-4321-a16c-307f3c64eb90', 'authenticated', 'authenticated', 'v.tenev10@gmail.comm', '$2a$10$ba8/JqEMwV37FgloUUhmX.Me8OJB4ftOpPsgDofFCsxvzkRJHyctW', '2026-02-21 09:52:43.500054+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-21 10:11:38.197429+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "6d4f3b14-cc36-4321-a16c-307f3c64eb90", "email": "v.tenev10@gmail.comm", "username": "valcho2", "last_name": "Tenev", "first_name": "Valentin", "email_verified": true, "phone_verified": false}', NULL, '2026-02-21 09:52:43.492603+00', '2026-02-21 10:11:38.221237+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c973459c-29e8-480a-a800-fb9b2d0c891e', 'authenticated', 'authenticated', 'v.tenev10@gmail.commm', '$2a$10$kUKiNs7sFwDV9PZWMHqKzeO8jFFeFmtiJ93Uo7JrBfJKO1I9xavTm', '2026-02-21 09:52:56.209099+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-21 10:12:21.673724+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "c973459c-29e8-480a-a800-fb9b2d0c891e", "email": "v.tenev10@gmail.commm", "username": "valcho3", "last_name": "Tenev", "first_name": "Valentin", "email_verified": true, "phone_verified": false}', NULL, '2026-02-21 09:52:56.201715+00', '2026-02-21 10:12:21.675965+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '72247f76-97ac-44ab-b0e9-96148e0366d6', 'authenticated', 'authenticated', 'v.tenev10@gmail.com', '$2a$10$GNSGOV.QL5EKdnFX6xJBqOO0Ktwlm2JorBB.boOxgxLrQmWoUnZTG', '2026-02-21 09:52:32.660304+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-21 10:12:44.11546+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "72247f76-97ac-44ab-b0e9-96148e0366d6", "email": "v.tenev10@gmail.com", "username": "valcho", "last_name": "Tenev", "first_name": "Valentin", "email_verified": true, "phone_verified": false}', NULL, '2026-02-21 09:52:32.585957+00', '2026-02-21 10:12:44.120628+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('fcf9802e-3e54-481b-81bd-56960fcc39ac', 'fcf9802e-3e54-481b-81bd-56960fcc39ac', '{"sub": "fcf9802e-3e54-481b-81bd-56960fcc39ac", "email": "shpeev@gmail.com", "username": "Smisl", "last_name": "Peev", "first_name": "Stanimir", "email_verified": true, "phone_verified": false}', 'email', '2026-02-10 21:15:51.988981+00', '2026-02-10 21:15:51.989046+00', '2026-02-10 21:15:51.989046+00', '7a29ca34-cfed-4046-86bf-d94fa628e27e'),
	('72247f76-97ac-44ab-b0e9-96148e0366d6', '72247f76-97ac-44ab-b0e9-96148e0366d6', '{"sub": "72247f76-97ac-44ab-b0e9-96148e0366d6", "email": "v.tenev10@gmail.com", "username": "valcho", "last_name": "Tenev", "first_name": "Valentin", "email_verified": false, "phone_verified": false}', 'email', '2026-02-21 09:52:32.650127+00', '2026-02-21 09:52:32.65019+00', '2026-02-21 09:52:32.65019+00', '2e495271-b7f7-4784-ab52-6bd51700e15d'),
	('6d4f3b14-cc36-4321-a16c-307f3c64eb90', '6d4f3b14-cc36-4321-a16c-307f3c64eb90', '{"sub": "6d4f3b14-cc36-4321-a16c-307f3c64eb90", "email": "v.tenev10@gmail.comm", "username": "valcho2", "last_name": "Tenev", "first_name": "Valentin", "email_verified": false, "phone_verified": false}', 'email', '2026-02-21 09:52:43.496639+00', '2026-02-21 09:52:43.496689+00', '2026-02-21 09:52:43.496689+00', '36d8d387-9ab3-4ff5-9a16-208cdb56dd1b'),
	('c973459c-29e8-480a-a800-fb9b2d0c891e', 'c973459c-29e8-480a-a800-fb9b2d0c891e', '{"sub": "c973459c-29e8-480a-a800-fb9b2d0c891e", "email": "v.tenev10@gmail.commm", "username": "valcho3", "last_name": "Tenev", "first_name": "Valentin", "email_verified": false, "phone_verified": false}', 'email', '2026-02-21 09:52:56.207129+00', '2026-02-21 09:52:56.207173+00', '2026-02-21 09:52:56.207173+00', '8fc303a2-624c-4aca-a0e8-e3d4f88f1141');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('aecaf25a-aea8-4541-bbca-f044aa023d17', '72247f76-97ac-44ab-b0e9-96148e0366d6', '2026-02-21 10:12:44.115567+00', '2026-02-21 10:12:44.115567+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '212.95.187.89', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('aecaf25a-aea8-4541-bbca-f044aa023d17', '2026-02-21 10:12:44.120941+00', '2026-02-21 10:12:44.120941+00', 'password', '3df6c7ff-9600-4c0c-8645-afbfd26314be');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 189, '75uarwkposhh', '72247f76-97ac-44ab-b0e9-96148e0366d6', false, '2026-02-21 10:12:44.119662+00', '2026-02-21 10:12:44.119662+00', NULL, 'aecaf25a-aea8-4541-bbca-f044aa023d17');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "username", "first_name", "last_name", "avatar_url", "is_blocked", "reputation", "created_at", "updated_at", "is_active", "avatar_path", "avatar_updated_at", "email", "is_admin", "phone") VALUES
	('c973459c-29e8-480a-a800-fb9b2d0c891e', 'valcho3', 'Valentin', 'Tenev', NULL, false, 0, '2026-02-21 09:52:56.201396+00', '2026-02-21 09:55:40.748792+00', true, NULL, NULL, 'v.tenev10@gmail.commm', false, NULL),
	('6d4f3b14-cc36-4321-a16c-307f3c64eb90', 'valcho2', 'Valentin', 'Tenev', NULL, false, 0, '2026-02-21 09:52:43.492238+00', '2026-02-21 10:13:25.794297+00', true, NULL, NULL, 'v.tenev10@gmail.comm', false, NULL),
	('fcf9802e-3e54-481b-81bd-56960fcc39ac', 'Smisl', 'Stanimir', 'Peev', 'fcf9802e-3e54-481b-81bd-56960fcc39ac/avatar.png', false, 0, '2026-02-10 21:15:51.957006+00', '2026-02-21 09:21:48.216004+00', true, NULL, NULL, 'shpeev@gmail.com', true, NULL),
	('72247f76-97ac-44ab-b0e9-96148e0366d6', 'valcho', 'Valentin', 'Tenev', '72247f76-97ac-44ab-b0e9-96148e0366d6/avatar.png', false, 0, '2026-02-21 09:52:32.583806+00', '2026-02-21 10:48:52.850496+00', true, NULL, NULL, 'v.tenev10@gmail.com', true, '+359886338688');


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."votes" ("id", "voter_id", "target_type", "target_id", "value", "created_at") VALUES
	('058b05b6-0149-43e9-885e-3f54c26af8fd', '6d4f3b14-cc36-4321-a16c-307f3c64eb90', 'post', '466e7aaf-65e3-498a-b421-19da43b6b3fe', 1, '2026-02-21 09:53:42.947384+00'),
	('07488409-341f-4e21-bdb1-e7db09636a1e', '6d4f3b14-cc36-4321-a16c-307f3c64eb90', 'post', 'a9b85af6-b3c2-4b2c-9a09-bd85166c743e', 1, '2026-02-21 09:53:45.156417+00'),
	('17aa8fb1-d1d2-43b8-a928-8915d2d2cea2', '6d4f3b14-cc36-4321-a16c-307f3c64eb90', 'post', '0996290e-5764-45d6-82b7-cea0923d1e71', 1, '2026-02-21 09:53:49.91378+00'),
	('4bc068b4-c9bd-4190-9b7b-64940702c6b2', '72247f76-97ac-44ab-b0e9-96148e0366d6', 'post', '466e7aaf-65e3-498a-b421-19da43b6b3fe', 1, '2026-02-21 09:55:13.493931+00'),
	('f8137a50-1122-4ad7-aadd-b347b180c2b1', '72247f76-97ac-44ab-b0e9-96148e0366d6', 'post', '96e574c0-d9c4-47f3-b67b-e81c2a08c501', 1, '2026-02-21 10:03:26.078587+00'),
	('1ea10334-1086-464e-8b97-889597288853', '72247f76-97ac-44ab-b0e9-96148e0366d6', 'post', 'd6ed9312-81c9-4611-a9b5-cd7288f1923f', -1, '2026-02-21 10:03:26.782594+00'),
	('e4a7f791-b32a-46a0-88bc-3968094d876d', '72247f76-97ac-44ab-b0e9-96148e0366d6', 'post', '9140ba53-e6ba-4ddc-8af4-0a68ce764902', -1, '2026-02-21 10:48:10.158471+00'),
	('cdc506b5-acfb-40c7-aabe-86888c69d7bc', 'fcf9802e-3e54-481b-81bd-56960fcc39ac', 'post', 'c902a99a-4708-42f7-b690-0298d735a7bf', 1, '2026-02-16 14:46:39.843881+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('avatars', 'avatars', NULL, '2026-01-31 17:11:10.213662+00', '2026-01-31 17:11:10.213662+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('b0af89a9-3dfc-4911-8a04-ab4951b494d3', 'avatars', '72247f76-97ac-44ab-b0e9-96148e0366d6/avatar.png', '72247f76-97ac-44ab-b0e9-96148e0366d6', '2026-02-21 10:29:44.350284+00', '2026-02-21 10:29:44.350284+00', '2026-02-21 10:29:44.350284+00', '{"eTag": "\"c5fa5e5d24260c2e6ecd6dd7bd26f9d6\"", "size": 104015, "mimetype": "image/png", "cacheControl": "max-age=0", "lastModified": "2026-02-21T10:29:45.000Z", "contentLength": 104015, "httpStatusCode": 200}', '8991c86d-b660-464e-97e6-88076aa26045', '72247f76-97ac-44ab-b0e9-96148e0366d6', '{}'),
	('431f07b7-18a6-4515-b0a7-397fb770cc68', 'avatars', 'fcf9802e-3e54-481b-81bd-56960fcc39ac/avatar.png', 'fcf9802e-3e54-481b-81bd-56960fcc39ac', '2026-02-15 09:58:26.818215+00', '2026-02-15 09:58:26.818215+00', '2026-02-15 09:58:26.818215+00', '{"eTag": "\"7db7d68812942615e554cf17499226ee\"", "size": 893120, "mimetype": "image/png", "cacheControl": "max-age=0", "lastModified": "2026-02-15T09:58:27.000Z", "contentLength": 893120, "httpStatusCode": 200}', 'c2d6e384-db9e-478a-bfbe-1bde79818422', 'fcf9802e-3e54-481b-81bd-56960fcc39ac', '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 189, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict OtfwOene1tkGJUb05EF9cHNjjK02WEVbaB5rDcXkaYucs7cJCgxzoebVrOfSNrc

RESET ALL;
