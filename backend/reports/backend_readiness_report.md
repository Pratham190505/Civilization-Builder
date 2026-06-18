# Backend Readiness Report

This report outlines the status of major features and modules in the backend, identifying their current readiness state and the required fixes to achieve compatibility with the real production database.

| Module / Feature | Status | Mapped to Schema | Actions Required |
|---|---|---|---|
| **Authentication** | ⚠️ Needs Update | Yes (partially) | Update JWT login and registration logic to query actual `users` columns. Remove references to `user_sessions` and `user_preferences`. |
| **RBAC** | ⚠️ Needs Update | Yes (partially) | Align models for `users`, `roles`, `permissions`, and `user_role_assignments`. Refactor RBAC middlewares (Auth, Permission, Scope) to query correct table columns (`role_name`, `permission_key`, `module_name`). |
| **School Admin Scope** | 🔴 Incompatible | No (using placeholder `admin_profiles`) | Map `school_admin_mapping` table, update Middleware and controllers to verify if a user has access to a school. |
| **State Admin Scope** | 🔴 Incompatible | No (using placeholder `admin_profiles`) | Map `regional_admin_scope` table, update Middleware and controllers to filter requests by the regional admin's state. |
| **Media Workflow** | ⚠️ Needs Update | Yes (partially) | Align models (`media_assets`, `media_submissions`, `media_submission_versions`, `media_version_assets`, `submission_reviews`, `submission_review_steps`, `media_publications`) and update approval endpoints. |
| **Ranking System** | ⚠️ Needs Update | Yes (partially) | Refactor ranking calculation queries to use correct table mappings for score components, category, rule, history, and snapshots. |
| **Recommendations** | ⚠️ Needs Update | Yes (partially) | Align models (`school_recommendations`, `recommendation_status_history`, `proposal_call_requests`, `service_packages`, `school_package_proposals`) and adjust query structures. |
| **Reports & Inspections** | ⚠️ Needs Update | Yes (partially) | Align models (`inspection_requests`, `inspection_reports`, `generated_reports`) and fix controller/service logic. |
| **Notifications** | ⚠️ Needs Update | Yes (partially) | Update Socket.IO dynamic notifications to query actual `notifications`, `notification_recipients` and `user_notification_preferences`. |
| **Analytics** | ⚠️ Needs Update | Yes (partially) | Adjust National/State/School queries to fetch from `district_performance_snapshots`, `school_metric_snapshots`, and `social_daily_metrics`. |
| **Audit & Security** | ⚠️ Needs Update | Yes (partially) | Align models `audit_logs`, `impersonation_sessions`, and `webhook_events`. Implement full audit logging across login, logout, approvals, rejections, ranking changes, etc. |
