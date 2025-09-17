import React, { useState } from 'react';
import { Form, Badge } from 'react-bootstrap';

const TagInput = ({ tags = [], onChange, placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags);
  };

  return (
    <div>
      <div className="mb-2">
        {tags.map((tag, index) => (
          <Badge 
            key={index} 
            bg="secondary" 
            className="me-1 mb-1 tag-chip"
            style={{ cursor: 'pointer' }}
          >
            {tag}
            <span 
              className="remove-tag ms-1"
              onClick={() => removeTag(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  removeTag(index);
                }
              }}
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </span>
          </Badge>
        ))}
      </div>
      <Form.Control
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={placeholder}
        aria-label="Add tags"
      />
      <Form.Text className="text-muted">
        Press Enter or comma to add tags
      </Form.Text>
    </div>
  );
};

export default TagInput;