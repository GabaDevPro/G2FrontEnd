import type { DragEvent } from 'react'
import type { TarefaComProjeto } from './api'

// O cartão que um personagem está segurando durante o arraste, e onde ele foi
// pego. Usado pelo quadro (Totoro) e pela lista (Sem Rosto)
export interface Carga {
  tarefa: TarefaComProjeto
  // Onde o ponteiro estava quando o arraste começou
  x: number
  y: number
  // Distância do ponteiro até o canto do cartão, para ele não pular ao ser pego
  dx: number
  dy: number
  largura: number
  // A tarefa já foi solta e a API ainda não respondeu
  salvando: boolean
}

// Imagem transparente de 1 px. Esconde a cópia do cartão que o navegador
// desenha ao arrastar: quem aparece carregando o cartão é o personagem
const semImagem = new Image()
semImagem.src =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// Para chamar no onDragStart do cartão: prepara o arraste e devolve a carga
export function pegarCartao(
  evento: DragEvent<HTMLElement>,
  tarefa: TarefaComProjeto
): Carga {
  const caixa = evento.currentTarget.getBoundingClientRect()
  // O cartão no colo do personagem é menor que o da tela: sem os limites,
  // pegar pelo rodapé ou pela ponta deixaria o ponteiro fora dele
  const largura = Math.min(caixa.width, 300)

  evento.dataTransfer.effectAllowed = 'move'
  evento.dataTransfer.setData('text/plain', tarefa.id)
  evento.dataTransfer.setDragImage(semImagem, 0, 0)

  return {
    tarefa,
    x: evento.clientX,
    y: evento.clientY,
    dx: Math.min(evento.clientX - caixa.left, largura - 24),
    dy: Math.min(evento.clientY - caixa.top, 48),
    largura,
    salvando: false,
  }
}
