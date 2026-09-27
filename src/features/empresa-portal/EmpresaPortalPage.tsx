import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useLogout } from '@/features/auth/auth-hooks';
import { api, apiErrorMessage } from '@/lib/api';
import { CosteARLogo } from '@/components/layout/CosteARLogo';
import { ChatTimeline, type Submission } from './components/ChatTimeline';
import { ChatComposer } from './components/ChatComposer';
import { type PortalStructure } from './components/StructureSelector';
import { useOperationalCatalog, type OperationalAction } from '@/features/empresa-portal/empresa-portal-hooks';

interface CompanyConnection {
  id: string;
  connectionId: string;
  connection: {
    id: string;
    company: { id: string; name: string; industry: string | null };
    costist?: { id: string; name: string } | null;
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(((reader.result as string).split(',')[1]) ?? '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function EmpresaPortalPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [structureId, setStructureId] = useState<string | null>(null);
  const [structureName, setStructureName] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<OperationalAction | null>(null);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const companies = useQuery<CompanyConnection[]>({
    queryKey: ['my-companies'],
    queryFn: async () => (await api.get<{ data: CompanyConnection[] }>('/empresa-portal/my-companies')).data.data,
  });

  useEffect(() => {
    if (!connectionId && companies.data?.[0]) setConnectionId(companies.data[0].connectionId);
  }, [companies.data, connectionId]);

  const activeCompany = companies.data?.find((company) => company.connectionId === connectionId);
  const catalog = useOperationalCatalog(connectionId);

  useEffect(() => {
    setSelectedAction(null);
  }, [connectionId]);

  const submissions = useQuery<Submission[]>({
    queryKey: ['my-submissions', connectionId, structureId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (connectionId) params.set('connectionId', connectionId);
      if (structureId) params.set('costStructureId', structureId);
      const suffix = params.size ? `?${params.toString()}` : '';
      return (await api.get<{ data: Submission[] }>(`/empresa-portal/my-submissions${suffix}`)).data.data;
    },
    enabled: !!connectionId,
    refetchInterval: 15_000,
  });

  const { data: structures = [] } = useQuery<PortalStructure[]>({
    queryKey: ['portal-structures', connectionId],
    queryFn: async () => (
      await api.get<{ data: PortalStructure[] }>(`/empresa-portal/connections/${connectionId}/structures`)
    ).data.data,
    enabled: !!connectionId,
  });

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [submissions.data]);

  const handleSend = async () => {
    if ((!text.trim() && !file) || sending || !connectionId) return;
    if (catalog.data?.estado !== 'disponible' || !selectedAction) {
      setSendError('Elegí primero qué dato vas a cargar.');
      return;
    }
    if (structures.length > 1 && !structureId) {
      setSendError('Elegí a qué producto imputar este envío.');
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      await api.post('/empresa-portal/submit', {
        rawContent: text,
        sourceType: file ? (file.type.startsWith('image/') ? 'IMAGE' : 'PDF') : 'TEXT',
        connectionId,
        costStructureId: structureId ?? undefined,
        fileName: file?.name,
        fileData: file ? await fileToBase64(file) : undefined,
        fileMimeType: file?.type,
      });
      setText('');
      setFile(null);
      await queryClient.invalidateQueries({ queryKey: ['my-submissions', connectionId, structureId] });
    } catch (error) {
      setSendError(apiErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const noScope = catalog.data?.estado === 'sin_entidades_autorizadas';

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-alt font-sans">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-surface px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-granate text-white">
            <CosteARLogo className="h-5 w-auto" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-ink">Chat de carga</p>
            <p className="truncate text-xs text-ink-soft">{activeCompany?.connection.company.name ?? 'Preparando tu acceso…'}</p>
          </div>
        </div>
        <button type="button" aria-label="Cerrar sesión" onClick={() => logout.mutate(undefined, { onSettled: () => { window.location.href = '/login'; } })} className="rounded-xl p-2 text-ink-soft hover:bg-surface-alt hover:text-granate">
          <LogOut className="size-5" />
        </button>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col">
        <section className="shrink-0 border-b border-line bg-surface px-4 py-4 sm:px-6" aria-label="Opciones de carga autorizadas">
          <div className="mb-3 flex items-center gap-2"><ShieldCheck className="size-4 text-granate" /><h1 className="text-sm font-black text-ink">¿Qué dato vas a cargar?</h1></div>
          {companies.isLoading || catalog.isLoading ? (
            <p role="status" className="text-sm text-ink-soft">Buscando tus asignaciones…</p>
          ) : companies.isError || catalog.isError ? (
            <p role="alert" className="text-sm font-semibold text-danger">No pudimos consultar tus asignaciones.</p>
          ) : noScope ? (
            <div role="status" className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-ink">{catalog.data?.mensaje ?? 'Todavía no te asignaron un sector para cargar datos.'}</div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {catalog.data?.acciones.map((action) => {
                const active = selectedAction?.clave === action.clave && selectedAction.entidad.id === action.entidad.id;
                return (
                  <button key={`${action.clave}-${action.entidad.id}`} type="button" aria-pressed={active} onClick={() => { setSelectedAction(action); setSendError(null); }} className={`min-w-52 rounded-xl border px-4 py-3 text-left transition-colors ${active ? 'border-granate bg-granate text-white' : 'border-line bg-surface-alt text-ink hover:border-granate/40'}`}>
                    <span className="block text-sm font-bold">{action.nombre}</span>
                    <span className={`mt-1 block text-xs ${active ? 'text-white/75' : 'text-ink-soft'}`}>{action.entidad.etiqueta} · {action.entidad.referencia}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="flex min-h-0 flex-1 flex-col">
          <ChatTimeline submissions={submissions.data ?? []} activeStructureName={structureName} costistName={activeCompany?.connection.costist?.name ?? 'Soporte'} chatBottomRef={chatBottomRef} sending={sending} />
          {!noScope && (
            <ChatComposer text={text} setText={setText} file={file} setFile={setFile} fileError={fileError} setFileError={setFileError} sendError={sendError} sending={sending} activeConnectionId={connectionId} activeStructureId={structureId} onSelectStructure={(id, name) => { setStructureId(id); setStructureName(name); }} onSend={handleSend} />
          )}
        </div>
      </main>
      <span className="sr-only">Sesión de {user?.name ?? 'cargador'}</span>
    </div>
  );
}
