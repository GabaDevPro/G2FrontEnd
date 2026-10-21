import { Link, useLocation } from 'react-router-dom'

function NaoEncontrada() {
  const localizacao = useLocation()

  return (
    <>
      <h1>Página não encontrada</h1>

      <p>
        O endereço <code>{localizacao.pathname}</code> não existe neste
        aplicativo.
      </p>

      <Link to="/" className="link-voltar">
        ← Voltar para a lista de tarefas
      </Link>
    </>
  )
}

export default NaoEncontrada
