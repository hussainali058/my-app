import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 4000;
export const JWT_SECRET =
  process.env.JWT_SECRET || 'punjab-university-cultural-day-secret';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const DATABASE_URL = process.env.DATABASE_URL || null;

