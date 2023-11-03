<script lang="ts">
	export let showModal: boolean;
	let dialog: HTMLDialogElement;

	$: if (dialog && showModal) {
		dialog.showModal();
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:click|self={() => dialog.close()}
	on:close={() => (showModal = false)}
	class="rounded-lg bg-transparent text-white max-w-lg py-6 px-8"
>
	<button
		on:click={() => dialog.close()}
		class="i-mdi-close-thick text-2xl fixed top-8 right-8 hover:opacity-70 hover:cursor-pointer"
	/>
	<h2>都市名しりとり</h2>

	<h3>ルール</h3>
	<p>
		終わりの文字が「長音」の場合、その一つ前の文字を用いる: <br />
		<code>バクー</code> → <code>クエッタ</code>
	</p>
	<p>
		終わりの文字が「促音」の場合、もとの文字（清音）を用いる: <br />
		<code>ウファ</code> → <code>アダナ</code>
	</p>
	<p>
		「濁音・半濁音」は、そのまま用いる: <br />
		<code>バグダッド</code> → <code>ドゥアラ</code>
	</p>
	<p>
		終わりの文字が <code>ん</code> でも続ける:<br />
		<code>ロンドン</code> → <code>ンジャメナ</code>
	</p>

	<h3>データ</h3>
	<p>人口100万を超える世界の都市、計520を対象とする。</p>
	<p>
		元データ: <br />
		<a href="https://amano-tec.com/data/megacities.html" target="_blank" rel="noopener noreferrer"
			>世界の百万都市の位置データ Location Data of Megacities - ASTI アマノ技研</a
		>
	</p>
	<p>
		データの前処理は、次のノートブックを参照のこと: <br />
		<a
			href="https://github.com/sorami/city-shiritori/blob/main/data/cities.ipynb"
			target="_blank"
			rel="noopener noreferrer">data/cities.ipynb</a
		>
	</p>
	<p>
		次に続けることができない都市名は存在しない: <br />
		<code>菏沢（ほーづー）</code> のみ、 <code>づ</code> から始まる都市名がないため、
		<code>ず</code> という扱いにしている。
	</p>
	<p>
		どの都市からも続かない都市名は複数存在する: <br />
		始まりの"読み"が <code>が</code>,
		<code>け</code>, <code>せ</code>, <code>そ</code>, <code>ぢ</code>, <code>つ</code>,
		<code>つ</code>, <code>ぴ</code>, <code>ふ</code>, <code>ぺ</code>, <code>ほ</code>,
		<code>ゔ</code>。
	</p>
	<p>もっとも多い「始まりの"読み"」は <code>あ</code> （29都市）。</p>
	<p>もっとも多い「終わりの"読み"」は <code>ん</code> （149都市）。</p>
	<p>もっとも長い都市名は <code>ナコーンシータンマラート</code> 。</p>

	<h3>コード</h3>
	<p>
		GitHub: <a
			href="https://github.com/sorami/city-shiritori/"
			target="_blank"
			rel="noopener noreferrer">sorami/city-shiritori</a
		>
	</p>

	<h3>参考</h3>
	<p>
		<a href="https://observablehq.com/@d3/world-tour" target="_blank" rel="noopener noreferrer"
			>World Tour / D3 | Observable</a
		>
	</p>

	<div class="text-sm flex items-center gap-x-1 justify-end">
		<a href="https://sorami.dev" target="_blank" rel="noopener noreferrer">sorami.dev</a>
		<div class="i-material-symbols-favorite-rounded" />
	</div>
</dialog>

<style>
	dialog::backdrop {
		@apply bg-black/85;
	}

	a {
		@apply text-white;
		@apply underline;
	}
	a:hover {
		@apply opaicty-70;
	}
	h2,
	h3 {
		@apply text-center;
		@apply m-0;
	}
	h2 {
		@apply text-2xl;
		@apply font-bold;
	}
	h3 {
		@apply text-lg;
		@apply font-bold;
		@apply mt-8 mb-2;
	}
	p {
		@apply text-sm;
	}
	p + p {
		@apply mt-4.5;
	}
	code {
		@apply font-mono;
		@apply bg-white/70 rounded-sm text-black px-1 py-0.25;
	}
</style>
