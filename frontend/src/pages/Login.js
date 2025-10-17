import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../components/Logo";

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image - Desktop */}
      <div className="hidden lg:block absolute inset-0">
        <img
          src="/login-desktop.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/20"></div>
      </div>

      {/* Background Image - Mobile */}
      <div className="lg:hidden absolute inset-0">
        <img
          src="/login-mobile.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Right side pattern */}
      <div className="absolute right-0 top-0 w-32 h-full bg-white/10 backdrop-blur-sm">
        <div
          className="w-full h-full opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      {/* Curved blue shape */}
      <div className="absolute right-32 top-0 w-16 h-full">
        <svg
          className="w-full h-full"
          viewBox="0 0 64 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 Q32,50 0,100 L64,100 L64,0 Z"
            fill="#1e40af"
            opacity="0.1"
          />
        </svg>
      </div>

      {/* Login Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-end pr-8 lg:pr-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-white/95">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Logo size="lg" variant="full" />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {/* Usuário */}
                <div>
                  <input
                    {...register("email", {
                      required: "Usuário é obrigatório",
                    })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Usuário"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Senha */}
                <div className="relative">
                  <input
                    {...register("password", {
                      required: "Senha é obrigatória",
                      minLength: {
                        value: 6,
                        message: "Senha deve ter pelo menos 6 caracteres",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Esqueci minha senha */}
              <div className="text-right">
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Esqueci minha senha!
                </a>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="loading-spinner mr-2"></div>
                      Entrando...
                    </div>
                  ) : (
                    <>
                      <span>ENTRAR</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Alterar empresa */}
              <div className="text-center">
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Alterar empresa
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
