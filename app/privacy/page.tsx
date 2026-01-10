import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <main className="relative min-h-screen text-white overflow-x-hidden">
            <div className="max-w-3xl mx-auto px-6 py-24 relative z-10">
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 group text-sm"
                >
                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to home
                </Link>

                <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-zinc-500 mb-12 text-sm font-medium">Last updated: January 11, 2026</p>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">1</span>
                            What we collect
                        </h2>
                        <div className="pl-11 space-y-4 text-zinc-400 leading-relaxed">
                            <p>When you sign in with Google, we collect:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Name</li>
                                <li>Email address</li>
                                <li>Profile picture</li>
                            </ul>
                            <p className="text-zinc-500 italic">Nothing else. No creepy tracking. No selling your soul.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">2</span>
                            Why we collect it
                        </h2>
                        <div className="pl-11 space-y-4 text-zinc-400 leading-relaxed">
                            <p>We use this data only for:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Account creation</li>
                                <li>Login authentication</li>
                                <li>Basic user identification inside the app</li>
                            </ul>
                            <p className="text-zinc-500 italic">That’s it. No ads. No spam. No shady stuff.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">3</span>
                            How your data is stored
                        </h2>
                        <div className="pl-11 space-y-4 text-zinc-400 leading-relaxed">
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Stored securely using SookBase</li>
                                <li>Access controlled</li>
                                <li>Rate limiting enabled</li>
                                <li>No plaintext passwords (because we’re not idiots)</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">4</span>
                            How your data is used
                        </h2>
                        <div className="pl-11 space-y-4 text-zinc-400 leading-relaxed">
                            <p>Your uploaded screenshots are:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Processed using OpenCV</li>
                                <li>Enhanced using Google Gemini API</li>
                                <li>Used only to generate App Store-style mockups</li>
                            </ul>
                            <p className="font-medium text-white pt-2">We do NOT:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Sell your data</li>
                                <li>Train models on your uploads</li>
                                <li>Share anything publicly</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">5</span>
                            Third-party services
                        </h2>
                        <div className="pl-11 space-y-4 text-zinc-400 leading-relaxed">
                            <p>We use:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Google OAuth (login)</li>
                                <li>Google Gemini API (image/text processing)</li>
                            </ul>
                            <p>They only get what’s necessary to function.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">6</span>
                            Data deletion
                        </h2>
                        <div className="pl-11 space-y-4 text-zinc-400 leading-relaxed">
                            <p>You can:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Delete your account anytime</li>
                                <li>Request complete data removal</li>
                            </ul>
                            <p>Just email: <span className="text-white underline">chetangonuguntla@gmail.com</span></p>
                            <p className="text-zinc-500 italic">We’ll nuke it.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">7</span>
                            Contact
                        </h2>
                        <div className="pl-11 text-zinc-400 leading-relaxed">
                            <p>Questions? Complaints? Lawsuits?</p>
                            <p>📩 <span className="text-white underline">chetangonuguntla@gmail.com</span></p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
