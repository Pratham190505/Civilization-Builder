# Backend Compatibility Report

## Summary of Compatibility

- **Perfectly Aligned Models**: 0 / 51
- **Mismatched Models**: 51 / 51
- **Missing Models (Tables in DB but no model)**: 2
- **Extra Models (Models in codebase but no table in DB)**: 5

## Missing Models (Need Creation)

- `regional_admin_scope` (Should create model file `regionalAdminScope.js`)
- `school_admin_mapping` (Should create model file `schoolAdminMapping.js`)

## Extra Models (Need Removal/Refactoring)

- Model: `RolePermission` (Table: `role_permissions`)
- Model: `UserSession` (Table: `user_sessions`)
- Model: `UserPreference` (Table: `user_preferences`)
- Model: `AdminProfile` (Table: `admin_profiles`)
- Model: `SchoolSocialAccount` (Table: `school_social_accounts`)

## Model Column & Constraint Mismatches (Need Real Table Alignment)

### Model: `User` (Table: `users`)

- **Missing Columns (in DB but not in Model)**:
  - `user_code (varchar)`
  - `mobile (varchar)`
  - `last_login (datetime)`
- **Extra Columns (in Model but not in DB)**:
  - `phone`
  - `profile_picture`
  - `last_login_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `last_name`: DB Nullable = true, Model Nullable = false
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `Role` (Table: `roles`)

- **Missing Columns (in DB but not in Model)**:
  - `role_name (varchar)`
- **Extra Columns (in Model but not in DB)**:
  - `name`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `Permission` (Table: `permissions`)

- **Missing Columns (in DB but not in Model)**:
  - `permission_key (varchar)`
  - `module_name (varchar)`
- **Extra Columns (in Model but not in DB)**:
  - `name`
  - `code`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `UserRoleAssignment` (Table: `user_role_assignments`)

- **Missing Columns (in DB but not in Model)**:
  - `id (bigint)`
  - `assigned_at (timestamp)`
- **Primary Key Mismatches**:
  - Column `user_id`: DB PrimaryKey = false, Model PrimaryKey = true
  - Column `role_id`: DB PrimaryKey = false, Model PrimaryKey = true

### Model: `State` (Table: `states`)

- **Missing Columns (in DB but not in Model)**:
  - `state_code (varchar)`
  - `state_name (varchar)`
  - `is_active (tinyint)`
- **Extra Columns (in Model but not in DB)**:
  - `name`
  - `code`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `District` (Table: `districts`)

- **Missing Columns (in DB but not in Model)**:
  - `district_code (varchar)`
  - `district_name (varchar)`
  - `is_active (tinyint)`
- **Extra Columns (in Model but not in DB)**:
  - `name`
  - `code`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `School` (Table: `schools`)

- **Missing Columns (in DB but not in Model)**:
  - `school_code (varchar)`
  - `school_name (varchar)`
  - `udise_code (varchar)`
  - `principal_name (varchar)`
  - `mobile (varchar)`
  - `student_count (int)`
  - `teacher_count (int)`
  - `media_upload_enabled (tinyint)`
  - `approved_by (bigint)`
  - `approved_at (datetime)`
- **Extra Columns (in Model but not in DB)**:
  - `name`
  - `code`
  - `phone`
  - `website`
  - `logo_url`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `SchoolOnboardingRequest` (Table: `school_onboarding_requests`)

- **Missing Columns (in DB but not in Model)**:
  - `submitted_by (bigint)`
  - `remarks (text)`
- **Extra Columns (in Model but not in DB)**:
  - `requested_by`
  - `comments`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `ActivityCategory` (Table: `activity_categories`)

- **Missing Columns (in DB but not in Model)**:
  - `category_name (varchar)`
  - `is_active (tinyint)`
- **Extra Columns (in Model but not in DB)**:
  - `name`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `SchoolActivity` (Table: `school_activities`)

- **Missing Columns (in DB but not in Model)**:
  - `activity_code (varchar)`
  - `activity_date (date)`
  - `created_by (bigint)`
- **Extra Columns (in Model but not in DB)**:
  - `date`
  - `status`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `SchoolAchievement` (Table: `school_achievements`)

- **Missing Columns (in DB but not in Model)**:
  - `achievement_code (varchar)`
  - `activity_id (bigint)`
  - `achievement_level (enum)`
  - `achievement_date (date)`
  - `created_by (bigint)`
- **Extra Columns (in Model but not in DB)**:
  - `date`
  - `level`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `AchievementAsset` (Table: `achievement_assets`)

- **Missing Columns (in DB but not in Model)**:
  - `file_path (varchar)`
  - `uploaded_by (bigint)`
  - `uploaded_at (timestamp)`
- **Extra Columns (in Model but not in DB)**:
  - `file_url`
  - `thumbnail_url`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `MediaAsset` (Table: `media_assets`)

- **Missing Columns (in DB but not in Model)**:
  - `asset_code (varchar)`
  - `file_path (varchar)`
  - `file_size (bigint)`
  - `uploaded_by (bigint)`
  - `uploaded_at (timestamp)`
- **Extra Columns (in Model but not in DB)**:
  - `school_id`
  - `file_url`
  - `thumbnail_url`
  - `video_duration`
  - `uploader_id`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `MediaSubmission` (Table: `media_submissions`)

- **Missing Columns (in DB but not in Model)**:
  - `submission_code (varchar)`
  - `school_id (bigint)`
  - `submitted_by (bigint)`
  - `submitted_at (datetime)`
- **Extra Columns (in Model but not in DB)**:
  - `media_asset_id`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `MediaSubmissionVersion` (Table: `media_submission_versions`)

- **Missing Columns (in DB but not in Model)**:
  - `submission_id (bigint)`
  - `version_no (int)`
  - `version_notes (text)`
  - `created_by (bigint)`
- **Extra Columns (in Model but not in DB)**:
  - `media_submission_id`
  - `version_number`
  - `title`
  - `description`
  - `media_asset_id`
  - `status`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `MediaVersionAsset` (Table: `media_version_assets`)

- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `SubmissionReviewStep` (Table: `submission_review_steps`)

- **Missing Columns (in DB but not in Model)**:
  - `step_name (varchar)`
  - `step_order (int)`
  - `reviewed_by (bigint)`
  - `remarks (text)`
- **Extra Columns (in Model but not in DB)**:
  - `level`
  - `reviewer_id`
  - `comments`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `SubmissionReview` (Table: `submission_reviews`)

- **Missing Columns (in DB but not in Model)**:
  - `review_type (enum)`
  - `decision (enum)`
  - `reviewed_at (datetime)`
- **Extra Columns (in Model but not in DB)**:
  - `action`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `MediaPublication` (Table: `media_publications`)

- **Missing Columns (in DB but not in Model)**:
  - `published_by (bigint)`
  - `publication_url (varchar)`
- **Extra Columns (in Model but not in DB)**:
  - `publisher_id`
  - `platform_status`
  - `external_url`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `RankTier` (Table: `rank_tiers`)

- **Missing Columns (in DB but not in Model)**:
  - `tier_name (varchar)`
- **Extra Columns (in Model but not in DB)**:
  - `name`
  - `color`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `ScoreCategory` (Table: `score_categories`)

- **Missing Columns (in DB but not in Model)**:
  - `category_name (varchar)`
  - `max_score (int)`
- **Extra Columns (in Model but not in DB)**:
  - `name`
  - `weight`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `ScoreRule` (Table: `score_rules`)

- **Missing Columns (in DB but not in Model)**:
  - `rule_name (varchar)`
  - `score_value (int)`
  - `is_active (tinyint)`
- **Extra Columns (in Model but not in DB)**:
  - `action_type`
  - `points`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `SchoolScorePeriod` (Table: `school_score_periods`)

- **Missing Columns (in DB but not in Model)**:
  - `period_name (varchar)`
  - `is_closed (tinyint)`
- **Extra Columns (in Model but not in DB)**:
  - `school_id`
  - `total_score`
  - `academic_score`
  - `achievement_score`
  - `media_score`
  - `participation_score`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `start_date`: DB Nullable = true, Model Nullable = false
  - Column `end_date`: DB Nullable = true, Model Nullable = false
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `SchoolScoreComponent` (Table: `school_score_components`)

- **Missing Columns (in DB but not in Model)**:
  - `period_id (bigint)`
  - `calculated_at (datetime)`
- **Extra Columns (in Model but not in DB)**:
  - `score_period_id`
  - `details`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `score`: DB Nullable = true, Model Nullable = false

### Model: `SchoolRankHistory` (Table: `school_rank_history`)

- **Missing Columns (in DB but not in Model)**:
  - `period_id (bigint)`
  - `total_score (decimal)`
  - `global_rank (int)`
  - `state_rank (int)`
  - `district_rank (int)`
- **Extra Columns (in Model but not in DB)**:
  - `score`
  - `rank`
  - `calculated_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `SchoolRankSnapshot` (Table: `school_rank_snapshots`)

- **Missing Columns (in DB but not in Model)**:
  - `period_id (bigint)`
  - `previous_rank (int)`
  - `calculated_at (datetime)`
- **Extra Columns (in Model but not in DB)**:
  - `year`
  - `month`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `total_score`: DB Nullable = true, Model Nullable = false
  - Column `global_rank`: DB Nullable = true, Model Nullable = false
  - Column `state_rank`: DB Nullable = true, Model Nullable = false
  - Column `district_rank`: DB Nullable = true, Model Nullable = false

### Model: `Badge` (Table: `badges`)

- **Missing Columns (in DB but not in Model)**:
  - `badge_name (varchar)`
  - `badge_code (varchar)`
- **Extra Columns (in Model but not in DB)**:
  - `name`
  - `criteria`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `SchoolBadge` (Table: `school_badges`)

- **Missing Columns (in DB but not in Model)**:
  - `assigned_by (bigint)`
  - `assigned_at (datetime)`
- **Extra Columns (in Model but not in DB)**:
  - `awarded_at`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `Notification` (Table: `notifications`)

- **Missing Columns (in DB but not in Model)**:
  - `notification_code (varchar)`
  - `notification_type (varchar)`
  - `entity_type (varchar)`
  - `entity_id (bigint)`
  - `created_by (bigint)`
- **Extra Columns (in Model but not in DB)**:
  - `sender_id`
  - `type`
  - `link`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `message`: DB Nullable = true, Model Nullable = false
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `NotificationRecipient` (Table: `notification_recipients`)

- **Missing Columns (in DB but not in Model)**:
  - `user_id (bigint)`
  - `delivered_at (datetime)`
- **Extra Columns (in Model but not in DB)**:
  - `recipient_id`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `UserNotificationPreference` (Table: `user_notification_preferences`)

- **Missing Columns (in DB but not in Model)**:
  - `email_notifications (tinyint)`
  - `sms_notifications (tinyint)`
  - `push_notifications (tinyint)`
- **Extra Columns (in Model but not in DB)**:
  - `preference_type`
  - `is_enabled`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `Conversation` (Table: `conversations`)

- **Missing Columns (in DB but not in Model)**:
  - `conversation_code (varchar)`
  - `subject (varchar)`
  - `created_by (bigint)`
- **Extra Columns (in Model but not in DB)**:
  - `title`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `ConversationParticipant` (Table: `conversation_participants`)

- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `Message` (Table: `messages`)

- **Missing Columns (in DB but not in Model)**:
  - `message_text (text)`
  - `sent_at (datetime)`
  - `is_deleted (tinyint)`
- **Extra Columns (in Model but not in DB)**:
  - `text_content`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `MessageAsset` (Table: `message_assets`)

- **Missing Columns (in DB but not in Model)**:
  - `file_name (varchar)`
  - `file_path (varchar)`
  - `uploaded_at (datetime)`
- **Extra Columns (in Model but not in DB)**:
  - `file_url`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `InspectionRequest` (Table: `inspection_requests`)

- **Missing Columns (in DB but not in Model)**:
  - `request_code (varchar)`
  - `request_reason (text)`
  - `requested_at (datetime)`
- **Extra Columns (in Model but not in DB)**:
  - `comments`
  - `preferred_date`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `InspectionReport` (Table: `inspection_reports`)

- **Missing Columns (in DB but not in Model)**:
  - `report_code (varchar)`
  - `findings (text)`
  - `strengths (text)`
  - `improvement_areas (text)`
  - `recommendations (text)`
  - `overall_rating (decimal)`
  - `inspection_date (date)`
- **Extra Columns (in Model but not in DB)**:
  - `schedule_date`
  - `completion_date`
  - `score`
  - `feedback`
  - `report_file_url`
  - `status`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `GeneratedReport` (Table: `generated_reports`)

- **Missing Columns (in DB but not in Model)**:
  - `report_name (varchar)`
  - `file_path (varchar)`
  - `generated_at (datetime)`
- **Extra Columns (in Model but not in DB)**:
  - `school_id`
  - `date_generated`
  - `file_url`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `report_type`: DB Nullable = true, Model Nullable = false
  - Column `generated_by`: DB Nullable = true, Model Nullable = false

### Model: `SchoolRecommendation` (Table: `school_recommendations`)

- **Missing Columns (in DB but not in Model)**:
  - `title (varchar)`
  - `ranking_impact (int)`
  - `progress_percentage (int)`
  - `created_by (bigint)`
- **Extra Columns (in Model but not in DB)**:
  - `type`
  - `status`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `description`: DB Nullable = true, Model Nullable = false
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `RecommendationStatusHistory` (Table: `recommendation_status_history`)

- **Missing Columns (in DB but not in Model)**:
  - `old_status (varchar)`
  - `new_status (varchar)`
- **Extra Columns (in Model but not in DB)**:
  - `status`
  - `comments`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `changed_by`: DB Nullable = true, Model Nullable = false

### Model: `ServicePackage` (Table: `service_packages`)

- **Missing Columns (in DB but not in Model)**:
  - `package_name (varchar)`
  - `package_price (decimal)`
  - `expected_ranking_growth (varchar)`
- **Extra Columns (in Model but not in DB)**:
  - `name`
  - `price`
  - `ranking_impact`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `SchoolPackageProposal` (Table: `school_package_proposals`)

- **Missing Columns (in DB but not in Model)**:
  - `proposal_status (enum)`
  - `proposed_by (bigint)`
- **Extra Columns (in Model but not in DB)**:
  - `status`
  - `price`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `ProposalCallRequest` (Table: `proposal_call_requests`)

- **Missing Columns (in DB but not in Model)**:
  - `requested_by (bigint)`
  - `preferred_date (datetime)`
- **Extra Columns (in Model but not in DB)**:
  - `school_admin_id`
  - `preferred_time`
  - `notes`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `SchoolMetricSnapshot` (Table: `school_metric_snapshots`)

- **Missing Columns (in DB but not in Model)**:
  - `snapshot_date (date)`
  - `student_count (int)`
  - `teacher_count (int)`
  - `total_activities (int)`
  - `total_achievements (int)`
  - `total_media_uploads (int)`
- **Extra Columns (in Model but not in DB)**:
  - `date`
  - `active_students`
  - `active_teachers`
  - `rank`
  - `media_uploads_count`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `SocialDailyMetric` (Table: `social_daily_metrics`)

- **Missing Columns (in DB but not in Model)**:
  - `metric_date (date)`
  - `facebook_reach (int)`
  - `instagram_reach (int)`
  - `youtube_views (int)`
  - `website_visits (int)`
- **Extra Columns (in Model but not in DB)**:
  - `platform`
  - `date`
  - `follower_count`
  - `engagement_rate`
  - `reach`
  - `posts_count`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `SchoolDailyActivity` (Table: `school_daily_activity`)

- **Missing Columns (in DB but not in Model)**:
  - `activity_date (date)`
  - `uploads_count (int)`
  - `achievements_count (int)`
  - `activities_count (int)`
  - `logins_count (int)`
- **Extra Columns (in Model but not in DB)**:
  - `date`
  - `activity_type`
  - `count`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `DistrictPerformanceSnapshot` (Table: `district_performance_snapshots`)

- **Missing Columns (in DB but not in Model)**:
  - `snapshot_date (date)`
  - `inactive_schools (int)`
  - `total_score (decimal)`
  - `ranking_position (int)`
- **Extra Columns (in Model but not in DB)**:
  - `date`
  - `total_schools`
  - `created_at`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `AuditLog` (Table: `audit_logs`)

- **Missing Columns (in DB but not in Model)**:
  - `entity_type (varchar)`
  - `entity_id (bigint)`
  - `old_value (json)`
  - `new_value (json)`
- **Extra Columns (in Model but not in DB)**:
  - `target_type`
  - `target_id`
  - `details`
  - `user_agent`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `action`: DB Nullable = true, Model Nullable = false
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `ImpersonationSession` (Table: `impersonation_sessions`)

- **Missing Columns (in DB but not in Model)**:
  - `super_admin_id (bigint)`
  - `start_time (datetime)`
  - `end_time (datetime)`
  - `reason (text)`
- **Extra Columns (in Model but not in DB)**:
  - `admin_id`
  - `status`
  - `started_at`
  - `ended_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true

### Model: `OutboxEvent` (Table: `outbox_events`)

- **Extra Columns (in Model but not in DB)**:
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `event_type`: DB Nullable = true, Model Nullable = false
  - Column `payload`: DB Nullable = true, Model Nullable = false
  - Column `created_at`: DB Nullable = true, Model Nullable = false

### Model: `WebhookEvent` (Table: `webhook_events`)

- **Missing Columns (in DB but not in Model)**:
  - `webhook_url (varchar)`
  - `request_payload (json)`
  - `response_payload (json)`
  - `response_code (int)`
- **Extra Columns (in Model but not in DB)**:
  - `payload`
  - `status`
  - `response_status`
  - `updated_at`
- **Nullability Mismatches**:
  - Column `id`: DB Nullable = false, Model Nullable = true
  - Column `event_type`: DB Nullable = true, Model Nullable = false
  - Column `created_at`: DB Nullable = true, Model Nullable = false


## Broken Modules & Potential Issues

1. **ImpersonationSession & UserSession**: The database contains `impersonation_sessions` but does NOT contain `user_sessions` or `user_preferences` or `admin_profiles`. Authentication and impersonation logic must use `users` table columns (such as `last_login`, `user_code`, etc.) directly, or use the correct fields.
2. **School Admin Mapping**: The mapping of School Admins is handled by a new join table `school_admin_mapping` which references `user_id` and `school_id`. The `AdminProfile` model needs to be removed/refactored, and query references updated to join via `school_admin_mapping`.
3. **State Admin Scope**: Regional admins are assigned states in `regional_admin_scope` which references `user_id` and `state_id`. Scoping middleware must query this table rather than checking an `AdminProfile` state field.
4. **Role & Permission Naming**: The `roles` table uses column `role_name` (not `name`), and the `permissions` table uses `permission_key` and `module_name` (not `name` or `code`). These must be updated in models and throughout the RBAC code.
