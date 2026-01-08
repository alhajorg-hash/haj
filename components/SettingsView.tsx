
import React, { useState } from 'react';
import { 
  Save, Globe, Smartphone, Bell, Shield, Database, 
  Lock, UserCog, History, Key, CheckCircle2, Building2, 
  MessageCircle, Sparkles, Layout, Facebook, Instagram, Twitter, 
  MapPin, Megaphone, Palette
} from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsViewProps {
  initialSettings: SystemSettings;
  onSave: (settings: SystemSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialSettings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<SystemSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'storefront'>('system');

  const handleToggle = (key: keyof SystemSettings) => {
    if (typeof localSettings[key] === 'boolean') {
      setLocalSettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const handleChange = (key: keyof SystemSettings, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      onSave(localSettings);
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {showToast && (
        <div className="fixed top-20 right-8 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <CheckCircle2 size={20} />
          <p className="font-bold text-sm">Settings applied globally!</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Configuration Hub</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage enterprise policies and customer site experience.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
             <button 
               onClick={() => setActiveTab('system')}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-slate-900 text-white dark:bg-indigo-600' : 'text-slate-400 hover:text-slate-800'}`}
             >
               System
             </button>
             <button 
               onClick={() => setActiveTab('storefront')}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'storefront' ? 'bg-slate-900 text-white dark:bg-indigo-600' : 'text-slate-400 hover:text-slate-800'}`}
             >
               Storefront
             </button>
           </div>
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
           >
             {isSaving ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <Save size={18} />
             )}
             {isSaving ? 'Applying...' : 'Save All Changes'}
           </button>
        </div>
      </div>

      {activeTab === 'system' ? (
        <div className="grid grid-cols-1 gap-6">
          <SettingsCard icon={<Building2 size={20} />} title="System Branding">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Master System Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={localSettings.businessName}
                      onChange={(e) => handleChange('businessName', e.target.value)}
                      placeholder="e.g. GeminiPOS Pro"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-black focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                    />
                    {localSettings.businessName === 'GeminiPOS Pro' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-md">
                        <Sparkles size={10} />
                        <span className="text-[8px] font-black uppercase">Official</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Support WhatsApp</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#25D366]">
                      <MessageCircle size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={localSettings.adminWhatsApp}
                      onChange={(e) => handleChange('adminWhatsApp', e.target.value)}
                      placeholder="e.g. 0248074898"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>
             </div>
          </SettingsCard>

          <SettingsCard icon={<Lock size={20} />} title="Permission Management" highlight>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PermissionToggle 
                  label="Manager Access to Users" 
                  description="Allow managers to view and edit staff list." 
                  active={localSettings.managerAccessToUsers}
                  onToggle={() => handleToggle('managerAccessToUsers')}
                />
                <PermissionToggle 
                  label="Cashier Access to Inventory" 
                  description="Allow cashiers to view stock and pricing." 
                  active={localSettings.cashierAccessToInventory}
                  onToggle={() => handleToggle('cashierAccessToInventory')}
                />
                <PermissionToggle 
                  label="Delete Transaction Logs" 
                  description="Allow removal of history records." 
                  active={localSettings.allowTransactionDeletion}
                  onToggle={() => handleToggle('allowTransactionDeletion')}
                />
                <PermissionToggle 
                  label="Modify System Currency" 
                  description="Lock currency to prevent pricing errors." 
                  active={localSettings.lockSystemCurrency}
                  onToggle={() => handleToggle('lockSystemCurrency')}
                />
              </div>
            </div>
          </SettingsCard>

          <SettingsCard icon={<Globe size={20} />} title="Localization & Market">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Store Currency</label>
                <select 
                  value={localSettings.baseCurrency}
                  onChange={(e) => handleChange('baseCurrency', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                >
                  <option>GHS (GH₵)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Language</label>
                <select 
                  value={localSettings.primaryLanguage}
                  onChange={(e) => handleChange('primaryLanguage', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                >
                  <option>English (Ghana)</option>
                  <option>English (US)</option>
                  <option>Twi</option>
                </select>
              </div>
            </div>
          </SettingsCard>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
           <SettingsCard icon={<Layout size={20} />} title="Hero Section">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Main Hero Headline</label>
                    <input 
                      type="text" 
                      value={localSettings.storefrontHeroTitle}
                      onChange={(e) => handleChange('storefrontHeroTitle', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-black focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub-headline Description</label>
                    <textarea 
                      value={localSettings.storefrontHeroSubtitle}
                      onChange={(e) => handleChange('storefrontHeroSubtitle', e.target.value)}
                      className="w-full h-24 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white resize-none"
                    />
                 </div>
              </div>
           </SettingsCard>

           <SettingsCard icon={<Megaphone size={20} />} title="Promotions & Banners">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Top Announcement Banner</label>
                    <input 
                      type="text" 
                      value={localSettings.storefrontPromoBanner}
                      onChange={(e) => handleChange('storefrontPromoBanner', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mid-Page Sale Title</label>
                    <input 
                      type="text" 
                      value={localSettings.storefrontPromoTitle}
                      onChange={(e) => handleChange('storefrontPromoTitle', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-black focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sale Highlight (Price/Off)</label>
                    <input 
                      type="text" 
                      value={localSettings.storefrontPromoHighlight}
                      onChange={(e) => handleChange('storefrontPromoHighlight', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-indigo-400"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sale Description</label>
                    <input 
                      type="text" 
                      value={localSettings.storefrontPromoDesc}
                      onChange={(e) => handleChange('storefrontPromoDesc', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                    />
                 </div>
              </div>
           </SettingsCard>

           <SettingsCard icon={<MapPin size={20} />} title="Contact & Socials">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Physical Location</label>
                    <input 
                      type="text" 
                      value={localSettings.storefrontLocation}
                      onChange={(e) => handleChange('storefrontLocation', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                    />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Instagram size={12} /> Instagram Handle</label>
                      <input 
                        type="text" 
                        value={localSettings.storefrontInstagram}
                        onChange={(e) => handleChange('storefrontInstagram', e.target.value)}
                        placeholder="@username"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Facebook size={12} /> Facebook URL</label>
                      <input 
                        type="text" 
                        value={localSettings.storefrontFacebook}
                        onChange={(e) => handleChange('storefrontFacebook', e.target.value)}
                        placeholder="facebook.com/..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Twitter size={12} /> Twitter Handle</label>
                      <input 
                        type="text" 
                        value={localSettings.storefrontTwitter}
                        onChange={(e) => handleChange('storefrontTwitter', e.target.value)}
                        placeholder="@username"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                      />
                    </div>
                 </div>
              </div>
           </SettingsCard>
        </div>
      )}
    </div>
  );
};

const PermissionToggle: React.FC<{ label: string; description: string; active: boolean; onToggle: () => void }> = ({ label, description, active, onToggle }) => (
  <div 
    onClick={onToggle}
    className={`flex items-center justify-between p-4 bg-white dark:bg-slate-900 border rounded-2xl transition-all cursor-pointer group ${active ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
  >
    <div className="flex-1 pr-4">
      <div className="flex items-center gap-2">
        <p className={`font-bold text-sm ${active ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-200'}`}>{label}</p>
        {active && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
      </div>
      <p className="text-[10px] text-slate-400 font-medium leading-tight">{description}</p>
    </div>
    <div className={`w-10 h-5 rounded-full relative transition-all duration-300 shadow-inner ${active ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
  </div>
);

const SettingsCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; highlight?: boolean }> = ({ icon, title, children, highlight }) => (
  <div className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-sm transition-all ${highlight ? 'border-indigo-100 dark:border-indigo-900 ring-4 ring-indigo-50/50 dark:ring-indigo-900/30' : 'border-slate-100 dark:border-slate-800 hover:shadow-md'}`}>
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 ${highlight ? 'bg-indigo-600 text-white' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'} rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100/20`}>
        {icon}
      </div>
      <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);
