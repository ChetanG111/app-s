/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)'],
                handwriting: ['var(--font-caveat)'],
                modern: ['var(--font-poppins)'],
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
