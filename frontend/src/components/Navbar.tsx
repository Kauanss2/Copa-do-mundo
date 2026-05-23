import { Link, useLocation } from 'react-router-dom'

const links = [
  { path: '/',         label: 'Início',   icon: '🏠' },
  { path: '/grupos',   label: 'Grupos',   icon: '👥' },
  { path: '/perfil',   label: 'Perfil',   icon: '👤' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', background: '#13131a',
      borderTop: '1px solid rgba(255,255,255,0.08)',
    }}>
      {links.map(link => {
        const ativo = location.pathname === link.path
        return (
          <Link key={link.path} to={link.path} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 8px', textDecoration: 'none',
            color: ativo ? '#00C853' : '#606070',
            borderTop: `2px solid ${ativo ? '#00C853' : 'transparent'}`,
            fontSize: 11, fontWeight: 500, transition: 'color 0.2s',
          }}>
            <span style={{ fontSize: 22, marginBottom: 2 }}>{link.icon}</span>
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}