import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [sveltekit(), devtoolsJson()],

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		watch: {
			// 3. tell vite to ignore watching `src-tauri`
			ignored: ['**/src-tauri/**']
		}
	},
	optimizeDeps: {
		exclude: ['@sqlite.org/sqlite-wasm']
	},
	define: {
		CLICKHOUSE_URL: JSON.stringify(process.env.CLICKHOUSE_URL || 'https://proxy.agx.app/query'),
		PLATFORM: JSON.stringify(process.env.PLATFORM || 'NATIVE'),
		BUILD: JSON.stringify(
			(process.env.CF_PAGES_COMMIT_SHA || process.env.COMMIT_SHA || 'dev').slice(0, 7)
		),
		OLLAMA_BASE_URL: JSON.stringify(process.env.OLLAMA_BASE_URL || 'http://localhost:11434'),
		AUTH0_DOMAIN: JSON.stringify(process.env.AUTH0_DOMAIN || ''),
		AUTH0_CLIENT_ID: JSON.stringify(process.env.AUTH0_CLIENT_ID || ''),
		AUTH0_REDIRECT_URI: JSON.stringify(process.env.AUTH0_REDIRECT_URI || '')
	}
}));
