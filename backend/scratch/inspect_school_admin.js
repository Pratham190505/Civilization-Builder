const path = require('path');
const backendPath = 'c:/Users/Rana Ruchi/OneDrive/Desktop/internship 2.o/final/Civilization-Builder/backend';

const dotenv = require(`${backendPath}/node_modules/dotenv`);
dotenv.config({ path: `${backendPath}/.env` });

const { sequelize, User, Role, SchoolAdminMapping, School, District, State, SchoolRankSnapshot, RankTier, SchoolScoreComponent, ScoreCategory } = require(`${backendPath}/src/models`);

async function inspect() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.\n');

    // 1. Get user details
    const user = await User.findOne({
      where: { email: 'schooladmin@gds.com' },
      include: [{ model: Role }]
    });
    if (!user) {
      console.log('User schooladmin@gds.com not found.');
      return;
    }
    console.log(`=== USER ===`);
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Roles: ${user.Roles.map(r => r.role_name).join(', ')}`);

    // 2. Get school mapping
    const mapping = await SchoolAdminMapping.findOne({
      where: { user_id: user.id },
      include: [{
        model: School,
        include: [{
          model: District,
          include: [State]
        }]
      }]
    });
    console.log(`\n=== MAPPING ===`);
    if (!mapping) {
      console.log('No school mapping found.');
    } else {
      console.log(`Mapping ID: ${mapping.id}`);
      console.log(`School ID: ${mapping.school_id}`);
      if (mapping.School) {
        console.log(`School Name: ${mapping.School.school_name}`);
        console.log(`School Code: ${mapping.School.school_code}`);
        console.log(`Status: ${mapping.School.status}`);
        console.log(`Student Count: ${mapping.School.student_count}`);
        console.log(`Teacher Count: ${mapping.School.teacher_count}`);
        console.log(`District Name: ${mapping.School.District?.district_name}`);
        console.log(`State Name: ${mapping.School.District?.State?.state_name}`);
      } else {
        console.log('Mapping exists but School is null.');
      }
    }

    // 3. Get school rank snapshot
    if (mapping && mapping.school_id) {
      const rank = await SchoolRankSnapshot.findOne({
        where: { school_id: mapping.school_id },
        include: [RankTier]
      });
      console.log(`\n=== RANK SNAPSHOT ===`);
      if (!rank) {
        console.log('No ranking snapshot found for this school.');
      } else {
        console.log(`Snapshot ID: ${rank.id}`);
        console.log(`Tier: ${rank.RankTier?.tier_name}`);
        console.log(`Total Score: ${rank.total_score}`);
        console.log(`Global Rank: ${rank.global_rank}`);
        console.log(`State Rank: ${rank.state_rank}`);
        console.log(`District Rank: ${rank.district_rank}`);
      }

      const components = await SchoolScoreComponent.findAll({
        where: { school_id: mapping.school_id },
        include: [ScoreCategory]
      });
      console.log(`\n=== SCORE COMPONENTS ===`);
      components.forEach(c => {
        console.log(`Category: ${c.ScoreCategory?.category_name}, Score: ${c.score}`);
      });
    }

  } catch (err) {
    console.error('Error during inspection:', err);
  } finally {
    await sequelize.close();
  }
}

inspect();
