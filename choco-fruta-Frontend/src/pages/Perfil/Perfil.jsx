import { useEffect, useState } from 'react';
import { Navbar } from '../../componentes/Navbar/Navbar';
import { Footer } from '../../componentes/Footer/Footer';
import { getToken, setToken, guardarUsuario, obtenerUsuario, getUid } from '../../utils/session';

const API_BASE_URL = 'http://localhost:8081/api';

export function Perfil() {
  const prevUserRaw = typeof window !== 'undefined' ? localStorage.getItem('usuarioLogueado') : null;
  let prevEmail = '';
  let prevNombre = '';
  try { prevEmail = prevUserRaw ? (JSON.parse(prevUserRaw)?.email || '') : ''; } catch { prevEmail = ''; }
  try { prevNombre = prevUserRaw ? (JSON.parse(prevUserRaw)?.nombre || '') : ''; } catch { prevNombre = ''; }
  const initialUsername = (obtenerUsuario()?.username || '');
  const [perfil, setPerfil] = useState({ username: initialUsername, email: prevEmail, nombre: prevNombre });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Cambio realizado');
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirma, setPassConfirma] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const cargarPerfil = async (signal, preserveSuccess = false) => {
    setError(null);
    if (!preserveSuccess) { setSuccess(false); }
    try {
      const token = getToken();
        if (!token) { setLoading(false); return; }
        let resp = await fetch(`${API_BASE_URL}/perfil`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json'
          },
          signal
        });
        if (resp.status === 401 || resp.status === 403) {
          const rf = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Authorization': token ? `Bearer ${token}` : '' },
            signal
          }).catch(() => null);
          if (rf && rf.ok) {
            const data = await rf.json();
            if (data?.token) {
              setToken(data.token);
              const resp2 = await fetch(`${API_BASE_URL}/perfil`, {
                headers: { 'Authorization': `Bearer ${data.token}`, 'Accept': 'application/json' },
                signal
              });
              if (resp2.ok) {
                const pf = await resp2.json();
                let nextEmail = pf.email || '';
                if (!nextEmail) {
                  try {
                    const uid = getUid();
                    if (uid) {
                      const rUid = await fetch(`${API_BASE_URL.replace('/perfil','')}/usuarios/${uid}`, {
                        headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/json' },
                        signal
                      });
                      if (rUid.ok) {
                        const u2 = await rUid.json();
                        nextEmail = u2?.email || '';
                      }
                    }
                  } catch { void 0; }
                }
                setPerfil(prev => ({ username: pf.username || prev.username || '', email: nextEmail || prev.email || '', nombre: pf.nombre || prev.nombre || '' }));
                try { guardarUsuario({ token: getToken(), username: pf.username, email: nextEmail || pf.email, nombre: pf.nombre }); } catch { void 0; }
              }
            }
          }
        } else if (resp.ok) {
          const pf = await resp.json();
          let nextEmail = pf.email || '';
          if (!nextEmail) {
            try {
              const uid = getUid();
              if (uid) {
                const rUid = await fetch(`${API_BASE_URL.replace('/perfil','')}/usuarios/${uid}`, {
                  headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/json' },
                  signal
                });
                if (rUid.ok) {
                  const u2 = await rUid.json();
                  nextEmail = u2?.email || '';
                }
              }
            } catch { void 0; }
          }
          setPerfil(prev => ({ username: pf.username || prev.username || '', email: nextEmail || prev.email || '', nombre: pf.nombre || prev.nombre || '' }));
          try { guardarUsuario({ token: getToken(), username: pf.username, email: nextEmail || pf.email, nombre: pf.nombre }); } catch { void 0; }
        } else {
          try {
            resp = await fetch(`http://localhost:8081/api/perfil`, {
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Accept': 'application/json'
              },
              signal
            });
            if (resp.ok) {
              const pf = await resp.json();
              let nextEmail = pf.email || '';
              if (!nextEmail) {
                try {
                  const uid = getUid();
                  if (uid) {
                    const rUid = await fetch(`http://localhost:8081/api/usuarios/${uid}`, {
                      headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/json' },
                      signal
                    });
                    if (rUid.ok) {
                      const u2 = await rUid.json();
                      nextEmail = u2?.email || '';
                    }
                  }
                } catch { void 0; }
              }
              setPerfil(prev => ({ username: pf.username || prev.username || '', email: nextEmail || prev.email || '', nombre: pf.nombre || prev.nombre || '' }));
              try { guardarUsuario({ token: getToken(), username: pf.username, email: nextEmail || pf.email, nombre: pf.nombre }); } catch { void 0; }
            } else {
              setError('No se pudo cargar el perfil');
            }
          } catch {
            setError('No se pudo cargar el perfil');
          }
        }
    } catch (e) {
      if (!(e && e.name === 'AbortError')) {
        setError('Error al cargar el perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    cargarPerfil(ac.signal);
    return () => { try { ac.abort(); } catch { void 0; } };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    setSuccessMsg('Perfil actualizado correctamente');
    let timer;
    try {
      const ac = new AbortController();
      timer = setTimeout(() => { try { ac.abort(); } catch { void 0; } }, 15000);
      const token = getToken();
      const body = {
        email: (perfil.email || '').trim(),
        username: (perfil.username || '').trim(),
        nombre: (perfil.nombre || '').trim()
      };
      const doPut = async (tok) => {
        return fetch(`${API_BASE_URL}/perfil`, {
          method: 'PUT',
          headers: {
            'Authorization': tok ? `Bearer ${tok}` : '',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
          signal: ac.signal
        });
      };
      let resp;
      try {
        resp = await doPut(token);
      } catch {
        await new Promise(r => setTimeout(r, 500));
        resp = await doPut(token);
      }
      if (resp.status === 401 || resp.status === 403) {
        const r = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Authorization': token ? `Bearer ${token}` : '' },
          signal: ac.signal
        }).catch(() => null);
        if (r && r.ok) {
          const dataR = await r.json();
          if (dataR?.token) {
            setToken(dataR.token);
            resp = await fetch(`${API_BASE_URL}/perfil`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${dataR.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body),
              signal: ac.signal
            });
          }
        }
      }
      if (resp.status === 409) {
        setError('El username o email ya están en uso');
        return;
      }
      if (resp.status === 400) {
        setError('Email inválido o datos incompletos');
        return;
      }
      if (resp.status === 401 || resp.status === 403) {
        setError('Tu sesión no es válida. Inicia sesión nuevamente');
        return;
      }
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        throw new Error(txt || 'Error al actualizar el perfil');
      }
      const pf = await resp.json();
      setPerfil({ username: pf.username || '', email: pf.email || '', nombre: pf.nombre || '' });
      guardarUsuario({ token: getToken(), username: pf.username, email: pf.email, nombre: pf.nombre });
      setSuccess(true);
    } catch (e) {
      if (e && e.name === 'AbortError') {
        setError('La solicitud tardó demasiado. Intenta nuevamente.');
      } else {
        setError(e.message || 'Error al actualizar el perfil');
      }
    } finally {
      try { if (timer) clearTimeout(timer); } catch { void 0; }
      setSaving(false);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);
    if (!passActual || !passNueva || !passConfirma) { setPassError('Completa todas las contraseñas'); return; }
    if (passNueva.length < 8) { setPassError('La nueva contraseña debe tener al menos 8 caracteres'); return; }
    if (passNueva !== passConfirma) { setPassError('Las contraseñas no coinciden'); return; }
    try {
      const token = getToken();
      let resp = await fetch(`${API_BASE_URL}/perfil/password`, {
        method: 'PATCH',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ actual: passActual, nueva: passNueva })
      });
      if (resp.status === 401 || resp.status === 403) {
        const r = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        }).catch(() => null);
        if (r && r.ok) {
          const dataR = await r.json();
          if (dataR?.token) {
            setToken(dataR.token);
            resp = await fetch(`${API_BASE_URL}/perfil/password`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${dataR.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ actual: passActual, nueva: passNueva })
            });
          }
        }
      }
      if (!resp.ok) {
        if (resp.status === 403) { throw new Error('La contraseña actual no es correcta'); }
        throw new Error('No se pudo cambiar la contraseña');
      }
      setPassActual('');
      setPassNueva('');
      setPassConfirma('');
      setPassSuccess(true);
    } catch (er) {
      setPassError(er.message || 'Error al cambiar contraseña');
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-wrapper">
          <div className="container-fluid p-0">
            <Navbar />
          </div>
          <div className="container mt-5 page-content">
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visualmente-hidden">Cargando...</span>
              </div>
              <p className="mt-3">Cargando perfil...</p>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="container-fluid p-0">
          <Navbar />
        </div>
        <div className="container mt-4 page-content" style={{ maxWidth: '600px' }}>
          <div className="card">
            <div className="card-header bg-primary text-white py-2">
              <h6 className="mb-0">Mi Perfil</h6>
            </div>
            <div className="card-body p-3">
              {error && (
                <div className="alert alert-danger py-2 mb-2 small">{error}</div>
              )}
              {success && (
                <div className="alert alert-success py-2 mb-2 small">{successMsg}</div>
              )}

              <form onSubmit={handleGuardar}>
                <div className="mb-2">
                  <label className="form-label small mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={perfil.nombre ?? ''}
                    onChange={handleChange}
                    className="form-control form-control-sm"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small mb-1">Usuario</label>
                  <input
                    type="text"
                    name="username"
                    value={perfil.username ?? ''}
                    onChange={handleChange}
                    className="form-control form-control-sm"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={perfil.email ?? ''}
                    onChange={handleChange}
                    className="form-control form-control-sm"
                  />
                </div>
                

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-sm btn-primary" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
              <hr className="my-3" />
              {passError && (
                <div className="alert alert-danger py-2 mb-2 small">{passError}</div>
              )}
              {passSuccess && (
                <div className="alert alert-success py-2 mb-2 small">Contraseña actualizada</div>
              )}
              <form onSubmit={handleCambiarPassword}>
                <div className="mb-2">
                  <label className="form-label small mb-1">Contraseña actual</label>
                  <input type="password" value={passActual} onChange={(e) => setPassActual(e.target.value)} className="form-control form-control-sm" />
                </div>
                <div className="mb-2">
                  <label className="form-label small mb-1">Nueva contraseña</label>
                  <input type="password" value={passNueva} onChange={(e) => setPassNueva(e.target.value)} className="form-control form-control-sm" />
                </div>
                <div className="mb-3">
                  <label className="form-label small mb-1">Confirmar nueva</label>
                  <input type="password" value={passConfirma} onChange={(e) => setPassConfirma(e.target.value)} className="form-control form-control-sm" />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-sm btn-primary">Cambiar contraseña</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

