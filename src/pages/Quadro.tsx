
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  atualizarTarefa,
  listarTarefasComProjeto,
  type TarefaComProjeto,
} from '../api'
import CartaoTarefa from '../components/CartaoTarefa'
import { ordemStatus, rotuloStatus } from '../rotulos'
import type { Status } from '../tipos'
import FiltrosTarefas from '../components/FiltrosTarefas'
import { useFiltros } from '../context/FiltrosContext'
import BuscaTarefas from '../components/BuscaTarefas'
import AlternarVisao from '../components/AlternarVisao'
import { descreverResultado, filtrarTarefas } from '../filtrarTarefas'
import Carregando from '../components/Carregando'
import MensagemErro from '../components/MensagemErro'
import TituloPagina from '../components/TituloPagina'

function Quadro() {
  const [tarefas, setTarefas] = useState<TarefaComProjeto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const [tentativa, setTentativa] = useState(0)
  const [aviso, setAviso] = useState('')

  // Estados do arrastar e soltar
  const [tarefaArrastada, setTarefaArrastada] = useState<string | null>(null)
  const [colunaDestino, setColunaDestino] = useState<Status | null>(null)
  const [salvandoArraste, setSalvandoArraste] = useState(false)

  const { busca, status, prioridade } = useFiltros()

  useEffect(() => {
    let ativo = true

    async function carregarTarefas() {
      setCarregando(true)
      setErro(false)

      try {
        const dados = await listarTarefasComProjeto()

        if (ativo) {
          setTarefas(dados)
        }
      } catch {
        if (ativo) {
          setErro(true)
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarTarefas()

    return () => {
      ativo = false
    }
  }, [tentativa])

  const tarefasFiltradas = filtrarTarefas(tarefas, {
    busca,
    status,
    prioridade,
  })

  const total = tarefasFiltradas.length

  const mensagemVazio =
    !carregando && !erro && total === 0
      ? descreverResultado(total, { busca, status, prioridade })
      : ''

  const temSemStatus = tarefasFiltradas.some(
    (tarefa) => !ordemStatus.includes(tarefa.status)
  )

  const colunas: (Status | 'sem-status')[] = temSemStatus
    ? [...ordemStatus, 'sem-status']
    : ordemStatus

  // Anuncia alterações para leitores de tela
  function anunciar(texto: string) {
    setAviso((anterior) =>
      anterior === texto ? `${texto}\u00A0` : texto
    )
  }

  // Atualiza a posição do cartão depois que o status foi salvo
  function statusMudou(tarefa: TarefaComProjeto, novoStatus: Status) {
    flushSync(() => {
      setTarefas((atuais) =>
        atuais.map((atual) =>
          atual.id === tarefa.id
            ? { ...atual, status: novoStatus }
            : atual
        )
      )
    })

    const seletor = document.getElementById(`status-${tarefa.id}`)
    const mudanca = `${tarefa.titulo} foi para ${rotuloStatus[novoStatus]}`

    if (seletor) {
      seletor.focus()
      anunciar(`${mudanca}.`)
    } else {
      document.getElementById('filtro-status')?.focus()
      anunciar(`${mudanca} e não aparece com os filtros atuais.`)
    }
  }

  // Salva na API o status da coluna onde a tarefa foi solta
  async function soltarTarefa(novoStatus: Status) {
    if (!tarefaArrastada || salvandoArraste) return

    const tarefa = tarefas.find(
      (item) => item.id === tarefaArrastada
    )

    setTarefaArrastada(null)
    setColunaDestino(null)

    if (!tarefa || tarefa.status === novoStatus) return

    setSalvandoArraste(true)

    try {
      await atualizarTarefa(tarefa.id, { status: novoStatus })
      statusMudou(tarefa, novoStatus)
    } catch {
      anunciar('Não foi possível mover a tarefa. Tente novamente.')
    } finally {
      setSalvandoArraste(false)
    }
  }

  return (
    <>
      <header className="cabecalho-pagina cabecalho-com-acao">
        <div>
          <TituloPagina texto="Quadro" />
          <h1>Quadro</h1>
          <p>As tarefas de todos os projetos, separadas por status.</p>
        </div>

        <Link
          to="/tarefas/nova?origem=quadro"
          className="botao botao-primario"
        >
          <span aria-hidden="true">+</span> Nova tarefa
        </Link>
      </header>

      <AlternarVisao />

      <BuscaTarefas />
      <FiltrosTarefas />

      <p className="visualmente-oculto" role="status">
        {aviso}
      </p>

      {carregando ? (
        <Carregando mensagem="Carregando quadro..." />
      ) : (
        <p role="status" className="resultado-busca">
          {mensagemVazio}
        </p>
      )}

      {erro && (
        <MensagemErro
          mensagem="Não foi possível carregar as tarefas. Verifique se a API está rodando."
          aoTentarDeNovo={() =>
            setTentativa((atual) => atual + 1)
          }
        />
      )}

      {!carregando && !erro && (
        <div
          className="quadro"
          role="region"
          aria-label="Colunas do quadro"
          tabIndex={0}
        >
          {colunas.map((status) => {
            const tarefasDaColuna = tarefasFiltradas.filter(
              (tarefa) =>
                status === 'sem-status'
                  ? !ordemStatus.includes(tarefa.status)
                  : tarefa.status === status
            )

            const idTitulo = `coluna-${status}`

            return (
              <section
                key={status}
                className={`quadro-coluna status-${status} ${
                  colunaDestino === status
                    ? 'coluna-arraste-ativo'
                    : ''
                }`}
                aria-labelledby={idTitulo}
                onDragOver={(evento) => {
                  if (
                    status === 'sem-status' ||
                    salvandoArraste ||
                    !tarefaArrastada
                  ) {
                    return
                  }

                  evento.preventDefault()
                  evento.dataTransfer.dropEffect = 'move'
                  setColunaDestino(status)
                }}
                onDragLeave={(evento) => {
                  if (
                    !evento.currentTarget.contains(
                      evento.relatedTarget as Node
                    )
                  ) {
                    setColunaDestino(null)
                  }
                }}
                onDrop={(evento) => {
                  evento.preventDefault()

                  if (status !== 'sem-status') {
                    void soltarTarefa(status)
                  }
                }}
              >
                <h2
                  id={idTitulo}
                  className="quadro-coluna-titulo"
                >
                  {status === 'sem-status'
                    ? 'Sem status'
                    : rotuloStatus[status]}

                  <span className="quadro-contagem">
                    {tarefasDaColuna.length}
                    <span className="visualmente-oculto">
                      {tarefasDaColuna.length === 1
                        ? ' tarefa'
                        : ' tarefas'}
                    </span>
                  </span>
                </h2>

                {tarefasDaColuna.length === 0 ? (
                  <p className="quadro-vazio">
                    Nenhuma tarefa
                  </p>
                ) : (
                  <ul className="quadro-cartoes">
                    {tarefasDaColuna.map((tarefa) => (
                      <li
                        key={tarefa.id}
                        draggable={!salvandoArraste}
                        onDragStart={(evento) => {
                          if (salvandoArraste) {
                            evento.preventDefault()
                            return
                          }

                          evento.dataTransfer.effectAllowed = 'move'
                          evento.dataTransfer.setData(
                            'text/plain',
                            tarefa.id
                          )

                          setTarefaArrastada(tarefa.id)
                        }}
                        onDragEnd={() => {
                          setTarefaArrastada(null)
                          setColunaDestino(null)
                        }}
                      >
                        <CartaoTarefa
                          tarefa={tarefa}
                          nivelTitulo={3}
                          aoMudarStatus={(novoStatus) =>
                            statusMudou(tarefa, novoStatus)
                          }
                          origem="quadro"
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}

export default Quadro
