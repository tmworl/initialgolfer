[
  {
    "schema": "auth",
    "table_name": "audit_log_entries",
    "column_name": "instance_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "audit_log_entries",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "audit_log_entries",
    "column_name": "payload",
    "data_type": "json",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "audit_log_entries",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "audit_log_entries",
    "column_name": "ip_address",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": "''::character varying",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "flow_state",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "flow_state",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "flow_state",
    "column_name": "auth_code",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "flow_state",
    "column_name": "code_challenge_method",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "flow_state",
    "column_name": "code_challenge",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "flow_state",
    "column_name": "provider_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "flow_state",
    "column_name": "provider_access_token",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "flow_state",
    "column_name": "provider_refresh_token",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "flow_state",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "flow_state",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "flow_state",
    "column_name": "authentication_method",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "flow_state",
    "column_name": "auth_code_issued_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "identities",
    "column_name": "provider_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "identities",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "users",
    "target_column": "id"
  },
  {
    "schema": "auth",
    "table_name": "identities",
    "column_name": "identity_data",
    "data_type": "jsonb",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "identities",
    "column_name": "provider",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "identities",
    "column_name": "last_sign_in_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "identities",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "identities",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "identities",
    "column_name": "email",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "identities",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "instances",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "instances",
    "column_name": "uuid",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "instances",
    "column_name": "raw_base_config",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "instances",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "instances",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_amr_claims",
    "column_name": "session_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "sessions",
    "target_column": "id"
  },
  {
    "schema": "auth",
    "table_name": "mfa_amr_claims",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_amr_claims",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_amr_claims",
    "column_name": "authentication_method",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_amr_claims",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "factor_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "mfa_factors",
    "target_column": "id"
  },
  {
    "schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "verified_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "ip_address",
    "data_type": "inet",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "otp_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "web_authn_session_data",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "users",
    "target_column": "id"
  },
  {
    "schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "friendly_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "factor_type",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "status",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "secret",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "phone",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "last_challenged_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "web_authn_credential",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "web_authn_aaguid",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "users",
    "target_column": "id"
  },
  {
    "schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "token_type",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "token_hash",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "relates_to",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "created_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "instance_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": "nextval('auth.refresh_tokens_id_seq'::regclass)",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "token",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "user_id",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "revoked",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "parent",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "session_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": "sessions",
    "target_column": "id"
  },
  {
    "schema": "auth",
    "table_name": "saml_providers",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_providers",
    "column_name": "sso_provider_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "sso_providers",
    "target_column": "id"
  },
  {
    "schema": "auth",
    "table_name": "saml_providers",
    "column_name": "entity_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_providers",
    "column_name": "metadata_xml",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_providers",
    "column_name": "metadata_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_providers",
    "column_name": "attribute_mapping",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_providers",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_providers",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_providers",
    "column_name": "name_id_format",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "sso_provider_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "sso_providers",
    "target_column": "id"
  },
  {
    "schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "request_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "for_email",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "redirect_to",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "flow_state_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": "flow_state",
    "target_column": "id"
  },
  {
    "schema": "auth",
    "table_name": "schema_migrations",
    "column_name": "version",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sessions",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sessions",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "users",
    "target_column": "id"
  },
  {
    "schema": "auth",
    "table_name": "sessions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sessions",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sessions",
    "column_name": "factor_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sessions",
    "column_name": "aal",
    "data_type": "USER-DEFINED",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sessions",
    "column_name": "not_after",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sessions",
    "column_name": "refreshed_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sessions",
    "column_name": "user_agent",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sessions",
    "column_name": "ip",
    "data_type": "inet",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sessions",
    "column_name": "tag",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sso_domains",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sso_domains",
    "column_name": "sso_provider_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "sso_providers",
    "target_column": "id"
  },
  {
    "schema": "auth",
    "table_name": "sso_domains",
    "column_name": "domain",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sso_domains",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sso_domains",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sso_providers",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sso_providers",
    "column_name": "resource_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sso_providers",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "sso_providers",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "instance_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "aud",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "role",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "email",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "encrypted_password",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "email_confirmed_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "invited_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "confirmation_token",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "confirmation_sent_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "recovery_token",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "recovery_sent_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "email_change_token_new",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "email_change",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "email_change_sent_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "last_sign_in_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "raw_app_meta_data",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "raw_user_meta_data",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "is_super_admin",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "phone",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "NULL::character varying",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "phone_confirmed_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "phone_change",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "''::character varying",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "phone_change_token",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "''::character varying",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "phone_change_sent_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "confirmed_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "email_change_token_current",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "''::character varying",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "email_change_confirm_status",
    "data_type": "smallint",
    "is_nullable": "YES",
    "column_default": "0",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "banned_until",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "reauthentication_token",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "''::character varying",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "reauthentication_sent_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "is_sso_user",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": "false",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "deleted_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "auth",
    "table_name": "users",
    "column_name": "is_anonymous",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": "false",
    "target_table": null,
    "target_column": null
  }
]