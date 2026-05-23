import { createContext, useContext, useState, ReactNode } from 'react'

interface Usuario {
  id:    string
  nome:  string
  email: string
}

interface AuthContextType {
  usuario:  Usuario | null
  token:    string | null
  login:    (token: string, usuario: Usuario) => void
  logout:   () => void
  logado:   boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token,   setToken]   = useState<string | null>(localStorage.getItem('token'))
  const [usuario, setUsuario] = useState<Usuario | null>(
    JSON.parse(localStorage.getItem('usuario') || 'null')
  )

  function login(novoToken: string, novoUsuario: Usuario) {
    setToken(novoToken)
    setUsuario(novoUsuario)
    localStorage.setItem('token',   novoToken)
    localStorage.setItem('usuario', JSON.stringify(novoUsuario))
  }

  function logout() {
    setToken(null)
    setUsuario(null)
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, logado: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}