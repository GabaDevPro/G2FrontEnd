import { Link } from 'react-router-dom'
import type { Tarefa } from '../tipos'
import { formatarData } from '../formatarData'

interface TarefaCardProps {
  tarefa: Tarefa
}

function TarefaCard({ tarefa }: TarefaCardProps) {
  return (
    <article>
      <h2>
        <Link to={`/tarefas/${tarefa.id}`}>{tarefa.titulo}</Link>
      </h2>

      <p>Status: {tarefa.status}</p>
      <p>Prioridade: {tarefa.prioridade}</p>
      <p>Responsável: {tarefa.responsavel}</p>
      <p>
        Prazo:{' '}
        <time dateTime={tarefa.prazo}>{formatarData(tarefa.prazo)}</time>
      </p>
    </article>
  )
}

export default TarefaCard
