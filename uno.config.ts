// uno.config.ts
import { defineConfig, presetUno, presetWebFonts } from 'unocss';

export default defineConfig({
	presets: [
		presetUno(),
		presetWebFonts({
			provider: 'google',
			fonts: {
				custom: 'Kosugi Maru'
			}
		})
	]
});
