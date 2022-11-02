export default {
    buildModules: ['@nuxt/typescript-build', '@nuxt/postcss8'],
    modules: ['@nuxtjs/axios'],
    buildDir: 'dist',
    build: {
        postcss: {
            plugins: {
                tailwindcss: {},
                autoprefixer: {},
            },
        },
    },
    css: [
        '@/assets/css/index.css',
    ],
    target: 'static'
}