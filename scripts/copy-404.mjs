// GitHub Pages serves 404.html for unknown paths. Copying the built
// index.html there lets deep links (e.g. /wealthglobe/?subject=...) load the
// app instead of the Pages 404 page. Runs after `vite build`.
import { copyFileSync, existsSync } from 'node:fs'

if (!existsSync('dist/index.html')) {
  console.error('dist/index.html missing; run vite build first')
  process.exit(1)
}
copyFileSync('dist/index.html', 'dist/404.html')
console.log('copied dist/index.html -> dist/404.html')
