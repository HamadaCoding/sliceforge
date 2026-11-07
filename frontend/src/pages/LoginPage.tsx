import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { api, readApiError } from "../lib/api";

/**
 * LoginPage Component
 * 
 * Provides a secure email-based authentication form handling
 * account verification confirmations and password reset requests.
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginAction = useAuthStore((state) => state.login);

  const isEmailVerifiedRedirect = searchParams.get("verified") === "1";

  const [inputEmail, setInputEmail] = useState<string>("");
  const [inputPassword, setInputPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password modal/drawer state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("");
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<string | null>(null);
  const [isSendingResetLink, setIsSendingResetLink] = useState<boolean>(false);

  const handleLoginSubmit = async (formSubmitEvent: React.FormEvent<HTMLFormElement>): Promise<void> => {
    formSubmitEvent.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await loginAction({
        email: inputEmail.trim(),
        password: inputPassword,
      });
      navigate("/engine");
    } catch (apiError) {
      setErrorMessage(readApiError(apiError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (
    forgotFormSubmitEvent: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    forgotFormSubmitEvent.preventDefault();
    setIsSendingResetLink(true);
    setForgotPasswordStatus(null);

    try {
      const response = await api.post<{ message: string }>("/forgot-password", {
        email: forgotPasswordEmail.trim(),
      });
      setForgotPasswordStatus(
        response.data.message || "If that email is registered, a reset link has been dispatched."
      );
    } catch (apiError) {
      setForgotPasswordStatus(readApiError(apiError));
    } finally {
      setIsSendingResetLink(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 page-enter space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
          🔐 Secure Account Access
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          Sign In to SliceForge
        </h1>
        <p className="text-xs text-slate-400">
          Enter your developer credentials to manage saved sprite presets and settings.
        </p>
      </div>

      {/* Verified Banner */}
      {isEmailVerifiedRedirect && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-emerald-300 text-xs flex items-center gap-2.5">
          <span className="text-base font-bold">✓</span>
          <span>Your email address has been verified successfully! You can now log in below.</span>
        </div>
      )}

      {/* Main Login Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md space-y-5">
        {errorMessage && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-red-300 text-xs flex items-start gap-2.5">
            <span className="text-sm">⚠</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={(formSubmitEvent) => void handleLoginSubmit(formSubmitEvent)} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={inputEmail}
              onChange={(changeEvent) => setInputEmail(changeEvent.target.value)}
              placeholder="developer@example.com"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(!isForgotPasswordOpen)}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={isPasswordVisible ? "text" : "password"}
                required
                value={inputPassword}
                onChange={(changeEvent) => setInputPassword(changeEvent.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {isPasswordVisible ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-2.5 px-4 text-sm font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In 🚀</span>
            )}
          </button>
        </form>

        {/* Collapsible Forgot Password Section */}
        {isForgotPasswordOpen && (
          <div className="border-t border-slate-800/80 pt-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-200">
              Reset Password via Email Notification
            </h3>
            <p className="text-[11px] text-slate-400">
              Enter your email and our automated mail system will dispatch a secure password reset link.
            </p>
            {forgotPasswordStatus && (
              <p className="text-xs font-mono text-cyan-300 bg-cyan-950/30 p-2 rounded-lg border border-cyan-800/40">
                {forgotPasswordStatus}
              </p>
            )}
            <form onSubmit={(forgotEvent) => void handleForgotPasswordSubmit(forgotEvent)} className="space-y-2">
              <input
                type="email"
                required
                value={forgotPasswordEmail}
                onChange={(changeEvent) => setForgotPasswordEmail(changeEvent.target.value)}
                placeholder="Enter registered email"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSendingResetLink}
                className="w-full rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold py-2 px-3 transition-colors cursor-pointer"
              >
                {isSendingResetLink ? "Dispatching..." : "Send Reset Link"}
              </button>
            </form>
          </div>
        )}

        <div className="border-t border-slate-800/80 pt-4 text-center text-xs text-slate-400">
          Don't have an account yet?{" "}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
