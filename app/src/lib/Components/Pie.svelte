<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';

    export let counts;

    Chart.register(...registerables);
    let countChart: HTMLCanvasElement;
    const data = {
        labels: ['Positive', 'Negative'],
        datasets: [{
            label: 'Sentiments',
            data: counts,
            backgroundColor: ['#7000e1', '#fc8800'],
            // hoverOffset: 4,
            borderWidth: 0
        }]
    }
    const config = {
            type: 'pie',
            data: data,
            options: {
                borderRadius: '10',
                responsive: true,
                cutout: '95%',
                spacing: 2,
                plugins: {
                    legend: {
                        position: 'bottom',
                        display: true,
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Sentiment'
                    }
                }
            }
        };
    onMount(()=> {
        if (browser){
            new Chart(countChart, config)
        }
    })
    console.log("YES", data, counts)
</script>
<div class="flex w-1/2 h-1/2">
    <canvas bind:this={countChart} width={400} height={400} />
</div>