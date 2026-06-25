const BaseRepository = require('./baseRepository');
const models = require('../models');

class UserRepository extends BaseRepository {
  constructor() {
    super(models.User);
  }

  async findByEmail(email) {
    return this.findOne({ where: { email } });
  }

  async findWithProfile(id) {
    return this.findById(id, {
      include: [
        { model: models.Role }
      ]
    });
  }
}

class RoleRepository extends BaseRepository {
  constructor() {
    super(models.Role);
  }
}

class PermissionRepository extends BaseRepository {
  constructor() {
    super(models.Permission);
  }
}

class SchoolRepository extends BaseRepository {
  constructor() {
    super(models.School);
  }

  async findByCode(code) {
    return this.findOne({ where: { school_code: code } });
  }
}

class StateRepository extends BaseRepository {
  constructor() {
    super(models.State);
  }
}

class DistrictRepository extends BaseRepository {
  constructor() {
    super(models.District);
  }
}

class MediaRepository extends BaseRepository {
  constructor() {
    super(models.MediaAsset);
  }
}

class MediaSubmissionRepository extends BaseRepository {
  constructor() {
    super(models.MediaSubmission);
  }
}

class AuditRepository extends BaseRepository {
  constructor() {
    super(models.AuditLog);
  }
}

class SchoolLogRepository extends BaseRepository {
  constructor() {
    super(models.SchoolLog);
  }
}

class NotificationRepository extends BaseRepository {
  constructor() {
    super(models.Notification);
  }
}

class InspectionRepository extends BaseRepository {
  constructor() {
    super(models.InspectionRequest);
  }
}

class InspectionReportRepository extends BaseRepository {
  constructor() {
    super(models.InspectionReport);
  }
}

class RecommendationRepository extends BaseRepository {
  constructor() {
    super(models.SchoolRecommendation);
  }
}

class RankingRepository extends BaseRepository {
  constructor() {
    super(models.SchoolRankHistory);
  }
}

class ScorePeriodRepository extends BaseRepository {
  constructor() {
    super(models.SchoolScorePeriod);
  }
}

module.exports = {
  UserRepository: new UserRepository(),
  RoleRepository: new RoleRepository(),
  PermissionRepository: new PermissionRepository(),
  SchoolRepository: new SchoolRepository(),
  StateRepository: new StateRepository(),
  DistrictRepository: new DistrictRepository(),
  MediaRepository: new MediaRepository(),
  MediaSubmissionRepository: new MediaSubmissionRepository(),
  AuditRepository: new AuditRepository(),
  SchoolLogRepository: new SchoolLogRepository(),
  NotificationRepository: new NotificationRepository(),
  InspectionRepository: new InspectionRepository(),
  InspectionReportRepository: new InspectionReportRepository(),
  RecommendationRepository: new RecommendationRepository(),
  RankingRepository: new RankingRepository(),
  ScorePeriodRepository: new ScorePeriodRepository(),
  
  // Generic base mappings for direct tables if needed
  SchoolAdminMappingRepository: new BaseRepository(models.SchoolAdminMapping),
  RegionalAdminScopeRepository: new BaseRepository(models.RegionalAdminScope),
  SchoolOnboardingRequestRepository: new BaseRepository(models.SchoolOnboardingRequest),
  ActivityCategoryRepository: new BaseRepository(models.ActivityCategory),
  SchoolActivityRepository: new BaseRepository(models.SchoolActivity),
  SchoolAchievementRepository: new BaseRepository(models.SchoolAchievement),
  AchievementAssetRepository: new BaseRepository(models.AchievementAsset),
  MediaSubmissionVersionRepository: new BaseRepository(models.MediaSubmissionVersion),
  MediaVersionAssetRepository: new BaseRepository(models.MediaVersionAsset),
  SubmissionReviewStepRepository: new BaseRepository(models.SubmissionReviewStep),
  SubmissionReviewRepository: new BaseRepository(models.SubmissionReview),
  MediaPublicationRepository: new BaseRepository(models.MediaPublication),
  RankTierRepository: new BaseRepository(models.RankTier),
  ScoreCategoryRepository: new BaseRepository(models.ScoreCategory),
  ScoreRuleRepository: new BaseRepository(models.ScoreRule),
  SchoolScoreComponentRepository: new BaseRepository(models.SchoolScoreComponent),
  SchoolRankSnapshotRepository: new BaseRepository(models.SchoolRankSnapshot),
  BadgeRepository: new BaseRepository(models.Badge),
  SchoolBadgeRepository: new BaseRepository(models.SchoolBadge),
  NotificationRecipientRepository: new BaseRepository(models.NotificationRecipient),
  UserNotificationPreferenceRepository: new BaseRepository(models.UserNotificationPreference),
  ConversationRepository: new BaseRepository(models.Conversation),
  ConversationParticipantRepository: new BaseRepository(models.ConversationParticipant),
  MessageRepository: new BaseRepository(models.Message),
  MessageAssetRepository: new BaseRepository(models.MessageAsset),
  GeneratedReportRepository: new BaseRepository(models.GeneratedReport),
  RecommendationStatusHistoryRepository: new BaseRepository(models.RecommendationStatusHistory),
  ServicePackageRepository: new BaseRepository(models.ServicePackage),
  SchoolPackageProposalRepository: new BaseRepository(models.SchoolPackageProposal),
  ProposalCallRequestRepository: new BaseRepository(models.ProposalCallRequest),
  SchoolMetricSnapshotRepository: new BaseRepository(models.SchoolMetricSnapshot),
  SocialDailyMetricRepository: new BaseRepository(models.SocialDailyMetric),
  SchoolDailyActivityRepository: new BaseRepository(models.SchoolDailyActivity),
  DistrictPerformanceSnapshotRepository: new BaseRepository(models.DistrictPerformanceSnapshot),
  ImpersonationSessionRepository: new BaseRepository(models.ImpersonationSession),
  OutboxEventRepository: new BaseRepository(models.OutboxEvent),
  WebhookEventRepository: new BaseRepository(models.WebhookEvent)
};
