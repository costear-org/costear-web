import { useState, type FormEvent } from 'react';
import { AlertCircle, Calculator, Scale } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { apiErrorMessage } from '@/lib/api';
import { formatMoney } from '@/lib/utils';
import type { PuntoIndiferenciaData, PuntoIndiferenciaInput } from './owner-dashboard-hooks';

type Decision = 'fabricar-comprar' | 'equipos';
type Estructura = { fixed: string; variable: string };

const quantityFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

function numberValue(value: string): number {
  return Number(value.replace(',', '.'));
}

export function PuntoIndiferenciaPanel({
  companyId,
  unit,
  onCalculate,
}: {
  companyId?: string;
  unit?: string;
  onCalculate: (input: PuntoIndiferenciaInput) => Promise<PuntoIndiferenciaData>;
}) {
  const [decision, setDecision] = useState<Decision>('fabricar-comprar');
  const [a, setA] = useState<Estructura>({ fixed: '', variable: '' });
  const [b, setB] = useState<Estructura>({ fixed: '', variable: '' });
  const [result, setResult] = useState<PuntoIndiferenciaData>();
  const [submittedNames, setSubmittedNames] = useState<[string, string]>(['Fabricar', 'Comprar']);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const names: [string, string] = decision === 'equipos'
    ? ['Equipo A', 'Equipo B']
    : ['Fabricar', 'Comprar'];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyId || !unit) return;
    const input: PuntoIndiferenciaInput = {
      tipoDecision: 'comparar_estructuras',
      estructuraA: {
        nombre: names[0],
        costosFijos: numberValue(a.fixed),
        costoVariableUnitario: numberValue(a.variable),
      },
      estructuraB: {
        nombre: names[1],
        costosFijos: numberValue(b.fixed),
        costoVariableUnitario: numberValue(b.variable),
      },
      unidadCantidad: unit,
      moneda: 'ARS',
    };
    setError(undefined);
    setResult(undefined);
    setSubmittedNames(names);
    setLoading(true);
    try {
      setResult(await onCalculate(input));
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  const unavailableReason = !companyId
    ? 'No se pudo identificar un único negocio para comparar las alternativas.'
    : !unit
      ? 'Falta declarar la unidad del negocio antes de comparar las alternativas.'
      : undefined;

  const below = result?.cantidadIndiferencia === null
    ? undefined
    : result?.convieneA?.desde === 0 ? submittedNames[0] : result?.convieneB?.desde === 0 ? submittedNames[1] : undefined;
  const above = result?.cantidadIndiferencia === null
    ? undefined
    : result?.convieneA?.hasta === null ? submittedNames[0] : result?.convieneB?.hasta === null ? submittedNames[1] : undefined;

  return (
    <Card data-testid="punto-indiferencia-panel">
      <CardHeader
        title="Punto de indiferencia"
        description="Compará dos formas de hacer lo mismo y encontrá desde qué volumen conviene cada una."
        action={<Scale className="size-5 text-granate" aria-hidden="true" />}
      />
      <CardBody>
        {unavailableReason ? (
          <div role="status" className="flex items-start gap-3 text-sm text-ink-soft">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
            <p>{unavailableReason}</p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={submit}>
            <fieldset>
              <legend className="text-[12px] font-extrabold uppercase tracking-wider text-granate-deep">Qué querés comparar</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {([
                  ['fabricar-comprar', 'Fabricar o comprar'],
                  ['equipos', 'Un equipo u otro'],
                ] as const).map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-alt px-4 py-3 text-sm font-bold text-ink">
                    <input
                      type="radio"
                      name="decision"
                      value={value}
                      checked={decision === value}
                      onChange={() => setDecision(value)}
                      className="size-4 accent-granate"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 lg:grid-cols-2">
              {([
                [names[0], a, setA],
                [names[1], b, setB],
              ] as const).map(([name, values, setter]) => (
                <fieldset key={name} className="space-y-4 rounded-2xl border border-line bg-surface-alt p-4">
                  <legend className="px-2 text-sm font-extrabold text-granate-deep">{name}</legend>
                  <Input
                    label={`Costos fijos de ${name}`}
                    type="number"
                    min="0"
                    step="any"
                    required
                    numeric
                    value={values.fixed}
                    onChange={(event) => setter({ ...values, fixed: event.target.value })}
                  />
                  <Input
                    label={`Costo variable por unidad de ${name}`}
                    type="number"
                    min="0"
                    step="any"
                    required
                    numeric
                    value={values.variable}
                    onChange={(event) => setter({ ...values, variable: event.target.value })}
                  />
                </fieldset>
              ))}
            </div>

            <Button type="submit" loading={loading}>
              <Calculator className="size-4" aria-hidden="true" />
              Comparar costos
            </Button>

            {error && <div role="alert" className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-semibold text-danger">{error}</div>}

            {result && (
              <div data-testid="punto-indiferencia-resultado" className="rounded-2xl border border-granate/15 bg-granate-tenue p-5">
                {result.motivoSinPunto || result.cantidadIndiferencia === null || result.costoEnElPunto === null ? (
                  <div>
                    <p className="font-bold text-warning">No existe un punto de indiferencia</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink">{result.motivoSinPunto ?? 'El backend no informó un punto para los datos ingresados.'}</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <dl className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Volumen de indiferencia</dt>
                        <dd className="mt-2 font-mono-jb text-xl font-bold text-ink">{quantityFormatter.format(result.cantidadIndiferencia)} {result.unidades.cantidad}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Costo de ambas alternativas</dt>
                        <dd className="mt-2 font-mono-jb text-xl font-bold text-granate-deep">{formatMoney(result.costoEnElPunto)}</dd>
                      </div>
                    </dl>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink"><strong>Por debajo:</strong> conviene {below}.</p>
                      <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink"><strong>Por encima:</strong> conviene {above}.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        )}
      </CardBody>
    </Card>
  );
}
