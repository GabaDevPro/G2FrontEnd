import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { buscarTarefaComProjeto, type TarefaComProjeto } from '../api'
import { formatarData } from '../formatarData'
import { rotuloPrioridade, rotuloStatus } from '../rotulos'

function DetalheTarefa() {
  const { id } = useParams<{ id: string }>()
  const [tarefa, setTarefa] = useState<TarefaComProjeto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

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
        <Link to="/" className="link-voltar">
          ← Voltar para a lista de tarefas
        </Link>
      </>
    )
  }

  return (
    <>
      <Link to="/" className="link-voltar">
        ← Voltar para a lista de tarefas
      </Link>

      <header className="cabecalho-pagina cabecalho-com-acao">
        <div>
          <h1>{tarefa.titulo}</h1>
          <p>{tarefa.descricao}</p>
        </div>

        <Link
          to={`/tarefas/${tarefa.id}/editar`}
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
            {rotuloPrioridade[tarefa.prioridade]}
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
