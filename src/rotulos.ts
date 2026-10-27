import type { Prioridade, Status } from './tipos'

// Ordem das colunas do quadro: o caminho que uma tarefa percorre
export const ordemStatus: Status[] = [
  'a-fazer',
  'em-andamento',
  'em-revisao',
  'concluida',
]

// Textos que aparecem na tela para os valores do contrato ("em-andamento" vira "Em andamento")
export const rotuloStatus: Record<Status, string> = {
  'a-fazer': 'A fazer',
  'em-andamento': 'Em andamento',
  'em-revisao': 'Em revisão',
  concluida: 'Concluída',
}

export const rotuloPrioridade: Record<Prioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
}
