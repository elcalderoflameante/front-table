import { useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CNavItem,
  CNavTitle,
  CHeader,
  CHeaderBrand,
  CHeaderNav,
  CContainer,
  CButton,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CAvatar
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilList, cilAccountLogout, cilMenu } from '@coreui/icons';
import logo from '../assets/logo-caldero.png';
import avatarImg from '../assets/avatar.png'; // Usa tu imagen de avatar aquí

export default function CoreUILayout({ children, onLogout, title, breadcrumbs = [] }) {
  const location = useLocation();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className="min-vh-100 d-flex">
      <CSidebar
        unfoldable
        visible={sidebarVisible}
        className="vh-100"
        style={{
          transition: 'width 0.2s',
          width: sidebarVisible ? 256 : 0,
          minWidth: 0,
          overflow: 'hidden'
        }}
      >
        <CSidebarBrand className="d-flex align-items-center justify-content-center py-3">
          <img src={logo} alt="Logo" style={{ width: 40 }} />
          {sidebarVisible && <span className="ms-2 fw-bold">Restaurante</span>}
        </CSidebarBrand>
        <CSidebarNav>
          <CNavTitle>Perfil</CNavTitle>
          <CNavTitle>Mesas</CNavTitle>
          <CNavItem
            href="/solicitudes"
            active={location.pathname.startsWith('/solicitudes')}
          >
            <CIcon icon={cilList} className="me-2" />
            {sidebarVisible && 'Solicitudes'}
          </CNavItem>
        </CSidebarNav>
      </CSidebar>
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          transition: 'margin-left 0.2s',
          marginLeft: sidebarVisible ? 256 : 0,
        }}
      >
        <CHeader className="mb-4 bg-white shadow-sm d-flex align-items-center">
          <CButton
            color="light"
            variant="ghost"
            size="sm"
            className="me-3"
            onClick={() => setSidebarVisible((v) => !v)}
          >
            <CIcon icon={cilMenu} size="lg" />
          </CButton>
          <CHeaderBrand>
            <span className="fw-bold">{title || 'Pantalla'}</span>
          </CHeaderBrand>
          <CHeaderNav className="ms-auto">
            <CDropdown alignment="end">
              <CDropdownToggle color="light" caret={false}>
                <CAvatar src={avatarImg} size="md" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={onLogout}>
                  <CIcon icon={cilAccountLogout} className="me-2" />
                  Cerrar sesión
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CHeaderNav>
        </CHeader>
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb px-4">
            <li className="breadcrumb-item">
              <Link to="/">Inicio</Link>
            </li>
            {breadcrumbs.map((bc, idx) =>
              <li
                key={idx}
                className={`breadcrumb-item${idx === breadcrumbs.length - 1 ? ' active' : ''}`}
                aria-current={idx === breadcrumbs.length - 1 ? 'page' : undefined}
              >
                {bc.to ? <Link to={bc.to}>{bc.label}</Link> : bc.label}
              </li>
            )}
          </ol>
        </nav>
        <CContainer fluid className="flex-grow-1">
          {children}
        </CContainer>
      </div>
    </div>
  );
}