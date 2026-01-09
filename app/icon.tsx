import { ImageResponse } from 'next/og';

export const size = {
    width: 32,
    height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#050505',
                    borderRadius: '6px',
                }}
            >
                <div
                    style={{
                        width: 24,
                        height: 12,
                        background: '#27272a',
                        borderRadius: 999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <div
                        style={{
                            width: 10,
                            height: 10,
                            background: 'rgba(255,255,255,0.3)',
                            borderRadius: 999,
                            filter: 'blur(1px)',
                        }}
                    />
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
