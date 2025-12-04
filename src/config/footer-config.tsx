'use client';

import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import { useTranslations } from 'next-intl';
import { websiteConfig } from './website';

/**
 * Get footer config with translations
 *
 * NOTICE: used in client components only
 *
 * docs:
 * https://mksaas.com/docs/config/footer
 *
 * @returns The footer config with translated titles
 */
export function useFooterLinks(): NestedMenuItem[] {
  const t = useTranslations('Marketing.footer');

  return [
    {
      title: 'Product',
      items: [
        {
          title: 'Features',
          href: '#features',
          external: false,
        },
        {
          title: 'Pricing',
          href: '#',
          external: false,
        },
        {
          title: 'For Schools',
          href: '#',
          external: false,
        },
      ],
    },
    {
      title: 'Resources',
      items: [
        {
          title: 'Help Center',
          href: '#',
          external: false,
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          title: 'Privacy Policy',
          href: '#',
          external: false,
        },
        {
          title: 'Terms of Service',
          href: '#',
          external: false,
        },
        {
          title: 'FERPA Compliance',
          href: '#',
          external: false,
        },
      ],
    },
  ];
}
