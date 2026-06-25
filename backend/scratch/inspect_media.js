const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { sequelize, MediaSubmission, MediaSubmissionVersion, MediaAsset, SubmissionReviewStep, SubmissionReview, MediaPublication, School, District, User } = require('../src/models');
const { MediaSubmissionRepository, MediaSubmissionVersionRepository, MediaRepository, SubmissionReviewStepRepository, SubmissionReviewRepository, MediaPublicationRepository, SchoolRepository } = require('../src/repositories');

async function inspect() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    // Find one submission
    const sub = await MediaSubmission.findOne();
    if (!sub) {
      console.log('No media submissions in database. Cannot run detail query test.');
      return;
    }
    
    console.log(`Found media submission ID ${sub.id}. Attempting to query detail using same includes as MediaController...`);
    
    const submission = await MediaSubmissionRepository.findById(sub.id, {
      include: [
        {
          model: MediaSubmissionVersionRepository.model,
          include: [MediaRepository.model]
        },
        { model: SubmissionReviewStepRepository.model },
        { model: SubmissionReviewRepository.model },
        { model: MediaPublicationRepository.model },
        { model: SchoolRepository.model, include: ['District'] },
        { association: 'User', attributes: ['id', 'email', 'first_name', 'last_name'] }
      ]
    });
    
    console.log('Query successful!');
    console.log(JSON.stringify(submission, null, 2));

  } catch (err) {
    console.error('Inspection failed:', err);
  } finally {
    process.exit(0);
  }
}

inspect();
