import { Navbar } from "../../componentes/Navbar/Navbar";
import { Footer } from "../../componentes/Footer/Footer";
import './Home.css';

export function Home() {
    return (
        <>
            <div className="page-wrapper">
            <div className="container-fluid p-0">
                <Navbar />
                
                <div className="home-content page-content">
                    <div className="bienvenida-section">
                        <h1>Bienvenido a Choco&Frutas</h1>
                        <p className="subtitle">🍫 Los mejores chocolates, frutos secos y frutas deshidratadas 🥜</p>
                    </div>

                    <div className="carousel-section">
                        <div id="carouselHome" className="carousel slide" data-bs-ride="carousel">
                            <div className="carousel-indicators">
                                <button type="button" data-bs-target="#carouselHome" data-bs-slide-to="0" className="active"></button>
                                <button type="button" data-bs-target="#carouselHome" data-bs-slide-to="1"></button>
                                <button type="button" data-bs-target="#carouselHome" data-bs-slide-to="2"></button>
                            </div>
                            
                            <div className="carousel-inner">
                                <div className="carousel-item active">
                                    <img src="/img/Fruto.jpg" className="d-block w-100" alt="Frutos Secos" />
                                    <div className="carousel-caption">
                                        <h3>Mix de la Mejor Zona</h3>
                                        <p>Selección premium de frutos secos</p>
                                    </div>
                                </div>
                                
                                <div className="carousel-item">
                                    <img src="/img/Chocolate.webp" className="d-block w-100" alt="Chocolates" />
                                    <div className="carousel-caption">
                                        <h3>Chocolates de Alta Calidad</h3>
                                        <p>Experiencia gourmet en cada bocado</p>
                                    </div>
                                </div>
                                
                                <div className="carousel-item">
                                    <img src="/img/FruDesh.jpg" className="d-block w-100" alt="Frutas Deshidratadas" />
                                    <div className="carousel-caption">
                                        <h3>Frutas Deshidratadas Naturales</h3>
                                        <p>Sabor natural sin conservantes</p>
                                    </div>
                                </div>
                            </div>
                            
                            <button className="carousel-control-prev" type="button" data-bs-target="#carouselHome" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon"></span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#carouselHome" data-bs-slide="next">
                                <span className="carousel-control-next-icon"></span>
                            </button>
                        </div>
                    </div>

                    <div className="productos-destacados">
                        <h2>Productos Destacados</h2>
                        <div className="row">
                            <div className="col-md-4 mb-4">
                                <div className="card producto-card">
                                    <img src="/img/FruSecos.webp" className="card-img-top" alt="Frutos Secos" />
                                    <div className="card-body">
                                        <h4 className="card-title">Frutos Secos</h4>
                                        <p className="card-text">Almendras, nueces, castañas y más</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-4 mb-4">
                                <div className="card producto-card">
                                    <img src="/img/FruDesh.jpg" className="card-img-top" alt="Frutas Deshidratadas" />
                                    <div className="card-body">
                                        <h4 className="card-title">Frutas Deshidratadas</h4>
                                        <p className="card-text">Plátano, manzana, pasas y berries</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-4 mb-4">
                                <div className="card producto-card">
                                    <img src="/img/Choco.jpg" className="card-img-top" alt="Chocolates" />
                                    <div className="card-body">
                                        <h4 className="card-title">Chocolate</h4>
                                        <p className="card-text">Variedades premium y artesanales</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-4">
                                <div className="card producto-card">
                                    <img src="/img/Semillas.jpg" className="card-img-top" alt="Semillas" />
                                    <div className="card-body">
                                        <h4 className="card-title">Semillas</h4>
                                        <p className="card-text">Chía, calabaza, maravilla</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-6 mb-4">
                                <div className="card producto-card">
                                    <img src="/img/Mix.jpg" className="card-img-top" alt="Mezclas" />
                                    <div className="card-body">
                                        <h4 className="card-title">Mezclas</h4>
                                        <p className="card-text">Combinaciones especiales</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="beneficios-section">
                        <h2>¿Por qué elegirnos?</h2>
                        <div className="row">
                            <div className="col-md-4 beneficio-item">
                                <div className="beneficio-icon">
                                    <i className="bi bi-truck"></i>
                                </div>
                                <h4>Envío Rápido</h4>
                                <p>Entregamos en 24-48 horas en toda la ciudad</p>
                            </div>

                            <div className="col-md-4 beneficio-item">
                                <div className="beneficio-icon">
                                    <i className="bi bi-award"></i>
                                </div>
                                <h4>Productos Naturales</h4>
                                <p>100% naturales sin conservantes artificiales</p>
                            </div>

                            <div className="col-md-4 beneficio-item">
                                <div className="beneficio-icon">
                                    <i className="bi bi-star-fill"></i>
                                </div>
                                <h4>Calidad Premium</h4>
                                <p>Seleccionamos los mejores productos para ti</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <Footer />
            </div>
            </div>
        </>
    );
}
