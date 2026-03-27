import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AdsTable } from '@/components/dashboard/AdsTable';
import { AdDetailsModal } from '@/components/dashboard/AdDetailsModal';
import type { Ad } from '@/data/mockAds';

describe('Creative Image Quality - Bug Condition Exploration', () => {
  const mockAd: Ad = {
    id: '123456789',
    adId: 'AD-789',
    headline: 'Test Ad Headline',
    body: 'Test ad body text',
    ctaText: 'LEARN_MORE',
    destinationUrl: 'https://example.com',
    thumbnail: 'https://example.com/image.jpg',
    status: 'active',
    platform: 'Facebook',
    startDate: '2026-03-01T00:00:00Z',
    lastSeen: '2026-03-20T00:00:00Z',
    pageName: 'Test Page',
    tags: [],
    notes: '',
    impressions: 10000,
    clicks: 500,
    reach: 8000,
    ctr: 5.0,
    spend: 100.0,
    leads: 50,
    costPerLead: 2.0,
    currency: 'BRL'
  };

  describe('Property 1: Fault Condition - Image Quality in Adequate Container Sizes', () => {
    it('should render table thumbnail in container of adequate size (80x80px or larger)', () => {
      const { container } = render(
        <AdsTable ads={[mockAd]} onViewDetails={() => {}} />
      );

      const thumbnailContainer = container.querySelector('div.h-20.w-20');
      expect(thumbnailContainer).not.toBeNull();
      expect(thumbnailContainer?.className).toContain('h-20');
      expect(thumbnailContainer?.className).toContain('w-20');
    });

    it('should render modal preview in container of adequate size (384px+ height)', () => {
      const { container } = render(
        <AdDetailsModal ad={mockAd} onClose={() => {}} />
      );

      const previewContainer = container.querySelector('div.h-96');
      expect(previewContainer).not.toBeNull();
      expect(previewContainer?.className).toContain('h-96');
    });

    it('should render images with object-cover in table', () => {
      const { container } = render(
        <AdsTable ads={[mockAd]} onViewDetails={() => {}} />
      );

      const img = container.querySelector('img[alt="Ad Creative"]');
      expect(img).not.toBeNull();
      expect(img?.className).toContain('object-cover');
    });

    it('should render images with object-contain in modal', () => {
      const { container } = render(
        <AdDetailsModal ad={mockAd} onClose={() => {}} />
      );

      const img = container.querySelector('img[alt="Test Ad Headline"]');
      expect(img).not.toBeNull();
      expect(img?.className).toContain('object-contain');
    });

    it('should have loading eager attribute on table thumbnail image', () => {
      const { container } = render(
        <AdsTable ads={[mockAd]} onViewDetails={() => {}} />
      );

      const img = container.querySelector('img[alt="Ad Creative"]');
      expect(img).not.toBeNull();
      expect(img?.getAttribute('loading')).toBe('eager');
    });

    it('should have loading eager attribute on modal preview image', () => {
      const { container } = render(
        <AdDetailsModal ad={mockAd} onClose={() => {}} />
      );

      const img = container.querySelector('img[alt="Test Ad Headline"]');
      expect(img).not.toBeNull();
      expect(img?.getAttribute('loading')).toBe('eager');
    });

    it('should have View Full Size button in modal preview', () => {
      const { container } = render(
        <AdDetailsModal ad={mockAd} onClose={() => {}} />
      );

      const viewFullSizeButton = container.querySelector('a[title="Ver em tamanho real"]');
      expect(viewFullSizeButton).not.toBeNull();
      expect(viewFullSizeButton?.getAttribute('href')).toBe(mockAd.thumbnail);
      expect(viewFullSizeButton?.getAttribute('target')).toBe('_blank');
    });
  });
});
