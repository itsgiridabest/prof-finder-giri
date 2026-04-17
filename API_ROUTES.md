# ProfFinder Vercel API Routes

This document describes how to convert the tRPC backend to Vercel serverless API routes.

## Directory Structure

```
api/
├── trpc/
│   ├── [trpc].ts          ← Main tRPC handler
│   └── auth/
│       ├── me.ts          ← GET /api/trpc/auth.me
│       └── logout.ts      ← POST /api/trpc/auth.logout
├── professor/
│   ├── search.ts          ← POST /api/professor/search
│   ├── generateEmail.ts   ← POST /api/professor/generateEmail
│   └── getHistory.ts      ← GET /api/professor/history
├── profile/
│   ├── get.ts             ← GET /api/profile
│   └── update.ts          ← POST /api/profile/update
├── outreach/
│   ├── list.ts            ← GET /api/outreach
│   ├── create.ts          ← POST /api/outreach
│   └── update.ts          ← POST /api/outreach/update
└── health.ts              ← GET /api/health
```

## Implementation Pattern

Each API route follows this pattern:

```typescript
// api/professor/search.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchProfessors } from '@/server/professorSearch';
import { getDb } from '@/server/db';

export async function POST(req: NextRequest) {
  try {
    const { researchField, universityPreference, locationPreference } = await req.json();
    
    // Validate input
    if (!researchField) {
      return NextResponse.json({ error: 'Research field required' }, { status: 400 });
    }

    // Get database connection
    const db = await getDb();
    
    // Call business logic
    const results = await searchProfessors(researchField, universityPreference, locationPreference, db);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
```

## Database Connection

For Vercel Postgres, use:

```typescript
import { sql } from '@vercel/postgres';

// Query
const result = await sql`SELECT * FROM users WHERE id = ${userId}`;

// Insert
const { rows } = await sql`
  INSERT INTO professors (name, university, email) 
  VALUES (${name}, ${university}, ${email})
  RETURNING *
`;
```

## Authentication

Vercel API routes don't have built-in session management like Express. Use:

1. **Cookies**: Parse from `req.headers.get('cookie')`
2. **JWT**: Verify token from Authorization header
3. **Manus OAuth**: Validate token with Manus API

Example:

```typescript
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function verifyAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

## Environment Variables

In Vercel, environment variables are set in the dashboard:

- `DATABASE_URL`: Vercel Postgres connection string (auto-provided)
- `OPENAI_API_KEY`: Your OpenAI API key
- `JWT_SECRET`: Secret for JWT signing
- `OWNER_OPEN_ID`: Owner's OAuth ID
- `OWNER_NAME`: Owner's name

## Deployment

Vercel automatically detects and deploys API routes in the `api/` directory. No additional configuration needed.

## Testing Locally

```bash
npm run dev
# API routes available at http://localhost:3000/api/*
```

## CORS

For frontend requests from different domains, add CORS headers:

```typescript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

return NextResponse.json(data, { headers });
```

## Rate Limiting

Vercel has built-in rate limiting. For custom limits, use middleware:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Add rate limiting logic here
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

## Monitoring

Monitor API performance in Vercel dashboard:
- Function duration
- Error rates
- Memory usage
- Cold starts

## Migration from Express/tRPC

Key differences:

| Express/tRPC | Vercel |
|---|---|
| `req.body` | `await req.json()` |
| `res.json()` | `NextResponse.json()` |
| Middleware | `middleware.ts` |
| Error handling | Try/catch + NextResponse |
| Database | Vercel Postgres SDK |
| Sessions | JWT or cookies |

## Performance Tips

1. **Keep functions small**: Vercel charges per execution
2. **Use connection pooling**: Vercel Postgres handles this
3. **Cache responses**: Use HTTP caching headers
4. **Minimize cold starts**: Keep bundle size small
5. **Async operations**: Use Promise.all() for parallel queries

## Troubleshooting

**Function timeout**: Increase maxDuration in vercel.json (max 60s on Hobby plan)  
**Cold start slow**: Optimize imports, reduce bundle size  
**Database connection errors**: Check DATABASE_URL is set  
**CORS errors**: Add CORS headers to response  
**Out of memory**: Reduce query result size, use pagination  
