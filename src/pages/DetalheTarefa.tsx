import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { buscarTarefaComProjeto, type TarefaComProjeto } from '../api'
import { formatarData } from '../formatarData'
import { rotuloPrioridade, rotuloStatus } from '../rotulos'

function DetalheTarefa() {
  const { id } = useParams<{ id: string }>()
  const [tarefa, setTarefa] = useState<TarefaComProjeto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const [parametros] = useSearchParams()

  // Aberta pelo quadro, a URL traz ?origem=quadro: o "voltar" leva para lá,
  // e o parâmetro segue para a edição para não se perder no caminho
  const veioDoQuadro = parametros.get('origem') === 'quadro'
  const busca = veioDoQuadro ? '?origem=quadro' : ''
  const volta = veioDoQuadro
    ? { caminho: '/quadro', rotulo: 'Voltar para o quadro' }
    : { caminho: '/', rotulo: 'Voltar para a lista de tarefas' }

  useEffect(() => {
    async function carregarTarefa() {
      if (!id) return

      setCarregando(true)
      setErro(false)

      try {
        const dados = await buscarTarefaComProjeto(id)
        setTarefa(dados)
      } catch {
        setErro(true)
      } finally {
        setCarregando(false)
      }
    }

    carregarTarefa()
  }, [id])

  if (carregando) {
    return <p>Carregando tarefa...</p>
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

        <Link
          to={`/tarefas/${tarefa.id}/editar${busca}`}
          className="botao botao-secundario"
        >
          ✎ Editar tarefa
        </Link>
      </header>

      <dl className="painel-dados">
        <dt>Projeto</dt>
        <dd>
          <Link to={`/projetos/${tarefa.projetoId}`}>
            {tarefa.projeto?.nome ?? `Projeto ${tarefa.projetoId}`}
          </Link>
        </dd>

        <dt>Status</dt>
        <dd>
          <span className="etiqueta">{rotuloStatus[tarefa.status]}</span>
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
