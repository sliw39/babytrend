<template>
    <div class="timeline-chart">
        <v-btn-toggle v-model="display">
            <v-btn value="chart"><v-icon>mdi-chart-scatter-plot</v-icon></v-btn>
            <v-btn value="table"><v-icon>mdi-table</v-icon></v-btn>
        </v-btn-toggle>
        <canvas ref="chartref" v-show="display === 'chart'"></canvas>
        <table v-if="display === 'table'">
            <tbody>
                <tr v-for="d of tableSet" :key="d.day">
                    <th>{{ d.day }}</th>
                    <td v-for="e of d.events" @click="gotoDetail(e.id)"><span>{{ e.time }}</span><div style="display: flex;"><v-icon v-for="i of e.icons">{{ i }}</v-icon></div></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
    import Chart from 'chart.js/auto';
    import "chartjs-adapter-moment";
    import { onMounted, ref, onUnmounted, computed, watch } from 'vue';
    import { Survey, load } from '../io';
    import moment from 'moment';


    const display = ref<("table"|"chart")>("chart");
    const chartref = ref<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;
    const surveys = ref<Survey[]>([]);

    //watch display change to update chart
    watch(display, () => {
        if(display.value === "chart" && chart) {
            updateChart();
        }
    })
    
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
                    }, {
                        label: 'Repas sans régurgitation',
                        data: [],
                        backgroundColor: 'rgb(75, 192, 192)'
                    }, {
                        label: 'Change (Pipi)',
                        data: [],
                        backgroundColor: 'rgb(255, 205, 86)'
                    }, {
                        label: 'Change (Caca)',
                        data: [], 
                        backgroundColor: 'rgb(153, 102, 0)',
                        
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

            // add event listener on element clicked
            chart.canvas.addEventListener('click', (e) => {
                if(!chart) return;
                const element = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                if (element.length > 0) {
                    const value = chart.data.datasets[element[0].datasetIndex].data[element[0].index] as any;
                    if(value.id) {
                        gotoDetail(value.id);
                    }
                }
            });
        }
    });

    function gotoDetail(id: number) {
        document.location.href = `#/survey/${id}`;
    }
    
    async function updateChart() {
        if (!chart) return;

        const data1 = surveys.value.filter(s => s.type === "Repas" && s.blurp).map(s => { const d = new Date(s.date); return { y: moment(s.date).startOf("day").toDate().getTime(), x: d.getMinutes() / 60 + d.getHours(), id: (s as any)._id } });
        chart.data.datasets[0].data = data1;

        const data2 = surveys.value.filter(s => s.type === "Repas" && !s.blurp).map(s => { const d = new Date(s.date); return { y: moment(s.date).startOf("day").toDate().getTime(), x: d.getMinutes() / 60 + d.getHours(), id: (s as any)._id } });
        chart.data.datasets[1].data = data2;

        const data3 = surveys.value.filter(s => s.type === "Change" && s.pee).map(s => { const d = new Date(s.date); return { y: moment(s.date).startOf("day").toDate().getTime(), x: d.getMinutes() / 60 + d.getHours(), id: (s as any)._id } });
        chart.data.datasets[2].data = data3;

        const data4 = surveys.value.filter(s => s.type === "Change" && s.poop).map(s => { const d = new Date(s.date); return { y: moment(s.date).startOf("day").toDate().getTime() + (s.pee ? 3000000 : 0), x: (d.getMinutes()) / 60 + d.getHours(), id: (s as any)._id } });
        chart.data.datasets[3].data = data4;
        
        chart.update();
    }

    const tableSet = computed(() => {
        const set: {day: string, events: {time: string, icons: string[], id: number}[]}[] = [];
        surveys.value.filter(e => ["Change", "Repas"].indexOf(e.type) !== -1).forEach(s => {
            const day = moment(s.date).format('DD/MM/YYYY');
            const time = moment(s.date).format('HH:mm');
            const icons = [];
            if (s.type === "Repas") {
                icons.push("mdi-baby-bottle");
                if (s.blurp) icons.push("mdi-emoticon-sick");
            } else if (s.type === "Change") {
                if (s.pee) icons.push("mdi-water");
                if (s.poop) icons.push("mdi-emoticon-poop");
            }
            const daySet = set.find(s => s.day === day);
            if (daySet) {
                daySet.events.push({ time, icons, id: (s as any)._id });
            } else {
                set.push({ day, events: [{ time, icons, id: (s as any)._id }] });
            }
        });
        // sort by day
        set.sort((a, b) => {
            const aDate = moment(a.day, 'DD/MM/YYYY');
            const bDate = moment(b.day, 'DD/MM/YYYY');
            if (aDate.isBefore(bDate)) return 1;
            if (aDate.isAfter(bDate)) return -1;
            return 0;
        });
        // sort by time
        set.forEach(s => s.events.sort((a, b) => {
            const aDate = moment(a.time, 'HH:mm');
            const bDate = moment(b.time, 'HH:mm');
            if (aDate.isBefore(bDate)) return -1;
            if (aDate.isAfter(bDate)) return 1;
            return 0;
        }));
        return set;
    })

    load({}).then(s => surveys.value = s).then(() => updateChart());

    onUnmounted(() => {
        chart?.destroy();
    })

</script>

<style scoped>
    /* first column has blue background */
    table tr th {
        background-color: #b0d3ff;
    }

    /* td alternate between white and grey background */
    table tr td:nth-child(even) {
        background-color: #b7b7b7;
    }
    table tr td:nth-child(odd) {
        background-color: #e4e4e4;
    }

    /* td padding and centered */
    table tr td {
        padding: 5px;
        text-align: center;
        cursor: pointer;
    }
</style>