import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { criarTarefa } from '../api'
import FormularioTarefa from '../components/FormularioTarefa'
import type { NovaTarefa as DadosNovaTarefa } from '../tipos'

function NovaTarefa() {
  const navigate = useNavigate()
  const [parametros] = useSearchParams()

  // Aberta pela página de um projeto, a URL traz ?projeto=<id> e o formulário já vem com ele
  const projetoId = parametros.get('projeto') ?? ''

  async function salvar(dados: DadosNovaTarefa) {
    await criarTarefa(dados)
    navigate('/')
  }

  return (
    <>
      <h1>Nova tarefa</h1>

      <FormularioTarefa
        valoresIniciais={{
          projetoId,
          titulo: '',
          descricao: '',
          status: 'a-fazer',
          prioridade: 'media',
          responsavel: '',
          prazo: '',
        }}
        aoSalvar={salvar}
      />

      <Link to="/">Voltar para a lista de tarefas</Link>
    </>
  )
}

export default NovaTarefa
