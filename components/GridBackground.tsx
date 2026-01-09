import React from 'react';

export const GridBackground: React.FC = () => {
    return (
        <div
            className="fixed inset-0 w-screen h-screen pointer-events-none z-0"
            style={{
                backgroundImage: `
                    linear-gradient(to right, #1a1a1a 1px, transparent 1px),
                    linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
            }}
        />
    );
};
