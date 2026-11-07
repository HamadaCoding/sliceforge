import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { readApiError } from "../lib/api";

/**
 * RegisterPage Component
 * 
 * Provides account creation with client-side validation and an explicit
 * post-registration email verification prompt screen.
 */
export const RegisterPage: React.FC = () => {
  const registerAction = useAuthStore((state) => state.register);

  const [inputName, setInputName] = useState<string>("");
  const [inputEmail, setInputEmail] = useState<string>("");
  const [inputPassword, setInputPassword] = useState<string>("");
  const [inputPasswordConfirmation, setInputPasswordConfirmation] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Explicit post-registration prompt state
  const [isRegisteredSuccessfully, setIsRegisteredSuccessfully] = useState<boolean>(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  const handleRegisterSubmit = async (formSubmitEvent: React.FormEvent<HTMLFormElement>): Promise<void> => {
    formSubmitEvent.preventDefault();
    setErrorMessage(null);

    if (inputPassword !== inputPasswordConfirmation) {
      setErrorMessage("Passwords do not match. Please verify your confirmation password.");
      return;
    }

    if (inputPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters in length.");
      return;
    }

    setIsSubmitting(true);

    try {
      const emailTrimmed = inputEmail.trim();
      await registerAction({
        name: inputName.trim(),
        email: emailTrimmed,
        password: inputPassword,
        passwordConfirmation: inputPasswordConfirmation,
      });

      setRegisteredEmail(emailTrimmed);
      setIsRegisteredSuccessfully(true);
    } catch (apiError) {
      setErrorMessage(readApiError(apiError));
      setIsSubmitting(false);
    }
  };

  // Dedicated Post-Registration Verification Prompt Screen
  if (isRegisteredSuccessfully) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 page-enter space-y-6 text-center">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-3xl mx-auto shadow-lg shadow-cyan-500/10">
            ✉️
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white">
              Verification Email Dispatched
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              We have dispatched a verification link to{" "}
              <span className="text-cyan-300 font-semibold">{registeredEmail}</span>.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400 text-left space-y-2">
            <p className="font-semibold text-slate-200">Next Steps:</p>
            <p>1. Check your email inbox (and spam or promotions folder).</p>
            <p>2. Click the verification button to confirm your account.</p>
            <p>3. Return to SliceForge to sign in and launch your workspace.</p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/login"
              className="block w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white py-3 px-4 text-sm font-bold shadow-lg shadow-cyan-600/20 transition-all hover:scale-102"
            >
              Proceed to Sign In 🚀
            </Link>

            <Link
              to="/"
              className="block w-full rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/80 text-slate-400 hover:text-white py-2.5 px-4 text-xs font-medium transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 page-enter space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
          ⚡ Free Developer Account
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          Join SliceForge
        </h1>
        <p className="text-xs text-slate-400">
          Save custom slicing presets, sync across workstations, and access cloud storage.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md space-y-5">
        {errorMessage && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-red-300 text-xs flex items-start gap-2.5">
            <span className="text-sm font-bold">⚠</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={(formSubmitEvent) => void handleRegisterSubmit(formSubmitEvent)} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="block text-xs font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              id="register-name"
              type="text"
              required
              maxLength={120}
              value={inputName}
              onChange={(changeEvent) => setInputName(changeEvent.target.value)}
              placeholder="Ada Lovelace"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              id="register-email"
              type="email"
              required
              maxLength={255}
              value={inputEmail}
              onChange={(changeEvent) => setInputEmail(changeEvent.target.value)}
              placeholder="developer@example.com"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="block text-xs font-medium text-slate-300 mb-1.5">
              Password (Min. 8 characters)
            </label>
            <input
              id="register-password"
              type="password"
              required
              minLength={8}
              value={inputPassword}
              onChange={(changeEvent) => setInputPassword(changeEvent.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="register-confirm" className="block text-xs font-medium text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <input
              id="register-confirm"
              type="password"
              required
              minLength={8}
              value={inputPasswordConfirmation}
              onChange={(changeEvent) => setInputPasswordConfirmation(changeEvent.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-2.5 px-4 text-sm font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register Account 🚀</span>
            )}
          </button>
        </form>

        <div className="border-t border-slate-800/80 pt-4 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
