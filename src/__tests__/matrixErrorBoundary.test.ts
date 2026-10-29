import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MatrixErrorBoundary } from '../components/MatrixErrorBoundary';

// Mock Next.js Link component to avoid errors in tests
vi.mock('next/link', () => ({
  default: function LinkMock(props: { children: React.ReactNode; href: string }) {
    return React.createElement('a', { href: props.href }, props.children);
  }
}));

// Mock console.error to prevent actual error logs during tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  vi.useRealTimers();
});

class ProblemChild extends React.Component<{ shouldThrow?: boolean }> {
  render() {
    if (this.props.shouldThrow !== false) {
      throw new Error('Test Matrix Error');
    }
    return React.createElement('div', null, 'Normal Content');
  }
}

describe('MatrixErrorBoundary', () => {
  it('renders children correctly when there is no error', () => {
    render(
      React.createElement(
        MatrixErrorBoundary,
        null,
        React.createElement('div', { 'data-testid': 'child' }, 'Child Content')
      )
    );

    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.getByText('Child Content')).toBeDefined();
  });

  it('catches error and displays fallback UI', () => {
    render(
      React.createElement(
        MatrixErrorBoundary,
        null,
        React.createElement(ProblemChild, null)
      )
    );

    // Fallback UI title
    expect(screen.getByText('SYSTEM FAILURE DETECTED')).toBeDefined();

    // Check if error message is displayed
    expect(screen.getByText(/Test Matrix Error/)).toBeDefined();

    // Check for Reboot and Nexus links/buttons
    expect(screen.getByRole('button', { name: /REBOOT SUBSYSTEM/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /RETURN TO MATRIX NEXUS/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /RETURN TO MATRIX NEXUS/i }).getAttribute('href')).toBe('/');
  });

  it('renders error container with role="alert" and aria-live="assertive"', () => {
    render(
      React.createElement(
        MatrixErrorBoundary,
        null,
        React.createElement(ProblemChild, null)
      )
    );

    const alertContainer = screen.getByRole('alert');
    expect(alertContainer).toBeDefined();
    expect(alertContainer.getAttribute('aria-live')).toBe('assertive');
  });

  it('resets the error boundary when reboot subsystem is clicked', () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      return React.createElement(
        'div',
        null,
        React.createElement('button', { onClick: () => setShouldThrow(false) }, 'Fix Error'),
        React.createElement(
          MatrixErrorBoundary,
          null,
          React.createElement(ProblemChild, { shouldThrow })
        )
      );
    };

    render(React.createElement(TestComponent, null));

    // Initially displays the fallback UI
    expect(screen.getByText('SYSTEM FAILURE DETECTED')).toBeDefined();

    // "Fix" the error externally
    fireEvent.click(screen.getByText('Fix Error'));

    // Now click the reboot button in the error boundary
    const rebootButton = screen.getByRole('button', { name: /REBOOT SUBSYSTEM/i });
    fireEvent.click(rebootButton);

    // After reset, normal content should be rendered
    expect(screen.queryByText('SYSTEM FAILURE DETECTED')).toBeNull();
    expect(screen.getByText('Normal Content')).toBeDefined();
  });

  it('triggers onError callback with error and component stack info when child throws', () => {
    const onErrorMock = vi.fn();
    render(
      React.createElement(
        MatrixErrorBoundary,
        { onError: onErrorMock },
        React.createElement(ProblemChild, null)
      )
    );

    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(onErrorMock.mock.calls[0][0].message).toBe('Test Matrix Error');
    expect(onErrorMock.mock.calls[0][1]).toHaveProperty('componentStack');
  });

  it('triggers onReset callback when reboot button is clicked', () => {
    const onResetMock = vi.fn();
    render(
      React.createElement(
        MatrixErrorBoundary,
        { onReset: onResetMock },
        React.createElement(ProblemChild, null)
      )
    );

    const rebootButton = screen.getByRole('button', { name: /REBOOT SUBSYSTEM/i });
    fireEvent.click(rebootButton);

    expect(onResetMock).toHaveBeenCalledTimes(1);
  });

  it('displays subsystem name in header when subsystemName prop is provided', () => {
    render(
      React.createElement(
        MatrixErrorBoundary,
        { subsystemName: 'Quantum Compiler V8' },
        React.createElement(ProblemChild, null)
      )
    );

    expect(screen.getByText(/Subsystem: Quantum Compiler V8/i)).toBeDefined();
  });

  it('copies error diagnostics to clipboard when copy log button is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(
      React.createElement(
        MatrixErrorBoundary,
        { subsystemName: 'Neural Net Pipeline' },
        React.createElement(ProblemChild, null)
      )
    );

    const copyBtn = screen.getByTitle('Copy Crash Diagnostics');
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    const clipboardPayload = writeTextMock.mock.calls[0][0];
    expect(clipboardPayload).toContain('[DEVQUEST SYSTEM FAILURE REPORT]');
    expect(clipboardPayload).toContain('Neural Net Pipeline');
    expect(clipboardPayload).toContain('Test Matrix Error');
  });

  it('provides accessible Copy Error Details button with visual state feedback ("Copied!" badge for 2s)', async () => {
    vi.useFakeTimers();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(
      React.createElement(
        MatrixErrorBoundary,
        null,
        React.createElement(ProblemChild, null)
      )
    );

    const copyBtn = screen.getByRole('button', { name: /copy error details/i });
    expect(copyBtn).toBeDefined();
    expect(screen.getByText('Copy Error Details')).toBeDefined();

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Copied!')).toBeDefined();

    // Fast-forward 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Feedback should revert back to Copy Error Details
    expect(screen.queryByText('Copied!')).toBeNull();
    expect(screen.getByText('Copy Error Details')).toBeDefined();
  });

  it('falls back to document.execCommand when navigator.clipboard.writeText fails', async () => {
    const originalExecCommand = document.execCommand;
    const execCommandMock = vi.fn().mockReturnValue(true);
    document.execCommand = execCommandMock;

    const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'));
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(
      React.createElement(
        MatrixErrorBoundary,
        null,
        React.createElement(ProblemChild, null)
      )
    );

    const copyBtn = screen.getByRole('button', { name: /copy error details/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(execCommandMock).toHaveBeenCalledWith('copy');
    expect(screen.getByText('Copied!')).toBeDefined();

    document.execCommand = originalExecCommand;
  });

  it('falls back to document.execCommand when navigator.clipboard is not available', async () => {
    const originalExecCommand = document.execCommand;
    const execCommandMock = vi.fn().mockReturnValue(true);
    document.execCommand = execCommandMock;

    Object.assign(navigator, {
      clipboard: undefined,
    });

    render(
      React.createElement(
        MatrixErrorBoundary,
        null,
        React.createElement(ProblemChild, null)
      )
    );

    const copyBtn = screen.getByRole('button', { name: /copy error details/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(execCommandMock).toHaveBeenCalledWith('copy');
    expect(screen.getByText('Copied!')).toBeDefined();

    document.execCommand = originalExecCommand;
  });

  it('clears copy timeout timer on component unmount without error', async () => {
    vi.useFakeTimers();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    const { unmount } = render(
      React.createElement(
        MatrixErrorBoundary,
        null,
        React.createElement(ProblemChild, null)
      )
    );

    const copyBtn = screen.getByRole('button', { name: /copy error details/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(screen.getByText('Copied!')).toBeDefined();

    expect(() => unmount()).not.toThrow();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
  });

  it('supports custom fallback render function with error and reset handler', () => {
    const customFallbackFn = vi.fn((error: Error, reset: () => void) => {
      return React.createElement(
        'div',
        { 'data-testid': 'custom-fallback' },
        `Fault: ${error.message}`,
        React.createElement('button', { onClick: reset }, 'Custom Reboot')
      );
    });

    render(
      React.createElement(
        MatrixErrorBoundary,
        { fallback: customFallbackFn },
        React.createElement(ProblemChild, null)
      )
    );

    expect(screen.getByTestId('custom-fallback')).toBeDefined();
    expect(screen.getByText('Fault: Test Matrix Error')).toBeDefined();
    expect(customFallbackFn).toHaveBeenCalled();
  });
});
