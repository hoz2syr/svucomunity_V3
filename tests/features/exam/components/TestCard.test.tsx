import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestCard } from '@/src/features/exam/src/components/TestCard';
import type { TestModel } from '@/src/features/exam/src/types';
import { BrowserRouter } from 'react-router-dom';

const buildTest = (overrides: Partial<TestModel> = {}): TestModel => ({
  id: 'test-1',
  title: 'اختبار',
  description: 'وصف',
  createdAt: Date.now(),
  settings: { showExplanations: true },
  questions: [],
  published: false,
  ...overrides,
});

const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe('TestCard delete visibility', () => {
  it('shows delete button when canDelete is true', () => {
    renderWithRouter(
      <TestCard
        test={buildTest()}
        loadingPdf={null}
        onPrintPdf={() => {}}
        onExportWord={() => {}}
        onDelete={() => {}}
        canDelete={true}
      />
    );
    const deleteButtons = screen.getAllByTitle('حذف الاختبار');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('hides delete button when canDelete is false', () => {
    renderWithRouter(
      <TestCard
        test={buildTest()}
        loadingPdf={null}
        onPrintPdf={() => {}}
        onExportWord={() => {}}
        onDelete={() => {}}
        canDelete={false}
      />
    );
    expect(screen.queryAllByTitle('حذف الاختبار').length).toBe(0);
  });

  it('shows delete button by default when canDelete is omitted', () => {
    renderWithRouter(
      <TestCard
        test={buildTest()}
        loadingPdf={null}
        onPrintPdf={() => {}}
        onExportWord={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getAllByTitle('حذف الاختبار').length).toBeGreaterThan(0);
  });
});

describe('TestCard publish/sharing visibility', () => {
  it('shows publish button for logged-in user when test is not published', () => {
    renderWithRouter(
      <TestCard
        test={buildTest({ published: false })}
        loadingPdf={null}
        onPrintPdf={() => {}}
        onExportWord={() => {}}
        onDelete={() => {}}
        onPublish={() => {}}
        isGuest={false}
      />
    );
    expect(screen.getByText('نشر ومشاركة')).toBeDefined();
  });

  it('shows publish button for guest user when test is not published', () => {
    renderWithRouter(
      <TestCard
        test={buildTest({ published: false })}
        loadingPdf={null}
        onPrintPdf={() => {}}
        onExportWord={() => {}}
        onDelete={() => {}}
        onPublish={() => {}}
        isGuest={true}
      />
    );
    expect(screen.getByText('نشر ومشاركة')).toBeDefined();
  });

  it('does not show publish button when test is already published', () => {
    renderWithRouter(
      <TestCard
        test={buildTest({ published: true })}
        loadingPdf={null}
        onPrintPdf={() => {}}
        onExportWord={() => {}}
        onDelete={() => {}}
        onPublish={() => {}}
        isGuest={false}
      />
    );
    expect(screen.queryByText('نشر ومشاركة')).toBeNull();
  });
});
