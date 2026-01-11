"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import useSWR from 'swr';
import { ConfirmationModal, useConfirmation } from '@/components/ConfirmationModal';
import { FeedbackModal } from '@/components/FeedbackModal';
import { NotificationToast, useNotification } from '@/components/Notification';
import {
    User as UserIcon,
    CreditCard,
    HelpCircle,
    ArrowLeft,
    LogOut,
    ExternalLink,
    Mail,
    MessageSquare,
    FileText,
    Check,
    AlertTriangle,
    Upload,
    Zap
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
    { id: 'account', label: 'Account', icon: UserIcon, description: 'Personal information and security' },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard, description: 'Manage your subscription and usage' },
    { id: 'help', label: 'Help & About', icon: HelpCircle, description: 'Support, documentation, and legal' },
];

// --- Sub-Components ---

const AccountView = ({ onDelete }: { onDelete: () => void }) => {
    const { data: session } = useSession();
    const user = session?.user;
    const isOAuth = user?.image?.includes('googleusercontent.com') || !!user?.image;

    return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
                <p className="text-zinc-400">Manage your profile details and preferences.</p>
            </div>

            {/* Avatar Section */}
            <div className="mb-10 flex items-center gap-6">
                <div className={`relative group ${isOAuth ? 'cursor-default' : 'cursor-pointer'}`}>
                    <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-700 overflow-hidden">
                        {user?.image ? (
                            <Image
                                src={user.image}
                                alt={user.name || "Avatar"}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <UserIcon size={40} className="text-zinc-500" />
                        )}
                    </div>
                    {!isOAuth && (
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload size={20} className="text-white" />
                        </div>
                    )}
                </div>
                <div>
                    {!isOAuth ? (
                        <>
                            <button className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-zinc-200 transition-colors mb-2">
                                Change Avatar
                            </button>
                            <p className="text-zinc-500 text-xs">
                                JPG, GIF or PNG. 1MB max.
                            </p>
                        </>
                    ) : (
                        <p className="text-zinc-500 text-sm italic">
                            Avatar managed via Google Account
                        </p>
                    )}
                </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6 mb-12">
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-zinc-300">Display Name</label>
                    <input
                        type="text"
                        defaultValue={user?.name || ""}
                        readOnly={isOAuth}
                        className={`w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none transition-all ${isOAuth ? 'opacity-60 cursor-not-allowed' : 'focus:border-white/20 focus:ring-1 focus:ring-white/20'}`}
                    />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-zinc-300">Email Address</label>
                    <input
                        type="email"
                        defaultValue={user?.email || ""}
                        readOnly
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white opacity-60 cursor-not-allowed outline-none"
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
                <button
                    onClick={onDelete}
                    className="text-red-400 hover:text-white hover:bg-red-600 border border-red-500/30 hover:border-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
};

const BillingView = ({ credits }: { credits: number }) => {
    return (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight">Billing & Plans</h2>
                    <p className="text-zinc-400 text-xs sm:text-base">Add credits to your account to keep generating mockups.</p>
                </div>

                <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-4 sm:p-0 rounded-2xl border border-white/5 sm:border-none">
                    <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Available Balance</div>
                    <div className="flex items-center gap-2 sm:justify-end">
                        <Zap size={18} className="text-blue-500" />
                        <span className="text-2xl sm:text-3xl font-black text-white">{credits}</span>
                        <span className="text-zinc-400 text-xs sm:text-sm font-bold">Credits</span>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="mb-12">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Starter Plan */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col hover:border-zinc-700 transition-all group">
                        <div className="mb-6 sm:mb-8">
                            <h4 className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs mb-1">Starter</h4>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl sm:text-4xl font-black text-white">$10</span>
                                <span className="text-zinc-500 text-xs sm:text-sm">one-time</span>
                            </div>
                        </div>
                        <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-1">
                            <li className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Check size={12} className="text-blue-500" strokeWidth={3} />
                                </div>
                                10 Generation Credits
                            </li>
                            <li className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Check size={12} className="text-blue-500" strokeWidth={3} />
                                </div>
                                Full Feature Access
                            </li>
                            <li className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Check size={12} className="text-blue-500" strokeWidth={3} />
                                </div>
                                Lifetime Assets
                            </li>
                        </ul>
                        <button className="w-full py-3 sm:py-4 bg-white text-black rounded-2xl font-black text-xs sm:text-sm hover:bg-zinc-200 transition-all active:scale-95">
                            Buy Credits
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-6 sm:p-8 flex flex-col relative overflow-hidden group hover:border-blue-500/40 transition-all">
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 sm:px-4 py-1 sm:py-1.5 rounded-bl-2xl">
                            Best Value
                        </div>
                        <div className="mb-6 sm:mb-8">
                            <h4 className="text-blue-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs mb-1">Professional</h4>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl sm:text-4xl font-black text-white">$50</span>
                                <span className="text-zinc-500 text-xs sm:text-sm">one-time</span>
                            </div>
                        </div>
                        <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-1">
                            <li className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Check size={12} className="text-blue-500" strokeWidth={3} />
                                </div>
                                <span className="font-bold text-white">70 Generation Credits</span>
                            </li>
                            <li className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Check size={12} className="text-blue-500" strokeWidth={3} />
                                0</div>
                                Full Feature Access
                            </li>
                            <li className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Check size={12} className="text-blue-500" strokeWidth={3} />
                                </div>
                                Lifetime Assets
                            </li>
                        </ul>
                        <button className="w-full py-3 sm:py-4 bg-blue-600 text-white rounded-2xl font-black text-xs sm:text-sm hover:bg-blue-500 transition-all active:scale-95">
                            Buy Credits
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Method */}
            <div className="mb-12">
                <h3 className="text-base sm:text-lg font-bold text-white mb-4">Payment Method</h3>
                <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-7 sm:w-12 sm:h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-[8px] sm:text-[10px] font-black text-zinc-500 border border-white/5">
                            CARD
                        </div>
                        <span className="text-zinc-400 text-xs sm:text-sm font-medium">No payment method added yet.</span>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-bold transition-colors">
                        Add Method
                    </button>
                </div>
            </div>
        </div>
    );
};

const HelpView = ({ onOpenFeedback }: { onOpenFeedback: () => void }) => {
    return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-2">Support & About</h2>
                <p className="text-zinc-400">Get help, find documentation, or contact us.</p>
            </div>

            {/* Contact Options */}
            <div className="mb-12">
                <h3 className="text-lg font-bold text-white mb-4">Contact</h3>
                <div className="space-y-3">
                    <a 
                        href="mailto:chetangonuguntla0@gmail.com?subject=shots88 - Support Request"
                        className="w-full flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                            <span className="text-zinc-300 group-hover:text-white transition-colors">Email Support</span>
                        </div>
                        <ExternalLink size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </a>
                    <button 
                        onClick={onOpenFeedback}
                        className="w-full flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                            <span className="text-zinc-300 group-hover:text-white transition-colors">Report a Bug / Feedback</span>
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
                    <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                    <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---

function SettingsContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const validTabs: TabId[] = ['account', 'billing', 'help'];
    const initialTab = (tabParam && validTabs.includes(tabParam as TabId)) ? (tabParam as TabId) : 'account';

    const [activeTab, setActiveTab] = useState<TabId>(initialTab);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const { notification, showNotification, hideNotification } = useNotification();
    const { confirmConfig, confirm, closeConfirm, handleConfirm } = useConfirmation();

    // Use same SWR key as dashboard - shares cache automatically
    const fetcher = (url: string) => fetch(url).then(res => res.json());
    const { data: creditsData } = useSWR('/api/credits', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        dedupingInterval: 60000,
    });
    const credits = creditsData?.credits ?? 0;

    const handleDeleteAccount = () => {
        confirm({
            title: "Delete Account",
            message: "Are you sure you want to permanently delete your account? This action cannot be undone and you will lose all your generated assets.",
            isDanger: true,
            confirmLabel: "Delete Forever",
            onConfirm: async () => {
                try {
                    const res = await fetch("/api/user/delete", { method: "DELETE" });
                    if (!res.ok) throw new Error("Failed to delete account");

                    showNotification("Account deleted successfully", "success");
                    // Sign out and redirect
                    setTimeout(() => signOut({ callbackUrl: "/" }), 1000);
                } catch (error) {
                    console.error(error);
                    showNotification("Failed to delete account. Please try again.", "error");
                }
            }
        });
    };

    return (
        <div className="flex flex-col sm:flex-row w-screen h-screen overflow-hidden p-4 sm:p-6 gap-4 sm:gap-6 relative">
            <NotificationToast
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={hideNotification}
            />
            <ConfirmationModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmLabel={confirmConfig.confirmLabel}
                cancelLabel={confirmConfig.cancelLabel}
                isDanger={confirmConfig.isDanger}
                onConfirm={handleConfirm}
                onCancel={closeConfirm}
            />
            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />

            {/* Floating Sidebar / Top Tab Bar */}
            <aside className="w-full sm:w-[300px] h-auto sm:h-full flex flex-col bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/5 rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden shrink-0 z-10">
                {/* Header / Back Button */}
                <div className="p-4 sm:p-8 sm:pb-4 relative flex items-center justify-center sm:block">
                    <Link
                        href="/dash"
                        className="absolute left-4 sm:relative sm:left-0 inline-flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium sm:mb-8 group bg-white/5 sm:bg-transparent rounded-full sm:rounded-none"
                        title="Back to Editor"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back to Editor</span>
                    </Link>
                    <h1 className="text-lg sm:text-3xl font-black tracking-tight text-center sm:text-left">Settings</h1>
                </div>

                {/* Navigation */}
                <nav className="flex sm:flex-col sm:flex-1 px-2 sm:px-4 space-x-1 sm:space-x-0 sm:space-y-2 py-2 sm:py-4">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex-1 sm:flex-none flex sm:w-full items-center justify-center sm:justify-start gap-1.5 sm:gap-4 px-2 sm:px-5 py-2 sm:py-4 rounded-xl sm:rounded-2xl text-left transition-all duration-300 group relative border
                                    ${isActive
                                        ? 'bg-white/10 text-white border-white/10 shadow-lg'
                                        : 'border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                                    }
                                `}
                            >
                                <Icon size={18} className={`sm:w-[22px] sm:h-[22px] ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                <div>
                                    <span className="block text-[10px] sm:text-sm font-bold">{tab.label}</span>
                                    <span className={`hidden sm:block text-[10px] uppercase tracking-wider font-medium transition-colors ${isActive ? 'text-zinc-400' : 'text-zinc-600 group-hover:text-zinc-500'}`}>
                                        {tab.description}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="hidden sm:block p-6 border-t border-white/5">
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-3 px-4 py-4 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all text-sm font-bold group border border-transparent hover:border-red-500/20"
                    >
                        <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Floating Content Area */}
            <main className="flex-1 h-full bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/5 rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10">
                <div className="h-full overflow-y-auto scroll-smooth">
                    <div className="max-w-4xl mx-auto py-8 px-6 sm:py-16 sm:px-12">
                        {activeTab === 'account' && <AccountView onDelete={handleDeleteAccount} />}
                        {activeTab === 'billing' && <BillingView credits={credits} />}
                        {activeTab === 'help' && <HelpView onOpenFeedback={() => setIsFeedbackOpen(true)} />}
                        
                        {/* Mobile Log Out Button */}
                        <div className="sm:hidden mt-8 pt-8 border-t border-white/10">
                             <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold border border-red-500/20"
                            >
                                <LogOut size={16} />
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="flex w-screen h-screen bg-black items-center justify-center text-white">Loading...</div>}>
            <SettingsContent />
        </Suspense>
    );
}