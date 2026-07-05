// EXTENSION: Types for OAuth users and sleep sessions mapped to DB
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SleepSession {
  id: string;
  userId: string;
  bedTime: Date;
  wakeTime: Date;
  durationMins: number;
  qualityScore?: number | null;
  notes?: string | null;
  createdAt: Date;
}

export interface HealthProfile {
  userId: string;
  targetSleepDurationMins: number;
  averageCycleDurationMins: number;
  bedtimeConsistencyScore: number; // 0-100
}
