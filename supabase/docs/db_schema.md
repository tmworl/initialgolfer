Foreign keys relationships:
[
  {
    "source_table": "profiles",
    "source_column": "id",
    "target_table": "users",
    "target_column": "id"
  },
  {
    "source_table": "rounds",
    "source_column": "profile_id",
    "target_table": "profiles",
    "target_column": "id"
  },
  {
    "source_table": "rounds",
    "source_column": "course_id",
    "target_table": "courses",
    "target_column": "id"
  },
  {
    "source_table": "insights",
    "source_column": "round_id",
    "target_table": "rounds",
    "target_column": "id"
  },
  {
    "source_table": "insights",
    "source_column": "profile_id",
    "target_table": "profiles",
    "target_column": "id"
  },
  {
    "source_table": "shots",
    "source_column": "round_id",
    "target_table": "rounds",
    "target_column": "id"
  },
  {
    "source_table": "user_permissions",
    "source_column": "profile_id",
    "target_table": "profiles",
    "target_column": "id"
  }
]

Tables, structures:
[
  {
    "schema": "public",
    "table_name": "api_keys",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "api_keys",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "api_keys",
    "column_name": "key",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "api_keys",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "holes",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "par",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "api_course_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "club_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "location",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "country",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "latitude",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "longitude",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "num_holes",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "18",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "tees",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "courses",
    "column_name": "poi",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "insights",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "insights",
    "column_name": "profile_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "profiles",
    "target_column": "id"
  },
  {
    "schema": "public",
    "table_name": "insights",
    "column_name": "round_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": "rounds",
    "target_column": "id"
  },
  {
    "schema": "public",
    "table_name": "insights",
    "column_name": "insights",
    "data_type": "jsonb",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "insights",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "insights",
    "column_name": "feedback_rating",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "profiles",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "users",
    "target_column": "id"
  },
  {
    "schema": "public",
    "table_name": "profiles",
    "column_name": "email",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "profiles",
    "column_name": "handicap",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "profiles",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "profiles",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "rounds",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "rounds",
    "column_name": "profile_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "profiles",
    "target_column": "id"
  },
  {
    "schema": "public",
    "table_name": "rounds",
    "column_name": "course_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "courses",
    "target_column": "id"
  },
  {
    "schema": "public",
    "table_name": "rounds",
    "column_name": "date",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "rounds",
    "column_name": "is_complete",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "rounds",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "rounds",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "rounds",
    "column_name": "score",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "rounds",
    "column_name": "gross_shots",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "rounds",
    "column_name": "selected_tee_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "rounds",
    "column_name": "selected_tee_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "shots",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "shots",
    "column_name": "round_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "rounds",
    "target_column": "id"
  },
  {
    "schema": "public",
    "table_name": "shots",
    "column_name": "hole_number",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "shots",
    "column_name": "hole_data",
    "data_type": "jsonb",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "shots",
    "column_name": "total_score",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "shots",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "user_permissions",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "user_permissions",
    "column_name": "profile_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": "profiles",
    "target_column": "id"
  },
  {
    "schema": "public",
    "table_name": "user_permissions",
    "column_name": "permission_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "user_permissions",
    "column_name": "revenuecat_user_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "user_permissions",
    "column_name": "product_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "user_permissions",
    "column_name": "platform",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "user_permissions",
    "column_name": "active",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": "true",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "user_permissions",
    "column_name": "expires_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "user_permissions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "target_table": null,
    "target_column": null
  },
  {
    "schema": "public",
    "table_name": "user_permissions",
    "column_name": "metadata",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "target_table": null,
    "target_column": null
  }
]