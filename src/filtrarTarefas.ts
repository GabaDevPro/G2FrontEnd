import type { Prioridade, Status, Tarefa } from './tipos'

export interface Filtros {
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

// Frase que a lista e o quadro mostram (e o leitor de tela lê) sobre o
// resultado da busca e dos filtros. Vazia quando não há nada a dizer.
export function descreverResultado(
  total: number,
  { busca, status, prioridade }: Filtros,
): string {
  const termo = busca.trim()
  const filtrando = status !== '' || prioridade !== ''

  if (total === 0 && termo) {
    // "que corresponda aos filtros" só quando há algum filtro escolhido
    return `Nenhuma tarefa com "${termo}" no título${
      filtrando ? ' que corresponda aos filtros' : ''
    }.`
  }

  if (total === 0 && filtrando) {
    // Antes só a busca gerava mensagem: filtros sem resultado deixavam a
    // página em branco, sem nada para o leitor de tela anunciar
    return 'Nenhuma tarefa corresponde aos filtros.'
  }

  if (total === 0) {
    return 'Nenhuma tarefa cadastrada.'
  }

  if (termo || filtrando) {
    return `${total} ${total === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}`
  }

  return ''
}
