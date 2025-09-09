const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    maxlength: 300
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  organizer: {
    type: String, // User ID from user service
    required: true
  },
  dateTime: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  location: {
    venue: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'USA'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  pricing: {
    type: {
      type: String,
      enum: ['free', 'paid'],
      required: true
    },
    amount: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  capacity: {
    total: {
      type: Number,
      required: true,
      min: 1
    },
    available: {
      type: Number,
      required: true
    }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  requirements: {
    ageLimit: {
      min: Number,
      max: Number
    },
    specialRequirements: [String]
  },
  socialLinks: {
    website: String,
    facebook: String,
    twitter: String,
    instagram: String
  },
  registrationDeadline: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure available capacity doesn't exceed total
eventSchema.pre('save', function(next) {
  if (this.capacity.available > this.capacity.total) {
    this.capacity.available = this.capacity.total;
  }
  next();
});

// Index for search
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ 'dateTime.start': 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);