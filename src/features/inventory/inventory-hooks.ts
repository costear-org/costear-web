import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface InventoryArticle {
  id: string;
  codigo: string;
  descripcion: string;
  unidadId: string;
  unidad: { id: string; nombre: string; simbolo: string };
  almacenable: boolean;
  saldoCantidad: number;
  saldoValor: number;
  ppp: number;
}

export interface InventoryMovementInput {
  articuloId: string;
  tipo: 'INGRESO' | 'SALIDA';
  cantidad: number;
  fecha: string;
  periodoImputado: string;
  costoUnitario?: number;
  gastosCompra?: number;
  ordenId?: string;
  documento?: string;
}

export function useArticles(companyId: string) {
  return useQuery({
    queryKey: ['companies', companyId, 'articles'],
    queryFn: async () => (
      await api.get<{ data: InventoryArticle[] }>(`/companies/${companyId}/articulos`)
    ).data.data,
    enabled: Boolean(companyId),
  });
}

export function useRegisterInventoryMovement(companyId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: InventoryMovementInput) => (
      await api.post<{ data: { id: string } }>(
        `/companies/${companyId}/movimientos-inventario`,
        input,
      )
    ).data.data,
    onSuccess: () => client.invalidateQueries({
      queryKey: ['companies', companyId, 'articles'],
    }),
  });
}
