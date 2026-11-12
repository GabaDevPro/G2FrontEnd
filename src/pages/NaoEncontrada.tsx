import { Link, useLocation } from 'react-router-dom'
import TituloPagina from '../components/TituloPagina'
import { Fuligens } from '../components/Ghibli'

function NaoEncontrada() {
  const localizacao = useLocation()

  return (
    // Padrão noturno, o mesmo da lista de tarefas
    <div className="ghibli ghibli-noite">
      <TituloPagina texto="Página não encontrada" />
      <h1>Página não encontrada</h1>

      <div className="ghibli-vazio">
        <Fuligens />

        <p>
          O endereço <code>{localizacao.pathname}</code> não existe neste
          aplicativo. Só as fuligens ficaram por aqui.
        </p>

        <Link to="/" className="botao botao-primario">
          <span aria-hidden="true">←</span> Voltar para a lista de tarefas
        </Link>
      </div>
    </div>
  )
}

export default NaoEncontrada
