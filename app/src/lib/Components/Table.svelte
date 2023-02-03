<script lang="ts">
    export let data = [];
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch } from 'flowbite-svelte';
    import { formatMetric, formatDecimal } from '$lib/functions/utils';

    let searchTerm = '';
    $: filteredItems = data.filter(
      (item) => item.longName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
    );

    let table_start_idx = 0; 
    let offset = 10;

    

</script>
<div class="m-5 min-w-1/2">
<TableSearch placeholder="Search by stock name" hoverable={true} bind:inputValue={searchTerm}>
  <TableHead>
    <TableHeadCell>Symbol</TableHeadCell>
    <TableHeadCell>Name</TableHeadCell>
    <TableHeadCell>Market Cap</TableHeadCell>
    <TableHeadCell>Market Price</TableHeadCell>
  </TableHead>
  <TableBody class="divide-y">
    {#each filteredItems as item}
      <TableBodyRow>
        <TableBodyCell>{item.symbol}</TableBodyCell>
        <TableBodyCell>{item.shortName}</TableBodyCell>
        <TableBodyCell>{formatMetric(item.marketCap)}</TableBodyCell>
        <TableBodyCell>{formatMetric(item.regularMarketPrice)}</TableBodyCell>
        <TableBodyCell><a href='./stock/{item.symbol}' 
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
          Sentiment</a>
        </TableBodyCell>
      </TableBodyRow>
    {/each}
  </TableBody>
</TableSearch>
</div>
