export type LeadSource = 'Website' | 'Referral' | 'LinkedIn' | 'Facebook' | 'Instagram' | 'Other';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Converted' | 'Closed';

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  lead_source: LeadSource;
  requirement_message: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  lead_id: string;
  content: string;
  created_at: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  scheduled_date: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

export interface StatusHistory {
  id: string;
  lead_id: string;
  old_status: LeadStatus | null;
  new_status: LeadStatus;
  changed_at: string;
}

export interface User {
  id: string;
  email: string;
}
