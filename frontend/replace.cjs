const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/Mauri/Downloads/tarea/EvaluacionesDerecho2025/Proyecto-Metodologia-2026-1/frontend/src/pages';
const files = fs.readdirSync(directory).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    const filePath = path.join(directory, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/emerald/g, 'blue');
    content = content.replace(/teal/g, 'slate');
    fs.writeFileSync(filePath, content);
});

// Now do specific changes to Login.jsx
const loginPath = path.join(directory, 'Login.jsx');
let loginContent = fs.readFileSync(loginPath, 'utf8');

const oldBrandingRegex = /<div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-blue-600 to-slate-900 items-center justify-center overflow-hidden">[\s\S]*?<div className="flex items-center space-x-4">/m;

const newBranding = `<div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-blue-800 to-slate-900 items-center justify-center overflow-hidden">
                {/* Elementos decorativos abstractos */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                
                <div className="relative z-10 p-16 flex flex-col items-start justify-center h-full max-w-xl text-white">
                    <div className="mb-10 bg-white p-5 rounded-2xl shadow-2xl flex items-center justify-center inline-block">
                        <img src="/logo.png" alt="Surcentral Logo" className="h-20 w-auto object-contain" />
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight">
                        Formando conductores con <span className="text-blue-300">responsabilidad</span>
                    </h1>
                    <p className="text-lg text-blue-50 mb-10 leading-relaxed font-light">
                        Escuela de conducción profesional Surcentral. Aprende con instructores calificados y vehículos modernos para obtener tu licencia con total confianza y seguridad.
                    </p>
                    <div className="flex items-center space-x-4">`;

loginContent = loginContent.replace(oldBrandingRegex, newBranding);

fs.writeFileSync(loginPath, loginContent);
console.log('Done!');
