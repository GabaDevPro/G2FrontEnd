
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router-dom'
import { listarTarefasComProjeto, type TarefaComProjeto } from '../api'
import CartaoTarefa from '../components/CartaoTarefa'
import FiltrosTarefas from '../components/FiltrosTarefas'
import { useFiltros } from '../context/FiltrosContext'
import BuscaTarefas from '../components/BuscaTarefas'
import AlternarVisao from '../components/AlternarVisao'
import { filtrarTarefas } from '../filtrarTarefas'
import { rotuloStatus } from '../rotulos'
import type { Status } from '../tipos'

function ListaTarefas() {
  const [tarefas, setTarefas] = useState<TarefaComProjeto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  // Texto lido pelo leitor de tela quando um cartão sai da lista pelos filtros
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

  // Busca e filtros combinados, com as mesmas regras do quadro
  const termo = busca.trim()
  const filtrando = status !== '' || prioridade !== ''

  const tarefasFiltradas = filtrarTarefas(tarefas, { busca, status, prioridade })

  const total = tarefasFiltradas.length

  function statusMudou(tarefa: TarefaComProjeto, novoStatus: Status) {
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
      setAviso(
        `${tarefa.titulo} foi para ${rotuloStatus[novoStatus]} e não aparece com os filtros atuais.`
      )
    }
  }

  let resultadoBusca = ''

  // A busca fica guardada no contexto ao trocar de visão. Sem esperar o
  // carregamento, a lista abria com "Nenhuma tarefa com..." (e o leitor de
  // tela anunciava isso) até a API responder.
  if (carregando) {
    resultadoBusca = 'Carregando tarefas...'
  } else if (erro) {
    // O aviso de erro aparece logo abaixo. Sem isso, com algo digitado, a
    // lista dizia "Nenhuma tarefa com..." como se a busca tivesse rodado.
    resultadoBusca = ''
  } else if (total === 0 && termo) {
    // "que corresponda aos filtros" só quando há algum filtro escolhido
    resultadoBusca = `Nenhuma tarefa com "${termo}" no título${
      filtrando ? ' que corresponda aos filtros' : ''
    }.`
  } else if (total === 0 && filtrando) {
    // Antes só a busca gerava mensagem: filtros sem resultado deixavam a
    // página em branco, sem nada para o leitor de tela anunciar
    resultadoBusca = 'Nenhuma tarefa corresponde aos filtros.'
  } else if (total === 0) {
    resultadoBusca = 'Nenhuma tarefa cadastrada.'
  } else if (termo || filtrando) {
    resultadoBusca = `${total} ${total === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}`
  }

  return (
    <>
      <header className="cabecalho-pagina cabecalho-com-acao">
        <div>
          <h1>Tarefas</h1>
          <p>Todas as tarefas de todos os projetos.</p>
        </div>

        <Link to="/tarefas/nova" className="botao botao-primario">
          + Nova tarefa
        </Link>
      </header>

      <AlternarVisao />

      <BuscaTarefas />

      <FiltrosTarefas />

      <p role="status" className="resultado-busca">
        {resultadoBusca}
      </p>

      <p className="visualmente-oculto" role="status">
        {aviso}
      </p>

      {erro && (
        <p className="alerta" role="alert">
          Não foi possível carregar as tarefas.
        </p>
      )}

      {total > 0 && (
        <ul className="lista-cartoes">
          {tarefasFiltradas.map((tarefa) => (
            <li key={tarefa.id}>
              <CartaoTarefa
                tarefa={tarefa}
                aoMudarStatus={(novoStatus) => statusMudou(tarefa, novoStatus)}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default ListaTarefas
