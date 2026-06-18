const { 
  SchoolActivityRepository, SchoolAchievementRepository, AchievementAssetRepository, SchoolRepository 
} = require('../repositories');
const mediaStorage = require('../services/mediaStorageService');

class ActivityController {
  // Activity endpoints
  async createActivity(req, res) {
    try {
      // School Admin defaults to own schoolId
      let schoolId = req.body.school_id;
      if (req.user.rolesList.includes('School Admin')) {
        schoolId = req.user.scope.schoolId;
      }

      if (!schoolId) {
        return res.status(400).json({ success: false, message: 'school_id is required', errors: [] });
      }

      const activity = await SchoolActivityRepository.create({
        ...req.body,
        school_id: schoolId
      });

      return res.status(201).json({ success: true, message: 'Activity created successfully', data: activity });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to create activity', errors: [error.message] });
    }
  }

  async updateActivity(req, res) {
    try {
      const activity = await SchoolActivityRepository.update(req.params.id, req.body);
      if (!activity) return res.status(404).json({ success: false, message: 'Activity not found', errors: [] });
      return res.status(200).json({ success: true, message: 'Activity updated successfully', data: activity });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to update activity', errors: [error.message] });
    }
  }

  async deleteActivity(req, res) {
    try {
      const success = await SchoolActivityRepository.delete(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'Activity not found', errors: [] });
      return res.status(200).json({ success: true, message: 'Activity deleted successfully', data: {} });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to delete activity', errors: [error.message] });
    }
  }

  async getActivitiesBySchool(req, res) {
    try {
      const schoolId = req.params.schoolId;
      const activities = await SchoolActivityRepository.findAll({
        where: { school_id: schoolId },
        include: ['ActivityCategory']
      });
      return res.status(200).json({ success: true, message: 'Activities fetched successfully', data: activities });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch school activities', errors: [error.message] });
    }
  }

  // Achievement endpoints
  async createAchievement(req, res) {
    try {
      let schoolId = req.body.school_id;
      if (req.user.rolesList.includes('School Admin')) {
        schoolId = req.user.scope.schoolId;
      }

      if (!schoolId) {
        return res.status(400).json({ success: false, message: 'school_id is required', errors: [] });
      }

      const achievement = await SchoolAchievementRepository.create({
        ...req.body,
        school_id: schoolId
      });

      return res.status(201).json({ success: true, message: 'Achievement created successfully', data: achievement });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to create achievement', errors: [error.message] });
    }
  }

  async uploadAchievementAsset(req, res) {
    try {
      const achievementId = req.params.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded', errors: [] });
      }

      const achievement = await SchoolAchievementRepository.findById(achievementId);
      if (!achievement) {
        return res.status(404).json({ success: false, message: 'Achievement not found', errors: [] });
      }

      const uploadResult = await mediaStorage.uploadFile(file);

      const asset = await AchievementAssetRepository.create({
        achievement_id: achievementId,
        file_url: uploadResult.fileUrl,
        file_name: uploadResult.fileName,
        file_type: uploadResult.fileType,
        thumbnail_url: uploadResult.thumbnailUrl
      });

      return res.status(200).json({
        success: true,
        message: 'Achievement certificate/media uploaded successfully',
        data: asset
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to upload achievement asset', errors: [error.message] });
    }
  }
}

module.exports = new ActivityController();
