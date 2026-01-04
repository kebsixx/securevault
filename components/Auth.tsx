import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, KeyRound, X, Bell } from 'lucide-react';

interface AuthProps {
  onAuthenticated: (email: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showFakeNotification, setShowFakeNotification] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    
    // Simulate API call latency then show fake email notification
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setShowFakeNotification(true);
      
      // Auto-hide notification after 20 seconds
      setTimeout(() => setShowFakeNotification(false), 20000);
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      setError('Invalid OTP code');
      return;
    }
    onAuthenticated(email);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 relative overflow-hidden">
      
      {/* SIMULATED EMAIL NOTIFICATION (Untuk Demo) */}
      {showFakeNotification && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full bg-white rounded-xl shadow-2xl border-l-4 border-indigo-600 p-4 animate-in slide-in-from-right fade-in duration-700">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 p-1.5 rounded-full text-indigo-600">
                        <Mail size={16} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">New Email Received</p>
                        <p className="text-[10px] text-gray-500">From: SecureVault Security</p>
                    </div>
                </div>
                <button onClick={() => setShowFakeNotification(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={16} />
                </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Your login verification code is:</p>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-bold text-gray-900 tracking-widest">{generatedOtp}</span>
                    <button 
                        onClick={() => {navigator.clipboard.writeText(generatedOtp);}}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 bg-indigo-50 rounded border border-indigo-100"
                    >
                        Copy
                    </button>
                </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-right italic">
              *Simulation: Real emails require a backend server.
            </p>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            SecureVault Login
          </h1>
          <p className="text-gray-500 text-center mt-2 text-sm">
            Enter your email to access your session. 
            <br/>
            <span className="text-red-500 font-medium">Warning: Data is cleared on refresh.</span>
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 ml-1 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="name@example.com"
                  autoFocus
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
            >
              {isLoading ? 'Sending Code...' : 'Send Login Code'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 ml-1 uppercase tracking-wide">
                Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all tracking-widest font-mono text-lg"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Code sent to {email}</p>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mt-4"
            >
              Verify & Enter
              <ArrowRight size={18} />
            </button>
            
            <button 
              type="button"
              onClick={() => { setStep('email'); setOtp(''); setError(''); setShowFakeNotification(false); }}
              className="w-full text-center text-sm text-gray-500 hover:text-indigo-600 mt-2"
            >
              Change Email
            </button>
          </form>
        )}
      </div>
      <div className="mt-8 text-center text-gray-400 text-xs max-w-sm">
        <p>This vault is session-based. Passwords are stored in memory and verified via OTP. Export your data before closing the tab.</p>
      </div>
    </div>
  );
};