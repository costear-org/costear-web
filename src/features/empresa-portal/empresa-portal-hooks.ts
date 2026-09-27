import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Operator {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  alcance: {
    unidadesProductivas: Array<{ id: string; referencia: string }>;
    depositos: Array<{ id: string; referencia: string }>;
    ordenesTrabajo: Array<{ id: string; codigo: string; descripcion: string }>;
  };
  permisos: string[];
}

export interface AssignableEntity {
  id: string;
  referencia: string;
  etiqueta: string;
}

export interface AssignableEntities {
  unidadesProductivas: AssignableEntity[];
  depositos: AssignableEntity[];
}

export interface OperationalAction {
  clave: string;
  nombre: string;
  descripcion: string;
  superficie: string;
  destino: string;
  entidad: AssignableEntity & { tipo: 'UnidadProductiva' | 'Deposito' };
}

export interface OperationalCatalog {
  estado: 'disponible' | 'sin_entidades_autorizadas';
  mensaje: string | null;
  acciones: OperationalAction[];
}

export interface GeneratedAccess {
  email: string;
  tempPassword?: string;   // solo viene cuando isNewUser=true
  inviteCode?: string;
  isNewUser?: boolean;
}

export function useOperators(companyId: string) {
  return useQuery({
    queryKey: ['operators', companyId],
    queryFn: async () => {
      const res = await api.get<{ data: Operator[] }>(`/empresa-portal/${companyId}/operators`);
      return res.data.data;
    },
    enabled: !!companyId,
  });
}

export function useAssignableEntities(companyId: string) {
  return useQuery({
    queryKey: ['assignable-entities', companyId],
    queryFn: async () => {
      const res = await api.get<{ data: AssignableEntities }>(
        `/empresa-portal/${companyId}/assignable-entities`,
      );
      return res.data.data;
    },
    enabled: !!companyId,
  });
}

export interface OperatorScopeInput {
  operatorId: string;
  unidadProductivaIds: string[];
  depositoIds: string[];
  ordenTrabajoIds: string[];
  permisos: string[];
}

export function useReplaceOperatorScope(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ operatorId, ...scope }: OperatorScopeInput) => {
      await api.put(`/empresa-portal/${companyId}/operators/${operatorId}/scope`, scope);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['operators', companyId] }),
  });
}

export function useOperationalCatalog(connectionId: string | null) {
  return useQuery({
    queryKey: ['operational-catalog', connectionId],
    queryFn: async () => {
      const res = await api.get<{ data: OperationalCatalog }>(
        `/empresa-portal/connections/${connectionId}/operational-catalog`,
      );
      return res.data.data;
    },
    enabled: !!connectionId,
  });
}

export function useGenerateOperatorAccess(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      operatorName,
      operatorEmail,
      /**
       * El PUESTO en la empresa ("Jefe de Depósito"), no el rol de login.
       * Opcional: si el costista no lo sabe, "no consta" es más honesto que un
       * puesto inventado. Se estampa en cada dato que cargue esta persona.
       */
      jobTitle,
    }: {
      operatorName: string;
      operatorEmail: string;
      jobTitle?: string;
    }) => {
      const res = await api.post<{ data: GeneratedAccess }>(
        `/empresa-portal/${companyId}/operators`,
        {
          operatorName,
          operatorEmail,
          // El servidor exige 2 caracteres como mínimo. Un puesto de una letra
          // no es un puesto, así que no se manda: mejor "no consta" que un 400.
          ...((jobTitle?.trim().length ?? 0) >= 2 ? { jobTitle: jobTitle!.trim() } : {}),
        },
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['operators', companyId] }),
  });
}

export function useRevokeOperator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (operatorId: string) => {
      await api.delete(`/empresa-portal/operators/${operatorId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['operators'] }),
  });
}

export function useResetOperatorPassword() {
  return useMutation({
    mutationFn: async (operatorId: string) => {
      const res = await api.post<{ data: { email: string; tempPassword: string } }>(
        `/empresa-portal/operators/${operatorId}/reset-password`,
        {},
      );
      return res.data.data;
    },
  });
}
