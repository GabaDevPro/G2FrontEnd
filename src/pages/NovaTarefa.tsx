import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { criarTarefa } from '../api'
import FormularioTarefa from '../components/FormularioTarefa'
import type { NovaTarefa as DadosNovaTarefa } from '../tipos'

function NovaTarefa() {
  const navigate = useNavigate()
  const [parametros] = useSearchParams()

  // Aberta pela página de um projeto, a URL traz ?projeto=<id> e o formulário já vem com ele
  const projetoId = parametros.get('projeto') ?? ''

  // Cancelar volta para onde a pessoa estava: a página do projeto ou a lista de tarefas
  const origem = projetoId
    ? { caminho: `/projetos/${projetoId}`, rotulo: 'Voltar para o projeto' }
    : { caminho: '/', rotulo: 'Voltar para a lista de tarefas' }

  async function salvar(dados: DadosNovaTarefa) {
    await criarTarefa(dados)
    navigate('/')
  }

  return (
    <div className="pagina-formulario">
      <Link to={origem.caminho} className="link-voltar">
        ← {origem.rotulo}
      </Link>

      <header className="cabecalho-pagina">
        <h1>Nova tarefa</h1>
        <p>
          Preencha os dados da tarefa. Os campos com{' '}
          <span className="obrigatorio">*</span> são obrigatórios.
        </p>
      </header>

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
        aoCancelar={() => navigate(origem.caminho)}
      />
    </div>
  )
}

export default NovaTarefa
