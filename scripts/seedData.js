const mongoose = require('mongoose');

// Sample categories
const categories = [
  {
    name: 'Technology',
    description: 'Tech conferences, workshops, and meetups',
    icon: 'fas fa-laptop-code',
    color: '#007bff'
  },
  {
    name: 'Music',
    description: 'Concerts, festivals, and music events',
    icon: 'fas fa-music',
    color: '#28a745'
  },
  {
    name: 'Sports',
    description: 'Sports events, tournaments, and competitions',
    icon: 'fas fa-futbol',
    color: '#ffc107'
  },
  {
    name: 'Business',
    description: 'Business conferences, networking events',
    icon: 'fas fa-briefcase',
    color: '#dc3545'
  },
  {
    name: 'Education',
    description: 'Educational workshops and seminars',
    icon: 'fas fa-graduation-cap',
    color: '#6f42c1'
  },
  {
    name: 'Health & Wellness',
    description: 'Health, fitness, and wellness events',
    icon: 'fas fa-heart',
    color: '#20c997'
  }
];

// Sample users
const users = [
  {
    email: 'admin@eventsphere.com',
    password: 'admin123',
    firstName: 'Event',
    lastName: 'Admin',
    role: 'admin',
    isEmailVerified: true
  },
  {
    email: 'organizer@eventsphere.com', 
    password: 'organizer123',
    firstName: 'Event',
    lastName: 'Organizer',
    role: 'organizer',
    isEmailVerified: true
  },
  {
    email: 'user@eventsphere.com',
    password: 'user123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    isEmailVerified: true
  }
];

module.exports = { categories, users };