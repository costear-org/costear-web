import { describe, expect, it } from 'vitest';
import { duplicateWorkOrderMessage, nextWorkOrderState } from './work-order-domain';

describe('reglas visibles de obras', () => {
  it('explica el conflicto usando el nombre que publicó el paquete', () => {
    expect(duplicateWorkOrderMessage('Obra')).toBe('Ya existe una obra con ese código.');
  });

  it('declara ausencia de transición automática en estados finales', () => {
    expect(nextWorkOrderState('BORRADOR')).toBe('COTIZADA');
    expect(nextWorkOrderState('CERRADA')).toBeUndefined();
    expect(nextWorkOrderState('CANCELADA')).toBeUndefined();
  });
});
