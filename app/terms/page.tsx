import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
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

                <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
                <p className="text-zinc-500 mb-12 text-sm font-medium">Last updated: January 11, 2026</p>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">1</span>
                            What this app does
                        </h2>
                        <div className="pl-11 space-y-4 text-zinc-400 leading-relaxed">
                            <p>This app helps you:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Upload your app screenshots</li>
                                <li>Process them with OpenCV + AI</li>
                                <li>Generate polished App Store mockups</li>
                            </ul>
                            <p className="text-zinc-500 italic">That’s the product. Period.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">2</span>
                            Your responsibilities
                        </h2>
                        <div className="pl-11 space-y-4 text-zinc-400 leading-relaxed">
                            <p>You agree:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>You own the images you upload</li>
                                <li>You’re not uploading copyrighted garbage</li>
                                <li>You won’t abuse the system</li>
                            </ul>
                            <p className="text-zinc-500 italic">If you do… bye.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">3</span>
                            Prohibited use
                        </h2>
                        <div className="pl-11 space-y-4 text-zinc-400 leading-relaxed">
                            <p>Don’t:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Upload illegal content</li>
                                <li>Spam requests</li>
                                <li>Reverse engineer</li>
                                <li>Try to break stuff</li>
                            </ul>
                            <p className="text-zinc-500 italic">We see you. Don’t try it.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">4</span>
                            Account termination
                        </h2>
                        <div className="pl-11 space-y-4 text-zinc-400 leading-relaxed">
                            <p>We can:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Suspend or delete your account</li>
                                <li>Without notice</li>
                                <li>If you violate terms</li>
                            </ul>
                            <p className="text-zinc-500 italic">Cry later.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">5</span>
                            Service availability
                        </h2>
                        <div className="pl-11 space-y-4 text-zinc-400 leading-relaxed">
                            <p>This app is provided “as-is”:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>No uptime guarantees</li>
                                <li>No perfect results</li>
                                <li>No refunds for bad outputs</li>
                            </ul>
                            <p className="text-zinc-500 italic">AI isn’t magic. Deal with it.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">6</span>
                            Liability
                        </h2>
                        <div className="pl-11 space-y-4 text-zinc-400 leading-relaxed">
                            <p>We are not responsible for:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Lost data</li>
                                <li>Bad designs</li>
                                <li>Missed deadlines</li>
                                <li>Any damage from using this app</li>
                            </ul>
                            <p className="text-zinc-500 italic font-medium">Use it at your own risk.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">7</span>
                            Changes
                        </h2>
                        <div className="pl-11 space-y-4 text-zinc-400 leading-relaxed">
                            <p>We may update these terms anytime.</p>
                            <p>You keep using it = you accept them.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-sm">8</span>
                            Contact
                        </h2>
                        <div className="pl-11 text-zinc-400 leading-relaxed">
                            <p>Questions? Complaints?</p>
                            <p>📩 <span className="text-white underline">chetangonuguntla@gmail.com</span></p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
