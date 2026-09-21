import api from "@/lib/api";

export interface Plan {
  id: string;
  product_id: string;      // 'THINKNAO'
  name: string;            // 'Free Access', '1 Month', '3 Months', '6 Months'
  name_short: string;      // 'Usage-limited', '1 month', '3 months', '6 months'
  duration_months: number;
  price_per_month_idr: number;
  total_price_idr: number;
  billing_note: string | null;
  savings_badge: string | null;
  is_active: boolean;
  sort_order: number;
  products: {
    id: string;
    name: string;
    slug: string;
  };
}

export async function activateFreePlan(): Promise<{ status: string; plan_id: string; expires_at: null }> {
  const { data } = await api.post("/api/payments/free-plan");
  return data;
}

export interface ReferralValidationResult {
  valid: boolean;
  discount_amount: number;
  discount_type: "fixed" | "percentage";
  message?: string;
}

export interface PaymentCreationResult {
  payment_url: string;
  invoice_id: string;
}

export async function fetchPlans(productSlug?: string): Promise<Plan[]> {
  const { data } = await api.get("/api/payments/plans", {
    params: productSlug ? { product: productSlug } : undefined,
  });
  return data;
}

export async function validateReferral(code: string): Promise<ReferralValidationResult> {
  const { data } = await api.get(`/api/payments/referral/${code}`);
  return data;
}

export async function createPayment(
  planId: string,
  referralCode?: string
): Promise<PaymentCreationResult> {
  const { data } = await api.post("/api/payments/create", {
    plan_id: planId,
    referral_code: referralCode ?? null,
  });
  return data;
}
