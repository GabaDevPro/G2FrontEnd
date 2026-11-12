
import { useEffect, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  atualizarTarefa,
  listarTarefasComProjeto,
  type TarefaComProjeto,
} from '../api'
import { pegarCartao, type Carga } from '../arrastar'
import CartaoTarefa from '../components/CartaoTarefa'
import FiltrosTarefas from '../components/FiltrosTarefas'
import { useFiltros } from '../context/FiltrosContext'
import BuscaTarefas from '../components/BuscaTarefas'
import AlternarVisao from '../components/AlternarVisao'
import { descreverResultado, filtrarTarefas } from '../filtrarTarefas'
import { rotuloStatus } from '../rotulos'
import type { Status } from '../tipos'
import Carregando from '../components/Carregando'
import MensagemErro from '../components/MensagemErro'
import TituloPagina from '../components/TituloPagina'
import {
  CabecasVerdes,
  Carregador,
  CenaSemRosto,
  Pepitas,
} from '../components/Ghibli'
import VilaoDoStatus from '../components/VilaoDoStatus'
// A lista é o lado dos vilões do tema do Studio Ghibli: cada status tem o seu
import { viloes } from '../viloes'

function ListaTarefas() {
  const [tarefas, setTarefas] = useState<TarefaComProjeto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  // Cada clique em "Tentar de novo" soma 1 e faz o useEffect buscar de novo
  const [tentativa, setTentativa] = useState(0)
  // Texto lido pelo leitor de tela quando um cartão sai da lista pelos filtros
  const [aviso, setAviso] = useState('')
  const { busca, status, prioridade } = useFiltros()

  // Arrastar um cartão até um status: o Sem Rosto segura o cartão (carga), e
  // o alvo é o status embaixo do ponteiro
  const [carga, setCarga] = useState<Carga | null>(null)
  const [alvo, setAlvo] = useState<Status | null>(null)
  const [salvandoArraste, setSalvandoArraste] = useState(false)
  const [erroMover, setErroMover] = useState(false)
  // Última tarefa que mudou de status: o cartão dela pousa de volta na lista
  const [chegada, setChegada] = useState<string | null>(null)

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

  // Busca e filtros combinados, com as mesmas regras do quadro
  const tarefasFiltradas = filtrarTarefas(tarefas, { busca, status, prioridade })

  const total = tarefasFiltradas.length

  // O leitor de tela só lê o role="status" quando o texto muda. Uma tarefa que
  // sai pelo filtro, volta a aparecer e sai de novo pelo mesmo caminho gerava
  // o mesmo texto e ficava em silêncio: um espaço invisível no fim faz o
  // texto mudar
  function anunciar(texto: string) {
    setAviso((anterior) => (anterior === texto ? `${texto} ` : texto))
  }

  function statusMudou(tarefa: TarefaComProjeto, novoStatus: Status) {
    setChegada(tarefa.id)

    // flushSync aplica a mudança na tela na hora, para saber logo abaixo se
    // o cartão continua na lista
    flushSync(() => {
      setTarefas((atuais) =>
        atuais.map((atual) =>
          atual.id === tarefa.id ? { ...atual, status: novoStatus } : atual
        )
      )
    })

    // Com o filtro de status ativo (ex.: "A fazer"), a tarefa sai da lista ao
    // mudar de status, e o foco cairia no começo da página. Ele vai para o
    // filtro que a escondeu, e o leitor de tela ouve o motivo
    if (!document.getElementById(`status-${tarefa.id}`)) {
      document.getElementById('filtro-status')?.focus()
      anunciar(
        `${tarefa.titulo} foi para ${rotuloStatus[novoStatus]} e não aparece com os filtros atuais.`
      )
    }
  }

  // Grava na API o status do alvo em que o cartão foi solto
  async function soltarCartao(novoStatus: Status) {
    setAlvo(null)

    if (!carga || salvandoArraste || carga.tarefa.status === novoStatus) return

    const { tarefa } = carga

    setSalvandoArraste(true)
    // O Sem Rosto continua segurando o cartão até a API responder
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

  let resultadoBusca = ''

  // A busca fica guardada no contexto ao trocar de visão. Sem esperar o
  // carregamento, a lista abria com "Nenhuma tarefa com..." (e o leitor de
  // tela anunciava isso) até a API responder.
  if (carregando) {
    resultadoBusca = ''
  } else if (erro) {
    // O aviso de erro aparece logo abaixo. Sem isso, com algo digitado, a
    // lista dizia "Nenhuma tarefa com..." como se a busca tivesse rodado.
    resultadoBusca = ''
  } else {
    // As mesmas frases do quadro
    resultadoBusca = descreverResultado(total, { busca, status, prioridade })
  }

  return (
    <div className="ghibli ghibli-noite">
      <header className="cabecalho-pagina cabecalho-com-acao">
        <div>
          <TituloPagina texto="Tarefas" />
          <h1>Tarefas</h1>
          <p>Todas as tarefas de todos os projetos.</p>
        </div>

        <Link to="/tarefas/nova" className="botao botao-primario">
          <span aria-hidden="true">+</span> Nova tarefa
        </Link>
      </header>

      <div className="ghibli-topo">
        <div className="ghibli-controles">
          <AlternarVisao />

          <BuscaTarefas />
        </div>

        <CenaSemRosto />
      </div>

      <FiltrosTarefas />

      {carregando ? (
        <Carregando mensagem="Carregando tarefas..." />
      ) : (
        <p role="status" className="resultado-busca">
          {resultadoBusca}
        </p>
      )}

      <p className="visualmente-oculto" role="status">
        {aviso}
      </p>

      {erro && (
        <MensagemErro
          mensagem="Não foi possível carregar as tarefas. Verifique se a API está rodando."
          aoTentarDeNovo={() => setTentativa((atual) => atual + 1)}
        />
      )}

      {erroMover && (
        <div className="alerta ghibli-aviso" role="alert">
          <p>
            Não foi possível mudar o status da tarefa. Verifique se a API está
            rodando e tente de novo.
          </p>
        </div>
      )}

      {total > 0 && (
        <ul className="lista-cartoes">
          {tarefasFiltradas.map((tarefa) => {
            return (
              <li
                key={tarefa.id}
                className={
                  carga?.tarefa.id === tarefa.id
                    ? 'cartao-levado'
                    : chegada === tarefa.id
                      ? 'cartao-pousou'
                      : undefined
                }
                draggable={!salvandoArraste}
                onDragStart={(evento) => {
                  if (salvandoArraste) {
                    evento.preventDefault()
                    return
                  }

                  setErroMover(false)
                  setCarga(pegarCartao(evento, tarefa))
                }}
                onDragEnd={() => {
                  setAlvo(null)
                  // Soltou fora de um alvo: o Sem Rosto vai embora. Se está
                  // salvando, ele espera a resposta da API
                  setCarga((atual) => (atual?.salvando ? atual : null))
                }}
                onAnimationEnd={() => setChegada(null)}
              >
                <CartaoTarefa
                  tarefa={tarefa}
                  aoMudarStatus={(novoStatus) => statusMudou(tarefa, novoStatus)}
                />

                <span className="cartao-vilao" aria-hidden="true">
                  <VilaoDoStatus status={tarefa.status} />
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {total > 0 && (
        <div className="ghibli-chao">
          <CabecasVerdes />
          <Pepitas />
          <p>
            Arraste um cartão e o Sem Rosto leva até o status que você escolher.
            Sem mouse, use o seletor de status do cartão.
          </p>
        </div>
      )}

      {/* Enquanto um cartão é arrastado: os alvos de status embaixo da tela e
          o Sem Rosto segurando o cartão. Ficam no body para a posição fixa
          não depender de nada da página */}
      {carga &&
        createPortal(
          <>
            {!carga.salvando && (
              <div className="alvos-status" aria-hidden="true">
                <p>Solte o cartão em um status</p>

                <div className="alvos-lista">
                  {viloes.map((vilao) => (
                    <div
                      key={vilao.status}
                      className={`alvo-status ${
                        alvo === vilao.status ? 'alvo-ativo' : ''
                      } ${
                        carga.tarefa.status === vilao.status ? 'alvo-atual' : ''
                      }`}
                      onDragOver={(evento) => {
                        // O status em que a tarefa já está não aceita o cartão
                        if (carga.tarefa.status === vilao.status) return

                        evento.preventDefault()
                        evento.dataTransfer.dropEffect = 'move'
                        setAlvo(vilao.status)
                      }}
                      onDragLeave={() => setAlvo(null)}
                      onDrop={(evento) => {
                        evento.preventDefault()
                        void soltarCartao(vilao.status)
                      }}
                    >
                      <vilao.Personagem />
                      <span>
                        <strong>{rotuloStatus[vilao.status]}</strong>
                        {vilao.nome}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Carregador
              quem="sem-rosto"
              titulo={carga.tarefa.titulo}
              projeto={carga.tarefa.projeto?.nome}
              destino={alvo ? rotuloStatus[alvo] : undefined}
              x={carga.x}
              y={carga.y}
              dx={carga.dx}
              dy={carga.dy}
              largura={carga.largura}
            />
          </>,
          document.body
        )}
    </div>
  )
}

export default ListaTarefas
