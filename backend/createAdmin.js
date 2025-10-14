const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userModel = require('./src/models/user');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await userModel.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Password: admin123');
      return;
    }

    // Create admin user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    const adminUser = new userModel({
      userId: 'ADMIN001',
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@college.edu');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  createAdminUser();
}

module.exports = { createAdminUser };