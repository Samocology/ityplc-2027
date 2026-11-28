export type UserRole = "hq_admin" | "zone_admin";

export type RegistrationStatus = "registered" | "cancelled" | "pending";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type RegistrationSource = "public" | "zone_bulk_upload";

export type ResponseState = "idle" | "loading" | "success" | "error";

export interface Zone {
  id: string;
  name: string;
  slug: string;
  zone_id_code: string | null;
  is_active: boolean;
  is_activated: boolean;
  activation_token: string | null;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ZoneActivationCode {
  id: string;
  zone_id: string;
  auth_user_id: string;
  code: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  role: UserRole;
  zone_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  first_name: string;
  surname: string;
  kingschat_username: string | null;
  designation: string | null;
  title: string | null;
  age_group: string | null;
  zone_id: string;
  registration_status: RegistrationStatus;
  payment_status: PaymentStatus;
  registration_source: RegistrationSource;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
