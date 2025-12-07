import './Footer.css';

export function Footer() {
  return (
    <footer className="footer-custom">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5 className="footer-title">Choco&Frutas</h5>
            <p className="footer-text">
              Los mejores chocolates, frutos secos y frutas deshidratadas, 
              directamente a tu mesa.
            </p>
          </div>
          
          <div className="col-md-4 mb-3">
            <h5 className="footer-title">Envíos</h5>
            <p className="footer-text">
              Región Metropolitana: 24-48 horas.
            </p>
            <p className="footer-text">
              Resto del país: según destino.
            </p>
          </div>
          
          <div className="col-md-4 mb-3">
            <h5 className="footer-title">Contacto</h5>
            <p className="footer-text">
              <i className="bi bi-envelope"></i> ximena.monterog1976@gmail.com
            </p>
            <p className="footer-text">
              <i className="bi bi-telephone"></i> +56 9 5992 0615
            </p>
          </div>
        </div>
        
        <hr className="footer-divider" />
        
        <div className="text-center">
          <p className="footer-copyright">
            &copy; 2025 Choco&Frutas - Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
