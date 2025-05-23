export interface DailyLog {
  id: string;
  description: string;
  timestamp: string; // ISO string format
  userId?: string;
  businessId?: string;
  category?: string;
}
