// uno.config.ts
import { defineConfig, presetUno, presetIcons, presetWebFonts } from 'unocss';
import transformerDirectives from '@unocss/transformer-directives';

export default defineConfig({
	presets: [
		presetUno(),
		presetIcons(),
		presetWebFonts({
			provider: 'google',
			fonts: {
				custom: 'Kosugi Maru'
			}
		})
	],
	transformers: [transformerDirectives()]
});
