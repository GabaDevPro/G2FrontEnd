import { Link, useNavigate } from 'react-router-dom'
import { criarProjeto } from '../api'
import FormularioProjeto from '../components/FormularioProjeto'
import type { NovoProjeto } from '../tipos'

// Data de hoje no formato "2026-10-20", no fuso do navegador.
// toISOString() usaria UTC, que depois das 21h no Brasil já é o dia seguinte.
function hoje(): string {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')

  return `${agora.getFullYear()}-${mes}-${dia}`
}

function CadastroProjeto() {
  const navigate = useNavigate()

  async function salvar(projeto: NovoProjeto) {
    const criado = await criarProjeto(projeto)
    navigate(`/projetos/${criado.id}`)
  }

  return (
    <>
      <h1>Novo projeto</h1>

      <FormularioProjeto
        valoresIniciais={{
          nome: '',
          descricao: '',
          disciplina: '',
          criadoEm: hoje(),
        }}
        textoBotao="Criar projeto"
        aoSalvar={salvar}
      />

      <Link to="/projetos">Cancelar</Link>
    </>
  )
}

export default CadastroProjeto
