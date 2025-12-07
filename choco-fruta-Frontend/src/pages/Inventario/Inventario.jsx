import { Navbar } from "../../componentes/Navbar/Navbar";
import { Productos } from "../../componentes/Productos/Productos";
import { Footer } from "../../componentes/Footer/Footer";

export function Inventario() {
    return (
        <>
            <div className="page-wrapper">
                <div className="container-fluid p-0">
                    <Navbar />
                </div>
                <div className="container page-content">
                    <Productos />
                </div>
                <Footer />
            </div>
        </>
    );
}
