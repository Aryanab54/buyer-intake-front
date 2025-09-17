import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagInput from '../TagInput';

describe('TagInput Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders input field', () => {
    render(<TagInput tags={[]} onChange={mockOnChange} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('displays existing tags', () => {
    render(<TagInput tags={['urgent', 'family']} onChange={mockOnChange} />);
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('family')).toBeInTheDocument();
  });

  test('adds tag on Enter key', async () => {
    const user = userEvent.setup();
    render(<TagInput tags={[]} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'new-tag');
    await user.keyboard('{Enter}');
    
    expect(mockOnChange).toHaveBeenCalledWith(['new-tag']);
  });

  test('removes tag when clicking X', async () => {
    const user = userEvent.setup();
    render(<TagInput tags={['urgent', 'family']} onChange={mockOnChange} />);
    
    const removeButton = screen.getAllByText('×')[0];
    await user.click(removeButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(['family']);
  });
});