// Shared TypeScript types for the AI Packing List feature

export interface Trip {
  id: string;
  destination: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  activities: string[];
  created_at: string;
}

export interface PackingList {
  id: string;
  trip_id: string;
  user_id: string | null;
  created_at: string;
}

export interface PackingItem {
  id: string;
  list_id: string;
  category: string;
  name: string;
  checked: boolean;
  is_custom: boolean;
}

export interface PackingCategory {
  name: string;
  items: PackingItem[];
}

export interface PackingListWithItems extends PackingList {
  categories: PackingCategory[];
}

// Shape returned by OpenAI
export interface OpenAIPackingResponse {
  categories: Array<{
    name: string;
    items: Array<{ name: string }>;
  }>;
}
