import { useState, type FormEvent } from 'react';
import { AlertCircle, Calculator, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { apiErrorMessage } from '@/lib/api';
import { formatMoney, percentInputToFraction } from '@/lib/utils';
import type {
  PlaneamientoResultadosData,
  PlaneamientoResultadosInput,
} from './owner-dashboard-hooks';

type GoalType = 'resultado_absoluto' | 'porcentaje_sobre_capital';

const quantityFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function numberValue(value: string): number {
  return Number(value.replace(',', '.'));
}

export function PlaneamientoResultadosPanel({
  companyId,
  unit,
  onCalculate,
}: {
  companyId?: string;
  unit?: string;
  onCalculate: (input: PlaneamientoResultadosInput) => Promise<PlaneamientoResultadosData>;
}) {
  const [goalType, setGoalType] = useState<GoalType>('resultado_absoluto');
  const [fixedCosts, setFixedCosts] = useState('');
  const [variableCost, setVariableCost] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [absoluteResult, setAbsoluteResult] = useState('');
  const [rate, setRate] = useState('');
  const [fixedCapital, setFixedCapital] = useState('');
  const [variableCapital, setVariableCapital] = useState('');
  const [result, setResult] = useState<PlaneamientoResultadosData>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyId || !unit) return;
    setError(undefined);
    setResult(undefined);
    const objective: PlaneamientoResultadosInput['objetivo'] = goalType === 'resultado_absoluto'
      ? { tipo: goalType, importe: numberValue(absoluteResult) }
      : {
        tipo: goalType,
        tasa: percentInputToFraction(rate),
        capitalFijo: numberValue(fixedCapital),
        capitalPorPesoCostoVariable: numberValue(variableCapital),
      };
    const input: PlaneamientoResultadosInput = {
      modalidad: 'fisica',
      costosFijos: numberValue(fixedCosts),
      costoVariableUnitario: numberValue(variableCost),
      precioUnitario: numberValue(unitPrice),
      unidadCantidad: unit,
      moneda: 'ARS',
      objetivo: objective,
    };

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
    ? 'No se pudo identificar un único negocio para calcular el objetivo.'
    : !unit
      ? 'Falta declarar la unidad del negocio antes de calcular el objetivo.'
      : undefined;

  return (
    <Card data-testid="planeamiento-resultados-panel">
      <CardHeader
        title="Planeamiento de resultados"
        description="Cuánto necesitás vender para alcanzar la ganancia que buscás."
        action={<Target className="size-5 text-granate" aria-hidden="true" />}
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
              <legend className="text-[12px] font-extrabold uppercase tracking-wider text-granate-deep">
                Cómo querés definir la ganancia
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {([
                  ['resultado_absoluto', 'Resultado absoluto'],
                  ['porcentaje_sobre_capital', 'Porcentaje sobre el capital'],
                ] as const).map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-alt px-4 py-3 text-sm font-bold text-ink">
                    <input
                      type="radio"
                      name="goal-type"
                      value={value}
                      checked={goalType === value}
                      onChange={() => setGoalType(value)}
                      className="size-4 accent-granate"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Costos fijos" type="number" min="0" step="any" required numeric value={fixedCosts} onChange={(event) => setFixedCosts(event.target.value)} />
              <Input label="Costo variable por unidad" type="number" min="0" step="any" required numeric value={variableCost} onChange={(event) => setVariableCost(event.target.value)} />
              <Input label="Precio por unidad" type="number" min="0.01" step="any" required numeric value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} />
            </div>

            {goalType === 'resultado_absoluto' ? (
              <Input label="Resultado que querés lograr" type="number" step="any" required numeric value={absoluteResult} onChange={(event) => setAbsoluteResult(event.target.value)} />
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <Input label="Ganancia buscada" type="number" min="0" step="any" required numeric suffix="%" value={rate} onChange={(event) => setRate(event.target.value)} />
                <Input label="Capital fijo invertido" type="number" min="0" step="any" required numeric value={fixedCapital} onChange={(event) => setFixedCapital(event.target.value)} />
                <Input label="Capital por peso de costo variable" type="number" min="0" step="any" required numeric value={variableCapital} onChange={(event) => setVariableCapital(event.target.value)} />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" loading={loading}>
                <Calculator className="size-4" aria-hidden="true" />
                Calcular objetivo
              </Button>
              <p className="text-[11px] leading-relaxed text-ink-soft">
                El objetivo se expresa en pesos o sobre el capital. No se calcula sobre ventas ni costos.
              </p>
            </div>

            {error && (
              <div role="alert" className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-semibold text-danger">
                {error}
              </div>
            )}

            {result && (
              <div data-testid="planeamiento-resultado" className="rounded-2xl border border-granate/15 bg-granate-tenue p-5">
                {result.motivo || result.cantidadNecesaria === null || result.ventasNecesarias === null || result.resultadoLogrado === null ? (
                  <div>
                    <p className="font-bold text-warning">No hay un equilibrio posible</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink">
                      {result.motivo ?? 'El backend no informó un resultado para los datos ingresados.'}
                    </p>
                  </div>
                ) : (
                  <dl className="grid gap-4 md:grid-cols-3">
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Cantidad necesaria</dt>
                      <dd className="mt-2 font-mono-jb text-xl font-bold text-ink">
                        {quantityFormatter.format(result.cantidadNecesaria)} {result.unidades.cantidadNecesaria}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Ventas necesarias</dt>
                      <dd className="mt-2 font-mono-jb text-xl font-bold text-ink">{formatMoney(result.ventasNecesarias)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Resultado logrado</dt>
                      <dd className="mt-2 font-mono-jb text-xl font-bold text-granate-deep">{formatMoney(result.resultadoLogrado)}</dd>
                    </div>
                  </dl>
                )}
              </div>
            )}
          </form>
        )}
      </CardBody>
    </Card>
  );
}
