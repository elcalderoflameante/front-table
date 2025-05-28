import { useState } from 'react';
import { login } from '../../services/api';
import { subscribeUserToPush } from '../../utils/push';
import {
    CContainer,
    CRow,
    CCol,
    CCard,
    CCardBody,
    CCardHeader,
    CCardGroup,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CButton,
    CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilLockLocked } from '@coreui/icons';
import logo from '../../assets/logo-caldero.png';
import AlertMessage from '../../components/AlertMessage';

export default function Login({ onLogin }) {
    const [username, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [pushError, setPushError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await login({ username, password });
            localStorage.setItem('token', data.token);

            // Intenta suscribirse a push, pero no detiene el login si falla
            try {
                if (Notification.permission === 'granted') {
                    await subscribeUserToPush();
                } else if (Notification.permission !== 'denied') {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        await subscribeUserToPush();
                    }
                }
            } catch (pushError) {
                setPushError('No se pudo registrar la suscripción push');
                // Opcional: muestra un warning, pero no bloquea el login
                console.warn('No se pudo registrar la suscripción push:', pushError);
            }

            onLogin && onLogin(data.token);
        } catch (err) {
            setError('Usuario o contraseña incorrectos');
        }
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
            <CContainer>
                <CRow className="justify-content-center">
                    <CCol md={8}>
                        <CCardGroup>
                            <CCard className="p-4">
                                <CCardBody>
                                    <div className="text-center mb-4">
                                        <img src={logo} alt="Logo" style={{ width: 90, marginBottom: 10 }} />
                                        <h4 className="mb-0" style={{ color: '#b8860b', fontWeight: 'bold' }}>Ingreso de Meseros</h4>
                                    </div>
                                    <CForm onSubmit={handleSubmit}>
                                        <CInputGroup className="mb-3">
                                            <CInputGroupText>
                                                <CIcon icon={cilUser} />
                                            </CInputGroupText>
                                            <CFormInput
                                                placeholder="Usuario"
                                                autoComplete="username"
                                                value={username}
                                                onChange={e => setUsuario(e.target.value)}
                                                required
                                            />
                                        </CInputGroup>
                                        <CInputGroup className="mb-4">
                                            <CInputGroupText>
                                                <CIcon icon={cilLockLocked} />
                                            </CInputGroupText>
                                            <CFormInput
                                                type="password"
                                                placeholder="Contraseña"
                                                autoComplete="current-password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                required
                                            />
                                        </CInputGroup>
                                        <CRow>
                                            <CCol xs={12}>
                                                <CButton color="warning" type="submit" className="w-100 text-white" style={{ fontWeight: 'bold' }}>
                                                    Ingresar
                                                </CButton>
                                            </CCol>
                                        </CRow>
                                        <AlertMessage color="danger" message={error} className="mt-3" />
                                        <AlertMessage color="warning" message={pushError} className="mt-2" />
                                    </CForm>
                                </CCardBody>
                            </CCard>
                            <CCard className="text-white bg-warning py-5 d-md-down-none" style={{ width: '44%' }}>
                                <CCardBody className="text-center d-flex flex-column justify-content-center align-items-center">
                                    <div>
                                        <h2>Bienvenido</h2>
                                        <p>Por favor ingresa tus credenciales para acceder al sistema de restaurante.</p>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCardGroup>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    );
}