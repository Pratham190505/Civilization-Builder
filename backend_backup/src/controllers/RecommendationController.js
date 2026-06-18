const { 
  RecommendationRepository, RecommendationStatusHistoryRepository, 
  SchoolPackageProposalRepository, ProposalCallRequestRepository 
} = require('../repositories');
const notificationService = require('../services/notificationService');

class RecommendationController {
  async createRecommendation(req, res) {
    try {
      // school_recommendations columns: id, school_id, title, description, priority, ranking_impact, progress_percentage, created_by, created_at
      const rec = await RecommendationRepository.create({
        school_id: req.body.school_id,
        title: req.body.type || req.body.title || 'Improvement Recommendation',
        description: req.body.description,
        priority: req.body.priority || 'MEDIUM',
        ranking_impact: req.body.ranking_impact || 10,
        progress_percentage: 0,
        created_by: req.user.id
      });

      // Log Status History
      // recommendation_status_history columns: id, recommendation_id, old_status, new_status, changed_by, changed_at
      await RecommendationStatusHistoryRepository.create({
        recommendation_id: rec.id,
        old_status: null,
        new_status: 'PENDING',
        changed_by: req.user.id,
        changed_at: new Date()
      });

      // Send notification to School Admin
      await notificationService.sendNotification({
        senderId: req.user.id,
        type: 'RECOMMENDATION_CREATED',
        title: 'New Improvement Recommendation',
        message: `Your school has received a new ${req.body.priority || 'MEDIUM'} priority recommendation.`,
        targetSchoolId: req.body.school_id
      });

      return res.status(201).json({ success: true, message: 'Recommendation logged successfully', data: rec });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to create recommendation', errors: [error.message] });
    }
  }

  async acceptRecommendation(req, res) {
    try {
      const rec = await RecommendationRepository.findById(req.params.id);
      if (!rec) return res.status(404).json({ success: false, message: 'Recommendation not found', errors: [] });

      // Fetch the last status from history
      const lastHistory = await RecommendationStatusHistoryRepository.findOne({
        where: { recommendation_id: rec.id },
        order: [['changed_at', 'DESC']]
      });

      await RecommendationStatusHistoryRepository.create({
        recommendation_id: rec.id,
        old_status: lastHistory ? lastHistory.new_status : 'PENDING',
        new_status: 'ACCEPTED',
        changed_by: req.user.id,
        changed_at: new Date()
      });

      return res.status(200).json({ success: true, message: 'Recommendation accepted successfully', data: rec });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Accept failed', errors: [error.message] });
    }
  }

  async rejectRecommendation(req, res) {
    try {
      const rec = await RecommendationRepository.findById(req.params.id);
      if (!rec) return res.status(404).json({ success: false, message: 'Recommendation not found', errors: [] });

      const lastHistory = await RecommendationStatusHistoryRepository.findOne({
        where: { recommendation_id: rec.id },
        order: [['changed_at', 'DESC']]
      });

      await RecommendationStatusHistoryRepository.create({
        recommendation_id: rec.id,
        old_status: lastHistory ? lastHistory.new_status : 'PENDING',
        new_status: 'REJECTED',
        changed_by: req.user.id,
        changed_at: new Date()
      });

      return res.status(200).json({ success: true, message: 'Recommendation rejected successfully', data: rec });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Reject failed', errors: [error.message] });
    }
  }

  async getRecommendationHistory(req, res) {
    try {
      const schoolId = parseInt(req.params.schoolId, 10);
      const history = await RecommendationRepository.findAll({
        where: { school_id: schoolId },
        include: [{ model: RecommendationStatusHistoryRepository.model }],
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        message: 'Recommendation history fetched successfully',
        data: history
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Fetch history failed', errors: [error.message] });
    }
  }
}

module.exports = new RecommendationController();
