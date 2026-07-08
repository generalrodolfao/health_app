import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Home Page', () => {
  it('renders the hero headline', () => {
    render(<Home />);
    expect(screen.getByText('Sua saúde em um só lugar')).toBeInTheDocument();
  });

  it('shows all three feature cards', () => {
    render(<Home />);
    expect(screen.getByText('Checkups Anuais')).toBeInTheDocument();
    expect(screen.getByText('NR-1 Saúde Mental')).toBeInTheDocument();
    expect(screen.getByText('Mapa da Saúde')).toBeInTheDocument();
  });

  it('has call-to-action buttons', () => {
    render(<Home />);
    expect(screen.getByText('Começar grátis')).toBeInTheDocument();
    expect(screen.getByText('Saiba mais')).toBeInTheDocument();
  });
});
