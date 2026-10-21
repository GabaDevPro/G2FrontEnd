import { Link } from 'react-router-dom'
import type { Tarefa } from '../tipos'
import { formatarData } from '../formatarData'

interface CartaoTarefaProps {
  tarefa: Tarefa
  // Na lista de tarefas o cartão fica logo abaixo do h1, então usa h2.
  // Na página do projeto ele fica abaixo do h2 "Tarefas do projeto" e usa h3.
  nivelTitulo?: 2 | 3
}

function CartaoTarefa({ tarefa, nivelTitulo = 2 }: CartaoTarefaProps) {
  const Titulo = nivelTitulo === 3 ? 'h3' : 'h2'

  return (
    <article>
      <Titulo>
        <Link to={`/tarefas/${tarefa.id}`}>{tarefa.titulo}</Link>
      </Titulo>

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

export default CartaoTarefa
