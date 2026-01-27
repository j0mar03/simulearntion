// Migration Script: Convert existing JSON profiles to PostgreSQL
// Run with: node scripts/migrate-profiles.js

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function migrateProfiles() {
  console.log('🔄 Starting profile migration...\n');
  
  // Path to existing profiles
  const profilesDir = path.join(__dirname, '../../player_profiles');
  
  if (!fs.existsSync(profilesDir)) {
    console.log('❌ player_profiles directory not found');
    console.log('   Expected path:', profilesDir);
    return;
  }
  
  // Get all JSON files
  const files = fs.readdirSync(profilesDir).filter(f => f.endsWith('.json'));
  
  console.log(`📁 Found ${files.length} profile(s) to migrate\n`);
  
  let migrated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const file of files) {
    const filePath = path.join(profilesDir, file);
    const username = file.replace('.json', '');
    
    try {
      // Read existing profile
      const profileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      console.log(`Processing: ${username}`);
      
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { username }
      });
      
      if (existing) {
        console.log(`  ⏭️  Skipped (already exists)\n`);
        skipped++;
        continue;
      }
      
      // Create default password (users will need to reset)
      const defaultPassword = 'Physics2026!';
      const passwordHash = await bcrypt.hash(defaultPassword, 12);
      
      // Create email from username
      const email = `${username.toLowerCase()}@gokgok.edu`.replace(/\s+/g, '_');
      
      // Create user
      const user = await prisma.user.create({
        data: {
          username: profileData.username || username,
          email,
          passwordHash,
          avatarConfig: profileData.avatar || { body: 'u1', head: 'none' },
          currentStreak: profileData.progress?.current_streak || 0,
          totalPlaytime: profileData.progress?.total_playtime || 0,
          lastPlayDate: profileData.progress?.last_play_date 
            ? new Date(profileData.progress.last_play_date) 
            : null,
          createdAt: profileData.created_at 
            ? new Date(profileData.created_at) 
            : new Date(),
          lastLogin: profileData.last_played 
            ? new Date(profileData.last_played) 
            : new Date()
        }
      });
      
      // Migrate topics studied
      if (profileData.progress?.topics_studied) {
        for (const topic of profileData.progress.topics_studied) {
          await prisma.topicStudied.create({
            data: {
              userId: user.id,
              topic
            }
          });
        }
      }
      
      // Migrate achievements
      if (profileData.progress?.achievements || profileData.achievements) {
        const achievementsList = profileData.progress?.achievements || profileData.achievements;
        for (const achievementId of achievementsList) {
          await prisma.achievement.create({
            data: {
              userId: user.id,
              achievementId
            }
          });
        }
      }
      
      console.log(`  ✅ Migrated successfully`);
      console.log(`     Email: ${email}`);
      console.log(`     Default password: ${defaultPassword}`);
      console.log(`     (User should change password after first login)\n`);
      
      migrated++;
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
      errors++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log('='.repeat(50) + '\n');
  
  if (migrated > 0) {
    console.log('⚠️  IMPORTANT: All migrated users have the default password:');
    console.log('   Password: Physics2026!');
    console.log('   Users should change their password after first login.\n');
  }
}

// Run migration
migrateProfiles()
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
