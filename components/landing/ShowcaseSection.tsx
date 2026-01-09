"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const ShowcaseSection: React.FC = () => {
    return (
        <section id="showcase" className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Outputs Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-black text-white">
                        Outputs
                    </h2>
                </motion.div>

                {/* Section Header (Commented Out)
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                        Everything You Need
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                        Professional app store graphics without the design skills or expensive tools.
                    </p>
                </motion.div>
                */}

                {/* Features Grid (Commented Out)
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 hover:bg-zinc-900/80 transition-all"
                            >
                                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Icon size={24} className="text-zinc-300" />
                                </div>
                                <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
                */}

                {/* Showcase Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 overflow-hidden">
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="aspect-[9/19] bg-zinc-900 rounded-2xl flex items-center justify-center"
                                >
                                    <div className="w-16 h-16 bg-zinc-800 rounded-xl animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-zinc-600 text-sm mt-6">
                            Your generated mockups will appear here
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
