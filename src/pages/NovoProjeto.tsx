import { Link, useNavigate } from 'react-router-dom'
import { criarProjeto } from '../api'
import FormularioProjeto from '../components/FormularioProjeto'
import type { NovoProjeto as DadosNovoProjeto } from '../tipos'

// Data de hoje no formato "2026-10-20", no fuso do navegador.
// toISOString() usaria UTC, que depois das 21h no Brasil já é o dia seguinte.
function hoje(): string {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')

  return `${agora.getFullYear()}-${mes}-${dia}`
}

function NovoProjeto() {
  const navigate = useNavigate()

  async function salvar(projeto: DadosNovoProjeto) {
    const criado = await criarProjeto(projeto)
    navigate(`/projetos/${criado.id}`)
  }

  return (
    <div className="pagina-formulario">
      <Link to="/projetos" className="link-voltar">
        ← Voltar para a lista de projetos
      </Link>

      <header className="cabecalho-pagina">
        <h1>Novo projeto</h1>
        <p>Preencha os dados do projeto.</p>
      </header>

      <FormularioProjeto
        valoresIniciais={{
          nome: '',
          descricao: '',
          disciplina: '',
          criadoEm: hoje(),
        }}
        textoBotao="Criar projeto"
        aoSalvar={salvar}
        aoCancelar={() => navigate('/projetos')}
      />
    </div>
  )
}

export default NovoProjeto
