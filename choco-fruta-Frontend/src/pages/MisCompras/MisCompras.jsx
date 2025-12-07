import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../componentes/Navbar/Navbar';
import { Footer } from '../../componentes/Footer/Footer';
import { getToken, setToken } from '../../utils/session';

const API_BASE_URL = 'http://localhost:8081/api';

export function MisCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        const token = getToken();
        if (!token) { setCompras([]); setLoading(false); return; }
        let resp = await fetch(`${API_BASE_URL}/boletas/historial`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (resp.status === 401 || resp.status === 403) {
          const r = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
          }).catch(() => null);
          if (r && r.ok) {
            const data = await r.json();
            if (data?.token) {
              setToken(data.token);
              resp = await fetch(`${API_BASE_URL}/boletas/historial`, {
                headers: { 'Authorization': `Bearer ${data.token}`, 'Accept': 'application/json' }
              });
            }
          }
        }
        if (!resp.ok) {
          setError(resp.status === 403 ? 'No autorizado' : 'No se pudo cargar el historial');
          setCompras([]);
          return;
        }
        const data = await resp.json();
        setCompras(Array.isArray(data) ? data : []);
      } catch {
        setError('No se pudo conectar con el backend');
        setCompras([]);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  return (
    <>
      <div className="page-wrapper">
        <div className="container-fluid p-0">
          <Navbar />
        </div>
        <div className="container mt-4 page-content" style={{ maxWidth: '900px' }}>
          <div className="card">
            <div className="card-header bg-primary text-white py-2">
              <h6 className="mb-0">Mis Compras</h6>
            </div>
            <div className="card-body p-3">
              {loading && <div className="small">Cargando historial...</div>}
              {error && <div className="alert alert-danger py-2 mb-2 small">{error}</div>}
              {!loading && !error && (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th># Boleta</th>
                        <th>Fecha</th>
                        <th>Subtotal</th>
                        <th>IVA</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(compras || []).map(b => (
                        <tr key={`mb-${b.id ?? b.numero}`}>
                          <td>{b.numero ?? b.id}</td>
                          <td>{b?.fecha ? new Date(b.fecha).toLocaleString('es-CL') : '—'}</td>
                          <td>${Number(b?.neto ?? 0).toLocaleString('es-CL')}</td>
                          <td>${Number(b?.iva ?? 0).toLocaleString('es-CL')}</td>
                          <td>${Number(b?.total ?? ((Number(b?.neto ?? 0)) + Math.round(Number(b?.neto ?? 0) * 0.19))).toLocaleString('es-CL')}</td>
                          <td>
                            <Link className="btn btn-sm btn-outline-primary" to={`/seguimiento-pedido?numero=${b?.numero ?? ''}`}>
                              Ver detalle
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {Array.isArray(compras) && compras.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center small">No tienes compras registradas</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
