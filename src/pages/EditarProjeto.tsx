import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { atualizarProjeto, buscarProjeto } from '../api'
import FormularioProjeto from '../components/FormularioProjeto'
import type { NovoProjeto, Projeto } from '../tipos'

function EditarProjeto() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    // Se o id da URL mudar antes da resposta chegar, a resposta antiga é
    // ignorada. Sem isso o formulário podia abrir com os dados de outro
    // projeto e salvar por cima deste.
    let ativo = true

    async function carregarProjeto() {
      if (!id) return

      setCarregando(true)
      setErro(false)

      try {
        const dados = await buscarProjeto(id)

        if (ativo) {
          setProjeto(dados)
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

    carregarProjeto()

    return () => {
      ativo = false
    }
  }, [id])

  async function salvar(dados: NovoProjeto) {
    if (!id) return

    await atualizarProjeto(id, dados)
    navigate(`/projetos/${id}`)
  }

  if (carregando) {
    return <p>Carregando projeto...</p>
  }

  if (erro || !projeto) {
    return (
      <>
        <h1>Projeto não encontrado</h1>
        <p>Não existe projeto com o id {id}.</p>
        <Link to="/projetos" className="link-voltar">
          ← Voltar para a lista de projetos
        </Link>
      </>
    )
  }

  return (
    <div className="pagina-formulario">
      <Link to={`/projetos/${id}`} className="link-voltar">
        ← Voltar para o projeto
      </Link>

      <header className="cabecalho-pagina">
        <h1>Editar projeto</h1>
        <p>
          Altere os dados de <strong>{projeto.nome}</strong>. Os campos com{' '}
          <span className="obrigatorio">*</span> são obrigatórios.
        </p>
      </header>

      <FormularioProjeto
        valoresIniciais={projeto}
        textoBotao="Salvar alterações"
        aoSalvar={salvar}
        aoCancelar={() => navigate(`/projetos/${id}`)}
      />
    </div>
  )
}

export default EditarProjeto
