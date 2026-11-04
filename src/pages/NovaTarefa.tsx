import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { buscarProjeto, criarTarefa, ErroNaoEncontrado } from '../api'
import FormularioTarefa from '../components/FormularioTarefa'
import type { NovaTarefa as DadosNovaTarefa } from '../tipos'
import Carregando from '../components/Carregando'
import MensagemErro from '../components/MensagemErro'

function NovaTarefa() {
  const navigate = useNavigate()
  const [parametros] = useSearchParams()

  // Aberta pela página de um projeto, a URL traz ?projeto=<id> e o formulário já vem com ele
  const projetoId = parametros.get('projeto') ?? ''

  // Aberta pelo quadro, a URL traz ?origem=quadro
  const veioDoQuadro = parametros.get('origem') === 'quadro'

  // Salvar e cancelar voltam para onde a pessoa estava: o quadro, a página do projeto ou a lista de tarefas
  const origem = veioDoQuadro
    ? { caminho: '/quadro', rotulo: 'Voltar para o quadro' }
    : projetoId
      ? { caminho: `/projetos/${projetoId}`, rotulo: 'Voltar para o projeto' }
      : { caminho: '/', rotulo: 'Voltar para a lista de tarefas' }

  // O projeto da URL é conferido antes de abrir o formulário. Com
  // ?projeto=999 a tela abria normalmente, e o "voltar" e o salvar levavam
  // para /projetos/999, que não existe.
  const [carregando, setCarregando] = useState(projetoId !== '')
  const [erro, setErro] = useState<'nao-encontrado' | 'falha' | null>(null)
  // Cada clique em "Tentar de novo" soma 1 e faz o useEffect buscar de novo
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true

    async function conferirProjeto() {
      setErro(null)

      if (!projetoId) {
        setCarregando(false)
        return
      }

      setCarregando(true)

      try {
        await buscarProjeto(projetoId)
      } catch (falha) {
        if (ativo) {
          setErro(
            falha instanceof ErroNaoEncontrado ? 'nao-encontrado' : 'falha',
          )
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    conferirProjeto()

    return () => {
      ativo = false
    }
  }, [projetoId, tentativa])

  async function salvar(dados: DadosNovaTarefa) {
    await criarTarefa(dados)
    navigate(origem.caminho)
  }

  if (carregando) {
    return <Carregando mensagem="Carregando projeto..." />
  }

  if (erro === 'falha') {
    return (
      <>
        <h1>Não foi possível carregar o projeto</h1>
        <MensagemErro
          mensagem="A API não respondeu. Verifique se ela está rodando."
          aoTentarDeNovo={() => setTentativa((atual) => atual + 1)}
        />
        <Link to="/projetos" className="link-voltar">
          ← Voltar para a lista de projetos
        </Link>
      </>
    )
  }

  if (erro) {
    return (
      <>
        <h1>Projeto não encontrado</h1>
        <p>
          Não existe projeto com o id {projetoId}.{' '}
          <Link
            to={veioDoQuadro ? '/tarefas/nova?origem=quadro' : '/tarefas/nova'}
          >
            Criar a tarefa escolhendo outro projeto
          </Link>
          .
        </p>
        <Link to="/projetos" className="link-voltar">
          ← Voltar para a lista de projetos
        </Link>
      </>
    )
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
        textoBotao="Criar tarefa"
        aoSalvar={salvar}
        aoCancelar={() => navigate(origem.caminho)}
      />
    </div>
  )
}

export default NovaTarefa
