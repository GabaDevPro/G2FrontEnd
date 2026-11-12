import { Link, useNavigate } from 'react-router-dom'
import { criarProjeto } from '../api'
import FormularioProjeto from '../components/FormularioProjeto'
import type { NovoProjeto as DadosNovoProjeto } from '../tipos'
import TituloPagina from '../components/TituloPagina'
import { trocarDeTelaComLuz } from '../transicao'

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

    // A luz sai da bola de cristal, que fica em cima da mesa do formulário,
    // cobre a tela, e a página do projeto novo aparece por baixo. Esperar a
    // troca mantém o formulário em "Salvando...": não dá para enviar de novo
    // enquanto a animação roda
    const mesa = document.querySelector('.formulario')?.getBoundingClientRect()

    await trocarDeTelaComLuz(
      () => navigate(`/projetos/${criado.id}`),
      mesa && { x: mesa.left + mesa.width / 2, y: mesa.top - 40 }
    )
  }

  return (
    <div className="pagina-formulario">
      <Link to="/projetos" className="link-voltar">
        <span aria-hidden="true">←</span> Voltar para a lista de projetos
      </Link>

      <header className="cabecalho-pagina">
        <TituloPagina texto="Novo projeto" />
        <h1>Novo projeto</h1>
        <p>
          Preencha os dados do projeto. Os campos com{' '}
          <span className="obrigatorio">*</span> são obrigatórios.
        </p>
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
