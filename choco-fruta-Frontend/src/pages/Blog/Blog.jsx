import { Navbar } from "../../componentes/Navbar/Navbar";
import { Footer } from "../../componentes/Footer/Footer";
import './Blog.css';

export function Blog() {
    const articulos = [
        {
            id: 1,
            titulo: "Los Increíbles Beneficios del Cacao",
            imagen: "/img/Cacao.jpg",
            descripcion: "Descubre por qué el cacao es considerado un superalimento. Rico en antioxidantes y flavonoides, el cacao aporta múltiples beneficios para la salud cardiovascular y mental."
        },
        {
            id: 2,
            titulo: "El Poder Nutricional de los Frutos Secos",
            imagen: "/img/Secos.jpg",
            descripcion: "Los frutos secos son pequeñas fuentes de energía y nutrición. Conoce todos los beneficios que aportan a tu salud y cómo incorporarlos en tu dieta diaria de manera deliciosa."
        },
        {
            id: 3,
            titulo: "Frutas Deshidratadas: Snacks Naturales y Nutritivos",
            imagen: "/img/FrutaDes.jpg",
            descripcion: "Las frutas deshidratadas mantienen la mayoría de sus nutrientes y son perfectas como snacks saludables. Aprende sobre sus beneficios y las mejores formas de consumirlas."
        },
        {
            id: 4,
            titulo: "Semillas: Pequeños Tesoros Nutricionales",
            imagen: "/img/Semillas.jpg",
            descripcion: "Las semillas de chía, calabaza y maravilla son verdaderos tesoros nutricionales. Descubre sus propiedades y cómo pueden transformar tu alimentación diaria."
        },
        {
            id: 5,
            titulo: "Mezclas Perfectas para una Vida Saludable",
            imagen: "/img/Mix.jpg",
            descripcion: "Combinar diferentes frutos secos, semillas y frutas deshidratadas crea mezclas perfectas para obtener todos los nutrientes que necesitas. Conoce nuestras combinaciones especiales."
        }
    ];

    return (
        <>
            <div className="page-wrapper">
                <div className="container-fluid p-0">
                    <Navbar />
                </div>

                <div className="blog-content page-content">
                    <h1 className="blog-title">Noticias y Datos Curiosos</h1>

                    <div className="articulos-grid">
                        {articulos.map(articulo => (
                            <article key={articulo.id} className="blog-item">
                                <div className="blog-row">
                                    <img 
                                        src={articulo.imagen} 
                                        className="blog-image" 
                                        alt={articulo.titulo}
                                    />
                                    <div className="blog-content-text">
                                        <h2 className="blog-item-title">{articulo.titulo}</h2>
                                        <p className="blog-description">
                                            {articulo.descripcion}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
