# Architecture Documentation

## Overview

This is a **Patient Notification Management System** built with the T3 Stack. The application manages medical appointment notifications across multiple delivery channels (Email, SMS, In-App) with timezone-aware scheduling and user preferences.

## Tech Stack

- **Framework**: Next.js 15 (App Router with Turbopack)
- **Language**: TypeScript (strict mode)
- **API Layer**: tRPC v11 for type-safe API calls
- **Database**: Prisma ORM with SQLite
- **Authentication**: NextAuth v5 (beta) with Credentials provider
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest with React Testing Library
- **Package Manager**: pnpm

## System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│               Presentation Layer                     │
│          (Next.js App Router Components)            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                  API Layer                          │
│              (tRPC Routers)                         │
│  - appointment.ts                                   │
│  - notification.ts                                  │
│  - preference.ts                                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│               Service Layer                          │
│  - AppointmentService                               │
│  - NotificationService                              │
│  - NotificationScheduler                            │
│  - NotificationValidator                            │
│  - NotificationRetrier                              │
│  - TemplateEngine                                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│            Channel Implementations                   │
│         (Strategy Pattern)                          │
│  - INotificationChannel (interface)                 │
│  - EmailChannel                                     │
│  - SmsChannel                                       │
│  - InAppChannel                                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│               Data Layer                            │
│            (Prisma ORM)                             │
└─────────────────────────────────────────────────────┘
```

## Database Schema

### Core Models

#### Patient
Extends the base User model with healthcare-specific fields:
- `timezone`: Patient's timezone for scheduling
- `phoneNumber`: For SMS notifications
- Relations: `user`, `notificationPrefs`, `appointments`, `notifications`

#### Appointment
Medical appointments with scheduling and status tracking:
- `scheduledAt`: Appointment date/time
- `status`: SCHEDULED | CONFIRMED | CANCELLED | COMPLETED | NO_SHOW
- `appointmentType`, `doctorName`, `location`, `notes`
- Relations: `patient`, `notifications`

#### Notification
Notification records with delivery tracking:
- `notificationType`: Type of notification (enum)
- `channelType`: Delivery channel (EMAIL | SMS | IN_APP)
- `status`: Delivery status tracking
- `scheduledFor`: When to send
- `sentAt`, `deliveredAt`, `failedAt`: Delivery timestamps
- `retryCount`, `maxRetries`: Retry management
- `content`: JSON stringified notification content
- Relations: `patient`, `appointment`

#### NotificationPreference
User preferences per notification type and channel:
- `notificationType`: What type of notification
- `channelType`: Which channel
- `enabled`: Whether enabled
- Unique constraint on (patientId, notificationType, channelType)

#### NotificationTemplate
Reusable templates with variable interpolation:
- `bodyTemplate`: Template string with `{{variable}}` placeholders
- `variables`: JSON array of required variables
- Unique constraint on (notificationType, channelType)

### Enums

```typescript
enum NotificationType {
  APPOINTMENT_REMINDER
  APPOINTMENT_CONFIRMATION
  APPOINTMENT_CANCELLATION
  APPOINTMENT_RESCHEDULED
  TEST_RESULTS_READY
  PRESCRIPTION_READY
}

enum ChannelType {
  EMAIL
  SMS
  IN_APP
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}

enum NotificationStatus {
  PENDING
  SCHEDULED
  SENDING
  SENT
  DELIVERED
  FAILED
  CANCELLED
}
```

## Design Patterns

### Strategy Pattern (Notification Channels)

The `INotificationChannel` interface defines a contract for all notification delivery channels. Each channel (Email, SMS, In-App) implements this interface with its own delivery logic.

**Benefits**:
- Easy to add new channels
- Each channel can have different retry logic
- Testable in isolation
- Follows Open/Closed Principle

```typescript
interface INotificationChannel {
  send(notification: NotificationPayload): Promise<ChannelResult>;
  validate(notification: NotificationPayload): ValidationResult;
  getName(): ChannelType;
}
```

### Service Layer Pattern

Business logic is separated from the API layer into dedicated service classes:

- **AppointmentService**: Appointment CRUD and business logic
- **NotificationService**: Core notification operations
- **NotificationScheduler**: Calculates when to send notifications
- **NotificationValidator**: Business rule validation
- **NotificationRetrier**: Retry failed notifications
- **TemplateEngine**: Template parsing and variable interpolation

**Benefits**:
- Testable without tRPC
- Reusable across different endpoints
- Clear separation of concerns (SRP)
- Can be used in background jobs, CLI tools, etc.

## Key Business Rules

### 1. Notification Scheduling
- Appointment reminders sent 24h and 2h before appointment
- Respects "quiet hours" (10pm-7am in patient's timezone)
- If scheduled time falls in quiet hours, moves to 7am next valid day
- Skips 24h reminder if appointment is within 24h

### 2. User Preferences
- Each patient can enable/disable notifications per type and channel
- Notifications only sent if preference is enabled
- Missing contact info (email/phone) prevents channel usage

### 3. Retry Logic
- Failed notifications retry up to `maxRetries` times
- Uses exponential backoff: 1min, 2min, 4min, 8min...
- Only retries if error is retryable (network errors, not validation errors)

### 4. Template System
- Templates support `{{variable}}` interpolation
- Nested object paths supported: `{{appointment.doctor.name}}`
- HTML escaping for email context (XSS prevention)
- Missing variables handled gracefully

## Directory Structure

```
src/
├── app/                           # Next.js App Router
│   ├── _components/               # Server components
│   ├── api/
│   │   ├── auth/                  # NextAuth route handler
│   │   └── trpc/                  # tRPC HTTP adapter
│   ├── layout.tsx
│   └── page.tsx
├── server/
│   ├── api/
│   │   ├── routers/
│   │   │   ├── appointment.ts     # Appointment endpoints
│   │   │   ├── notification.ts    # Notification endpoints
│   │   │   └── preference.ts      # Preference endpoints
│   │   ├── root.ts                # Main tRPC router
│   │   └── trpc.ts                # tRPC initialization
│   ├── services/
│   │   ├── notification/
│   │   │   ├── NotificationService.ts
│   │   │   ├── NotificationScheduler.ts
│   │   │   ├── NotificationValidator.ts
│   │   │   ├── NotificationRetrier.ts
│   │   │   ├── channels/
│   │   │   │   ├── INotificationChannel.ts
│   │   │   │   ├── EmailChannel.ts
│   │   │   │   ├── SmsChannel.ts
│   │   │   │   └── InAppChannel.ts
│   │   │   └── templates/
│   │   │       └── TemplateEngine.ts
│   │   └── appointment/
│   │       └── AppointmentService.ts
│   ├── utils/
│   │   ├── timezone.ts
│   │   ├── datetime.ts
│   │   └── validation.ts
│   ├── auth/                      # NextAuth config
│   └── db.ts                      # Prisma client
├── trpc/                          # Client-side tRPC
├── test/                          # Test setup
└── env.js                         # Environment validation

prisma/
├── schema.prisma                  # Database schema
└── seed.ts                        # Seed data
```

## Testing Strategy

### Unit Tests
- Service layer methods (scheduling, validation, retry logic)
- Utility functions (timezone, template engine)
- Channel implementations

### Integration Tests
- tRPC endpoints with database
- Service composition
- End-to-end flows (create appointment → schedule notifications)

### Test Configuration
- **Framework**: Vitest
- **Environment**: jsdom (for React components)
- **Coverage**: v8 provider
- **Setup**: `src/test/setup.ts` with React Testing Library cleanup

### Running Tests
```bash
pnpm test              # Run tests in watch mode
pnpm test:ui           # Run tests with UI
pnpm test:coverage     # Generate coverage report
```

## Development Workflow

### Getting Started
1. Clone repository
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env` and configure
4. Push database schema: `pnpm db:push`
5. Seed database: `pnpm db:seed`
6. Start dev server: `pnpm dev`

### Code Quality
```bash
pnpm check             # Run linter and type checker
pnpm lint              # ESLint
pnpm typecheck         # TypeScript compiler
pnpm format:check      # Prettier check
pnpm format:write      # Auto-format
```

### Database Management
```bash
pnpm db:push           # Push schema (dev)
pnpm db:generate       # Generate Prisma client + migrations
pnpm db:migrate        # Deploy migrations (prod)
pnpm db:studio         # Open Prisma Studio
```

## Security Considerations

1. **XSS Prevention**: HTML escaping in template engine for email context
2. **Input Validation**: Zod schemas at tRPC layer + business validation at service layer
3. **Authentication**: All sensitive endpoints use `protectedProcedure`
4. **Data Isolation**: Patient data scoped to authenticated user
5. **SQL Injection**: Prevented by Prisma parameterized queries

## Performance Considerations

1. **Database Indexes**: Strategic indexes on frequently queried fields
   - `Patient.userId` (unique)
   - `Appointment.patientId`, `scheduledAt`, `status`
   - `Notification.patientId`, `status`, `scheduledFor`

2. **N+1 Query Prevention**: Use Prisma `include` for related data

3. **Pagination**: Notification listings support limit/offset

4. **Connection Pooling**: Prisma handles connection pooling

## Scalability Considerations

### Current Limitations (SQLite)
- Single file database
- No horizontal scaling
- Limited concurrency

### Production Recommendations
1. **Database**: Migrate to PostgreSQL or MySQL
2. **Background Jobs**: Use job queue (BullMQ, Inngest) for:
   - Notification scheduling
   - Retry logic
   - Cleanup tasks
3. **Message Queue**: Decouple notification sending
4. **Caching**: Redis for frequently accessed data (preferences, templates)
5. **Rate Limiting**: Prevent abuse of notification endpoints
6. **Monitoring**: Application performance monitoring (APM)

## SOLID Principles in Practice

1. **Single Responsibility Principle**
   - Each service has one clear purpose
   - Channels handle only their delivery method
   - Validators only validate

2. **Open/Closed Principle**
   - New notification channels added without modifying existing code
   - Template engine extensible for new variable types

3. **Liskov Substitution Principle**
   - Any INotificationChannel implementation is interchangeable

4. **Interface Segregation Principle**
   - Small, focused interfaces (INotificationChannel)
   - Clients don't depend on methods they don't use

5. **Dependency Inversion Principle**
   - Services depend on Prisma client abstraction, not concrete implementation
   - Channel strategy uses interface, not concrete classes

## Future Enhancements

1. **Real-time Notifications**: WebSocket/SSE for in-app notifications
2. **Notification History**: Archive and analytics
3. **A/B Testing**: Template performance tracking
4. **Multi-language Support**: i18n for notification content
5. **Rich Notifications**: Support for images, buttons in templates
6. **Delivery Reports**: Tracking open rates, click-through rates
7. **Smart Scheduling**: ML-based optimal send times
8. **Two-way Communication**: Reply handling for SMS/email
