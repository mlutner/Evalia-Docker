import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { renderWithBuilder, captureBuilderContext } from './testUtils';
import { apiRequest } from '@/lib/queryClient';

vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Survey lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('new survey starts clean, becomes dirty after add, saves via POST then PUT', async () => {
    const apiSpy = apiRequest as unknown as vi.Mock;
    apiSpy.mockResolvedValueOnce({ json: async () => ({ id: 'new-id' }) } as any); // POST
    apiSpy.mockResolvedValueOnce({ json: async () => ({ id: 'new-id' }) } as any); // PUT

    const { Consumer, getContext } = captureBuilderContext();
    renderWithBuilder(<Consumer />, { surveyId: 'new' });

    let ctx = getContext();
    expect(ctx.isDirty).toBe(false);
    expect(ctx.questions).toHaveLength(0);
    expect(ctx.survey.id).toContain('survey-');

    act(() => getContext().addQuestion('text'));
    ctx = getContext();
    expect(ctx.isDirty).toBe(true);

    await act(async () => { await getContext().saveSurvey(); });
    expect(apiSpy).toHaveBeenNthCalledWith(1, 'POST', '/api/surveys', expect.anything());
    ctx = getContext();
    expect(ctx.isDirty).toBe(false);
    expect(ctx.survey.id).toBe('new-id');

    await act(async () => { await getContext().saveSurvey(); });
    expect(apiSpy).toHaveBeenNthCalledWith(2, 'PUT', '/api/surveys/new-id', expect.anything());
  });

  it('existing survey uses PUT and stays clean after save', async () => {
    const apiSpy = apiRequest as unknown as vi.Mock;
    apiSpy.mockResolvedValue({ json: async () => ({ id: 'persisted-123' }) } as any);

    const { Consumer, getContext } = captureBuilderContext();
    renderWithBuilder(<Consumer />, { surveyId: 'persisted-123' });

    await waitFor(() => expect(getContext().isDirty).toBe(false));
    await act(async () => { await getContext().saveSurvey(); });
    expect(apiSpy).toHaveBeenCalledWith('PUT', '/api/surveys/persisted-123', expect.anything());
    expect(getContext().isDirty).toBe(false);
  });
});
