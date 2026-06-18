# Database Relationship Report

This report outlines the structural details of all tables in the `gds_portal` database, including primary keys, foreign keys, referenced tables, and mapped Sequelize associations.

| Table Name | Primary Key | Foreign Keys | Referenced Table(s) | Associations |
|---|---|---|---|---|
| `achievement_assets` | id | achievement_id, uploaded_by | school_achievements, users | BelongsTo -> SchoolAchievement (achievement_id) |
| `activity_categories` | id | None | None | HasMany -> SchoolActivity (category_id) |
| `audit_logs` | id | user_id | users | BelongsTo -> User (user_id) |
| `badges` | id | None | None | BelongsToMany -> School (badge_id) |
| `conversation_participants` | id | conversation_id, user_id | conversations, users | None |
| `conversations` | id | created_by | users | BelongsToMany -> User (conversation_id)<br>HasMany -> Message (conversation_id) |
| `district_performance_snapshots` | id | district_id | districts | BelongsTo -> District (district_id) |
| `districts` | id | state_id | states | BelongsTo -> State (state_id)<br>HasMany -> School (district_id)<br>HasMany -> DistrictPerformanceSnapshot (district_id) |
| `generated_reports` | id | generated_by | users | BelongsTo -> School (school_id) |
| `impersonation_sessions` | id | super_admin_id, impersonated_user_id | users, users | BelongsTo -> User (admin_id)<br>BelongsTo -> User (impersonated_user_id) |
| `inspection_reports` | id | inspection_request_id, inspector_id | inspection_requests, users | BelongsTo -> InspectionRequest (inspection_request_id) |
| `inspection_requests` | id | school_id, requested_by | schools, users | BelongsTo -> School (school_id)<br>HasOne -> InspectionReport (inspection_request_id) |
| `media_assets` | id | uploaded_by | users | BelongsTo -> School (school_id)<br>BelongsTo -> User (uploader_id)<br>HasMany -> MediaSubmission (media_asset_id) |
| `media_publications` | id | submission_id, published_by | media_submissions, users | BelongsTo -> MediaSubmission (submission_id) |
| `media_submission_versions` | id | submission_id, created_by | media_submissions, users | BelongsTo -> MediaSubmission (media_submission_id)<br>BelongsTo -> MediaAsset (media_asset_id) |
| `media_submissions` | id | school_id, submitted_by | schools, users | BelongsTo -> MediaAsset (media_asset_id)<br>HasMany -> MediaSubmissionVersion (media_submission_id)<br>HasMany -> SubmissionReviewStep (submission_id)<br>HasMany -> SubmissionReview (submission_id)<br>HasOne -> MediaPublication (submission_id) |
| `media_version_assets` | id | version_id, asset_id | media_submission_versions, media_assets | None |
| `message_assets` | id | message_id | messages | BelongsTo -> Message (message_id) |
| `messages` | id | conversation_id, sender_id | conversations, users | BelongsTo -> Conversation (conversation_id)<br>BelongsTo -> User (sender_id)<br>HasMany -> MessageAsset (message_id) |
| `notification_recipients` | id | notification_id, user_id | notifications, users | BelongsTo -> Notification (notification_id)<br>BelongsTo -> User (recipient_id) |
| `notifications` | id | created_by | users | HasMany -> NotificationRecipient (notification_id) |
| `outbox_events` | id | None | None | None |
| `permissions` | id | None | None | BelongsToMany -> Role (permission_id) |
| `proposal_call_requests` | id | proposal_id, requested_by | school_package_proposals, users | BelongsTo -> SchoolPackageProposal (proposal_id) |
| `rank_tiers` | id | None | None | HasMany -> SchoolRankHistory (tier_id)<br>HasMany -> SchoolRankSnapshot (tier_id) |
| `recommendation_status_history` | id | recommendation_id, changed_by | school_recommendations, users | BelongsTo -> SchoolRecommendation (recommendation_id) |
| `regional_admin_scope` | id | user_id, state_id | users, states | None |
| `roles` | id | None | None | BelongsToMany -> User (role_id)<br>BelongsToMany -> Permission (role_id) |
| `school_achievements` | id | school_id, activity_id, created_by | schools, school_activities, users | BelongsTo -> School (school_id)<br>HasMany -> AchievementAsset (achievement_id) |
| `school_activities` | id | school_id, category_id, created_by | schools, activity_categories, users | BelongsTo -> School (school_id)<br>BelongsTo -> ActivityCategory (category_id) |
| `school_admin_mapping` | id | user_id, school_id | users, schools | None |
| `school_badges` | id | school_id, badge_id, assigned_by | schools, badges, users | None |
| `school_daily_activity` | id | school_id | schools | BelongsTo -> School (school_id) |
| `school_metric_snapshots` | id | school_id | schools | BelongsTo -> School (school_id) |
| `school_onboarding_requests` | id | school_id, submitted_by, reviewed_by | schools, users, users | BelongsTo -> School (school_id) |
| `school_package_proposals` | id | school_id, package_id, proposed_by | schools, service_packages, users | BelongsTo -> ServicePackage (package_id)<br>BelongsTo -> School (school_id)<br>HasMany -> ProposalCallRequest (proposal_id) |
| `school_rank_history` | id | school_id, period_id, tier_id | schools, school_score_periods, rank_tiers | BelongsTo -> School (school_id)<br>BelongsTo -> RankTier (tier_id) |
| `school_rank_snapshots` | id | school_id, period_id, tier_id | schools, school_score_periods, rank_tiers | BelongsTo -> School (school_id)<br>BelongsTo -> RankTier (tier_id) |
| `school_recommendations` | id | school_id, created_by | schools, users | BelongsTo -> School (school_id)<br>HasMany -> RecommendationStatusHistory (recommendation_id) |
| `school_score_components` | id | school_id, period_id, category_id | schools, school_score_periods, score_categories | BelongsTo -> SchoolScorePeriod (score_period_id)<br>BelongsTo -> ScoreCategory (category_id) |
| `school_score_periods` | id | None | None | BelongsTo -> School (school_id)<br>HasMany -> SchoolScoreComponent (score_period_id) |
| `schools` | id | district_id | districts | BelongsTo -> District (district_id)<br>HasMany -> SchoolOnboardingRequest (school_id)<br>HasMany -> SchoolActivity (school_id)<br>HasMany -> SchoolAchievement (school_id)<br>HasMany -> MediaAsset (school_id)<br>HasMany -> SchoolScorePeriod (school_id)<br>HasMany -> SchoolRankHistory (school_id)<br>HasMany -> SchoolRankSnapshot (school_id)<br>BelongsToMany -> Badge (school_id)<br>HasMany -> InspectionRequest (school_id)<br>HasMany -> GeneratedReport (school_id)<br>HasMany -> SchoolRecommendation (school_id)<br>HasMany -> SchoolPackageProposal (school_id)<br>HasMany -> SchoolMetricSnapshot (school_id)<br>HasMany -> SocialDailyMetric (school_id)<br>HasMany -> SchoolDailyActivity (school_id)<br>HasMany -> SchoolSocialAccount (school_id) |
| `score_categories` | id | None | None | HasMany -> SchoolScoreComponent (category_id)<br>HasMany -> ScoreRule (category_id) |
| `score_rules` | id | category_id | score_categories | BelongsTo -> ScoreCategory (category_id) |
| `service_packages` | id | None | None | HasMany -> SchoolPackageProposal (package_id) |
| `social_daily_metrics` | id | school_id | schools | BelongsTo -> School (school_id) |
| `states` | id | None | None | HasMany -> District (state_id) |
| `submission_review_steps` | id | submission_id, reviewed_by | media_submissions, users | BelongsTo -> MediaSubmission (submission_id) |
| `submission_reviews` | id | submission_id, reviewer_id | media_submissions, users | BelongsTo -> MediaSubmission (submission_id) |
| `user_notification_preferences` | id | user_id | users | BelongsTo -> User (user_id) |
| `user_role_assignments` | id | user_id, role_id | users, roles | None |
| `users` | id | None | None | HasMany -> UserSession (user_id)<br>HasOne -> UserPreference (user_id)<br>HasOne -> AdminProfile (user_id)<br>BelongsToMany -> Role (user_id)<br>HasMany -> MediaAsset (uploader_id)<br>HasMany -> NotificationRecipient (recipient_id)<br>HasMany -> UserNotificationPreference (user_id)<br>BelongsToMany -> Conversation (user_id)<br>HasMany -> Message (sender_id)<br>HasMany -> AuditLog (user_id)<br>HasMany -> ImpersonationSession (admin_id)<br>HasMany -> ImpersonationSession (impersonated_user_id) |
| `webhook_events` | id | None | None | None |
