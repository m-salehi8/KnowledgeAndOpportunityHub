// @ts-nocheck
import { ProductHuntDailyDigest } from '../types';

export const initialProductHuntDigest: ProductHuntDailyDigest = {
  id: '',
  date_formatted: '',
  created_at: new Date().toISOString(),
  total_products: 0,
  products: [],
  ai_spotlight: '',
  idea_takeaway: '',
};
