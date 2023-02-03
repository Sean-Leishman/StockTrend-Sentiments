<script>
	import '../app.postcss';
	import 'flowbite-svelte';
</script>

<div class="min-h-screen">
	<aside class="m-8">
		<div class="flex justify-between items-center">
			<h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white"><span class = "text-blue-600 dark:text-blue-500">Stock</span>Trend</h1>
			<ul>
				<li><a href="/">Home</a></li>
			</ul>
		</div>
	</aside>

	<main class='h-full'>
		<slot />
	</main>

	<aside>
		<footer class="p-4 bg-white rounded-lg shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800">
			<span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">Made by Sean Leishman</span>
			<span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">Acknowledgments to Twitter and Yahoo Finance</span>
		</footer>
	</aside>
</div>

