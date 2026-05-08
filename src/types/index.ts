export type MemberStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type OrderStatus = "PENDING" | "PAID" | "SHIPPING" | "DELIVERED" | "CANCELLED";
export type CommissionType = "UNILEVEL" | "BINARY" | "MATRIX" | "HYBRID" | "SHARED";
export type RuleType = "REFERRAL" | "TEAM" | "RANK_BONUS" | "MATCHING" | "VOLUME";
export type CalcType = "PERCENT" | "FIXED" | "TIER";
export type SettlementStatus = "OPEN" | "CALCULATING" | "CLOSED" | "PAID";
export type PayoutStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Rank {
  id: string;
  code: string;
  name: string;
  level: number;
  min_pv: number;
  min_gv: number;
  min_direct_referral: number;
  color: string;
  badge_icon?: string;
}

export interface Member {
  id: string;
  member_code: string;
  name: string;
  email: string;
  phone?: string;
  sponsor_id?: string;
  placement_id?: string;
  placement_side?: "LEFT" | "RIGHT";
  rank_id?: string;
  rank?: Rank;
  sponsor?: Pick<Member, "id" | "name" | "member_code">;
  personal_pv: number;
  group_gv: number;
  left_volume: number;
  right_volume: number;
  bank_name?: string;
  bank_account?: string;
  bank_holder?: string;
  status: MemberStatus;
  is_admin: boolean;
  joined_at: string;
  created_at: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  member_price: number;
  pv: number;
  bv: number;
  category?: string;
  image_url?: string;
  stock: number;
  status: string;
}

export interface Order {
  id: string;
  order_code: string;
  member_id: string;
  member?: Pick<Member, "name" | "member_code">;
  total_price: number;
  total_pv: number;
  total_bv: number;
  status: OrderStatus;
  payment_method?: string;
  paid_at?: string;
  created_at: string;
}

export interface CommissionPlan {
  id: string;
  name: string;
  type: CommissionType;
  description?: string;
  is_active: boolean;
  rules?: CommissionRule[];
}

export interface CommissionRule {
  id: string;
  plan_id: string;
  name: string;
  rule_type: RuleType;
  target_depth_from: number;
  target_depth_to: number;
  target_side?: string;
  calc_type: CalcType;
  value?: number;
  base: string;
  min_rank_level: number;
  min_personal_pv: number;
  min_direct_referral: number;
  is_volume_only: boolean;
  max_amount?: number;
  max_monthly?: number;
  sort_order: number;
  is_active: boolean;
}

export interface Commission {
  id: string;
  period_id: string;
  member_id: string;
  member?: Pick<Member, "name" | "member_code">;
  rule_id: string;
  rule?: Pick<CommissionRule, "name" | "rule_type">;
  source_member_id?: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface SettlementPeriod {
  id: string;
  year: number;
  month: number;
  status: SettlementStatus;
  total_bv: number;
  total_commission: number;
  calculated_at?: string;
  closed_at?: string;
  paid_at?: string;
}

export interface DashboardStats {
  total_members: number;
  active_members: number;
  monthly_orders: number;
  monthly_revenue: number;
  monthly_pv: number;
  monthly_commission: number;
  new_members_today: number;
  pending_orders: number;
}
