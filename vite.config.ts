import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages serves project sites from /<repo-name>/. The Pages workflow
// sets BASE_PATH from the repository name; locally it defaults to the
// directory name of this project so `npm run preview` exercises the same path.
const base = process.env.BASE_PATH ?? '/wealthglobe/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    // three + react-globe.gl are one large chunk by nature; the warning is noise.
    chunkSizeWarningLimit: 1600,
  },
})
