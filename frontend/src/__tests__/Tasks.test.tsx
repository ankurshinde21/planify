import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tasks from '../pages/Tasks';

describe('Tasks Component', () => {
  beforeEach(() => {
    render(<Tasks />);
  });

  it('renders the Tasks page with title and add button', () => {
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  it('opens the add task dialog when clicking the add button', () => {
    fireEvent.click(screen.getByText('Add Task'));
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });

  it('creates a new task', async () => {
    // Open the dialog
    fireEvent.click(screen.getByText('Add Task'));

    // Fill in the form
    await userEvent.type(screen.getByLabelText('Title'), 'New Test Task');
    await userEvent.type(screen.getByLabelText('Description'), 'Test Description');
    await userEvent.type(screen.getByLabelText('Due Date'), '2024-12-31');

    // Submit the form
    fireEvent.click(screen.getByText('Create'));

    // Wait for the dialog to close
    await waitFor(() => {
      expect(screen.queryByText('Add New Task')).not.toBeInTheDocument();
    });

    // Verify the new task is displayed
    expect(screen.getByText('New Test Task')).toBeInTheDocument();
  });

  it('filters tasks by status', async () => {
    const filterSelect = screen.getByLabelText('Filter');
    
    // Change filter to completed
    await userEvent.selectOptions(filterSelect, 'completed');
    expect(screen.queryByText('Test Task')).not.toBeInTheDocument();

    // Change filter to pending
    await userEvent.selectOptions(filterSelect, 'pending');
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('deletes a task', async () => {
    // Open the menu for the first task
    const menuButton = screen.getAllByRole('button')[1];
    fireEvent.click(menuButton);

    // Click delete option
    fireEvent.click(screen.getByText('Delete'));

    // Wait for the task to be removed
    await waitFor(() => {
      expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
    });
  });

  it('marks a task as completed', async () => {
    // Open the menu for the first task
    const menuButton = screen.getAllByRole('button')[1];
    fireEvent.click(menuButton);

    // Click mark as completed option
    fireEvent.click(screen.getByText('Mark as Completed'));

    // Wait for the task to be removed from the list
    await waitFor(() => {
      expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
    });
  });
}); 