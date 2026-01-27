/**
 * Script to create default admin account
 * Run: node scripts/create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminUsername = 'admin';
    const adminEmail = 'admin@gokgok.local';
    const adminPassword = 'admin123'; // Change this in production!
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { username: adminUsername },
          { email: adminEmail }
        ]
      }
    });
    
    if (existingAdmin) {
      // Update existing user to admin
      if (!existingAdmin.isAdmin) {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { isAdmin: true }
        });
        console.log(`✅ Updated user "${adminUsername}" to admin`);
      } else {
        console.log(`ℹ️  Admin user "${adminUsername}" already exists`);
      }
      return;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        passwordHash,
        isAdmin: true,
        avatarConfig: { body: 'u1', head: 'none' }
      }
    });
    
    console.log('✅ Admin account created successfully!');
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n⚠️  WARNING: Change the admin password in production!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
