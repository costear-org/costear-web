import type { WorkOrderState } from './work-order-hooks';

const NEXT: Partial<Record<WorkOrderState, WorkOrderState>> = {
  BORRADOR: 'COTIZADA',
  COTIZADA: 'APROBADA',
  APROBADA: 'EN_PRODUCCION',
  EN_PRODUCCION: 'TERMINADA_TECNICA',
  TERMINADA_TECNICA: 'PENDIENTE_CIERRE',
};

export function nextWorkOrderState(state: WorkOrderState): WorkOrderState | undefined {
  return NEXT[state];
}

export function duplicateWorkOrderMessage(orderName: string | undefined): string {
  return `Ya existe una ${orderName?.toLocaleLowerCase('es') ?? 'orden de trabajo'} con ese código.`;
}
