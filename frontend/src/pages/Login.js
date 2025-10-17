import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../components/Logo";

// Import das imagens de background
import loginDesktop from "../assets/login-desktop.jpg";
import loginMobile from "../assets/login-mobile.jpg";

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
      <div className="hidden lg:block absolute inset-0 right-80">
        <img
          src={loginDesktop}
          alt="Background"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Background Image - Mobile */}
      <div className="lg:hidden absolute inset-0">
        <img
          src={loginMobile}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* White gap filler */}
      <div className="absolute right-0 top-0 w-96 h-full bg-white z-30"></div>

      {/* Curved blue shape - cutting the background */}
      <div className="absolute right-80 top-0 w-20 h-full z-40">
        <svg
          className="w-full h-full"
          viewBox="0 0 110 100"
          preserveAspectRatio="none"
        >
          <path d="M80,0 Q40,50 80,100 L0,100 L0,0 Z" fill="#1e40af" />
        </svg>
      </div>

      {/* Login Form */}
      <div className="relative z-50 min-h-screen flex items-center justify-end pr-8 lg:pr-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-white/95 border border-[#000638]">
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
                    className="w-full px-4 py-3 border-2 border-[#000638] rounded-lg focus:ring-2 focus:ring-[#000638] focus:border-[#000638] outline-none transition-all"
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
                    className="w-full px-4 py-3 pr-12 border-2 border-[#000638] rounded-lg focus:ring-2 focus:ring-[#000638] focus:border-[#000638] outline-none transition-all"
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
                  className="w-full btn12 font-bold py-3 px-6 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="loading-spinner mr-2"></div>
                      Entrando...
                    </div>
                  ) : (
                    <span>ENTRAR</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
