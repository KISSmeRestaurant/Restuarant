import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
export const JWT_COOKIE_EXPIRES = process.env.JWT_COOKIE_EXPIRES || 30;
export const NODE_ENV = process.env.NODE_ENV || 'development';