import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const D1_API_URL = process.env.CLOUDFLARE_API_URL || 'https://east-africa-education-api.pngobiro.workers.dev/api';
const D1_API_KEY = process.env.CLOUDFLARE_API_KEY || 'ea_edu_api_2025_9bf6e21f5d1a4d7da1b74ca222b89eec_secure';

// API client for Cloudflare D1
export const d1Client = axios.create({
  baseURL: D1_API_URL,
  headers: {
    'X-API-Key': D1_API_KEY,
    'Content-Type': 'application/json'
  }
});

export { D1_API_URL };
