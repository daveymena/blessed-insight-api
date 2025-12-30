# Server Implementation Plan

## Overview
We are adding a backend server to support user accounts and premium subscriptions.

## Stack
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PostgreSQL (via Prisma)
- **Auth**: JWT

## Schema Draft
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(USER)
  tier      Tier     @default(FREE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Tier {
  FREE
  PREMIUM
}

enum Role {
  USER
  ADMIN
}
```

## Next Steps
1. Initialize `server` folder.
2. Install dependencies.
3. Setup Prisma.
4. Create Auth routes.
