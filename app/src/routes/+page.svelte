<script lang="ts">
    import type { PageData } from './$types';
    import Hero from '$lib/Components/Hero.svelte'
    import Particles from '$lib/Components/Particles.svelte';
    import Table from '$lib/Components/Table.svelte';

    export let data: PageData;

    //<svelte:component this={Particles} />

</script>

<div class="">
  <div>
    <div class='relative m-8 w-full h-full'>
      <div class="absolute top-1/2 left-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/2">
        
      </div>
    </div>
    <div class="flex justify-center items-center">
      <div class="w-1/2 z-20">
        <h1 class="mb-4 text-xl text-right font-extrabold leading-none tracking-tight text-gray-900 md:text-xl lg:text-xl dark:text-white">Twitter Sentiment Analysis for <br><span class="text-blue-600 dark:text-blue-500">Stocks</span></h1>
      </div>
      <div class="w-1/2 z-10">
        <svelte:component this={Hero} />
      </div>
    </div>
  </div>
  <div class="flex justify-center overflow-y-auto shadow-md sm:rounded-lg">
    <Table data={data.post.data} />
  </div>
</div>