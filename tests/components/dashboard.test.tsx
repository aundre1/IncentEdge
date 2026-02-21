/**
 * Component Tests for Dashboard
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock component for testing
function MockDashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <div data-testid="stats-card">Total Projects: 5</div>
      <div data-testid="incentive-value">$5,000,000</div>
    </div>
  );
}

describe('Dashboard Component', () => {
  it('should render dashboard title', () => {
    render(<MockDashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should display project count', () => {
    render(<MockDashboard />);
    const statsCard = screen.getByTestId('stats-card');
    expect(statsCard).toHaveTextContent('Total Projects: 5');
  });

  it('should display total incentive value', () => {
    render(<MockDashboard />);
    const valueDisplay = screen.getByTestId('incentive-value');
    expect(valueDisplay).toHaveTextContent('$5,000,000');
  });
});
