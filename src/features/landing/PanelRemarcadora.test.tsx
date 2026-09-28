// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PanelRemarcadora } from './components/PanelRemarcadora';

afterEach(cleanup);

describe('panel de la remarcadora', () => {
  it('dice que los números son inventados', () => {
    render(<PanelRemarcadora />);
    expect(screen.getByText('Ejemplo con números inventados.')).toBeTruthy();
  });

  it('con un 20 % de suba propone el precio que devuelve el margen de antes', () => {
    render(<PanelRemarcadora />);
    fireEvent.click(screen.getByLabelText('20 %'));

    expect(screen.getByTestId('precio-remarcado').textContent).toMatch(/93\.923/);
    expect(screen.getByText(/6\.200/)).toBeTruthy();
    expect(screen.getByText(/14,5\s?%/)).toBeTruthy();
  });
});
