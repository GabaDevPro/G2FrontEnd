import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { atualizarTarefa, buscarTarefa, ErroNaoEncontrado } from '../api'
import FormularioTarefa from '../components/FormularioTarefa'
import type { NovaTarefa, Tarefa } from '../tipos'
import Carregando from '../components/Carregando'
import MensagemErro from '../components/MensagemErro'
import TituloPagina from '../components/TituloPagina'

function EditarTarefa() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tarefa, setTarefa] = useState<Tarefa | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<'nao-encontrada' | 'falha' | null>(null)
  // Cada clique em "Tentar de novo" soma 1 e faz o useEffect buscar de novo
  const [tentativa, setTentativa] = useState(0)
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
      setErro(null)

      try {
        const dados = await buscarTarefa(id)

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

  async function salvar(dados: NovaTarefa) {
    if (!id) return

    await atualizarTarefa(id, dados)
    navigate(caminhoDetalhe)
  }

  if (carregando) {
    return (
      <>
        <TituloPagina texto="Carregando tarefa" />
        <Carregando mensagem="Carregando tarefa..." />
      </>
    )
  }

  if (erro === 'falha') {
    return (
      <>
        <TituloPagina texto="Não foi possível carregar a tarefa" />
        <h1>Não foi possível carregar a tarefa</h1>
        <MensagemErro
          mensagem="A API não respondeu. Verifique se ela está rodando."
          aoTentarDeNovo={() => setTentativa((atual) => atual + 1)}
        />
        <Link to={volta.caminho} className="link-voltar">
          <span aria-hidden="true">←</span> {volta.rotulo}
        </Link>
      </>
    )
  }

  if (erro || !tarefa) {
    return (
      <>
        <TituloPagina texto="Tarefa não encontrada" />
        <h1>Tarefa não encontrada</h1>
        <p>Não existe tarefa com o id {id}.</p>
        <Link to={volta.caminho} className="link-voltar">
          <span aria-hidden="true">←</span> {volta.rotulo}
        </Link>
      </>
    )
  }

  return (
    <div className="pagina-formulario">
      <Link to={caminhoDetalhe} className="link-voltar">
        <span aria-hidden="true">←</span> Voltar para a tarefa
      </Link>

      <header className="cabecalho-pagina">
        <TituloPagina texto="Editar tarefa" />
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
