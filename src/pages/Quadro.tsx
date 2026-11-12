
import { useEffect, useState, type ReactElement } from 'react'
import { createPortal, flushSync } from 'react-dom'
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
import {
  Bolotas,
  Calcifer,
  CenaTotoro,
  Fuligens,
  Jiji,
  Kodamas,
  Ponyo,
  SemRosto,
  TotoroCarregador,
  TotoroPixel,
} from '../components/Ghibli'
import '@fontsource/corben/latin-400.css'
import '@fontsource/corben/latin-700.css'
import '../ghibli.css'

// Cada coluna homenageia um filme do Studio Ghibli: o nome aparece em cima
// dela e o personagem fica sentado na barra colorida
const filmes: Record<
  Status | 'sem-status',
  { nome: string; frase: string; Personagem: () => ReactElement }
> = {
  'a-fazer': {
    nome: 'Meu Amigo Totoro',
    frase: 'sementes esperando brotar',
    Personagem: Bolotas,
  },
  'em-andamento': {
    nome: 'O Castelo Animado',
    frase: 'Calcifer mantém tudo andando',
    Personagem: Calcifer,
  },
  'em-revisao': {
    nome: 'A Viagem de Chihiro',
    frase: 'o Sem Rosto está de olho',
    Personagem: SemRosto,
  },
  concluida: {
    nome: 'Ponyo',
    frase: 'guardadas no balde da Ponyo',
    Personagem: Ponyo,
  },
  'sem-status': {
    nome: 'Princesa Mononoke',
    frase: 'perdidas entre os kodamas',
    Personagem: Kodamas,
  },
}

// Imagem transparente de 1 px. Esconde a cópia do cartão que o navegador
// desenha ao arrastar: quem aparece carregando o cartão é o Totoro
const semImagem = new Image()
semImagem.src =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// O cartão que o Totoro está segurando e onde ele foi pego
interface Carga {
  tarefa: TarefaComProjeto
  x: number
  y: number
  dx: number
  dy: number
  largura: number
  salvando: boolean
}

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
  const [carga, setCarga] = useState<Carga | null>(null)
  const [erroMover, setErroMover] = useState(false)
  // Última tarefa que mudou de coluna: o cartão pousa e o personagem comemora
  const [chegada, setChegada] = useState<{ id: string; status: Status } | null>(
    null
  )

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
    setChegada({ id: tarefa.id, status: novoStatus })

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
    // O Totoro continua segurando o cartão até a API responder
    setCarga((atual) => atual && { ...atual, salvando: true })

    try {
      await atualizarTarefa(tarefa.id, { status: novoStatus })
      statusMudou(tarefa, novoStatus)
    } catch {
      setErroMover(true)
    } finally {
      setSalvandoArraste(false)
      setCarga(null)
    }
  }

  return (
    <div className="ghibli">
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

      <div className="ghibli-topo">
        <div className="ghibli-controles">
          <AlternarVisao />

          <BuscaTarefas />
        </div>

        <CenaTotoro />
      </div>

      <FiltrosTarefas />

      <p className="visualmente-oculto" role="status">
        {aviso}
      </p>

      {carregando ? (
        <div className="ghibli-carregando">
          <TotoroPixel />
          <Carregando mensagem="Carregando quadro..." />
        </div>
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

      {erroMover && (
        <div className="alerta ghibli-aviso" role="alert">
          <p>
            Não foi possível mover a tarefa. Verifique se a API está rodando e
            tente de novo.
          </p>
        </div>
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
            const filme = filmes[status]

            return (
              <section
                key={status}
                className={`quadro-coluna status-${status} ${
                  colunaDestino === status
                    ? 'coluna-arraste-ativo'
                    : ''
                } ${chegada?.status === status ? 'coluna-recebeu' : ''}`}
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

                <p className="quadro-filme">
                  <strong>{filme.nome}</strong> {filme.frase}
                </p>

                <span
                  className="quadro-personagem"
                  onAnimationEnd={() => setChegada(null)}
                >
                  <filme.Personagem />
                </span>

                {tarefasDaColuna.length === 0 ? (
                  <p className="quadro-vazio">
                    <Fuligens />
                    Nenhuma tarefa
                  </p>
                ) : (
                  <ul className="quadro-cartoes">
                    {tarefasDaColuna.map((tarefa) => (
                      <li
                        key={tarefa.id}
                        className={
                          carga?.tarefa.id === tarefa.id
                            ? 'cartao-levado'
                            : chegada?.id === tarefa.id
                              ? 'cartao-pousou'
                              : undefined
                        }
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

                          const caixa =
                            evento.currentTarget.getBoundingClientRect()

                          evento.dataTransfer.setDragImage(semImagem, 0, 0)

                          setTarefaArrastada(tarefa.id)
                          setErroMover(false)
                          setCarga({
                            tarefa,
                            x: evento.clientX,
                            y: evento.clientY,
                            dx: evento.clientX - caixa.left,
                            // O cartão no colo do Totoro é mais baixo que o do
                            // quadro: sem o limite, pegar pelo rodapé deixaria
                            // o ponteiro fora dele
                            dy: Math.min(evento.clientY - caixa.top, 48),
                            largura: caixa.width,
                            salvando: false,
                          })
                        }}
                        onDragEnd={() => {
                          setTarefaArrastada(null)
                          setColunaDestino(null)
                          // Soltou fora de uma coluna: o Totoro vai embora. Se
                          // está salvando, ele espera a resposta da API
                          setCarga((atual) => (atual?.salvando ? atual : null))
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

      {!carregando && !erro && (
        <div className="ghibli-chao">
          <TotoroPixel />
          <Jiji />
          <Kodamas />
          <p>
            Arraste um cartão e o Totoro leva para outra coluna. Sem mouse, use
            o seletor de status do cartão.
          </p>
        </div>
      )}

      {carga &&
        createPortal(
          <TotoroCarregador
            titulo={carga.tarefa.titulo}
            projeto={carga.tarefa.projeto?.nome}
            x={carga.x}
            y={carga.y}
            dx={carga.dx}
            dy={carga.dy}
            largura={carga.largura}
          />,
          document.body
        )}
    </div>
  )
}

export default Quadro
