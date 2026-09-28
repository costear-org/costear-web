// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RemarcadoraSection } from './components/RemarcadoraSection';

afterEach(cleanup);

describe('remarcadora de la landing', () => {
  it('antes de remarcar no muestra un precio nuevo', () => {
    render(<RemarcadoraSection />);

    expect(screen.queryByTestId('precio-remarcado')).toBeNull();
    expect(screen.getByText('Ejemplo con números inventados.')).toBeTruthy();
  });

  it('con un 20 % de suba propone el precio que devuelve el margen de antes', () => {
    render(<RemarcadoraSection />);
    fireEvent.click(screen.getByLabelText('20 %'));
    fireEvent.click(screen.getByRole('button', { name: 'Remarcar' }));

    expect(screen.getByTestId('precio-remarcado').textContent).toMatch(/93\.923/);
    expect(screen.getByText(/Tu costo subió \$\s?6\.200 por unidad/)).toBeTruthy();
    expect(screen.getByText(/14,5\s?%/)).toBeTruthy();
  });
});
