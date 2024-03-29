module.exports = {
    purge: {
        content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
        options: {
            safelist: ['text-dot', 'text-ksm', 'table-dot', 'table-ksm', 'identicon-container', 'ui--IdentityIcon circle:first-child']
        }
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                dot: '#e6007a',
                ksm: '#FF8F00',
                "kinda-black": 'rgb(18 19 18 / 27%)'
            },
            fontFamily: {
                'primary': ['Raleway', 'sans-serif'],
                'secondary': ['Orbitron', 'sans-serif'],
            }
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
