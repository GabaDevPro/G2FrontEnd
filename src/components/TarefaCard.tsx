import type { Tarefa } from '../tipos'

interface TarefaCardProps {
  tarefa: Tarefa
}

function TarefaCard({ tarefa }: TarefaCardProps) {
  return (
    <article>
      <h2>{tarefa.titulo}</h2>

      <p>Status: {tarefa.status}</p>
      <p>Prioridade: {tarefa.prioridade}</p>
      <p>Responsável: {tarefa.responsavel}</p>
      <p>Prazo: {tarefa.prazo}</p>
    </article>
  )
}

export default TarefaCard
