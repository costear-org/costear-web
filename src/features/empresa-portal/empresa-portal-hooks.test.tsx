// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const apiPost = vi.fn();
const apiGet = vi.fn();
const apiPut = vi.fn();
vi.mock('@/lib/api', () => ({
  api: { get: apiGet, post: apiPost, put: apiPut, delete: vi.fn() },
}));
const {
  useAssignableEntities,
  useGenerateOperatorAccess,
  useOperationalCatalog,
  useReplaceOperatorScope,
} = await import('./empresa-portal-hooks');

let queryClient: QueryClient;
function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  vi.clearAllMocks();
  apiPost.mockResolvedValue({ data: { data: { email: 'operador@empresa.test' } } });
});
afterEach(cleanup);

describe('alta de operadores', () => {
  it('recorta un puesto válido antes de enviarlo', async () => {
    const { result } = renderHook(() => useGenerateOperatorAccess('empresa-1'), { wrapper });

    await act(() => result.current.mutateAsync({
      operatorName: 'Ana Operadora',
      operatorEmail: 'operador@empresa.test',
      jobTitle: '  Jefa de depósito  ',
    }));

    expect(apiPost).toHaveBeenCalledWith('/empresa-portal/empresa-1/operators', {
      operatorName: 'Ana Operadora',
      operatorEmail: 'operador@empresa.test',
      jobTitle: 'Jefa de depósito',
    });
  });

  it('omite un puesto de una letra en vez de mandar un dato inválido', async () => {
    const { result } = renderHook(() => useGenerateOperatorAccess('empresa-1'), { wrapper });

    await act(() => result.current.mutateAsync({
      operatorName: 'Ana Operadora',
      operatorEmail: 'operador@empresa.test',
      jobTitle: 'X',
    }));

    expect(apiPost).toHaveBeenCalledWith('/empresa-portal/empresa-1/operators', {
      operatorName: 'Ana Operadora',
      operatorEmail: 'operador@empresa.test',
    });
  });
});

describe('alcance del cargador', () => {
  it('consulta las entidades asignables publicadas por el backend', async () => {
    apiGet.mockResolvedValueOnce({ data: { data: { unidadesProductivas: [], depositos: [] } } });

    const { result } = renderHook(() => useAssignableEntities('empresa-1'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiGet).toHaveBeenCalledWith('/empresa-portal/empresa-1/assignable-entities');
  });

  it('reemplaza el alcance completo y refresca la lista', async () => {
    apiPut.mockResolvedValueOnce({ data: { data: { success: true } } });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useReplaceOperatorScope('empresa-1'), { wrapper });

    await act(() => result.current.mutateAsync({
      operatorId: 'operador-1',
      unidadProductivaIds: ['galpon-1'],
      depositoIds: [],
      ordenTrabajoIds: [],
      permisos: [],
    }));

    expect(apiPut).toHaveBeenCalledWith('/empresa-portal/empresa-1/operators/operador-1/scope', {
      unidadProductivaIds: ['galpon-1'],
      depositoIds: [],
      ordenTrabajoIds: [],
      permisos: [],
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['operators', 'empresa-1'] });
  });

  it('consume el catalogo operativo sin inventar opciones', async () => {
    apiGet.mockResolvedValueOnce({
      data: { data: { estado: 'sin_entidades_autorizadas', mensaje: 'Todavia no te asignaron un galpon.', acciones: [] } },
    });

    const { result } = renderHook(() => useOperationalCatalog('conexion-1'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiGet).toHaveBeenCalledWith('/empresa-portal/connections/conexion-1/operational-catalog');
    expect(result.current.data?.acciones).toEqual([]);
  });
});
