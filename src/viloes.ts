import type { ReactElement } from 'react'
import {
  BruxaDesolada,
  JavaliAmaldicoado,
  ReiDosGatos,
  Yubaba,
} from './components/Ghibli'
import type { Status } from './tipos'

// O lado dos vilões do tema do Studio Ghibli. Cada status tem o seu: ele
// aparece no canto dos cartões de tarefa, no detalhe da tarefa e no alvo em
// que o cartão é solto para mudar de status. A ordem é a mesma das colunas do
// quadro
export const viloes: {
  status: Status
  nome: string
  Personagem: () => ReactElement
}[] = [
  {
    status: 'a-fazer',
    nome: 'Bruxa das Terras Desoladas',
    Personagem: BruxaDesolada,
  },
  {
    status: 'em-andamento',
    nome: 'Nago, o javali amaldiçoado',
    Personagem: JavaliAmaldicoado,
  },
  { status: 'em-revisao', nome: 'Yubaba', Personagem: Yubaba },
  { status: 'concluida', nome: 'Rei dos Gatos', Personagem: ReiDosGatos },
]
