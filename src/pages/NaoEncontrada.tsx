import { Link, useLocation } from 'react-router-dom'
import TituloPagina from '../components/TituloPagina'

function NaoEncontrada() {
  const localizacao = useLocation()

  return (
    <>
      <TituloPagina texto="Página não encontrada" />
      <h1>Página não encontrada</h1>

      <p>
        O endereço <code>{localizacao.pathname}</code> não existe neste
        aplicativo.
      </p>

      <Link to="/" className="link-voltar">
        <span aria-hidden="true">←</span> Voltar para a lista de tarefas
      </Link>
    </>
  )
}

export default NaoEncontrada
