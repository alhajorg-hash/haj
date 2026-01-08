
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ShieldCheck, Key, Undo2, Fingerprint, 
  ShieldAlert, CheckCircle2, X, Mail, Radio, 
  Terminal, Shield, Power, Clock as ClockIcon,
  MessageCircle
} from 'lucide-react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
  mockUsers: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  businessName: string;
  adminWhatsApp: string;
}

type LoginMode = 'login' | 'forgot' | 'verify' | 'reset';

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, mockUsers, setUsers, businessName, adminWhatsApp }) => {
  const [mode, setMode] = useState<LoginMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showIncomingMail, setShowIncomingMail] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Verification Failed: Identity mismatch.');
        setIsLoading(false);
      }
    }, 1200);
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === resetEmail);
      if (user) {
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(newCode);
        setMode('verify');
        setTimeout(() => setShowIncomingMail(true), 800);
      } else {
        setError('Identity not found in node registry.');
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode === generatedCode) {
      setMode('reset');
      setError('');
      setShowIncomingMail(false);
    } else {
      setError('Signal Corrupted: Key invalid.');
    }
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Sync Error: Passwords must match.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setUsers(prev => prev.map(u => u.email === resetEmail ? { ...u, password: newPassword } : u));
      setIsLoading(false);
      setMode('login');
      setEmail(resetEmail);
      setPassword('');
      setError('');
    }, 1500);
  };

  // Convert local 0... numbers to international 233... for WhatsApp API
  const cleanWhatsAppNumber = adminWhatsApp.startsWith('0') 
    ? `233${adminWhatsApp.substring(1)}` 
    : adminWhatsApp.replace(/\+/g, '');

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      
      {/* WhatsApp Support Button */}
      <a 
        href={`https://wa.me/${cleanWhatsAppNumber}`}
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-full shadow-[0_10px_40px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all group"
      >
        <div className="relative">
          <MessageCircle size={24} className="fill-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
        </div>
        <div className="flex flex-col">
           <span className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Support</span>
           <span className="text-xs font-bold whitespace-nowrap">Contact Admin</span>
        </div>
      </a>

      {/* Dynamic Satellite Notification */}
      {showIncomingMail && (
        <div className="fixed top-6 right-6 z-[200] w-full max-w-sm animate-in slide-in-from-right-8 duration-500">
          <div className="bg-indigo-600 text-white p-5 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/20">
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <Radio size={24} className="animate-pulse" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Reset Signal Received</p>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-xl font-black tracking-[0.3em]">{generatedCode}</span>
                </div>
             </div>
             <button onClick={() => setShowIncomingMail(false)} className="w-8 h-8 flex items-center justify-center bg-black/10 rounded-full hover:bg-black/20 transition-all">
                <X size={18} />
             </button>
          </div>
        </div>
      )}

      {/* Main Dual-Pane Container */}
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in duration-700">
        
        {/* Left Pane: Branding & Visualization (Blue Sidebar) */}
        <div className="relative hidden lg:flex flex-col justify-center p-16 text-white overflow-hidden">
          {/* Background Gradient & Waves */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5] via-[#3b82f6] to-[#2563eb] z-0"></div>
          
          {/* Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.1] z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40 L40 40 L40 0 M0 0 L0 40' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")` }}></div>
          
          {/* Abstract Waves Style Circles */}
          <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] z-20 pointer-events-none">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px]"></div>
             <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[80px]"></div>
             <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white/20 rounded-full blur-[2px]"></div>
             <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-white/40 rounded-full"></div>
          </div>

          {/* Branding Content */}
          <div className="relative z-30 space-y-4">
             <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                   <ShieldCheck size={20} />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.4em] opacity-80">{businessName}</span>
             </div>

             <div className="space-y-1">
                <p className="text-lg font-bold opacity-80 tracking-tight">Nice to see you again</p>
                <h1 className="text-6xl font-black tracking-tighter leading-none mb-8">WELCOME<br/>BACK</h1>
                <div className="w-16 h-1.5 bg-white rounded-full mb-8"></div>
                <p className="text-sm font-medium opacity-70 leading-relaxed max-w-sm">
                  Access your secure terminal nodes and manage your regional inventory with live strategic insights.
                </p>
             </div>
          </div>

          {/* Bottom Terminal Info */}
          <div className="absolute bottom-12 left-16 z-30 flex items-center gap-6">
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase opacity-40 mb-1">Terminal Time</span>
                <span className="text-xs font-bold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
             </div>
             <div className="w-[1px] h-6 bg-white/20"></div>
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase opacity-40 mb-1">Active Node</span>
                <span className="text-xs font-bold uppercase">Accra-01</span>
             </div>
          </div>
        </div>

        {/* Right Pane: Login Form (White Section) */}
        <div className="p-8 md:p-20 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            {mode === 'login' && (
              <div className="animate-in fade-in duration-500">
                <header className="mb-12">
                  <h2 className="text-3xl font-black text-[#3b82f6] tracking-tight mb-2">Login Account</h2>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    Identify your role to begin your authorized session. System activity is logged.
                  </p>
                </header>

                {error && (
                  <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600">
                    <ShieldAlert size={20} />
                    <p className="text-[10px] font-black uppercase tracking-tight">{error}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-1">
                    <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3b82f6] rounded-l-md transition-all group-focus-within:w-1.5"></div>
                      <input 
                        required
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email ID"
                        className="w-full bg-slate-50 border-none rounded-r-xl py-4 px-6 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3b82f6] rounded-l-md transition-all group-focus-within:w-1.5"></div>
                      <input 
                        required
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-slate-50 border-none rounded-r-xl py-4 px-6 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Keep me signed in</span>
                    </label>
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs font-bold text-[#3b82f6] hover:underline">Forgot Password?</button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-[60px] bg-[#3b82f6] text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#2563eb] shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? 'VERIFYING...' : 'SIGN IN'}
                  </button>
                </form>

                <footer className="mt-16 text-center">
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                     Global Retail Infrastructure v8.4.2
                   </p>
                </footer>
              </div>
            )}

            {mode === 'forgot' && (
              <div className="animate-in slide-in-from-right-8 duration-500">
                <button onClick={() => setMode('login')} className="flex items-center gap-2 text-slate-400 hover:text-[#3b82f6] mb-10 transition-all group">
                  <Undo2 size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Back to Entry</span>
                </button>
                <header className="mb-12">
                  <h2 className="text-3xl font-black text-[#3b82f6] tracking-tight mb-2">Recover ID</h2>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">Enter your registered ID to receive a satellite verification key.</p>
                </header>

                <form onSubmit={handleRequestReset} className="space-y-8">
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3b82f6] rounded-l-md"></div>
                    <input 
                      required
                      type="email" 
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Registered Email"
                      className="w-full bg-slate-50 border-none rounded-r-xl py-4 px-6 text-sm font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-5 bg-[#3b82f6] text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#2563eb] shadow-xl transition-all active:scale-[0.98]"
                  >
                    {isLoading ? 'TRANSMITTING...' : 'SEND RESET KEY'}
                  </button>
                </form>
              </div>
            )}

            {mode === 'verify' && (
              <div className="animate-in slide-in-from-right-8 duration-500">
                <header className="mb-10 text-center">
                  <h2 className="text-3xl font-black text-[#3b82f6] tracking-tight mb-4">Input Key</h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Received at: {resetEmail}</p>
                </header>

                <form onSubmit={handleVerifyCode} className="space-y-10">
                  <div className="flex justify-center">
                    <input 
                      required
                      autoFocus
                      type="text" 
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="••••••"
                      className="w-full bg-slate-50 border-none rounded-3xl py-8 text-center text-5xl font-black tracking-[0.5em] text-[#3b82f6] outline-none"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full py-5 bg-[#3b82f6] text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl"
                  >
                    AUTHORIZE LINK
                  </button>
                </form>
              </div>
            )}

            {mode === 'reset' && (
              <div className="animate-in slide-in-from-right-8 duration-500">
                <header className="mb-10">
                  <h2 className="text-3xl font-black text-[#3b82f6] tracking-tight mb-2">New Passkey</h2>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">Establish a new master passphrase for terminal sessions.</p>
                </header>

                <form onSubmit={handleSetNewPassword} className="space-y-6">
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3b82f6] rounded-l-md"></div>
                    <input 
                      required
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-full bg-slate-50 border-none rounded-r-xl py-4 px-6 text-sm font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3b82f6] rounded-l-md"></div>
                    <input 
                      required
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full bg-slate-50 border-none rounded-r-xl py-4 px-6 text-sm font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-5 bg-emerald-600 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-emerald-700 shadow-xl transition-all active:scale-[0.98]"
                  >
                    {isLoading ? 'SYNCING...' : 'UPDATE PASSPHRASE'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
