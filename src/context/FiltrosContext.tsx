
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Status, Prioridade } from '../tipos'

interface FiltrosContextType {
  busca: string
  status: Status | ''
  prioridade: Prioridade | ''
  setBusca: (valor: string) => void
  setStatus: (valor: Status | '') => void
  setPrioridade: (valor: Prioridade | '') => void
}

const FiltrosContext = createContext<FiltrosContextType | undefined>(undefined)

export function FiltrosProvider({ children }: { children: ReactNode }) {
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState<Status | ''>('')
  const [prioridade, setPrioridade] = useState<Prioridade | ''>('')

  return (
    <FiltrosContext.Provider
      value={{
        busca,
        status,
        prioridade,
        setBusca,
        setStatus,
        setPrioridade,
      }}
    >
      {children}
    </FiltrosContext.Provider>
  )
}

export function useFiltros() {
  const contexto = useContext(FiltrosContext)

  if (!contexto) {
    throw new Error('useFiltros deve ser usado dentro de FiltrosProvider')
  }

  return contexto
}
