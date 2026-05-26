import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login       from './pages/Login'
import Registro    from './pages/Registro'
import Inicio      from './pages/Inicio'
import Grupos      from './pages/Grupos'
import Perfil      from './pages/Perfil'
import Navbar      from './components/Navbar'

function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { logado } = useAuth()
  return logado ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  const { logado } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0f0' }}>
      {logado && <Navbar />}
      <Routes>
        <Route path="/login"           element={<Login />} />
        <Route path="/registro"        element={<Registro />} />
        <Route path="/"                element={<RotaProtegida><Inicio /></RotaProtegida>} />
        <Route path="/grupos"          element={<RotaProtegida><Grupos /></RotaProtegida>} />
        <Route path="/grupos/:id"      element={<RotaProtegida><GrupoDetalhePage /></RotaProtegida>} />
        <Route path="/perfil"          element={<RotaProtegida><Perfil /></RotaProtegida>} />
      </Routes>
    </div>
  )
}

// Wrapper que lê o :id da URL e busca o grupo antes de renderizar GrupoDetalhe
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from './services/api'
import GrupoDetalheComponent from './pages/GrupoDetalhe'

function GrupoDetalhePage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()

  const { data: grupo, isLoading, isError } = useQuery({
    queryKey: ['grupo-header', id],
    queryFn:  () => api.get(`/grupos/${id}`).then(r => r.data),
    enabled:  !!id,
  })

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#606070', gap: 10 }}>
      <div style={{ width: 20, height: 20, border: '2px solid #333', borderTopColor: '#00C853', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Carregando grupo...
    </div>
  )

  if (isError || !grupo) return (
    <div style={{ textAlign: 'center', padding: '60px 16px', color: '#606070' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
      Grupo não encontrado.{' '}
      <span onClick={() => navigate('/grupos')} style={{ color: '#00C853', cursor: 'pointer' }}>Voltar</span>
    </div>
  )

  return (
    <GrupoDetalheComponent
      grupo={grupo}
      onVoltar={() => navigate('/grupos')}
    />
  )
}