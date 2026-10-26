import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ListaTarefas from './pages/ListaTarefas'
import Quadro from './pages/Quadro'
import DetalheTarefa from './pages/DetalheTarefa'
import NovaTarefa from './pages/NovaTarefa'
import EditarTarefa from './pages/EditarTarefa'
import ListaProjetos from './pages/ListaProjetos'
import DetalheProjeto from './pages/DetalheProjeto'
import NovoProjeto from './pages/NovoProjeto'
import EditarProjeto from './pages/EditarProjeto'
import NaoEncontrada from './pages/NaoEncontrada'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ListaTarefas />} />
          {/* Rota fixa: o React Router dá preferência a ela, então "nova" nunca vira um :id */}
          <Route path="/tarefas/nova" element={<NovaTarefa />} />
          <Route path="/tarefas/:id" element={<DetalheTarefa />} />
          <Route path="/tarefas/:id/editar" element={<EditarTarefa />} />
          <Route path="/quadro" element={<Quadro />} />
          <Route path="/projetos" element={<ListaProjetos />} />
          <Route path="/projetos/novo" element={<NovoProjeto />} />
          <Route path="/projetos/:id" element={<DetalheProjeto />} />
          <Route path="/projetos/:id/editar" element={<EditarProjeto />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
