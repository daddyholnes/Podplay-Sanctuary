import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from '../components/Logo';
import logoMap from '../logoMap';

describe('Logo component', () => {
  Object.keys(logoMap).forEach((name) => {
    it(`renders logo for ${name}`, () => {
      render(<Logo name={name} alt={`${name} logo`} />);
      // Image should be in the document
      const img = screen.getByAltText(`${name} logo`);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src');
    });
  });
});
