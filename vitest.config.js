import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        environment: 'jsdom',
        environmentOptions: { jsdom: { url: 'http://localhost:3000' } },
        globals: true,
        include: ['tests/**/*.test.js'],
    },
})
