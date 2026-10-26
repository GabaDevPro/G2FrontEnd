import { Link } from 'react-router-dom'
import type { TarefaComProjeto } from '../api'
import { formatarData } from '../formatarData'
import { rotuloPrioridade, rotuloStatus } from '../rotulos'

interface CartaoTarefaProps {
  // Na página do projeto a tarefa vem sem o projeto, e o nome dele não aparece
  tarefa: TarefaComProjeto
  // Na lista de tarefas o cartão fica logo abaixo do h1, então usa h2.
  // Na página do projeto ele fica abaixo do h2 "Tarefas do projeto" e usa h3.
  // No quadro fica abaixo do h2 da coluna e também usa h3.
  nivelTitulo?: 2 | 3
  // No quadro a coluna já mostra o status, então a etiqueta sai do cartão
  mostrarStatus?: boolean
}

function CartaoTarefa({
  tarefa,
  nivelTitulo = 2,
  mostrarStatus = true,
}: CartaoTarefaProps) {
  const Titulo = nivelTitulo === 3 ? 'h3' : 'h2'

  return (
    <article className="cartao">
      <Titulo>
        {/* O link cobre o cartão inteiro pelo CSS (.link-cartao::after) */}
        <Link to={`/tarefas/${tarefa.id}`} className="link-cartao">
          {tarefa.titulo}
        </Link>
      </Titulo>

      {tarefa.projeto && (
        <p className="cartao-subtitulo">{tarefa.projeto.nome}</p>
      )}

      <div className="etiquetas">
        {mostrarStatus && (
          <span className="etiqueta">{rotuloStatus[tarefa.status]}</span>
        )}
        <span className={`etiqueta etiqueta-prioridade prioridade-${tarefa.prioridade}`}>
          Prioridade {rotuloPrioridade[tarefa.prioridade].toLowerCase()}
        </span>
      </div>

      <p className="cartao-info">
        Responsável: {tarefa.responsavel || 'Sem responsável'}
      </p>
      <p className="cartao-info">
        Prazo:{' '}
        <time dateTime={tarefa.prazo}>{formatarData(tarefa.prazo)}</time>
      </p>

      <span className="cartao-acao" aria-hidden="true">
        Ver tarefa →
      </span>
    </article>
  )
}

export default CartaoTarefa
