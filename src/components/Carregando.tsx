
interface CarregandoProps {
  mensagem?: string
}

function Carregando({
  mensagem = 'Carregando...',
}: CarregandoProps) {
  return (
    <p className="estado-carregando" role="status" aria-live="polite">
      {mensagem}
    </p>
  )
}

export default Carregando
