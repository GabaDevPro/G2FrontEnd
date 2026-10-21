import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { atualizarTarefa, buscarTarefa } from '../api'
import FormularioTarefa from '../components/FormularioTarefa'
import type { NovaTarefa, Tarefa } from '../tipos'

function EditarTarefa() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tarefa, setTarefa] = useState<Tarefa | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    // Se o id da URL mudar antes da resposta chegar, a resposta antiga é
    // ignorada. Sem isso o formulário podia abrir com os dados de outra
    // tarefa e salvar por cima desta.
    let ativo = true

    async function carregarTarefa() {
      if (!id) return

      setCarregando(true)
      setErro(false)

      try {
        const dados = await buscarTarefa(id)

        if (ativo) {
          setTarefa(dados)
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

    carregarTarefa()

    return () => {
      ativo = false
    }
  }, [id])

  async function salvar(dados: NovaTarefa) {
    if (!id) return

    await atualizarTarefa(id, dados)
    navigate(`/tarefas/${id}`)
  }

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
    <div className="pagina-formulario">
      <Link to={`/tarefas/${id}`} className="link-voltar">
        ← Voltar para a tarefa
      </Link>

      <header className="cabecalho-pagina">
        <h1>Editar tarefa</h1>
        <p>
          Altere os dados de <strong>{tarefa.titulo}</strong>. Os campos com{' '}
          <span className="obrigatorio">*</span> são obrigatórios.
        </p>
      </header>

      {/* O formulário só aparece depois que a tarefa carrega, então já abre
          com os dados atuais */}
      <FormularioTarefa
        valoresIniciais={tarefa}
        textoBotao="Salvar alterações"
        aoSalvar={salvar}
        aoCancelar={() => navigate(`/tarefas/${id}`)}
      />
    </div>
  )
}

export default EditarTarefa
