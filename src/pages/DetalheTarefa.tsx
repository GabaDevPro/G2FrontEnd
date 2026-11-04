import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  buscarTarefaComProjeto,
  excluirTarefa,
  ErroNaoEncontrado,
  type TarefaComProjeto,
} from '../api'
import { formatarData } from '../formatarData'
import { rotuloPrioridade, rotuloStatus } from '../rotulos'
import Carregando from '../components/Carregando'
import MensagemErro from '../components/MensagemErro'


function DetalheTarefa() {
  const { id } = useParams<{ id: string }>()
  const [tarefa, setTarefa] = useState<TarefaComProjeto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<'nao-encontrada' | 'falha' | null>(null)
  // Cada clique em "Tentar de novo" soma 1 e faz o useEffect buscar de novo
  const [tentativa, setTentativa] = useState(0)
  const [parametros] = useSearchParams()

  const navigate = useNavigate()
  const [excluindo, setExcluindo] = useState(false)
  const [erroExclusao, setErroExclusao] = useState('')

  // Aberta pelo quadro, a URL traz ?origem=quadro: o "voltar" leva para lá,
  // e o parâmetro segue para a edição para não se perder no caminho
  const veioDoQuadro = parametros.get('origem') === 'quadro'
  const busca = veioDoQuadro ? '?origem=quadro' : ''
  const volta = veioDoQuadro
    ? { caminho: '/quadro', rotulo: 'Voltar para o quadro' }
    : { caminho: '/', rotulo: 'Voltar para a lista de tarefas' }

  useEffect(() => {
    // Se o id da URL mudar antes da resposta chegar, a resposta antiga é
    // ignorada, como na edição. Sem isso a tela podia mostrar outra tarefa.
    let ativo = true

    async function carregarTarefa() {
      if (!id) return

      setCarregando(true)
      setErro(null)

      try {
        const dados = await buscarTarefaComProjeto(id)

        if (ativo) {
          setTarefa(dados)
        }
      } catch (falha) {
        if (ativo) {
          setErro(
            falha instanceof ErroNaoEncontrado ? 'nao-encontrada' : 'falha',
          )
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarTarefa()

    return () => {
      ativo = false
    }
  }, [id, tentativa])

  if (carregando) {
    return <Carregando mensagem="Carregando tarefa..." />
  }

  if (erro === 'falha') {
    return (
      <>
        <h1>Não foi possível carregar a tarefa</h1>
        <MensagemErro
          mensagem="A API não respondeu. Verifique se ela está rodando."
          aoTentarDeNovo={() => setTentativa((atual) => atual + 1)}
        />
        <Link to={volta.caminho} className="link-voltar">
          ← {volta.rotulo}
        </Link>
      </>
    )
  }

  if (erro || !tarefa) {
    return (
      <>
        <h1>Tarefa não encontrada</h1>
        <p>Não existe tarefa com o id {id}.</p>
        <Link to={volta.caminho} className="link-voltar">
          ← {volta.rotulo}
        </Link>
      </>
    )
  }

  async function lidarComExclusao() {
    if (!tarefa || excluindo) return

    const confirmou = window.confirm(
      `Deseja realmente excluir a tarefa "${tarefa.titulo}"?`
    )

    if (!confirmou) return

    setExcluindo(true)
    setErroExclusao('')

    try {
      await excluirTarefa(tarefa.id)
      navigate(volta.caminho, { replace: true })
    } catch {
      setErroExclusao(
        'Não foi possível excluir a tarefa. Verifique se a API está rodando e tente de novo.'
      )
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <>
      <Link to={volta.caminho} className="link-voltar">
        ← {volta.rotulo}
      </Link>

      <header className="cabecalho-pagina cabecalho-com-acao">
        <div>
          <h1>{tarefa.titulo}</h1>
          <p>{tarefa.descricao}</p>
        </div>

        
        <div className="acoes-tarefa">
          <Link
            to={`/tarefas/${tarefa.id}/editar${busca}`}
            className="botao botao-secundario"
          >
            ✎ Editar tarefa
          </Link>

          {/* aria-disabled em vez de disabled: assim o botão não perde o foco
              e, se a exclusão falhar, dá para tentar de novo pelo teclado.
              Um segundo clique é barrado em lidarComExclusao */}
          <button
            type="button"
            className="botao botao-secundario"
            onClick={lidarComExclusao}
            aria-disabled={excluindo}
          >
            {excluindo ? 'Excluindo...' : 'Excluir tarefa'}
          </button>
        </div>

      </header>

      {erroExclusao && (
        <p className="alerta" role="alert">
          {erroExclusao}
        </p>
      )}

      <dl className="painel-dados">
        <dt>Projeto</dt>
        <dd>
          <Link to={`/projetos/${tarefa.projetoId}`}>
            {tarefa.projeto?.nome ?? `Projeto ${tarefa.projetoId}`}
          </Link>
        </dd>

        <dt>Status</dt>
        <dd>
          <span className="etiqueta">
            {rotuloStatus[tarefa.status] ?? 'Sem status'}
          </span>
        </dd>

        <dt>Prioridade</dt>
        <dd>
          <span
            className={`etiqueta etiqueta-prioridade prioridade-${tarefa.prioridade}`}
          >
            {rotuloPrioridade[tarefa.prioridade] ?? 'Sem prioridade'}
          </span>
        </dd>

        <dt>Responsável</dt>
        <dd>{tarefa.responsavel || 'Sem responsável'}</dd>

        <dt>Prazo</dt>
        <dd>
          <time dateTime={tarefa.prazo}>{formatarData(tarefa.prazo)}</time>
        </dd>

        <dt>Id</dt>
        <dd>{tarefa.id}</dd>
      </dl>
    </>
  )
}

export default DetalheTarefa
