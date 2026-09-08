export type UserRole = 'Admin' | 'Trainer' | 'MC / Host' | 'Fasilitator' | 'HR / L&D' | 'Guru / Dosen' | 'EO';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  photoUrl?: string;
  location?: string;
  whatsapp?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: number;
  activity_number: string;
  activity_name: string;
  category: string;
  short_description: string;
  long_description: string;
  objective: string;
  main_goal: string;
  suitable_for: string[];
  suitable_event_filter: string[];
  participant_min: number;
  participant_max: number;
  duration_min: number;
  duration_max: number;
  format: 'Offline' | 'Online' | 'Hybrid';
  indoor_outdoor: 'Indoor' | 'Outdoor' | 'Both';
  energy_level: 'Calm' | 'Medium' | 'High';
  difficulty_level: 'Easy' | 'Medium' | 'Advanced';
  tools_needed: string[];
  step_by_step: string[];
  mc_script: string;
  debrief_questions: string[];
  variations: string[];
  risk_notes: string;
  mitigation_tips: string;
  professional_tips: string;
  rating: number;
  usage_count: number;
  is_free: boolean;
  estimated_fun_level: number;
  estimated_impact_level: number;
  illustration_url: string;
  created_by?: string;
  created_at?: string;
}

export interface ActivityPack {
  id: number;
  title: string;
  description: string;
  category?: string;
  activityCount: number;
  price: string;
  isPro: boolean;
  activities: number[];
  highlights: string[];
}

export interface Session {
  id: string;
  userId: string;
  name: string;
  date: string;
  context: string;
  audience: string;
  participantCount: number;
  activityIds: number[];
  notes: string;
  status: 'Draft' | 'Berjalan' | 'Selesai';
  createdAt: string;
  updatedAt: string;
}

export interface SavedActivity {
  id: string;
  userId: string;
  activityId: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}
