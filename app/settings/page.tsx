"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    CreditCard,
    HelpCircle,
    ArrowLeft,
    ChevronRight,
    LogOut,
    ExternalLink,
    Mail,
    MessageSquare,
    FileText,
    Check,
    AlertTriangle,
    Upload
} from 'lucide-react';

// --- Types ---

type TabId = 'account' | 'billing' | 'help';

interface TabItem {
    id: TabId;
    label: string;
    icon: React.ElementType;
    description: string;
}

// --- Configuration ---

const TABS: TabItem[] = [
    { id: 'account', label: 'Account', icon: User, description: 'Personal information and security' },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard, description: 'Manage your subscription and usage' },
    { id: 'help', label: 'Help & About', icon: HelpCircle, description: 'Support, documentation, and legal' },
];

// --- Sub-Components ---

const AccountView = () => {
    return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
                <p className="text-zinc-400">Manage your profile details and preferences.</p>
            </div>

            {/* Avatar Section */}
            <div className="mb-10 flex items-center gap-6">
                <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-700 overflow-hidden">
                        <User size={40} className="text-zinc-500" />
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={20} className="text-white" />
                    </div>
                </div>
                <div>
                    <button className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-zinc-200 transition-colors mb-2">
                        Change Avatar
                    </button>
                    <p className="text-zinc-500 text-xs">
                        JPG, GIF or PNG. 1MB max.
                    </p>
                </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6 mb-12">
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-zinc-300">Display Name</label>
                    <input
                        type="text"
                        defaultValue="Demo User"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all"
                    />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-zinc-300">Email Address</label>
                    <input
                        type="email"
                        defaultValue="user@example.com"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all"
                    />
                </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-6">
                <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Danger Zone
                </h3>
                <p className="text-zinc-400 text-sm mb-6">
                    Permanently delete your account and all of your content. This action cannot be undone.
                </p>
                <button className="text-red-400 hover:text-white hover:bg-red-600 border border-red-500/30 hover:border-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                    Delete Account
                </button>
            </div>
        </div>
    );
};

const BillingView = () => {
    return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-2">Plan & Usage</h2>
                <p className="text-zinc-400">View your current plan and usage statistics.</p>
            </div>

            {/* Current Plan Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                            Current Plan
                        </div>
                        <h3 className="text-3xl font-black text-white">Free Plan</h3>
                        <p className="text-zinc-400 mt-1">Basic features for personal use</p>
                    </div>
                    <button className="bg-white text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10">
                        Upgrade to Pro
                    </button>
                </div>

                <div className="space-y-4 relative z-10">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-zinc-300 font-medium">Monthly Generations</span>
                            <span className="text-white font-bold">15 / 50</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full w-[30%] bg-blue-500 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Method */}
            <div className="mb-10">
                <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
                <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-6 bg-zinc-700 rounded flex items-center justify-center text-[10px] font-bold text-zinc-400">
                            CARD
                        </div>
                        <span className="text-zinc-300 text-sm">No payment method added</span>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                        Add Method
                    </button>
                </div>
            </div>

             {/* Invoice History */}
             <div>
                <h3 className="text-lg font-bold text-white mb-4">Invoice History</h3>
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
                   <div className="p-8 text-center">
                        <p className="text-zinc-500 text-sm">No invoices found</p>
                   </div>
                </div>
            </div>
        </div>
    );
};

const HelpView = () => {
    return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-2">Support & About</h2>
                <p className="text-zinc-400">Get help, find documentation, or contact us.</p>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <button className="flex flex-col items-start gap-3 p-4 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all group text-left">
                    <div className="p-2 bg-zinc-800 rounded-lg group-hover:scale-110 transition-transform">
                        <FileText size={20} className="text-zinc-300" />
                    </div>
                    <div>
                        <span className="block text-white font-bold text-sm">Documentation</span>
                        <span className="text-zinc-500 text-xs">Read the guides</span>
                    </div>
                </button>
                <button className="flex flex-col items-start gap-3 p-4 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all group text-left">
                    <div className="p-2 bg-zinc-800 rounded-lg group-hover:scale-110 transition-transform">
                        <MessageSquare size={20} className="text-zinc-300" />
                    </div>
                    <div>
                        <span className="block text-white font-bold text-sm">Community</span>
                        <span className="text-zinc-500 text-xs">Join Discord</span>
                    </div>
                </button>
            </div>

            {/* Contact Options */}
            <div className="mb-12">
                <h3 className="text-lg font-bold text-white mb-4">Contact</h3>
                <div className="space-y-3">
                     <button className="w-full flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors group">
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                            <span className="text-zinc-300 group-hover:text-white transition-colors">Email Support</span>
                        </div>
                        <ExternalLink size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                     </button>
                     <button className="w-full flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors group">
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                            <span className="text-zinc-300 group-hover:text-white transition-colors">Report a Bug</span>
                        </div>
                        <ExternalLink size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                     </button>
                </div>
            </div>

             {/* Footer Info */}
             <div className="flex flex-col gap-4 border-t border-zinc-800 pt-8">
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>Shots v1.0.0</span>
                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                    <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                    <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
                </div>
             </div>
        </div>
    );
};


// --- Main Page Component ---

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabId>('account');

    return (
        <div className="flex w-screen h-screen overflow-hidden p-6 gap-6 relative">
            
            {/* Floating Sidebar */}
            <aside className="w-[300px] h-full flex flex-col bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden shrink-0 z-10">
                {/* Header / Back Button */}
                <div className="p-8 pb-4">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium mb-8 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Editor
                    </Link>
                    <h1 className="text-3xl font-black tracking-tight">Settings</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 group relative border
                                    ${isActive 
                                        ? 'bg-white/10 text-white border-white/10 shadow-lg' 
                                        : 'border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                                    }
                                `}
                            >
                                <Icon size={22} className={isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'} />
                                <div>
                                    <span className="block text-sm font-bold">{tab.label}</span>
                                    <span className={`text-[10px] uppercase tracking-wider font-medium transition-colors ${isActive ? 'text-zinc-400' : 'text-zinc-600 group-hover:text-zinc-500'}`}>
                                        {tab.description}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-6 border-t border-white/5">
                    <button className="w-full flex items-center justify-center gap-3 px-4 py-4 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all text-sm font-bold group border border-transparent hover:border-red-500/20">
                        <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Floating Content Area */}
            <main className="flex-1 h-full bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10">
                <div className="h-full overflow-y-auto scroll-smooth">
                    <div className="max-w-4xl mx-auto py-16 px-12">
                       {activeTab === 'account' && <AccountView />}
                       {activeTab === 'billing' && <BillingView />}
                       {activeTab === 'help' && <HelpView />}
                    </div>
                </div>
            </main>
        </div>
    );
}
