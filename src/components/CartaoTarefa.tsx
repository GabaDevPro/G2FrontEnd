import { useState } from 'react'
import { Link } from 'react-router-dom'
import { atualizarTarefa, type TarefaComProjeto } from '../api'
import { formatarData } from '../formatarData'
import { ordemStatus, rotuloPrioridade, rotuloStatus } from '../rotulos'
import type { Status } from '../tipos'

interface CartaoTarefaProps {
  // Na página do projeto a tarefa vem sem o projeto, e o nome dele não aparece
  tarefa: TarefaComProjeto
  // Na lista de tarefas o cartão fica logo abaixo do h1, então usa h2.
  // Na página do projeto ele fica abaixo do h2 "Tarefas do projeto" e usa h3.
  // No quadro fica abaixo do h2 da coluna e também usa h3.
  nivelTitulo?: 2 | 3
  // Com esta prop o status vira um seletor que grava na API. Depois de gravar,
  // o cartão avisa a página, que atualiza a tarefa na tela (no quadro, ela muda
  // de coluna). Sem a prop, o status aparece só como etiqueta.
  aoMudarStatus?: (status: Status) => void
  // No quadro o link leva ?origem=quadro, para o detalhe voltar para lá
  origem?: 'quadro'
}

function CartaoTarefa({
  tarefa,
  nivelTitulo = 2,
  aoMudarStatus,
  origem,
}: CartaoTarefaProps) {
  const Titulo = nivelTitulo === 3 ? 'h3' : 'h2'
  const idStatus = `status-${tarefa.id}`
  const statusValido = ordemStatus.includes(tarefa.status)

  // Status escolhido que ainda está sendo gravado. Enquanto isso o seletor já
  // mostra a escolha, e uma segunda troca é ignorada.
  const [statusSalvando, setStatusSalvando] = useState<Status | null>(null)
  const [erroStatus, setErroStatus] = useState('')

  async function mudarStatus(novoStatus: Status) {
    if (!aoMudarStatus || statusSalvando || novoStatus === tarefa.status) {
      return
    }

    setStatusSalvando(novoStatus)
    setErroStatus('')

    try {
      await atualizarTarefa(tarefa.id, { status: novoStatus })
      aoMudarStatus(novoStatus)
    } catch {
      setErroStatus('Não foi possível mudar o status. Tente novamente.')
    } finally {
      setStatusSalvando(null)
    }
  }

  return (
    <article className="cartao">
      <Titulo>
        {/* O link cobre o cartão inteiro pelo CSS (.link-cartao::after) */}
        {/* O title mostra o título inteiro ao passar o mouse quando ele é cortado no quadro */}
        <Link
          to={{
            pathname: `/tarefas/${tarefa.id}`,
            search: origem ? `?origem=${origem}` : '',
          }}
          className="link-cartao"
          title={tarefa.titulo}
        >
          {tarefa.titulo}
        </Link>
      </Titulo>

      {tarefa.projeto && (
        <p className="cartao-subtitulo">{tarefa.projeto.nome}</p>
      )}

      <div className="etiquetas">
        {!aoMudarStatus && (
          <span className="etiqueta">
            {statusValido ? rotuloStatus[tarefa.status] : 'Sem status'}
          </span>
        )}
        <span className={`etiqueta etiqueta-prioridade prioridade-${tarefa.prioridade}`}>
          {/* Prioridade ausente ou desconhecida (db.json editado à mão) não tem
              rótulo: sem isso o toLowerCase() quebrava a lista e o quadro inteiros */}
          {rotuloPrioridade[tarefa.prioridade]
            ? `Prioridade ${rotuloPrioridade[tarefa.prioridade].toLowerCase()}`
            : 'Sem prioridade'}
        </span>
      </div>

      {aoMudarStatus && (
        // Fica acima do link que cobre o cartão, senão o clique abriria a tarefa
        <div className="cartao-status">
          <label htmlFor={idStatus}>
            Status
            <span className="visualmente-oculto"> de {tarefa.titulo}</span>
          </label>
          <select
            id={idStatus}
            value={statusSalvando ?? (statusValido ? tarefa.status : '')}
            onChange={(evento) => mudarStatus(evento.target.value as Status)}
            aria-describedby={erroStatus ? `${idStatus}-erro` : undefined}
          >
            {/* Status fora dos quatro (db.json editado à mão): sem esta opção
                o seletor mostraria "A fazer", que não é o status gravado */}
            {!statusValido && (
              <option value="" disabled>
                Sem status
              </option>
            )}
            {ordemStatus.map((status) => (
              <option key={status} value={status}>
                {rotuloStatus[status]}
              </option>
            ))}
          </select>
          {statusSalvando && (
            <span className="cartao-status-aviso">Salvando...</span>
          )}
        </div>
      )}

      {erroStatus && (
        <p id={`${idStatus}-erro`} className="erro-campo" role="alert">
          {erroStatus}
        </p>
      )}

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
