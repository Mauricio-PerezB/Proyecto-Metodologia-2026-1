import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, preRegister } from '@services/auth.service.js';
import useLogin from '@hooks/useLogin.jsx';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    const [isPreRegister, setIsPreRegister] = useState(false);
    const [preRegisterData, setPreRegisterData] = useState({
        nombreCompleto: '',
        rut: '',
        telefono: '',
        sede: '',
        plan: '',
        comprobantePagoUrl: ''
    });
    const [preRegisterSuccess, setPreRegisterSuccess] = useState('');
    const [preRegisterError, setPreRegisterError] = useState('');

    const {
        errorEmail,
        errorPassword,
        errorData,
        handleInputChange
    } = useLogin();

    const validateField = (name, value) => {
        let error = '';

        if (name === 'email') {
            if (!value) {
                error = 'El correo electrónico es requerido';
            } else if (value.length < 8) {
                error = 'El correo debe tener al menos 8 caracteres';
            } else if (value.length > 30) {
                error = 'El correo no puede tener más de 30 caracteres';
            } else if (!value.endsWith('@gmail.com')) {
                error = 'El correo debe terminar en @gmail.com';
            }
        }

        if (name === 'password') {
            if (!value) {
                error = 'La contraseña es requerida';
            } /*else if (value.length < 8) {
                error = 'La contraseña debe tener al menos 8 caracteres';
            }*/ else if (value.length > 26) {
                error = 'La contraseña no puede tener más de 26 caracteres';
            } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
                error = 'Debe contener solo letras y números';
            }
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        handleInputChange(name, value);
    };

    const loginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const emailError = validateField('email', formData.email);
        const passwordError = validateField('password', formData.password);

        if (emailError || passwordError) {
            setErrors({
                email: emailError,
                password: passwordError
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await login(formData);
            if (response.status === 'Success') {
                navigate('/home');
            } else if (response.status === 'Client error') {
                errorData(response.details);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreRegisterChange = (e) => {
        const { name, value } = e.target;
        setPreRegisterData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePreRegisterSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setPreRegisterSuccess('');
        setPreRegisterError('');
        try {
            const response = await preRegister(preRegisterData);
            if (response.status === 'Success' || (response.message && response.message.toLowerCase().includes('correcta'))) {
                setPreRegisterSuccess('¡Preinscripción enviada con éxito! La secretaria revisará tu comprobante y se creará tu usuario.');
                setPreRegisterData({
                    nombreCompleto: '',
                    rut: '',
                    telefono: '',
                    sede: '',
                    plan: '',
                    comprobantePagoUrl: ''
                });
            } else {
                setPreRegisterError(response.message || 'Error al enviar la preinscripción');
            }
        } catch (error) {
            setPreRegisterError('Error al conectar con el servidor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <div className="min-h-screen flex">
        {/* Panel izquierdo - Bienvenida */}
        <div 
            className="flex-1 flex items-center justify-start pl-16 pr-12 relative overflow-hidden"
            style={{ backgroundColor: '#f5f5b8' }}
        >
            {/* Círculo decorativo */}
            <div className="absolute -right-40 -top-32 w-96 h-96 bg-white bg-opacity-30 rounded-full"></div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white bg-opacity-20 rounded-full"></div>

            <div className="text-gray-800 max-w-md z-10">
                <h1 className="text-4xl font-bold mb-6">
                    Bienvenido de nuevo!
                </h1>
                <div 
                    className="h-1 mb-6"
                    style={{ backgroundColor: '#7aff00' }}
                ></div>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                     curso de conducción para licencia tipo a,b
                </p>
            </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-12 relative overflow-y-auto">
            {/* Círculos decorativos */}
            <div className="absolute top-20 right-20 w-32 h-32 bg-gray-200 rounded-full opacity-60"></div>
            <div className="absolute bottom-32 left-20 w-24 h-24 bg-gray-300 rounded-full opacity-40"></div>

            <div className="w-full max-w-md z-10">
                {!isPreRegister ? (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Iniciar Sesión</h2>
                            <div 
                                className="w-12 h-1 mx-auto"
                                style={{ backgroundColor: '#7aff00' }}
                            ></div>
                        </div>

                        <form onSubmit={loginSubmit} className="space-y-6">
                            {/* Campo Email */}
                            <div>
                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="ejemplo@gmail.com"
                                    className={`w-full px-4 py-4 bg-white border-2 rounded-lg focus:outline-none transition-colors placeholder-gray-400 ${errors.email || errorEmail
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200'
                                        }`}
                                    style={{ '--tw-border-color': '#7aff00' }}
                                    onFocus={(e) => e.target.style.borderColor = '#7aff00'}
                                    autoComplete="email"
                                    required
                                />
                                {(errors.email || errorEmail) && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.email || errorEmail}
                                    </p>
                                )}
                            </div>

                            {/* Campo Password */}
                            <div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Ingresa tu contraseña..."
                                        className={`w-full px-4 py-4 bg-white border-2 rounded-lg focus:outline-none transition-colors placeholder-gray-400 pr-12 ${errors.password || errorPassword
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-200'
                                                }`}
                                        onFocus={(e) => e.target.style.borderColor = '#7aff00'}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {(errors.password || errorPassword) && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.password || errorPassword}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 rounded-lg font-semibold transition-all duration-200 ${isLoading
                                        ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                        : 'text-gray-900 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                                        }`}
                                style={{ 
                                    backgroundColor: isLoading ? '' : '#7aff00',
                                    color: isLoading ? '' : '#1a1a1a'
                                }}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        INICIANDO...
                                    </div>
                                ) : (
                                    'INICIAR SESIÓN'
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-6">
                            <button 
                                onClick={() => { setIsPreRegister(true); setPreRegisterSuccess(''); setPreRegisterError(''); }}
                                className="text-sm font-semibold text-green-700 hover:underline"
                            >
                                ¿No tienes cuenta? Preinscríbete aquí
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Preinscribirse</h2>
                            <div 
                                className="w-12 h-1 mx-auto"
                                style={{ backgroundColor: '#7aff00' }}
                            ></div>
                        </div>

                        {preRegisterSuccess && (
                            <div className="p-4 mb-4 text-sm text-green-800 bg-green-100 rounded-lg">
                                {preRegisterSuccess}
                            </div>
                        )}

                        {preRegisterError && (
                            <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">
                                {preRegisterError}
                            </div>
                        )}

                        <form onSubmit={handlePreRegisterSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    name="nombreCompleto"
                                    value={preRegisterData.nombreCompleto}
                                    onChange={handlePreRegisterChange}
                                    placeholder="Nombre Completo"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div>
                                <input
                                    type="text"
                                    name="rut"
                                    value={preRegisterData.rut}
                                    onChange={handlePreRegisterChange}
                                    placeholder="RUT (ej: 12.345.678-9)"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={preRegisterData.telefono}
                                    onChange={handlePreRegisterChange}
                                    placeholder="Teléfono"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div>
                                <input
                                    type="text"
                                    name="sede"
                                    value={preRegisterData.sede}
                                    onChange={handlePreRegisterChange}
                                    placeholder="Sede"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div>
                                <input
                                    type="text"
                                    name="plan"
                                    value={preRegisterData.plan}
                                    onChange={handlePreRegisterChange}
                                    placeholder="Plan a contratar"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div>
                                <input
                                    type="text"
                                    name="comprobantePagoUrl"
                                    value={preRegisterData.comprobantePagoUrl}
                                    onChange={handlePreRegisterChange}
                                    placeholder="URL o Detalle de Comprobante de Pago"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none placeholder-gray-400"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-lg font-semibold bg-green-500 hover:shadow-lg text-gray-900 transition-all"
                                style={{ backgroundColor: '#7aff00' }}
                            >
                                {isLoading ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
                            </button>
                        </form>

                        <div className="text-center mt-6">
                            <button 
                                onClick={() => { setIsPreRegister(false); setPreRegisterSuccess(''); setPreRegisterError(''); }}
                                className="text-sm font-semibold text-green-700 hover:underline"
                            >
                                ¿Ya tienes cuenta? Inicia sesión
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    </div>
);

};

export default Login;
