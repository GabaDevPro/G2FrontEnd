import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router-dom'
import { listarTarefasComProjeto, type TarefaComProjeto } from '../api'
import CartaoTarefa from '../components/CartaoTarefa'
import { ordemStatus, rotuloStatus } from '../rotulos'
import type { Status } from '../tipos'
import FiltrosTarefas from '../components/FiltrosTarefas'
import { useFiltros } from '../context/FiltrosContext'
import BuscaTarefas from '../components/BuscaTarefas'
import AlternarVisao from '../components/AlternarVisao'
import { filtrarTarefas } from '../filtrarTarefas'

function Quadro() {
  const [tarefas, setTarefas] = useState<TarefaComProjeto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  // Texto lido pelo leitor de tela quando um cartão muda de coluna
  const [aviso, setAviso] = useState('')
  const { busca, status, prioridade } = useFiltros()

  useEffect(() => {
    let ativo = true

    async function carregarTarefas() {
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
  }, [])

  // Mesmas regras da lista: ao alternar de visão aparecem as mesmas tarefas
  const tarefasFiltradas = filtrarTarefas(tarefas, { busca, status, prioridade })

  // O leitor de tela só lê o role="status" quando o texto muda. Duas tarefas
  // com o mesmo título indo para a mesma coluna, uma depois da outra, geravam
  // o mesmo texto e ficavam em silêncio: um espaço invisível no fim faz o
  // texto mudar
  function anunciar(texto: string) {
    setAviso((anterior) => (anterior === texto ? `${texto}\u00A0` : texto))
  }

  function statusMudou(tarefa: TarefaComProjeto, novoStatus: Status) {
    // flushSync aplica a mudança na tela na hora: o cartão já está na coluna
    // nova quando o foco é devolvido ao seletor dele. Sem isso, quem usa
    // teclado perderia o foco, porque o cartão antigo some da coluna.
    flushSync(() => {
      setTarefas((atuais) =>
        atuais.map((atual) =>
          atual.id === tarefa.id ? { ...atual, status: novoStatus } : atual
        )
      )
    })

    const seletor = document.getElementById(`status-${tarefa.id}`)
    const mudanca = `${tarefa.titulo} foi para ${rotuloStatus[novoStatus]}`

    if (seletor) {
      seletor.focus()
      anunciar(`${mudanca}.`)
    } else {
      // Com o filtro de status ativo (ex.: "A fazer"), a tarefa sai do quadro
      // ao mudar de status. O foco vai para o filtro que a escondeu, em vez de
      // cair no começo da página
      document.getElementById('filtro-status')?.focus()
      anunciar(`${mudanca} e não aparece com os filtros atuais.`)
    }
  }

  return (
    <>
      <header className="cabecalho-pagina cabecalho-com-acao">
        <div>
          <h1>Quadro</h1>
          <p>As tarefas de todos os projetos, separadas por status.</p>
        </div>

        {/* ?origem=quadro faz a tela de criação voltar para cá ao salvar ou cancelar */}
        <Link to="/tarefas/nova?origem=quadro" className="botao botao-primario">
          + Nova tarefa
        </Link>
      </header>

      <AlternarVisao />

      <BuscaTarefas />
      <FiltrosTarefas />
      
      <p className="visualmente-oculto" role="status">
        {aviso}
      </p>

      {carregando && <p>Carregando quadro...</p>}

      {erro && (
        <p className="alerta" role="alert">
          Não foi possível carregar as tarefas.
        </p>
      )}

      {!carregando && !erro && (
        <div className="quadro">
          {ordemStatus.map((status) => {
            const tarefasDaColuna = tarefasFiltradas.filter(
              (tarefa) => tarefa.status === status
            )
            const idTitulo = `coluna-${status}`

            return (
              <section
                key={status}
                className={`quadro-coluna status-${status}`}
                aria-labelledby={idTitulo}
              >
                <h2 id={idTitulo} className="quadro-coluna-titulo">
                  {rotuloStatus[status]}
                  <span className="quadro-contagem">
                    {tarefasDaColuna.length}
                    <span className="visualmente-oculto">
                      {tarefasDaColuna.length === 1 ? ' tarefa' : ' tarefas'}
                    </span>
                  </span>
                </h2>

                {tarefasDaColuna.length === 0 ? (
                  <p className="quadro-vazio">Nenhuma tarefa</p>
                ) : (
                  <ul className="quadro-cartoes">
                    {tarefasDaColuna.map((tarefa) => (
                      <li key={tarefa.id}>
                        <CartaoTarefa
                          tarefa={tarefa}
                          nivelTitulo={3}
                          aoMudarStatus={(status) =>
                            statusMudou(tarefa, status)
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
