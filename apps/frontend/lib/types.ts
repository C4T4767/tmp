export type SafetyStatus = 'safe' | 'caution' | 'blocked' | 'user-risk' | 'group-caution';

export interface Ingredient {
  name: string;
  amount?: string;
  unit?: string;
  status: SafetyStatus;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  status: SafetyStatus;
  ingredients: Ingredient[];
}

export interface PriceInfo {
  store: string;
  price: number;
  shipping: number;
  url: string;
}

export interface ProductOffer {
  id: string;
  productId: string;
  store: string;
  price: number;
  shipping: number;
  url: string;
  rank: number;
  crawledAt: string;
  reviewSummary?: ReviewSummary;
}

export interface ReviewSummary {
  positive: number;
  negative: number;
  other: number;
  summary: string;
  topics: {
    name: string;
    sentiment: 'positive' | 'negative' | 'other';
    summary: string;
  }[];
}

export interface Group {
  id: string;
  name: string;
  memberCount: number;
  onboardedCount: number;
  inviteCode: string;
  leaderId: string;
  leaderName: string;
}

export interface GroupMember {
  id: string;
  nickname: string;
  isOnboarded: boolean;
}

export interface User {
  id: string;
  nickname: string;
  isOnboarded: boolean;
  onboardingInfo?: OnboardingInfo;
}

export interface OnboardingInfo {
  isPregnant: boolean;
  hasHypertension: boolean;
  hasHyperlipidemia: boolean;
  hasDiabetes: boolean;
  isBreastfeeding: boolean;
  isChild: boolean;
  isElderly: boolean;
  isCaffeineSensitive: boolean;
  additionalNotes: string;
}
