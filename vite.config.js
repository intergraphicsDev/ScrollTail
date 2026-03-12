import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/scrolltail.js',
      name: 'ScrollTail',
      formats: ['iife'],
      fileName: () => 'scrolltail.min.js'
    },
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      external: ['gsap'],
      output: {
        globals: {
          gsap: 'gsap'
        }
      }
    }
  }
})
