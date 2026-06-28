import { SidebarItem } from "./SidebarItem.jsx";
import { 
  MdHouse, 
  MdSchool, 
  MdAttachMoney, 
  MdShoppingCart, 
  MdAdminPanelSettings,
  MdDirectionsCar
} from "react-icons/md";

import { useAuth } from '@context/AuthContext';

export const SidebarBase = ({pageContent}) => {
    const { user } = useAuth();
    return (
    <div className="drawer lg:drawer-open">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
            {/* Navbar */}
            <nav className="navbar w-full bg-base-300">
            <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                {/* Sidebar toggle icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
            </label>
            <div className="px-4">Opciones</div>
            </nav>
            <div className="actual-page-background">
                <div className="p-4 actual-page-content">
                    {pageContent}
                </div>
            </div>
        </div>

        <div className="drawer-side is-drawer-close:overflow-visible">
            <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
            <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
            {/* Sidebar content here */}
            <ul className="menu w-full grow">
                <SidebarItem label="Inicio" destination="/home" icon={MdHouse} />            
                <SidebarItem label="Clases" destination="/clase" icon={MdSchool} />
                {user?.rol === 'profesor' && (
                    <>
                        <SidebarItem label="Mis Clases" destination="/mis-clases" icon={MdSchool} />
                        <SidebarItem label="Generar QR Asistencia" destination="/generar-qr-clase" icon={MdSchool} />
                        <SidebarItem label="Ver Asistencias" destination="/ver-asistencia" icon={MdSchool} />
                    </>
                )}
                {user?.rol === 'estudiante' && (
                    <>
                        <SidebarItem label="Mi Historial de Clases" destination="/historial-clases" icon={MdSchool} />
                        <SidebarItem label="Registrar Asistencia (QR)" destination="/escanear-asistencia" icon={MdSchool} />
                    </>
                )}
                {user?.rol === 'secretario' && (
                    <SidebarItem label="Gestionar Preinscripciones" destination="/gestionar-ventas" icon={MdAttachMoney} />
                )}
                {/* <SidebarItem label="Deudas" destination="/class" icon={MdAttachMoney} />*/}
            </ul>
            </div>
        </div>
    </div>
    );
}

export default SidebarBase;