import { describe, expect, it } from 'vitest';
import { duplicateWorkOrderMessage, isExpiredBudget, nextWorkOrderState } from './work-order-domain';

describe('reglas visibles de obras', () => {
  it('explica el conflicto usando el nombre que publicó el paquete', () => {
    expect(duplicateWorkOrderMessage('Obra')).toBe('Ya existe una obra con ese código.');
  });

  it('considera vencida una versión preparada cuando terminó su vigencia', () => {
    expect(isExpiredBudget(
      { estado: 'PREPARADO', vigenteDesde: '2026-09-01T00:00:00.000Z', vigenciaDias: 7 },
      new Date('2026-09-09T00:00:00.000Z'),
    )).toBe(true);
  });

  it('declara ausencia de transición automática en estados finales', () => {
    expect(nextWorkOrderState('BORRADOR')).toBe('COTIZADA');
    expect(nextWorkOrderState('CERRADA')).toBeUndefined();
    expect(nextWorkOrderState('CANCELADA')).toBeUndefined();
  });
});
