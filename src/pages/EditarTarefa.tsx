import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { atualizarTarefa, buscarTarefa } from '../api'
import FormularioTarefa from '../components/FormularioTarefa'
import type { NovaTarefa, Tarefa } from '../tipos'

function EditarTarefa() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tarefa, setTarefa] = useState<Tarefa | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const [parametros] = useSearchParams()

  // Vinda do quadro (?origem=quadro), a edição devolve o parâmetro ao detalhe,
  // para o "voltar" de lá continuar levando ao quadro
  const veioDoQuadro = parametros.get('origem') === 'quadro'
  const busca = veioDoQuadro ? '?origem=quadro' : ''
  const caminhoDetalhe = `/tarefas/${id}${busca}`

  // Tarefa inexistente: volta para onde a pessoa veio, como no detalhe
  const volta = veioDoQuadro
    ? { caminho: '/quadro', rotulo: 'Voltar para o quadro' }
    : { caminho: '/', rotulo: 'Voltar para a lista de tarefas' }

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
    navigate(caminhoDetalhe)
  }

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
    <div className="pagina-formulario">
      <Link to={caminhoDetalhe} className="link-voltar">
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
        aoCancelar={() => navigate(caminhoDetalhe)}
      />
    </div>
  )
}

export default EditarTarefa
