import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { 
  Lock, Mail, User as UserIcon, Phone, KeyRound, 
  ArrowRight, CheckCircle2, Sparkles, AlertCircle, Eye, EyeOff 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot_password';
  initialRoleIntent?: 'org_admin' | 'volunteer';
  onRegisterSuccess?: (role: 'org_admin' | 'volunteer') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRoleIntent = 'volunteer',
  onRegisterSuccess
}) => {
  const { login, registerUser, resetPassword, users, showToast } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRoleIntent, setRegRoleIntent] = useState<'org_admin' | 'volunteer'>(initialRoleIntent);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailVal = (formData.get('loginEmail') as string) || loginEmail;
    const passwordVal = (formData.get('loginPassword') as string) || loginPassword;

    const success = login(emailVal.trim(), passwordVal.trim());
    if (success) {
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nameVal = (formData.get('name') as string) || regName;
    const emailVal = (formData.get('email') as string) || regEmail;
    const phoneVal = (formData.get('phone') as string) || regPhone;
    const passwordVal = (formData.get('password') as string) || regPassword;
    const roleVal = (formData.get('roleIntent') as any) || regRoleIntent;

    if (!nameVal.trim() || !emailVal.trim() || !passwordVal.trim()) return;

    const user = registerUser({
      name: nameVal.trim(),
      email: emailVal.trim(),
      phone: phoneVal.trim() || '(555) 000-0000',
      password: passwordVal.trim(),
      role: roleVal
    });

    onClose();
    if (onRegisterSuccess) {
      onRegisterSuccess(roleVal);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetStep === 1) {
      if (!resetEmail.trim()) return;
      setResetStep(2);
      showToast('info', 'Reset Verification Code', 'A password reset confirmation has been verified.');
    } else {
      if (!newPassword.trim()) return;
      resetPassword(resetEmail, newPassword);
      setMode('login');
      setResetStep(1);
    }
  };

  const handleQuickLogin = (email: string) => {
    login(email, 'password123');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'login' ? 'Sign In to R3Pro' :
        mode === 'register' ? 'Create Your R3Pro Account' :
        'Reset Account Password'
      }
      subtitle={
        mode === 'login' ? 'Access your organization workspaces, volunteer schedules, and tax letters' :
        mode === 'register' ? 'One account for all your organizations, events, and volunteer sign-ups' :
        'Enter your email to receive a password reset'
      }
      maxWidth="md"
    >
      <div className="space-y-5">

        {/* 1. SIGN IN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot_password')}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Switch to Register */}
            <div className="text-center pt-2 text-xs text-slate-500">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-indigo-600 hover:text-indigo-800 font-bold"
              >
                Create an Account
              </button>
            </div>

            {/* Quick 1-Click Demo Logins */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-2">
                Quick Demo Profile Logins
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('elena@lincolnpta.org')}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700"
                >
                  <span className="block font-bold text-slate-900">Elena Rostova</span>
                  <span className="text-[10px] text-indigo-600">Org Super Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('marcus@lincolnpta.org')}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700"
                >
                  <span className="block font-bold text-slate-900">Marcus Vance</span>
                  <span className="text-[10px] text-indigo-600">Event Planner / Chair</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('sarah.food@lincolnpta.org')}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700"
                >
                  <span className="block font-bold text-slate-900">Sarah Jenkins</span>
                  <span className="text-[10px] text-indigo-600">Hospitality Lead</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('david.miller@gmail.com')}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700"
                >
                  <span className="block font-bold text-slate-900">David Miller</span>
                  <span className="text-[10px] text-emerald-600">Parent / Volunteer</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 2. REGISTER / CREATE ACCOUNT MODE */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="phone"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Role Intention</label>
              <select
                name="roleIntent"
                value={regRoleIntent}
                onChange={(e) => setRegRoleIntent(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              >
                <option value="volunteer">I am a Volunteer, Parent, or Donor</option>
                <option value="org_admin">I want to Register & Lead an Organization / Events</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Free Account</span>
            </button>

            <div className="text-center pt-2 text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-indigo-600 hover:text-indigo-800 font-bold"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT / RESET PASSWORD MODE */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {resetStep === 1 ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enter Your Account Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
                >
                  Verify Email & Continue
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Email verified for <strong>{resetEmail}</strong>.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Enter New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New secure password"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
                >
                  Save New Password & Sign In
                </button>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

      </div>
    </Modal>
  );
};
