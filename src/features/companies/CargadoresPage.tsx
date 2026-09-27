import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardBody } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { useCompanies } from './company-hooks';
import { CompanyOperatorsTab } from './components/CompanyOperatorsTab';

export function CargadoresPage() {
  const companies = useCompanies();
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    if (!companyId && companies.data?.length === 1) {
      setCompanyId(companies.data[0]!.id);
    }
  }, [companies.data, companyId]);

  return (
    <AppShell wide>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-granate">Accesos de carga</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">Cargadores de datos</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Cada persona ve únicamente el chat y las opciones de carga de los sectores que le asignes.
        </p>
      </div>

      {companies.isLoading && <p role="status" className="text-sm text-ink-soft">Cargando negocios…</p>}
      {companies.isError && <p role="alert" className="text-sm text-danger">No pudimos cargar los negocios.</p>}

      {(companies.data?.length ?? 0) > 1 && (
        <Card className="mb-5 max-w-xl">
          <CardBody>
            <Select
              label="Negocio"
              placeholder="Elegí un negocio"
              value={companyId}
              options={(companies.data ?? []).map((company) => ({ value: company.id, label: company.name }))}
              onChange={(event) => setCompanyId(event.target.value)}
            />
          </CardBody>
        </Card>
      )}

      {companies.isSuccess && companies.data.length === 0 && (
        <Card><CardBody><p className="text-sm text-ink-soft">Primero agregá un negocio para invitar cargadores.</p></CardBody></Card>
      )}

      {companyId && <CompanyOperatorsTab companyId={companyId} />}
    </AppShell>
  );
}
