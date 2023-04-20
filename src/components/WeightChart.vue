<template>
    <div class="weight-chart">
        <canvas ref="chartref"></canvas>
    </div>
</template>

<script setup lang="ts">
    import Chart from 'chart.js/auto';
    import "chartjs-adapter-moment";
    import { onMounted } from 'vue';
    import { ref } from 'vue';
    import { load } from '../io';
    import { onUnmounted } from 'vue';

    const chartref = ref<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;
    
    onMounted(() => {
        const ctx = chartref.value?.getContext('2d');
        if (ctx) {
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Poids (g)',
                        data: [],
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day'
                            }
                        }
                    }
                }
            });
            updateChart();
        }
    })

    async function updateChart() {
        if (!chart) return;
        const surveys = await load({ minWeight: 1000, type: 'Visite' }, 1000, undefined, [{key: 'date', order: 'asc'}]);
        const data = surveys.map(s => ({ x: s.date, y: s.weight || 0 }));
        chart.data.datasets[0].data = data;
        chart.update();
    }

    onUnmounted(() => {
        chart?.destroy();
    })
</script>

<style>
    .weight-chart {
        width: 100%;
        height: 100%;
    }
</style>