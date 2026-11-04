import { useEffect } from 'react'

interface TituloPaginaProps {
  texto: string
}

// Troca o título da aba junto com a tela. Sem isso todas as abas e todo o
// histórico do navegador tinham o mesmo nome. Muda o <title> que já existe no
// index.html: renderizar um <title> aqui (React 19) criaria um segundo, e com
// dois no documento o comportamento do navegador não é garantido
function TituloPagina({ texto }: TituloPaginaProps) {
  useEffect(() => {
    document.title = `${texto} · Gerenciador de Tarefas`
  }, [texto])

  return null
}

export default TituloPagina
