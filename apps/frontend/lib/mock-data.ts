import type { Product, PriceInfo, ProductOffer, ReviewSummary, Group, GroupMember } from './types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Nature Made 멀티비타민',
    price: 25900,
    status: 'safe',
    ingredients: [
      { name: '비타민 A', status: 'safe' },
      { name: '비타민 C', status: 'safe' },
      { name: '비타민 D', status: 'safe' },
      { name: '아연', status: 'safe' },
    ],
  },
  {
    id: '2',
    name: 'NOW Foods 오메가-3',
    price: 32500,
    status: 'caution',
    ingredients: [
      { name: 'EPA', status: 'safe' },
      { name: 'DHA', status: 'safe' },
      { name: '비타민 E', status: 'caution' },
    ],
  },
  {
    id: '3',
    name: 'Swanson 프로바이오틱스',
    price: 28000,
    status: 'blocked',
    ingredients: [
      { name: '락토바실러스', status: 'safe' },
      { name: '비피도박테리움', status: 'safe' },
      { name: '에페드린', status: 'blocked' },
    ],
  },
  {
    id: '4',
    name: 'California Gold 비타민 C',
    price: 18500,
    status: 'user-risk',
    ingredients: [
      { name: '비타민 C', status: 'safe' },
      { name: '카페인', status: 'user-risk' },
    ],
  },
  {
    id: '5',
    name: 'Garden of Life 프로틴',
    price: 45000,
    status: 'group-caution',
    ingredients: [
      { name: '완두 단백질', status: 'safe' },
      { name: '프로바이오틱스', status: 'safe' },
      { name: '견과류 추출물', status: 'group-caution' },
    ],
  },
];

export const mockPriceInfos: PriceInfo[] = [
  { store: 'iHerb', price: 25900, shipping: 4500, url: 'https://iherb.com' },
  { store: 'Amazon', price: 27500, shipping: 5000, url: 'https://amazon.com' },
  { store: 'Vitacost', price: 24900, shipping: 6000, url: 'https://vitacost.com' },
];

export const mockProductOffers: ProductOffer[] = [
  {
    id: '1',
    productId: '1',
    store: 'iHerb',
    price: 25900,
    shipping: 4500,
    url: 'https://iherb.com',
    rank: 1,
    crawledAt: '2026-05-30T00:00:00+09:00',
  },
  {
    id: '2',
    productId: '1',
    store: 'Amazon',
    price: 27500,
    shipping: 5000,
    url: 'https://amazon.com',
    rank: 2,
    crawledAt: '2026-05-30T00:00:00+09:00',
  },
  {
    id: '3',
    productId: '1',
    store: 'Vitacost',
    price: 24900,
    shipping: 6000,
    url: 'https://vitacost.com',
    rank: 3,
    crawledAt: '2026-05-30T00:00:00+09:00',
  },
  {
    id: '4',
    productId: '2',
    store: 'Amazon',
    price: 32500,
    shipping: 5000,
    url: 'https://amazon.com',
    rank: 1,
    crawledAt: '2026-05-30T00:00:00+09:00',
  },
  {
    id: '5',
    productId: '2',
    store: 'iHerb',
    price: 34100,
    shipping: 4500,
    url: 'https://iherb.com',
    rank: 2,
    crawledAt: '2026-05-30T00:00:00+09:00',
  },
  {
    id: '6',
    productId: '3',
    store: 'Vitacost',
    price: 28000,
    shipping: 6000,
    url: 'https://vitacost.com',
    rank: 1,
    crawledAt: '2026-05-30T00:00:00+09:00',
  },
  {
    id: '7',
    productId: '4',
    store: 'iHerb',
    price: 18500,
    shipping: 4500,
    url: 'https://iherb.com',
    rank: 1,
    crawledAt: '2026-05-30T00:00:00+09:00',
  },
  {
    id: '8',
    productId: '4',
    store: 'Amazon',
    price: 19900,
    shipping: 5000,
    url: 'https://amazon.com',
    rank: 2,
    crawledAt: '2026-05-30T00:00:00+09:00',
  },
  {
    id: '9',
    productId: '5',
    store: 'Amazon',
    price: 45000,
    shipping: 5000,
    url: 'https://amazon.com',
    rank: 1,
    crawledAt: '2026-05-30T00:00:00+09:00',
  },
  {
    id: '10',
    productId: '5',
    store: 'Vitacost',
    price: 43800,
    shipping: 6000,
    url: 'https://vitacost.com',
    rank: 2,
    crawledAt: '2026-05-30T00:00:00+09:00',
  },
];

export const mockReviewSummary: ReviewSummary = {
  positive: 72,
  negative: 18,
  other: 10,
  summary: '가격은 저렴하다는 의견이 많지만, 배송 지연에 대한 불만도 일부 있습니다.',
};

export const mockGroups: Group[] = [
  {
    id: '1',
    name: '우리 가족',
    memberCount: 4,
    onboardedCount: 3,
    inviteCode: 'FAM2024',
    leaderId: '1',
    leaderName: '홍길동',
  },
  {
    id: '2',
    name: '회사 동료들',
    memberCount: 8,
    onboardedCount: 5,
    inviteCode: 'WORK123',
    leaderId: '2',
    leaderName: '김철수',
  },
];

export const mockGroupMembers: GroupMember[] = [
  { id: '1', nickname: '홍길동', isOnboarded: true },
  { id: '2', nickname: '김영희', isOnboarded: true },
  { id: '3', nickname: '박철수', isOnboarded: true },
  { id: '4', nickname: '이민지', isOnboarded: false },
];

export const mockCurrentUser = {
  id: '1',
  nickname: '홍길동',
  isOnboarded: true,
  onboardingInfo: {
    isPregnant: false,
    isBreastfeeding: false,
    isChild: false,
    isElderly: false,
    isCaffeineSensitive: true,
    hasSpecificAllergies: false,
    additionalNotes: '',
  },
};
