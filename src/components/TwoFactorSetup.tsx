import React, { useState } from 'react';
import api from '../lib/api';

interface TwoFactorSetupProps {
  initialEnabled?: boolean;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ initialEnabled }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isSetup, setIsSetup] = useState(!!initialEnabled);
  const [error, setError] = useState('');

  // Sync state if prop changes (e.g. after profile fetch)
  React.useEffect(() => {
    if (initialEnabled !== undefined) {
      setIsSetup(initialEnabled);
    }
  }, [initialEnabled]);

  const generateSecret = async () => {
    try {
      const res = await api.post('/auth/2fa/generate');
      setQrCodeUrl(res.data.data.qrCodeUrl);
      setSecret(res.data.data.secret);
      setError('');
    } catch (err) {
      setError('Failed to generate 2FA secret');
    }
  };

  const turnOn2FA = async () => {
    if (!code) {
      setError('Please enter the verification code');
      return;
    }
    try {
      await api.post('/auth/2fa/turn-on', { twoFactorCode: code });
      setIsSetup(true);
      setQrCodeUrl(''); // Clear setup UI after success
      setSecret('');
      setCode('');
      setError('');
      alert("2FA Enabled Successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code');
    }
  };

  const startRenewal = () => {
    setIsSetup(false);
    generateSecret();
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 mt-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">Two-Factor Authentication (2FA)</h3>
          <p className="text-sm text-slate-500">Secure your account with an additional verification step using Google Authenticator.</p>
        </div>
        {isSetup && (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
            ACTIVE
          </span>
        )}
      </div>
      
      {isSetup ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">2FA is actively protecting your account.</p>
              <p className="text-sm text-green-600 opacity-80">You will be asked for a code during login.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={startRenewal}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors border border-slate-200 text-sm"
            >
              Renew / Reset 2FA
            </button>
            <p className="text-xs text-slate-400">If you lost your device or want to switch apps, click here to set up again.</p>
          </div>
        </div>
      ) : (
        <>
          {!qrCodeUrl ? (
            <button onClick={generateSecret} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg active:transform active:scale-95 transition-all">
              Initialize 2FA Setup
            </button>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center">
                  <p className="text-sm font-bold text-slate-700 mb-4 border-b pb-2 w-full text-center">1. Scan QR Code</p>
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 border border-slate-200 bg-white p-3 rounded-lg shadow-inner" />
                  <div className="mt-4 w-full">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Manual Secret Key</p>
                    <p className="text-xs font-mono bg-white p-2 border rounded border-dashed text-slate-600 break-all">{secret}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-700">2. Verify Setup</p>
                  <p className="text-xs text-slate-500">Enter the 6-digit code from your authenticator app to complete the setup.</p>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full border-2 px-4 py-3 rounded-xl text-2xl font-mono text-center tracking-widest focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      maxLength={6}
                    />
                    <button 
                      onClick={turnOn2FA} 
                      className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                    >
                      Verify & Enable 2FA
                    </button>
                    {initialEnabled && (
                      <button 
                        onClick={() => setIsSetup(true)}
                        className="w-full py-2 text-slate-400 text-xs font-medium hover:text-slate-600"
                      >
                        Cancel Renewal
                      </button>
                    )}
                  </div>
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg animate-bounce">
                      ⚠️ {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

