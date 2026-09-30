import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type WorkOrderState = 'BORRADOR' | 'COTIZADA' | 'APROBADA' | 'EN_PRODUCCION' | 'TERMINADA_TECNICA' | 'PENDIENTE_CIERRE' | 'CERRADA' | 'CANCELADA';
export type WorkOrder = { id: string; codigo: string; descripcion: string; cliente: string; estado: WorkOrderState; etiquetaEstado: string };
export type WorkOrderStage = { id: string; clave: string; nombre: string; orden: number; esEntrega: boolean };
export type WorkOrderTemplate = { id: string; nombre: string; etapas: WorkOrderStage[] };
export type PackageLexicon = { category: string | null; lexicon: Record<string, string> };
export type BudgetType = 'BASE' | 'ADICIONAL' | 'REVISION';
export type BudgetState = 'BORRADOR' | 'PREPARADO' | 'APROBADO' | 'RECHAZADO' | 'VENCIDO';
export type BudgetLine = { id?: string; elemento: 'MP' | 'MOD' | 'CIP' | 'TERCEROS' | 'ENTREGA'; etapaId?: string | null; cantidad: number; unidadId: string; precio: number };
export type WorkOrderBudget = {
  id: string; ordenId: string; tipo: BudgetType; numero: number; estado: BudgetState;
  vigenteDesde: string; vigenciaDias: number; costoPrevisto: number; precio?: number;
  plazoDias: number; preparadoPor?: string | null; aprobadoPor?: string | null;
  causaAdicional?: string | null; renglones: BudgetLine[];
};
export type WorkOrderBudgets = { presupuestos: WorkOrderBudget[]; precioContractual?: number; costoPrevistoTotal: number };
export type BudgetAction = 'preparar' | 'aprobar' | 'rechazar' | 'revalidar';
export type DeviationSense = 'FAVORABLE' | 'DESFAVORABLE' | 'NEUTRA';
export type DeviationElement = 'MP' | 'MOD' | 'CIF' | 'ENTREGA';
export type WorkOrderDeviationReport = {
  ordenId: string;
  costoPresupuestado: number;
  costoReal: number;
  precioContractual?: number;
  margenEsperado?: number;
  margenReal?: number;
  desvioTotal: number;
  sentido: DeviationSense;
  elementos: Array<{
    elemento: DeviationElement;
    presupuestado: number;
    real: number;
    desvio: number;
    sentido: DeviationSense;
    comprometido: number;
    proyeccionAlTerminar: number;
  }>;
  puente: Array<{
    causa: 'PRECIO' | 'CANTIDAD' | 'EFICIENCIA' | 'ALCANCE' | 'ASIGNACION';
    elemento: DeviationElement;
    importe: number;
    sentido: DeviationSense;
  }>;
  proyeccionAlTerminar: {
    incurrido: number;
    comprometido: number;
    total: number;
    presupuesto: number;
  };
};
export type WorkOrderClosurePhoto = {
  id: string;
  ordenId: string;
  version: number;
  congelado: unknown;
  versionMotor: string;
  cerradoPor: string;
  motivoReapertura: string | null;
  anteriorId: string | null;
  createdAt: string;
};

export function usePackageLexicon(companyId: string) {
  return useQuery({
    queryKey: ['companies', companyId, 'package-lexicon'],
    queryFn: async () => (await api.get<{ data: PackageLexicon }>(`/companies/${companyId}/paquete-rubro`)).data.data,
    enabled: Boolean(companyId),
  });
}

export function useWorkOrders(companyId: string) {
  return useQuery({
    queryKey: ['companies', companyId, 'work-orders'],
    queryFn: async () => (await api.get<{ data: WorkOrder[] }>(`/companies/${companyId}/ordenes-trabajo`)).data.data,
    enabled: Boolean(companyId),
  });
}

export function useWorkOrderTemplates(companyId: string) {
  return useQuery({
    queryKey: ['companies', companyId, 'work-order-templates'],
    queryFn: async () => (await api.get<{ data: WorkOrderTemplate[] }>(`/companies/${companyId}/plantillas-orden`)).data.data,
    enabled: Boolean(companyId),
  });
}

export function useCreateWorkOrder(companyId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: { codigo: string; descripcion: string; cliente: string; plantillaId?: string }) =>
      (await api.post<{ data: WorkOrder }>(`/companies/${companyId}/ordenes-trabajo`, input)).data.data,
    onSuccess: () => client.invalidateQueries({ queryKey: ['companies', companyId, 'work-orders'] }),
  });
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ['work-orders', id],
    queryFn: async () => (await api.get<{ data: WorkOrder }>(`/ordenes-trabajo/${id}`)).data.data,
    enabled: Boolean(id),
  });
}

export function useWorkOrderStages(id: string) {
  return useQuery({
    queryKey: ['work-orders', id, 'stages'],
    queryFn: async () => (await api.get<{ data: WorkOrderStage[] }>(`/ordenes-trabajo/${id}/etapas`)).data.data,
    enabled: Boolean(id),
  });
}

export function useWorkOrderBudgets(id: string, enabled = true) {
  return useQuery({
    queryKey: ['work-orders', id, 'budgets'],
    queryFn: async () => (await api.get<{ data: WorkOrderBudgets }>(`/ordenes-trabajo/${id}/presupuestos`)).data.data,
    enabled: Boolean(id) && enabled,
  });
}

export function useWorkOrderDeviationReport(id: string, enabled = true) {
  return useQuery({
    queryKey: ['work-orders', id, 'deviation-report'],
    queryFn: async () => (await api.get<{ data: WorkOrderDeviationReport }>(`/ordenes-trabajo/${id}/informe-desvio`)).data.data,
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

export function useWorkOrderClosurePhotos(id: string, enabled = true) {
  return useQuery({
    queryKey: ['work-orders', id, 'closure-photos'],
    queryFn: async () => (await api.get<{ data: WorkOrderClosurePhoto[] }>(`/ordenes-trabajo/${id}/fotos-cierre`)).data.data,
    enabled: Boolean(id) && enabled,
  });
}

export function useCloseWorkOrder(id: string, companyId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post<{ data: WorkOrderClosurePhoto }>(`/ordenes-trabajo/${id}/cierre`, {})).data.data,
    onSuccess: (photo) => {
      client.setQueryData<WorkOrder | undefined>(['work-orders', id], (order) => order ? { ...order, estado: 'CERRADA', etiquetaEstado: 'Cerrada' } : order);
      client.setQueryData<WorkOrderClosurePhoto[]>(['work-orders', id, 'closure-photos'], (photos) => photos ? [...photos, photo] : [photo]);
      client.invalidateQueries({ queryKey: ['companies', companyId, 'work-orders'] });
    },
  });
}

export function useReopenWorkOrder(id: string, companyId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (motivo: string) => (await api.post<{ data: WorkOrder }>(`/ordenes-trabajo/${id}/reapertura`, { motivo })).data.data,
    onSuccess: (order) => {
      client.setQueryData(['work-orders', id], order);
      client.invalidateQueries({ queryKey: ['work-orders', id, 'closure-photos'] });
      client.invalidateQueries({ queryKey: ['companies', companyId, 'work-orders'] });
    },
  });
}

export function useBudgetAction(orderId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ budgetId, action }: { budgetId: string; action: BudgetAction }) =>
      (await api.post<{ data: WorkOrderBudget }>(`/presupuestos/${budgetId}/${action}`, action === 'revalidar' ? {} : undefined)).data.data,
    onSuccess: () => client.invalidateQueries({ queryKey: ['work-orders', orderId, 'budgets'] }),
  });
}

export function useTransitionWorkOrder(id: string, companyId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (estado: WorkOrderState) =>
      (await api.post<{ data: WorkOrder }>(`/ordenes-trabajo/${id}/transiciones`, { estado })).data.data,
    onSuccess: (order) => {
      client.setQueryData(['work-orders', id], order);
      client.invalidateQueries({ queryKey: ['companies', companyId, 'work-orders'] });
    },
  });
}
