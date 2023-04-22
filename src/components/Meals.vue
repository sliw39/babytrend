<template>
    <div class="meals-chart">
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
    import moment from 'moment';

    const chartref = ref<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;
    
    onMounted(() => {
        const ctx = chartref.value?.getContext('2d');
        if (ctx) {
            chart = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Repas avec régurgitation',
                        data: [],
                        backgroundColor: 'rgb(255, 99, 132)'
                    },
                    {
                        label: 'Repas sans régurgitation',
                        data: [],
                        backgroundColor: 'rgb(75, 192, 192)'
                    }]
                },
                options: {
                    scales: {
                        y: {
                            type: 'time',
                            time: {
                                unit: 'day'
                            }
                        },
                        x: {
                            type: 'linear',
                            min: 0,
                            max: 24,
                            ticks: {
                                stepSize: 1,
                                callback(tickValue, index, ticks) {
                                    return moment(tickValue, 'HH').format('HH:mm');
                                },
                            },
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const date = moment(context.parsed.y).format('DD/MM/YYYY');
                                    const hours = Math.floor(context.parsed.x);
                                    const minutes = Math.round((context.parsed.x - hours) * 60);
                                    const time = moment({ hours, minutes }).format('HH:mm');
                                    return `${date} ${time}`;
                                }
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
        const surveys = await load({ type: 'Repas' });

        const data1 = surveys.filter(s => s.blurp).map(s => { const d = new Date(s.date); return { y: moment(s.date).startOf("day").toDate().getTime(), x: d.getMinutes() / 60 + d.getHours() } });
        chart.data.datasets[0].data = data1;

        const data2 = surveys.filter(s => !s.blurp).map(s => { const d = new Date(s.date); return { y: moment(s.date).startOf("day").toDate().getTime(), x: d.getMinutes() / 60 + d.getHours() } });
        chart.data.datasets[1].data = data2;
        
        chart.update();
    }

    onUnmounted(() => {
        chart?.destroy();
    })

</script>