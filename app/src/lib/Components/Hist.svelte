<script lang="ts">
    /*
    {
                label: 'Negative',
                data: negative_data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                barPercentage: 1,
                categoryPercentage: 1,
                borderRadius: 5,
            },
    */
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';

    export let probs: any[];
    export let bins_count = 10;

    Chart.register(...registerables);
    let countChart: HTMLCanvasElement;

    const get_values = (probs: any) => {
        const MAX_PROB = Math.max(...probs)
        const MIN_PROB = Math.min(...probs)
        const probs_bins = probs.map((k,i) => {
            return Math.floor((k-MIN_PROB)/((MAX_PROB-MIN_PROB)/bins_count))
        })
        const x_vals = Array(bins_count).fill(0).map((_,i) => i);
        const y_vals = Array(bins_count).fill(0).map((_,i) => probs_bins.filter(k => k === i).length);
        // 
        const x_y_vals = y_vals.map((k,i) => ({x: x_vals[i], y:k}))

        return x_y_vals;
    }
    
    let positive_data = get_values(probs.map(k => k[1]))
    let negative_data = get_values(probs.map(k => k[0]))

    let backgroundColor = Array(positive_data.length).fill('rgba(255, 99, 132, 0.2)');
    let borderColor = Array(positive_data.length).fill('rgba(255, 99, 132, 1)');

    backgroundColor[parseInt(positive_data.length / 2)] = 'rgba(54, 162, 235, 0.2)';
    borderColor[parseInt(positive_data.length / 2)] = 'rgba(54, 162, 235, 1)';

    const data = {
            labels: ['Prob. Distribution'],
            datasets: [
            {
                label: 'Positive',
                data: positive_data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                barPercentage: 1,
                categoryPercentage: 1,
                borderRadius: 5,
            }]
        }

    const config = {
            type: 'bar',
            data: data,
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        offset: false,
                        grid: {
                        offset: false
                        },
                        ticks: {
                        stepSize: 1
                        },
                        title: {
                        display: true,
                        text: 'Tweet Scores',
                        font: {
                            size: 14
                        }
                        }
                    }, 
                    y: {
                        // beginAtZero: true
                        title: {
                        display: true,
                        text: 'Count',
                        font: {
                            size: 14
                        }
                        }
                    }
                },
            }
        };
    onMount(()=> {
        if (browser){
            new Chart(countChart, config)
        }
    })
    console.log("YES", data, probs)
    console.log(positive_data)
    console.log(negative_data)
    console.log(backgroundColor, borderColor)
    console.log('go')
</script>
<div class="flex w-1/2 h-1/2">
    <canvas bind:this={countChart} width={400} height={400} />
</div>