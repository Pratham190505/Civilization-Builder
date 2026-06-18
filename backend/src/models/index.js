const sequelize = require('../config/database');

// Import models
const User = require('./user');
const Role = require('./role');
const Permission = require('./permission');
const UserRoleAssignment = require('./userRoleAssignment');
const SchoolAdminMapping = require('./schoolAdminMapping');
const RegionalAdminScope = require('./regionalAdminScope');

const State = require('./state');
const District = require('./district');
const School = require('./school');
const SchoolOnboardingRequest = require('./schoolOnboardingRequest');

const ActivityCategory = require('./activityCategory');
const SchoolActivity = require('./schoolActivity');
const SchoolAchievement = require('./schoolAchievement');
const AchievementAsset = require('./achievementAsset');

const MediaAsset = require('./mediaAsset');
const MediaSubmission = require('./mediaSubmission');
const MediaSubmissionVersion = require('./mediaSubmissionVersion');
const MediaVersionAsset = require('./mediaVersionAsset');
const SubmissionReviewStep = require('./submissionReviewStep');
const SubmissionReview = require('./submissionReview');
const MediaPublication = require('./mediaPublication');

const RankTier = require('./rankTier');
const ScoreCategory = require('./scoreCategory');
const ScoreRule = require('./scoreRule');
const SchoolScorePeriod = require('./schoolScorePeriod');
const SchoolScoreComponent = require('./schoolScoreComponent');
const SchoolRankHistory = require('./schoolRankHistory');
const SchoolRankSnapshot = require('./schoolRankSnapshot');
const Badge = require('./badge');
const SchoolBadge = require('./schoolBadge');

const Notification = require('./notification');
const NotificationRecipient = require('./notificationRecipient');
const UserNotificationPreference = require('./userNotificationPreference');
const Conversation = require('./conversation');
const ConversationParticipant = require('./conversationParticipant');
const Message = require('./message');
const MessageAsset = require('./messageAsset');

const InspectionRequest = require('./inspectionRequest');
const InspectionReport = require('./inspectionReport');
const GeneratedReport = require('./generatedReport');

const SchoolRecommendation = require('./schoolRecommendation');
const RecommendationStatusHistory = require('./recommendationStatusHistory');
const ServicePackage = require('./servicePackage');
const SchoolPackageProposal = require('./schoolPackageProposal');
const ProposalCallRequest = require('./proposalCallRequest');

const SchoolMetricSnapshot = require('./schoolMetricSnapshot');
const SocialDailyMetric = require('./socialDailyMetric');
const SchoolDailyActivity = require('./schoolDailyActivity');
const DistrictPerformanceSnapshot = require('./districtPerformanceSnapshot');

const AuditLog = require('./auditLog');
const ImpersonationSession = require('./impersonationSession');
const OutboxEvent = require('./outboxEvent');
const WebhookEvent = require('./webhookEvent');

// Define Associations

// Authentication & Roles
User.belongsToMany(Role, { through: UserRoleAssignment, foreignKey: 'user_id', otherKey: 'role_id' });
Role.belongsToMany(User, { through: UserRoleAssignment, foreignKey: 'role_id', otherKey: 'user_id' });

User.hasMany(UserRoleAssignment, { foreignKey: 'user_id' });
UserRoleAssignment.belongsTo(User, { foreignKey: 'user_id' });
Role.hasMany(UserRoleAssignment, { foreignKey: 'role_id' });
UserRoleAssignment.belongsTo(Role, { foreignKey: 'role_id' });

// Scoping Mappings (replacing AdminProfile)
User.hasOne(SchoolAdminMapping, { foreignKey: 'user_id' });
SchoolAdminMapping.belongsTo(User, { foreignKey: 'user_id' });
School.hasMany(SchoolAdminMapping, { foreignKey: 'school_id' });
SchoolAdminMapping.belongsTo(School, { foreignKey: 'school_id' });

User.hasMany(RegionalAdminScope, { foreignKey: 'user_id' });
RegionalAdminScope.belongsTo(User, { foreignKey: 'user_id' });
State.hasMany(RegionalAdminScope, { foreignKey: 'state_id' });
RegionalAdminScope.belongsTo(State, { foreignKey: 'state_id' });

// Geography & Schools
State.hasMany(District, { foreignKey: 'state_id' });
District.belongsTo(State, { foreignKey: 'state_id' });

District.hasMany(School, { foreignKey: 'district_id' });
School.belongsTo(District, { foreignKey: 'district_id' });

School.hasMany(SchoolOnboardingRequest, { foreignKey: 'school_id' });
SchoolOnboardingRequest.belongsTo(School, { foreignKey: 'school_id' });
User.hasMany(SchoolOnboardingRequest, { foreignKey: 'submitted_by' });
SchoolOnboardingRequest.belongsTo(User, { foreignKey: 'submitted_by' });

// Activities & Achievements
School.hasMany(SchoolActivity, { foreignKey: 'school_id' });
SchoolActivity.belongsTo(School, { foreignKey: 'school_id' });

ActivityCategory.hasMany(SchoolActivity, { foreignKey: 'category_id' });
SchoolActivity.belongsTo(ActivityCategory, { foreignKey: 'category_id' });

User.hasMany(SchoolActivity, { foreignKey: 'created_by' });
SchoolActivity.belongsTo(User, { foreignKey: 'created_by' });

School.hasMany(SchoolAchievement, { foreignKey: 'school_id' });
SchoolAchievement.belongsTo(School, { foreignKey: 'school_id' });

SchoolActivity.hasMany(SchoolAchievement, { foreignKey: 'activity_id' });
SchoolAchievement.belongsTo(SchoolActivity, { foreignKey: 'activity_id' });

User.hasMany(SchoolAchievement, { foreignKey: 'created_by' });
SchoolAchievement.belongsTo(User, { foreignKey: 'created_by' });

SchoolAchievement.hasMany(AchievementAsset, { foreignKey: 'achievement_id' });
AchievementAsset.belongsTo(SchoolAchievement, { foreignKey: 'achievement_id' });

User.hasMany(AchievementAsset, { foreignKey: 'uploaded_by' });
AchievementAsset.belongsTo(User, { foreignKey: 'uploaded_by' });

// Media Upload & Approval Workflow
User.hasMany(MediaAsset, { foreignKey: 'uploaded_by' });
MediaAsset.belongsTo(User, { foreignKey: 'uploaded_by' });

School.hasMany(MediaSubmission, { foreignKey: 'school_id' });
MediaSubmission.belongsTo(School, { foreignKey: 'school_id' });

User.hasMany(MediaSubmission, { foreignKey: 'submitted_by' });
MediaSubmission.belongsTo(User, { foreignKey: 'submitted_by' });

MediaSubmission.hasMany(MediaSubmissionVersion, { foreignKey: 'submission_id' });
MediaSubmissionVersion.belongsTo(MediaSubmission, { foreignKey: 'submission_id' });

User.hasMany(MediaSubmissionVersion, { foreignKey: 'created_by' });
MediaSubmissionVersion.belongsTo(User, { foreignKey: 'created_by' });

MediaSubmissionVersion.belongsToMany(MediaAsset, { through: MediaVersionAsset, foreignKey: 'version_id', otherKey: 'asset_id' });
MediaAsset.belongsToMany(MediaSubmissionVersion, { through: MediaVersionAsset, foreignKey: 'asset_id', otherKey: 'version_id' });

MediaSubmission.hasMany(SubmissionReview, { foreignKey: 'submission_id' });
SubmissionReview.belongsTo(MediaSubmission, { foreignKey: 'submission_id' });
User.hasMany(SubmissionReview, { foreignKey: 'reviewer_id' });
SubmissionReview.belongsTo(User, { foreignKey: 'reviewer_id' });

MediaSubmission.hasMany(SubmissionReviewStep, { foreignKey: 'submission_id' });
SubmissionReviewStep.belongsTo(MediaSubmission, { foreignKey: 'submission_id' });
User.hasMany(SubmissionReviewStep, { foreignKey: 'reviewed_by' });
SubmissionReviewStep.belongsTo(User, { foreignKey: 'reviewed_by' });

MediaSubmission.hasOne(MediaPublication, { foreignKey: 'submission_id' });
MediaPublication.belongsTo(MediaSubmission, { foreignKey: 'submission_id' });
User.hasMany(MediaPublication, { foreignKey: 'published_by' });
MediaPublication.belongsTo(User, { foreignKey: 'published_by' });

// Ranking System
School.hasMany(SchoolScoreComponent, { foreignKey: 'school_id' });
SchoolScoreComponent.belongsTo(School, { foreignKey: 'school_id' });

SchoolScorePeriod.hasMany(SchoolScoreComponent, { foreignKey: 'period_id' });
SchoolScoreComponent.belongsTo(SchoolScorePeriod, { foreignKey: 'period_id' });

ScoreCategory.hasMany(SchoolScoreComponent, { foreignKey: 'category_id' });
SchoolScoreComponent.belongsTo(ScoreCategory, { foreignKey: 'category_id' });

ScoreCategory.hasMany(ScoreRule, { foreignKey: 'category_id' });
ScoreRule.belongsTo(ScoreCategory, { foreignKey: 'category_id' });

School.hasMany(SchoolRankHistory, { foreignKey: 'school_id' });
SchoolRankHistory.belongsTo(School, { foreignKey: 'school_id' });

SchoolScorePeriod.hasMany(SchoolRankHistory, { foreignKey: 'period_id' });
SchoolRankHistory.belongsTo(SchoolScorePeriod, { foreignKey: 'period_id' });

RankTier.hasMany(SchoolRankHistory, { foreignKey: 'tier_id' });
SchoolRankHistory.belongsTo(RankTier, { foreignKey: 'tier_id' });

School.hasMany(SchoolRankSnapshot, { foreignKey: 'school_id' });
SchoolRankSnapshot.belongsTo(School, { foreignKey: 'school_id' });

SchoolScorePeriod.hasMany(SchoolRankSnapshot, { foreignKey: 'period_id' });
SchoolRankSnapshot.belongsTo(SchoolScorePeriod, { foreignKey: 'period_id' });

RankTier.hasMany(SchoolRankSnapshot, { foreignKey: 'tier_id' });
SchoolRankSnapshot.belongsTo(RankTier, { foreignKey: 'tier_id' });

School.belongsToMany(Badge, { through: SchoolBadge, foreignKey: 'school_id', otherKey: 'badge_id' });
Badge.belongsToMany(School, { through: SchoolBadge, foreignKey: 'badge_id', otherKey: 'school_id' });

// Notifications
Notification.hasMany(NotificationRecipient, { foreignKey: 'notification_id' });
NotificationRecipient.belongsTo(Notification, { foreignKey: 'notification_id' });

User.hasMany(NotificationRecipient, { foreignKey: 'user_id' });
NotificationRecipient.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(UserNotificationPreference, { foreignKey: 'user_id' });
UserNotificationPreference.belongsTo(User, { foreignKey: 'user_id' });

// Messaging / Conversations
Conversation.belongsToMany(User, { through: ConversationParticipant, foreignKey: 'conversation_id', otherKey: 'user_id' });
User.belongsToMany(Conversation, { through: ConversationParticipant, foreignKey: 'user_id', otherKey: 'conversation_id' });

Conversation.hasMany(Message, { foreignKey: 'conversation_id' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

User.hasMany(Message, { foreignKey: 'sender_id' });
Message.belongsTo(User, { foreignKey: 'sender_id' });

Message.hasMany(MessageAsset, { foreignKey: 'message_id' });
MessageAsset.belongsTo(Message, { foreignKey: 'message_id' });

// Inspections
School.hasMany(InspectionRequest, { foreignKey: 'school_id' });
InspectionRequest.belongsTo(School, { foreignKey: 'school_id' });
User.hasMany(InspectionRequest, { foreignKey: 'requested_by' });
InspectionRequest.belongsTo(User, { foreignKey: 'requested_by' });

InspectionRequest.hasOne(InspectionReport, { foreignKey: 'inspection_request_id' });
InspectionReport.belongsTo(InspectionRequest, { foreignKey: 'inspection_request_id' });
User.hasMany(InspectionReport, { foreignKey: 'inspector_id' });
InspectionReport.belongsTo(User, { foreignKey: 'inspector_id' });

User.hasMany(GeneratedReport, { foreignKey: 'generated_by' });
GeneratedReport.belongsTo(User, { foreignKey: 'generated_by' });

// Recommendations
School.hasMany(SchoolRecommendation, { foreignKey: 'school_id' });
SchoolRecommendation.belongsTo(School, { foreignKey: 'school_id' });
User.hasMany(SchoolRecommendation, { foreignKey: 'created_by' });
SchoolRecommendation.belongsTo(User, { foreignKey: 'created_by' });

SchoolRecommendation.hasMany(RecommendationStatusHistory, { foreignKey: 'recommendation_id' });
RecommendationStatusHistory.belongsTo(SchoolRecommendation, { foreignKey: 'recommendation_id' });
User.hasMany(RecommendationStatusHistory, { foreignKey: 'changed_by' });
RecommendationStatusHistory.belongsTo(User, { foreignKey: 'changed_by' });

ServicePackage.hasMany(SchoolPackageProposal, { foreignKey: 'package_id' });
SchoolPackageProposal.belongsTo(ServicePackage, { foreignKey: 'package_id' });

School.hasMany(SchoolPackageProposal, { foreignKey: 'school_id' });
SchoolPackageProposal.belongsTo(School, { foreignKey: 'school_id' });

User.hasMany(SchoolPackageProposal, { foreignKey: 'proposed_by' });
SchoolPackageProposal.belongsTo(User, { foreignKey: 'proposed_by' });

SchoolPackageProposal.hasMany(ProposalCallRequest, { foreignKey: 'proposal_id' });
ProposalCallRequest.belongsTo(SchoolPackageProposal, { foreignKey: 'proposal_id' });
User.hasMany(ProposalCallRequest, { foreignKey: 'requested_by' });
ProposalCallRequest.belongsTo(User, { foreignKey: 'requested_by' });

// Analytics snapshots
School.hasMany(SchoolMetricSnapshot, { foreignKey: 'school_id' });
SchoolMetricSnapshot.belongsTo(School, { foreignKey: 'school_id' });

School.hasMany(SocialDailyMetric, { foreignKey: 'school_id' });
SocialDailyMetric.belongsTo(School, { foreignKey: 'school_id' });

School.hasMany(SchoolDailyActivity, { foreignKey: 'school_id' });
SchoolDailyActivity.belongsTo(School, { foreignKey: 'school_id' });

District.hasMany(DistrictPerformanceSnapshot, { foreignKey: 'district_id' });
DistrictPerformanceSnapshot.belongsTo(District, { foreignKey: 'district_id' });

// Audit & Impersonation
User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(ImpersonationSession, { foreignKey: 'super_admin_id', as: 'ImpersonatedSessionsAsAdmin' });
User.hasMany(ImpersonationSession, { foreignKey: 'impersonated_user_id', as: 'ImpersonatedSessionsAsUser' });
ImpersonationSession.belongsTo(User, { foreignKey: 'super_admin_id', as: 'Admin' });
ImpersonationSession.belongsTo(User, { foreignKey: 'impersonated_user_id', as: 'ImpersonatedUser' });

const models = {
  User,
  Role,
  Permission,
  UserRoleAssignment,
  SchoolAdminMapping,
  RegionalAdminScope,
  State,
  District,
  School,
  SchoolOnboardingRequest,
  ActivityCategory,
  SchoolActivity,
  SchoolAchievement,
  AchievementAsset,
  MediaAsset,
  MediaSubmission,
  MediaSubmissionVersion,
  MediaVersionAsset,
  SubmissionReviewStep,
  SubmissionReview,
  MediaPublication,
  RankTier,
  ScoreCategory,
  ScoreRule,
  SchoolScorePeriod,
  SchoolScoreComponent,
  SchoolRankHistory,
  SchoolRankSnapshot,
  Badge,
  SchoolBadge,
  Notification,
  NotificationRecipient,
  UserNotificationPreference,
  Conversation,
  ConversationParticipant,
  Message,
  MessageAsset,
  InspectionRequest,
  InspectionReport,
  GeneratedReport,
  SchoolRecommendation,
  RecommendationStatusHistory,
  ServicePackage,
  SchoolPackageProposal,
  ProposalCallRequest,
  SchoolMetricSnapshot,
  SocialDailyMetric,
  SchoolDailyActivity,
  DistrictPerformanceSnapshot,
  AuditLog,
  ImpersonationSession,
  OutboxEvent,
  WebhookEvent
};

module.exports = {
  sequelize,
  ...models
};
