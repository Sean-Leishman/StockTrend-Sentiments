<script lang="ts">
    import type { PageData } from './$types';
    import Tweet from '$lib/Components/Tweet.svelte';
    import Pie from '$lib/Components/Pie.svelte';
    import Hist from '$lib/Components/Hist.svelte';
    import Icon from '@iconify/svelte';
    
    import { formatMetric,formatDecimal } from '$lib/functions/utils';

    export let data: PageData;

    let stock = data.post.stockData;
    let sentiment = data.post.data.stream;
    let tweets = data.post.data.tweets;
    let updated = data.post.data.updated;
    console.log("STOCK", sentiment)
</script>

<div class="flex flex-col items-center">
    <div class="ml-10 mb-5 text-slate-500 text-sm">
        Updated: {new Date(updated).toString()}
    </div>
    <div class="flex w-full md:w-1/2 p-10 bg-gray-100 text-gray-600 items-center md-10 ml-10">
        <div class="w-full">
            <h3 class="text-lg font-semibold leading-tight text-gray-800" >{#if stock.displayName}{(stock.displayName)}{:else if stock.shortName} {stock.shortName} {/if}</h3>
            <h6 class="text-sm leading-tight mb-2"><span >{stock.symbol}</span>&nbsp;&nbsp;-&nbsp;&nbsp;Aug 2nd 4:00pm AEST</h6>
            <div class="flex w-full items-end mb-6">
                <span class="block leading-none text-3xl text-gray-800">{formatDecimal(stock.regularMarketPrice)}</span>
                <span class="block leading-5 text-sm ml-4 text-green-500">{formatDecimal(stock.regularMarketDayHigh)-formatDecimal(stock.regularMarketDayLow)<0?'▼':'▲'} ${formatDecimal((stock.regularMarketDayHigh-stock.regularMarketDayLow))} ({formatDecimal(((stock.regularMarketDayHigh/stock.regularMarketDayLow)*100)-100)}%)</span>
            </div>
            <div class="flex w-full text-xs">
                <div class="flex w-5/12">
                    <div class="flex-1 pr-3 text-left font-semibold">Open</div>
                    <div class="flex-1 px-3 text-right">{formatDecimal(stock.regularMarketOpen)}</div>
                </div>
                <div class="flex w-7/12">
                    <div class="flex-1 px-3 text-left font-semibold">Market Cap</div>
                    <div class="flex-1 pl-3 text-right" >{formatMetric(stock.marketCap)}</div>
                </div>
            </div>
            <div class="flex w-full text-xs">
                <div class="flex w-5/12">
                    <div class="flex-1 pr-3 text-left font-semibold">High</div>
                    <div class="px-3 text-right">{formatDecimal(stock.regularMarketDayHigh)}</div>
                </div>
                <div class="flex w-7/12">
                    <div class="flex-1 px-3 text-left font-semibold">P/E ratio</div>
                    <div class="pl-3 text-right">{formatDecimal(stock.trailingPE)}</div>
                </div>
            </div>
            <div class="flex w-full text-xs">
                <div class="flex w-5/12">
                    <div class="flex-1 pr-3 text-left font-semibold">Low</div>
                    <div class="px-3 text-right">{formatDecimal(stock.regularMarketDayLow)}</div>
                </div>
                <div class="flex w-7/12">
                    <div class="flex-1 px-3 text-left font-semibold">Dividend yield</div>
                    <div class="pl-3 text-right">{formatMetric(stock.regularMarketVolume)}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="flex w-1/2 m-5">
        <Pie counts={[sentiment['positive_count'], sentiment['negative_count']]} />
        <Hist probs={sentiment['probabilities']} />
    </div>
    <div class="flex flex-col w-1/2">
        <div class="flex items-center h-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="#1da1f2" d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23Z"/></svg>
            <h2 class="text-3xl font-bold ml-2">Top Twitter Posts for {stock.displayName}</h2>
        </div>

    {#each tweets as tweet, i}
    <Tweet tweet={tweet} sentiment={sentiment.sentiment[i]} probability={sentiment.probabilities[i]}/>
    {/each}
    </div>
</div>
