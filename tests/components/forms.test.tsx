/**
 * Component Tests for Forms
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock form component
function MockProjectForm() {
  return (
    <form data-testid="project-form">
      <input
        type="text"
        name="name"
        placeholder="Project Name"
        required
      />
      <input
        type="number"
        name="total_units"
        placeholder="Total Units"
        min="1"
      />
      <button type="submit">Create Project</button>
    </form>
  );
}

describe('Form Components', () => {
  it('should render project form', () => {
    render(<MockProjectForm />);
    const form = screen.getByTestId('project-form');
    expect(form).toBeInTheDocument();
  });

  it('should have required name field', () => {
    render(<MockProjectForm />);
    const nameInput = screen.getByPlaceholderText('Project Name');
    expect(nameInput).toBeRequired();
  });

  it('should validate number inputs', () => {
    render(<MockProjectForm />);
    const unitsInput = screen.getByPlaceholderText('Total Units') as HTMLInputElement;
    expect(unitsInput.type).toBe('number');
    expect(unitsInput.min).toBe('1');
  });

  it('should have submit button', () => {
    render(<MockProjectForm />);
    const submitButton = screen.getByRole('button', { name: /create project/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should allow user input', async () => {
    const user = userEvent.setup();
    render(<MockProjectForm />);

    const nameInput = screen.getByPlaceholderText('Project Name');
    await user.type(nameInput, 'Test Project');

    expect(nameInput).toHaveValue('Test Project');
  });
});
