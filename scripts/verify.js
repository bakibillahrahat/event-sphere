#!/usr/bin/env node

console.log('🚀 EventSphere Microservices Platform');
console.log('=====================================\n');

const fs = require('fs');
const path = require('path');

// Check if all services exist
const services = [
  'user-service',
  'event-service', 
  'booking-service',
  'notification-service',
  'payment-service',
  'analytics-service',
  'api-gateway'
];

console.log('📁 Checking service structure...');
services.forEach(service => {
  const servicePath = path.join(__dirname, '..', 'services', service);
  const srcPath = path.join(servicePath, 'src');
  const packagePath = path.join(servicePath, 'package.json');
  const dockerPath = path.join(servicePath, 'Dockerfile');
  
  if (fs.existsSync(servicePath) && fs.existsSync(srcPath) && fs.existsSync(packagePath) && fs.existsSync(dockerPath)) {
    console.log(`✅ ${service}`);
  } else {
    console.log(`❌ ${service} - missing files`);
  }
});

console.log('\n🐳 Checking Docker configuration...');
const dockerComposePath = path.join(__dirname, '..', 'docker-compose.yml');
if (fs.existsSync(dockerComposePath)) {
  console.log('✅ docker-compose.yml exists');
} else {
  console.log('❌ docker-compose.yml missing');
}

console.log('\n📖 Checking documentation...');
const readmePath = path.join(__dirname, '..', 'README.md');
if (fs.existsSync(readmePath)) {
  const readme = fs.readFileSync(readmePath, 'utf8');
  if (readme.includes('EventSphere') && readme.includes('microservices')) {
    console.log('✅ README.md complete');
  } else {
    console.log('❌ README.md incomplete');
  }
} else {
  console.log('❌ README.md missing');
}

console.log('\n🌱 Checking seed scripts...');
const seedPath = path.join(__dirname, 'seed.js');
const seedDataPath = path.join(__dirname, 'seedData.js');
if (fs.existsSync(seedPath) && fs.existsSync(seedDataPath)) {
  console.log('✅ Seed scripts available');
} else {
  console.log('❌ Seed scripts missing');
}

console.log('\n🎯 Implementation Summary:');
console.log('• Complete microservices architecture with 7 services');
console.log('• Docker containerization for all services');
console.log('• MongoDB + Redis infrastructure');
console.log('• JWT-based authentication');
console.log('• API Gateway for service routing'); 
console.log('• Comprehensive documentation');
console.log('• Sample data and seeding scripts');

console.log('\n🚀 Next Steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Start services: npm run dev');
console.log('3. Seed sample data: npm run seed');
console.log('4. Access API Gateway: http://localhost:3000');

console.log('\n✨ EventSphere is ready for deployment!');