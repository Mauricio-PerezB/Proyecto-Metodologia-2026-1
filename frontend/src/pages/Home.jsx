import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import escuelaConductoresImg from '@assets/Escuela-de-Conductores-Conduce.jpg';

export default function Home() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };
  /* 
  const backgroundStyle = {
    backgroundImage: `url(${escuelaConductoresImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'blur(2px)',
    opacity: 0.6,
    position: 'fixed',
    top: 0,
    left: '16rem',
    right: 0,
    bottom: 0,
    zIndex: 1
  };
  */

  const OLD_CLASS = "relative min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center";

  return (
    <div className="">
      {/* <div style={backgroundStyle}></div> */}
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              🚗 Bienvenido
            </h1>
            <h2 className="text-2xl md:text-3xl font-light text-gray-700 mb-4">
              Curso de conducción
            </h2>
            <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4">
            <p className="text-lg md:text-xl text-gray-600 font-light">
              {getGreeting()}, <span className="font-semibold text-green-700">{user?.nombre}</span>
            </p>
            
            <p className="text-base text-gray-600 leading-relaxed">
              Te damos la bienvenida al curso de conducción. 
              Aquí podrás mantenerte informado sobre clases y evaluaciones.
            </p>

            
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="text-2xl mb-3">🕐</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Hora actual</h3>
            <p className="text-xl font-mono text-green-700">
              {currentTime.toLocaleTimeString()}
            </p>
            <p className="text-gray-600 mt-1 text-sm">
              {currentTime.toLocaleDateString('es-CL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="text-2xl mb-3">👤</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tu perfil</h3>
            <p className="text-base text-gray-700">
              <span className="font-medium">{user?.nombre}</span>
            </p>
            <p className="text-green-600 font-medium capitalize mt-1 text-sm">
              {user?.rol}
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <p className="text-gray-800 italic font-medium">
              "Estamos trabajando para usted"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}