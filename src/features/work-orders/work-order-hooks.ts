import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type WorkOrderState = 'BORRADOR' | 'COTIZADA' | 'APROBADA' | 'EN_PRODUCCION' | 'TERMINADA_TECNICA' | 'PENDIENTE_CIERRE' | 'CERRADA' | 'CANCELADA';
export type WorkOrder = { id: string; codigo: string; descripcion: string; cliente: string; estado: WorkOrderState; etiquetaEstado: string };
export type WorkOrderStage = { id: string; clave: string; nombre: string; orden: number; esEntrega: boolean };
export type WorkOrderTemplate = { id: string; nombre: string; etapas: WorkOrderStage[] };
export type PackageLexicon = { category: string | null; lexicon: Record<string, string> };

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
