interface MensagemErroProps {
  mensagem: string
  aoTentarDeNovo: () => void
}

function MensagemErro({ mensagem, aoTentarDeNovo }: MensagemErroProps) {
  return (
    <div className="alerta" role="alert">
      <p>{mensagem}</p>
      <button type="button" className="botao" onClick={aoTentarDeNovo}>
        Tentar de novo
      </button>
    </div>
  )
}

export default MensagemErro
