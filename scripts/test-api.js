#!/usr/bin/env node

/**
 * EventSphere API Test Script
 * Tests the basic functionality of all microservices
 */

const axios = require('axios');

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';

async function testHealthChecks() {
  console.log('🏥 Testing health checks...');
  
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/health`);
    console.log('✅ API Gateway health check passed');
    console.log(`   Services: ${response.data.services.join(', ')}`);
  } catch (error) {
    console.log('❌ API Gateway health check failed:', error.message);
  }
}

async function testUserRegistration() {
  console.log('\n👤 Testing user registration...');
  
  try {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    };
    
    const response = await axios.post(`${API_GATEWAY_URL}/api/auth/register`, userData);
    console.log('✅ User registration successful');
    console.log(`   User ID: ${response.data.user._id}`);
    return response.data.token;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️  User already exists, attempting login...');
      return await testUserLogin();
    } else {
      console.log('❌ User registration failed:', error.response?.data || error.message);
      return null;
    }
  }
}

async function testUserLogin() {
  try {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await axios.post(`${API_GATEWAY_URL}/api/auth/login`, loginData);
    console.log('✅ User login successful');
    return response.data.token;
  } catch (error) {
    console.log('❌ User login failed:', error.response?.data || error.message);
    return null;
  }
}

async function testEventCategories() {
  console.log('\n📂 Testing event categories...');
  
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/categories`);
    console.log('✅ Categories retrieved successfully');
    console.log(`   Found ${response.data.categories.length} categories`);
    return response.data.categories;
  } catch (error) {
    console.log('❌ Categories retrieval failed:', error.response?.data || error.message);
    return [];
  }
}

async function testEventCreation(token, categories) {
  console.log('\n🎉 Testing event creation...');
  
  if (!token || categories.length === 0) {
    console.log('⏭️  Skipping event creation (missing token or categories)');
    return;
  }
  
  try {
    const eventData = {
      title: 'API Test Event',
      description: 'This is a test event created by the API test script.',
      shortDescription: 'Test event for API validation',
      category: categories[0]._id,
      dateTime: {
        start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        end: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000) // 8 days from now
      },
      location: {
        venue: 'Test Venue',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'USA'
      },
      pricing: {
        type: 'free'
      },
      capacity: {
        total: 100
      },
      tags: ['test', 'api'],
      status: 'published'
    };
    
    const response = await axios.post(`${API_GATEWAY_URL}/api/events`, eventData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Event creation successful');
    console.log(`   Event ID: ${response.data.event._id}`);
    return response.data.event;
  } catch (error) {
    console.log('❌ Event creation failed:', error.response?.data || error.message);
    return null;
  }
}

async function testAnalytics() {
  console.log('\n📊 Testing analytics...');
  
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/analytics/dashboard`);
    console.log('✅ Analytics dashboard retrieved');
    console.log(`   Total Events: ${response.data.totalEvents}`);
    console.log(`   Total Bookings: ${response.data.totalBookings}`);
    console.log(`   Total Revenue: $${response.data.totalRevenue}`);
  } catch (error) {
    console.log('❌ Analytics retrieval failed:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🧪 EventSphere API Test Suite');
  console.log('==============================\n');
  console.log(`Testing API Gateway at: ${API_GATEWAY_URL}`);
  console.log('Note: This script requires the services to be running\n');
  
  // Run tests
  await testHealthChecks();
  const token = await testUserRegistration();
  const categories = await testEventCategories();
  await testEventCreation(token, categories);
  await testAnalytics();
  
  console.log('\n🏁 Test suite completed!');
  console.log('\nTo run the full system:');
  console.log('1. npm run dev (start all services)');
  console.log('2. npm run seed (populate sample data)');
  console.log('3. node scripts/test-api.js (run this test)');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };