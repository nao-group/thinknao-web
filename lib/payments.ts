import api from "@/lib/api";

export interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  starts_at: string;
  expires_at: string;
  plans: {
    name: string;
    name_short: string | null;
    products: { name: string };
  };
}

export async function fetchSubscription(): Promise<Subscription | null> {
  const { data } = await api.get<{ subscription: Subscription | null }>("/api/payments/subscription");
  return data.subscription;
}
