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
        <Link to="/projetos">Voltar para a lista de projetos</Link>
      </>
    )
  }

  return (
    <>
      <h1>Editar projeto</h1>

      <FormularioProjeto
        valoresIniciais={projeto}
        textoBotao="Salvar alterações"
        aoSalvar={salvar}
      />

      <Link to={`/projetos/${id}`}>Cancelar</Link>
    </>
  )
}

export default EditarProjeto
