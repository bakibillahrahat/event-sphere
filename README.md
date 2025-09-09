# EventSphere - Microservices Event Management Platform

EventSphere is a complete event management platform built on a modern microservices architecture. This project serves as a practical example of how to break down a large, complex system into smaller, independent, and manageable services.

## 🏗️ Architecture Overview

The platform consists of the following microservices:

### Core Services

1. **User Service** (`port 3001`)
   - User registration, authentication, and profile management
   - JWT-based authentication
   - Role-based access control (user, organizer, admin)
   - User preferences and settings

2. **Event Service** (`port 3002`)
   - Event creation, management, and discovery
   - Event categories and tagging
   - Search and filtering capabilities
   - Event capacity management

3. **Booking Service** (`port 3003`)
   - Event registration and booking management
   - Ticket generation with QR codes
   - Attendee information management
   - Booking status tracking

4. **Notification Service** (`port 3004`)
   - Email and SMS notifications
   - Event reminders and updates
   - Booking confirmations
   - Custom notification preferences

5. **Payment Service** (`port 3005`)
   - Payment processing integration
   - Refund management
   - Payment history and receipts
   - Multiple payment gateway support

6. **Analytics Service** (`port 3006`)
   - Event analytics and reporting
   - User engagement metrics
   - Revenue tracking
   - Dashboard data aggregation

### Infrastructure Services

7. **API Gateway** (`port 3000`)
   - Single entry point for all client requests
   - Request routing and load balancing
   - Authentication middleware
   - Rate limiting and monitoring

### Supporting Infrastructure

- **MongoDB**: Database for each service
- **Redis**: Caching and session management
- **Docker**: Containerization for all services

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- MongoDB (if running locally)
- Redis (if running locally)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/bakibillahrahat/event-sphere.git
   cd event-sphere
   ```

2. **Start all services**
   ```bash
   npm run dev
   ```
   This will build and start all services using Docker Compose.

3. **Access the services**
   - API Gateway: http://localhost:3000
   - User Service: http://localhost:3001
   - Event Service: http://localhost:3002
   - Booking Service: http://localhost:3003
   - Notification Service: http://localhost:3004
   - Payment Service: http://localhost:3005
   - Analytics Service: http://localhost:3006

### Development Setup

1. **Install dependencies for all services**
   ```bash
   npm install
   ```

2. **Start individual services for development**
   ```bash
   # Start MongoDB and Redis
   docker-compose up mongo redis -d
   
   # Start services individually
   cd services/user-service && npm run dev
   cd services/event-service && npm run dev
   # ... repeat for other services
   ```

## 📚 API Documentation

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### User Service API

#### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-token` - Verify JWT token

#### User Management Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `DELETE /api/users/:id` - Deactivate user (admin only)

### Event Service API

#### Event Endpoints
- `POST /api/events` - Create new event
- `GET /api/events` - Get events (with filtering)
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `PATCH /api/events/:id/capacity` - Update event capacity

#### Category Endpoints
- `POST /api/categories` - Create category
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Booking Service API

#### Booking Endpoints
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

## 🛠️ Technology Stack

### Backend Technologies
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Redis** - In-memory data structure store
- **JWT** - JSON Web Tokens for authentication
- **Joi** - Data validation library
- **bcryptjs** - Password hashing
- **Axios** - HTTP client for inter-service communication

### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting middleware

## 🏁 Microservices Principles

This project demonstrates key microservices principles:

### 1. **Single Responsibility**
Each service has a specific business function and owns its data.

### 2. **Loose Coupling**
Services communicate through well-defined APIs and are independently deployable.

### 3. **High Cohesion**
Related functionality is grouped together within services.

### 4. **Database per Service**
Each service has its own database to ensure data independence.

### 5. **API Gateway Pattern**
Centralized entry point for client requests with cross-cutting concerns.

### 6. **Service Discovery**
Services communicate through environment-based configuration.

## 🔧 Configuration

### Environment Variables

Each service can be configured using environment variables:

#### User Service
- `PORT` - Service port (default: 3000)
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time

#### Event Service
- `PORT` - Service port (default: 3000)
- `DATABASE_URL` - MongoDB connection string

#### Booking Service
- `PORT` - Service port (default: 3000)
- `DATABASE_URL` - MongoDB connection string
- `USER_SERVICE_URL` - User service URL
- `EVENT_SERVICE_URL` - Event service URL

## 🧪 Testing

Run tests for all services:
```bash
npm test
```

Run tests for a specific service:
```bash
cd services/user-service
npm test
```

## 📊 Monitoring and Health Checks

Each service exposes a health check endpoint:
- `GET /health` - Returns service health status

Monitor all services:
```bash
curl http://localhost:3001/health  # User Service
curl http://localhost:3002/health  # Event Service
curl http://localhost:3003/health  # Booking Service
# ... and so on
```

## 🚀 Deployment

### Production Deployment with Docker

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy to production**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Kubernetes Deployment

Kubernetes manifests are available in the `/k8s` directory for container orchestration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

MD. Bakibillah Rahat - [GitHub](https://github.com/bakibillahrahat)

Project Link: [https://github.com/bakibillahrahat/event-sphere](https://github.com/bakibillahrahat/event-sphere)

---

## 🎯 Project Goals

This project serves as a comprehensive example of:

- **Microservices Architecture**: Practical implementation of microservices patterns
- **Modern Node.js Development**: Best practices in Node.js application development
- **API Design**: RESTful API design principles
- **Docker Containerization**: Multi-service containerization and orchestration
- **Database Design**: NoSQL database modeling and relationships
- **Authentication & Authorization**: JWT-based security implementation
- **Inter-Service Communication**: Service-to-service communication patterns
- **Error Handling**: Comprehensive error handling and validation
- **Code Organization**: Clean code architecture and separation of concerns

Perfect for learning microservices architecture, Node.js development, and modern web application patterns!