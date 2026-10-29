import type { Prioridade, Status, Tarefa } from './tipos'

interface Filtros {
  busca: string
  status: Status | ''
  prioridade: Prioridade | ''
}

// A lista e o quadro filtram com esta mesma função: ao alternar entre as duas
// visões, aparecem exatamente as mesmas tarefas
export function filtrarTarefas<T extends Tarefa>(
  tarefas: T[],
  { busca, status, prioridade }: Filtros,
): T[] {
  const termo = busca.trim().toLowerCase()

  return tarefas.filter((tarefa) => {
    // Tarefa sem título (db.json editado à mão) conta como título vazio
    const correspondeBusca = (tarefa.titulo ?? '').toLowerCase().includes(termo)

    // Filtro vazio não restringe nada
    const correspondeStatus = !status || tarefa.status === status

    const correspondePrioridade =
      !prioridade || tarefa.prioridade === prioridade

    return correspondeBusca && correspondeStatus && correspondePrioridade
  })
}
