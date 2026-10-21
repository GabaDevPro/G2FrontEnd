import type { NovaTarefa, NovoProjeto, Projeto, Tarefa } from './tipos'

const API_URL = 'http://localhost:3000'

async function buscarJson<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`)

  if (!resposta.ok) {
    throw new Error(`Falha ao buscar ${caminho} (${resposta.status})`)
  }

  const dados: T = await resposta.json()

  return dados
}

export async function listarTarefas(): Promise<Tarefa[]> {
  return buscarJson<Tarefa[]>('/tarefas')
}

export async function buscarTarefa(id: string): Promise<Tarefa> {
  return buscarJson<Tarefa>(`/tarefas/${id}`)
}

export async function listarProjetos(): Promise<Projeto[]> {
  return buscarJson<Projeto[]>('/projetos')
}

export async function buscarProjeto(id: string): Promise<Projeto> {
  return buscarJson<Projeto>(`/projetos/${id}`)
}

export type ProjetoComTarefas = Projeto & {
  tarefas: Tarefa[]
}

export async function listarProjetosComTarefas(): Promise<
  ProjetoComTarefas[]
> {
  return buscarJson<ProjetoComTarefas[]>('/projetos?_embed=tarefas')
}

export type TarefaComProjeto = Tarefa & {
  // Pode faltar se o projeto da tarefa não existir mais
  projeto?: Projeto
}

export async function listarTarefasComProjeto(): Promise<TarefaComProjeto[]> {
  return buscarJson<TarefaComProjeto[]>('/tarefas?_embed=projeto')
}

export async function buscarTarefaComProjeto(
  id: string,
): Promise<TarefaComProjeto> {
  return buscarJson<TarefaComProjeto>(`/tarefas/${id}?_embed=projeto`)
}

export async function buscarProjetoComTarefas(
  id: string,
): Promise<ProjetoComTarefas> {
  return buscarJson<ProjetoComTarefas>(`/projetos/${id}?_embed=tarefas`)
}

export async function criarTarefa(tarefa:NovaTarefa): Promise<Tarefa> {
  const resposta = await fetch(`${API_URL}/tarefas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tarefa),
  })
  
  if (!resposta.ok) {
    throw new Error(`Erro ao criar tarefa (${resposta.status})`)
  }

  return resposta.json() as Promise<Tarefa>
}

export async function criarProjeto(
  projeto: NovoProjeto,
): Promise<Projeto> {
  const resposta = await fetch(`${API_URL}/projetos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projeto),
  })

  if (!resposta.ok) {
    throw new Error(`Erro ao criar projeto (${resposta.status})`)
  }

  return resposta.json() as Promise<Projeto>
}

export async function atualizarTarefa(
  id: string,
  dados: Partial<NovaTarefa>,
): Promise<Tarefa> {
  const resposta = await fetch(`${API_URL}/tarefas/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })

  if (!resposta.ok) {
    throw new Error(`Erro ao atualizar tarefa (${resposta.status})`)
  }

  return resposta.json() as Promise<Tarefa>
}

export async function atualizarProjeto(
  id: string,
  dados: Partial<NovoProjeto>,
): Promise<Projeto> {
  const resposta = await fetch(`${API_URL}/projetos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })

  if (!resposta.ok) {
    throw new Error(`Erro ao atualizar projeto (${resposta.status})`)
  }

  return resposta.json() as Promise<Projeto>
}