#!/usr/bin/env node
/**
 * Initialize Vercel Postgres database with ProfFinder schema
 * Run with: npm run db:init
 */

import { sql } from '@vercel/postgres';

const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Searches table
CREATE TABLE IF NOT EXISTS searches (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id),
  researchField TEXT NOT NULL,
  universityPreference VARCHAR(255),
  locationPreference VARCHAR(255),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Professors table
CREATE TABLE IF NOT EXISTS professors (
  id SERIAL PRIMARY KEY,
  searchId INTEGER NOT NULL REFERENCES searches(id),
  name VARCHAR(255) NOT NULL,
  university VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  researchInterests TEXT,
  recentPapers TEXT,
  contactEmail VARCHAR(320),
  profileUrl TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
  id SERIAL PRIMARY KEY,
  professorId INTEGER NOT NULL REFERENCES professors(id),
  originalContent TEXT NOT NULL,
  editedContent TEXT,
  wasSent VARCHAR(20) NOT NULL DEFAULT 'unknown' CHECK(wasSent IN ('yes', 'no', 'unknown')),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL UNIQUE REFERENCES users(id),
  fullName VARCHAR(255),
  university VARCHAR(255),
  major VARCHAR(255),
  year VARCHAR(50),
  gpa VARCHAR(10),
  researchInterests TEXT,
  skills TEXT,
  pastExperience TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Outreach table
CREATE TABLE IF NOT EXISTS outreach (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id),
  professorId INTEGER NOT NULL REFERENCES professors(id),
  emailId INTEGER NOT NULL REFERENCES emails(id),
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'replied', 'no_response', 'meeting_scheduled', 'rejected')),
  sentAt TIMESTAMP,
  repliedAt TIMESTAMP,
  notes TEXT,
  followUpReminder TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Professor Bookmarks table
CREATE TABLE IF NOT EXISTS professorBookmarks (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id),
  professorId INTEGER NOT NULL REFERENCES professors(id),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Professor Scores table
CREATE TABLE IF NOT EXISTS professorScores (
  id SERIAL PRIMARY KEY,
  professorId INTEGER NOT NULL REFERENCES professors(id),
  userId INTEGER NOT NULL REFERENCES users(id),
  matchScore INTEGER NOT NULL,
  reasoning TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Follow Up Emails table
CREATE TABLE IF NOT EXISTS followUpEmails (
  id SERIAL PRIMARY KEY,
  outreachId INTEGER NOT NULL REFERENCES outreach(id),
  emailContent TEXT NOT NULL,
  tone VARCHAR(20) NOT NULL DEFAULT 'formal' CHECK(tone IN ('formal', 'friendly', 'concise')),
  daysAfterOriginal INTEGER NOT NULL,
  sentAt TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Email Tone Preferences table
CREATE TABLE IF NOT EXISTS emailTonePreferences (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL UNIQUE REFERENCES users(id),
  defaultTone VARCHAR(20) NOT NULL DEFAULT 'formal' CHECK(defaultTone IN ('formal', 'friendly', 'concise')),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_searches_userId ON searches(userId);
CREATE INDEX IF NOT EXISTS idx_professors_searchId ON professors(searchId);
CREATE INDEX IF NOT EXISTS idx_emails_professorId ON emails(professorId);
CREATE INDEX IF NOT EXISTS idx_profiles_userId ON profiles(userId);
CREATE INDEX IF NOT EXISTS idx_outreach_userId ON outreach(userId);
CREATE INDEX IF NOT EXISTS idx_outreach_professorId ON outreach(professorId);
CREATE INDEX IF NOT EXISTS idx_professorBookmarks_userId ON professorBookmarks(userId);
CREATE INDEX IF NOT EXISTS idx_professorScores_userId ON professorScores(userId);
CREATE INDEX IF NOT EXISTS idx_followUpEmails_outreachId ON followUpEmails(outreachId);
`;

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing ProfFinder database...');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await sql.query(statement);
    }

    console.log('✅ Database initialized successfully!');
    console.log('📊 All tables created and indexes built.');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
