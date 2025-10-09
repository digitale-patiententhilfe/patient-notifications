# Patient Notification Management System

A full-stack application for managing medical appointment notifications with multiple delivery channels, built with the [T3 Stack](https://create.t3.gg/).

## Features

- **Multi-channel Notifications**: Email, SMS, and In-App notifications
- **User Notification Preferences**: Granular control over notification types and channels
- **Smart Scheduling**: Timezone-aware scheduling with quiet hours support (10pm-7am)
- **Template Management**: Reusable templates with variable interpolation (`{{patientName}}`, etc.)
- **Retry Logic**: Automatic retry with exponential backoff for failed deliveries
- **Notification History**: Complete tracking of notification status and delivery
- **Appointment Management**: Schedule and manage medical appointments
- **Type Safety**: End-to-end type safety with tRPC and TypeScript strict mode

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router and Turbopack
- **Language**: TypeScript (strict mode enabled)
- **API Layer**: [tRPC v11](https://trpc.io) for type-safe API calls
- **Database**: [Prisma ORM](https://prisma.io) with SQLite (easy to switch to PostgreSQL/MySQL)
- **Authentication**: [NextAuth v5](https://next-auth.js.org) (beta) with Credentials provider
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Testing**: [Vitest](https://vitest.dev) with React Testing Library
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd notification-project
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env
   ```

   The `.env` file needs:
   - `DATABASE_URL`: SQLite database path (default `file:./db.sqlite` works)
   - `AUTH_SECRET`: Any string for development (e.g., `dev-secret`)

   **Demo Login Credentials:**
   - Email: `test@example.com`
   - Password: `password123`

4. Initialize the database

   ```bash
   pnpm db:push
   ```

5. (Optional) Seed with sample data

   ```bash
   pnpm db:seed
   ```

6. Start the development server

   ```bash
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Commands

### Development

```bash
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build
pnpm start            # Start production server
pnpm preview          # Build and start production server
```

### Code Quality

```bash
pnpm check            # Run linter and type checker together
pnpm lint             # Run ESLint
pnpm lint:fix         # Auto-fix ESLint issues
pnpm typecheck        # Run TypeScript compiler (no emit)
pnpm format:check     # Check code formatting
pnpm format:write     # Auto-format code with Prettier
```

### Database

```bash
pnpm db:push          # Push schema changes to DB (dev)
pnpm db:generate      # Generate Prisma client and run migrations
pnpm db:migrate       # Deploy migrations (production)
pnpm db:studio        # Open Prisma Studio GUI
pnpm db:seed          # Seed database with sample data
```

### Testing

```bash
pnpm test             # Run tests in watch mode
pnpm test:ui          # Run tests with Vitest UI
pnpm test:coverage    # Generate test coverage report
```

## Project Structure

```
notification-project/
├── src/
│   ├── app/                    # Next.js App Router pages and components
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/       # tRPC routers (appointment, notification, preference)
│   │   │   ├── root.ts        # Main tRPC router
│   │   │   └── trpc.ts        # tRPC configuration
│   │   ├── services/          # Business logic services
│   │   │   ├── notification/  # Notification services and channels
│   │   │   └── appointment/   # Appointment services
│   │   ├── utils/             # Utility functions (timezone, datetime, validation)
│   │   ├── auth/              # NextAuth configuration
│   │   └── db.ts              # Prisma client singleton
│   ├── trpc/                  # Client-side tRPC setup
│   └── env.js                 # Environment variable validation
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seed script
├── ARCHITECTURE.md            # Detailed architecture documentation
└── vitest.config.ts           # Test configuration
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation on:

- System architecture and design patterns
- Database schema and relationships
- Service layer organization
- Testing strategy
- Security and performance considerations

## Key Concepts

### Notification Flow

1. **Appointment Created** → Triggers notification scheduling
2. **Scheduler** → Calculates send times (24h before, 2h before) respecting quiet hours
3. **Preference Check** → Verifies user has enabled this notification type/channel
4. **Channel Selection** → Routes to appropriate channel (Email/SMS/In-App)
5. **Template Rendering** → Interpolates variables into template
6. **Delivery** → Sends notification and tracks status
7. **Retry Logic** → Retries failed notifications with exponential backoff

### Design Patterns Used

- **Strategy Pattern**: Notification channels implement `INotificationChannel` interface
- **Service Layer**: Business logic separated from API layer
- **Repository Pattern**: Prisma provides data access abstraction

## Authentication

The app uses NextAuth v5 with Credentials provider for easy development:

**Demo Credentials:**

- Email: `test@example.com`
- Password: `password123`

The seed script creates this demo user automatically. In a production environment, you would:

- Hash passwords using bcrypt or similar
- Implement proper user registration
- Add email verification
- Use OAuth providers (GitHub, Google, etc.)

## Learn More

### T3 Stack Resources

- [T3 Stack Documentation](https://create.t3.gg/)
- [T3 Stack Tutorial](https://create.t3.gg/en/faq)

### Technology Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev)

## Contributing

This project follows strict TypeScript and ESLint configurations. Before submitting changes:

1. Run `pnpm check` to ensure code quality
2. Run `pnpm test` to ensure all tests pass
3. Write tests for new features
4. Follow the existing code structure and patterns

## License

MIT License

Copyright (c) 2024 Patient Notification Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
