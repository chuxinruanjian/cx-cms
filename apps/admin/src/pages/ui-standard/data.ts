export type StandardStatus = 'enabled' | 'disabled' | 'draft';

export interface StandardRecord {
  id: number;
  name: string;
  code: string;
  category: 'platform' | 'content' | 'marketing';
  owner: string;
  status: StandardStatus;
  updatedAt: string;
  description: string;
}

export const standardRecords: StandardRecord[] = [
  {
    id: 1001,
    name: 'Enterprise content portal',
    code: 'CONTENT-PORTAL',
    category: 'content',
    owner: 'Chen Yu',
    status: 'enabled',
    updatedAt: '2026-07-28T09:35:00+08:00',
    description: 'Unified content publishing and review workspace.',
  },
  {
    id: 1002,
    name: 'Member growth center',
    code: 'MEMBER-GROWTH',
    category: 'marketing',
    owner: 'Lin Wei',
    status: 'enabled',
    updatedAt: '2026-07-27T16:20:00+08:00',
    description: 'Campaign and member lifecycle operations.',
  },
  {
    id: 1003,
    name: 'Supplier workspace',
    code: 'SUPPLIER-HUB',
    category: 'platform',
    owner: 'Zhou Min',
    status: 'draft',
    updatedAt: '2026-07-25T11:08:00+08:00',
    description: 'Supplier onboarding and qualification management.',
  },
  {
    id: 1004,
    name: 'Contract archive',
    code: 'CONTRACT-ARCHIVE',
    category: 'content',
    owner: 'Chen Yu',
    status: 'disabled',
    updatedAt: '2026-07-20T14:42:00+08:00',
    description: 'Private contract files and approval records.',
  },
  {
    id: 1005,
    name: 'Promotion calendar',
    code: 'PROMO-CALENDAR',
    category: 'marketing',
    owner: 'Lin Wei',
    status: 'enabled',
    updatedAt: '2026-07-18T10:15:00+08:00',
    description: 'Cross-channel campaign planning calendar.',
  },
  {
    id: 1006,
    name: 'Integration registry',
    code: 'INTEGRATIONS',
    category: 'platform',
    owner: 'Zhou Min',
    status: 'draft',
    updatedAt: '2026-07-15T18:05:00+08:00',
    description: 'External provider connection registry.',
  },
];
