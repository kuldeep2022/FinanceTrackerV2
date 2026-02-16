import { BarChart3, Repeat, Upload, Heart, Zap, ShieldCheck } from 'lucide-react';

export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  features: {
    icon: any;
    title: string;
    description: string;
  }[];
}

export const RELEASES: ReleaseNote[] = [
  {
    version: '2.0.0',
    date: '2026-02-15',
    title: 'The "Supercharged" Update',
    features: [
      {
        icon: BarChart3,
        title: 'Interactive Analytics',
        description: 'Visualize your spending with 4 new interactive charts and breakdown views.'
      },
      {
        icon: Repeat,
        title: 'Auto-Recurring Flows',
        description: 'Set your bills and salary once. The app now handles the rest automatically.'
      },
      {
        icon: Upload,
        title: 'Smart CSV Import',
        description: 'Upload bank statements. We auto-categorize and detect duplicates for you.'
      },
      {
        icon: Heart,
        title: 'Live Financial Health',
        description: 'Real-time analysis of your savings and debt with personalized insights.'
      },
      {
        icon: Zap,
        title: 'Premium UX',
        description: 'Faster load times, smoother animations, and a polished glassmorphic design.'
      },
      {
        icon: ShieldCheck,
        title: 'Hardened Security',
        description: 'Enhanced Row-Level Security ensures your financial data stays private.'
      }
    ]
  }
];

export const CURRENT_VERSION = RELEASES[0].version;
