import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  UserPlus, 
  LogIn, 
  AlertCircle, 
  ShieldCheck,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Auth: React.FC = () => {
  const { login, register, user } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isAdminRoleSelected, setIsAdminRoleSelected] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Field Validations
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!isLoginView && !displayName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }

    setLoading(true);

    try {
      if (isLoginView) {
        // Sign in
        await login(email.trim(), password);
        setSuccessMsg('¡Sesión iniciada con éxito!');
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1000);
      } else {
        // Sign up
        let roleToRegister: 'admin' | 'user' = 'user';
        if (isAdminRoleSelected) {
          if (adminCode.trim() !== 'admin123') {
            setErrorMsg('Código de Administrador incorrecto. Use "admin123" o deje la casilla sin marcar para registrarse como usuario común.');
            setLoading(false);
            return;
          }
          roleToRegister = 'admin';
        }

        await register(email.trim(), password, displayName.trim(), roleToRegister);
        setSuccessMsg('¡Cuenta registrada e iniciada con éxito!');
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1000);
      }
    } catch (err: any) {
      console.error('Error during Auth submission:', err);
      // Translate typical Firebase error codes to beautiful Spanish
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('El correo o la contraseña son incorrectos.');
      } else if (err.code === 'auth/user-not-found') {
        setErrorMsg('No existe ningún usuario registrado con este correo.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Este correo electrónico ya se encuentra registrado por otro usuario.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('El formato del correo electrónico ingresado no es válido.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('El método de inicio de sesión con Correo/Contraseña no está habilitado en tu consola de Firebase (possible-droplet-sfs6l). Por favor, ve a Firebase Console -> Authentication -> Sign-in method y activa "Correo electrónico/contraseña".');
      } else {
        setErrorMsg(err.message || 'Ocurrió un error inesperado al conectar con Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If user is already authenticated
  if (user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-6">
        <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <Check className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Sesión Activa</h2>
          <p className="text-sm text-gray-500">
            Ya has iniciado sesión como <strong className="text-gray-800">{user.displayName || user.email}</strong>.
          </p>
        </div>
        <div>
          <a
            href="#/"
            className="inline-flex justify-center items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors cursor-pointer"
          >
            Ir a Inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Messages */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex items-center space-x-2 text-sm"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 flex items-center space-x-2 text-sm font-medium"
          >
            <Check className="h-5 w-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        {/* Toggle Headings */}
        <div className="flex items-center justify-center space-x-6 border-b border-gray-100 pb-4">
          <button
            onClick={() => {
              setIsLoginView(true);
              setErrorMsg('');
            }}
            className={`text-base font-black pb-3 relative cursor-pointer ${
              isLoginView ? 'text-indigo-600 font-black' : 'text-gray-400 font-semibold'
            }`}
          >
            <span>Iniciar Sesión</span>
            {isLoginView && (
              <motion.div
                layoutId="auth-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
              />
            )}
          </button>
          <button
            onClick={() => {
              setIsLoginView(false);
              setErrorMsg('');
            }}
            className={`text-base font-black pb-3 relative cursor-pointer ${
              !isLoginView ? 'text-indigo-600 font-black' : 'text-gray-400 font-semibold'
            }`}
          >
            <span>Crear Cuenta</span>
            {!isLoginView && (
              <motion.div
                layoutId="auth-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
              />
            )}
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name for Registration */}
          {!isLoginView && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nombre Completo</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tu nombre y apellido"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                  required
                />
                <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                required
              />
              <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                required
              />
              <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Teacher Admin Registration Assistance Options */}
          {!isLoginView && (
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 mt-2 space-y-3">
              <div className="flex items-start space-x-2.5">
                <input
                  type="checkbox"
                  id="adminRoleCheckbox"
                  checked={isAdminRoleSelected}
                  onChange={(e) => setIsAdminRoleSelected(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="adminRoleCheckbox" className="text-xs font-semibold text-gray-700 cursor-pointer leading-tight">
                  Registrarse como Administrador (Profesor/Evaluador)
                </label>
              </div>

              {isAdminRoleSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1.5 pt-1 overflow-hidden"
                >
                  <label className="block text-xxs font-bold text-amber-700 uppercase tracking-wide">Código Secreto Admin</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Ingrese 'admin123'"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      className="w-full text-xs bg-white border border-amber-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 outline-hidden font-mono"
                    />
                    <ShieldCheck className="h-4 w-4 text-amber-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-xxs text-amber-600 leading-normal block">
                    Use el código <strong>admin123</strong> para autorizar el rol. Esto registrará una cuenta con accesos totales al CRUD.
                  </span>
                </motion.div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer active:scale-95 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoginView ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            <span>{loading ? 'Conectando...' : isLoginView ? 'Ingresar' : 'Registrar Cuenta'}</span>
          </button>
        </form>

        {/* Bottom Help and Credentials tips for Quick login */}
        {isLoginView && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xxs text-gray-500 leading-normal space-y-1.5">
            <span className="font-bold text-gray-700 block text-xs mb-1">Cuentas de Prueba Rápidas</span>
            <div>• <strong>Administrador (CRUD):</strong> `admin@test.com` (Contraseña: `admin123`)</div>
            <div>• <strong>Usuario Común (Cliente):</strong> `cliente@test.com` (Contraseña: `cliente123`)</div>
            <span className="text-indigo-600 font-medium block mt-1">
              * O crea una nueva cuenta y usa el panel de arriba para elegir tu rol.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
