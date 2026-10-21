import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
});
