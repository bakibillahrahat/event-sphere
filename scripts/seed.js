#!/usr/bin/env node

const mongoose = require('mongoose');
const axios = require('axios');
const { categories, users } = require('./seedData');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://localhost:3002';

async function seedCategories() {
  console.log('Seeding categories...');
  
  for (const category of categories) {
    try {
      await axios.post(`${EVENT_SERVICE_URL}/api/categories`, category);
      console.log(`✓ Created category: ${category.name}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`- Category already exists: ${category.name}`);
      } else {
        console.error(`✗ Failed to create category ${category.name}:`, error.message);
      }
    }
  }
}

async function seedUsers() {
  console.log('Seeding users...');
  
  for (const user of users) {
    try {
      await axios.post(`${USER_SERVICE_URL}/api/auth/register`, user);
      console.log(`✓ Created user: ${user.email}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`- User already exists: ${user.email}`);
      } else {
        console.error(`✗ Failed to create user ${user.email}:`, error.message);
      }
    }
  }
}

async function createSampleEvents() {
  console.log('Creating sample events...');
  
  try {
    // Login as organizer to get token
    const loginResponse = await axios.post(`${USER_SERVICE_URL}/api/auth/login`, {
      email: 'organizer@eventsphere.com',
      password: 'organizer123'
    });
    
    const token = loginResponse.data.token;
    
    // Get categories
    const categoriesResponse = await axios.get(`${EVENT_SERVICE_URL}/api/categories`);
    const techCategory = categoriesResponse.data.categories.find(c => c.name === 'Technology');
    
    if (!techCategory) {
      console.error('Technology category not found');
      return;
    }
    
    const sampleEvent = {
      title: 'EventSphere Tech Conference 2024',
      description: 'Join us for the inaugural EventSphere Technology Conference, featuring cutting-edge talks on microservices, cloud computing, and modern web development.',
      shortDescription: 'A premier tech conference showcasing the latest in software development.',
      category: techCategory._id,
      dateTime: {
        start: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        end: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000) // 31 days from now
      },
      location: {
        venue: 'Tech Center Convention Hall',
        address: '123 Innovation Drive',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      },
      pricing: {
        type: 'paid',
        amount: 99.99,
        currency: 'USD'
      },
      capacity: {
        total: 500
      },
      tags: ['technology', 'microservices', 'cloud', 'development'],
      status: 'published'
    };
    
    await axios.post(`${EVENT_SERVICE_URL}/api/events`, sampleEvent, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Created sample event: EventSphere Tech Conference 2024');
    
  } catch (error) {
    console.error('✗ Failed to create sample events:', error.response?.data || error.message);
  }
}

async function seed() {
  console.log('🌱 Starting database seeding...\n');
  
  // Wait for services to be ready
  console.log('Waiting for services to be ready...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  try {
    await seedCategories();
    console.log('');
    
    await seedUsers();
    console.log('');
    
    await createSampleEvents();
    console.log('');
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@eventsphere.com / admin123');
    console.log('Organizer: organizer@eventsphere.com / organizer123');
    console.log('User: user@eventsphere.com / user123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed };