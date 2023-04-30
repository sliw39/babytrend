<template>
    <div class="events-chart">
        <v-card class="search-form">
            <v-form ref="form" lazy-validation>
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-text-field  
                            :model-value="moment(query.dateFrom).format('YYYY-MM-DD')"
                            @update:model-value="query.dateFrom = moment($event).valueOf()"
                            label="Date de début"
                            type="date"
                            :rules="[...dateRules, (v) => moment(v, 'YYYY-MM-DD').isSameOrBefore(query.dateTo) || 'La date de début doit être avant la date de fin']"
                            required
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            :model-value="moment(query.dateTo).format('YYYY-MM-DD')"
                            @update:model-value="query.dateTo = moment($event).valueOf()"
                            label="Date de fin"
                            type="date"
                            :rules="[...dateRules, (v) => moment(v, 'YYYY-MM-DD').isSameOrAfter(query.dateFrom) || 'La date de fin doit être après la date de début']"
                            required
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-select v-model="query.type" :items="SurveyTypeList" label="Type"></v-select>
            </v-form>
        </v-card>
        <v-btn-toggle v-model="display">
            <v-btn value="table"><v-icon>mdi-table</v-icon></v-btn>
            <v-btn value="chart"><v-icon>mdi-chart-scatter-plot</v-icon></v-btn>
        </v-btn-toggle>
        <canvas ref="chartref" v-show="display === 'chart'"></canvas>
        <table v-if="display === 'table'">
            <tbody>
                <tr v-for="d of tableSet" :key="d.day">
                    <th>{{ d.day }}</th>
                    <td v-for="e of d.events" :key="e.id" @click="gotoDetail(e.id)"><span>{{ e.time }}</span><div style="display: flex;"><v-icon v-for="i of e.icons">{{ i }}</v-icon></div></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
    import Chart from 'chart.js/auto';
    import "chartjs-adapter-moment";
    import { onMounted, ref, onUnmounted, computed, watch } from 'vue';
    import { Survey, SurveyQuery, SurveyType, SurveyTypeList, load } from '../io';
    import moment from 'moment'
    import 'moment/dist/locale/fr'
    import { reactive } from 'vue';
    import { gotoDetail } from '../navigation';
    import { EVENT_TYPE_COLORS, EVENT_TYPE_ICONS, SURVEY_TYPE_COLORS } from '../consts';
    moment.locale("fr-FR")

    const display = ref<("table"|"chart")>("table");
    const chartref = ref<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;
    const surveys = ref<Survey[]>([]);

    const query = reactive({
        dateFrom: moment().subtract(1, 'week').toDate().getTime(),
        dateTo: moment().toDate().getTime(),
    } as SurveyQuery);

    const dateRules = [
        (v: string) => !!v || 'La date est requise',
    ];

    //watch display change to update chart
    watch(display, () => {
        if(display.value === "chart" && chart) {
            updateChart();
        }
    })

    //watch query change to update data
    watch(query, () => {
        load(query).then((s) => {
            surveys.value = s;
            if(display.value === "chart" && chart) {
                updateChart();
            }
        })
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
                        backgroundColor: EVENT_TYPE_COLORS['blurp']
                    }, {
                        label: 'Repas sans régurgitation',
                        data: [],
                        backgroundColor: EVENT_TYPE_COLORS['eat']
                    }, {
                        label: 'Change (Pipi)',
                        data: [],
                        backgroundColor: EVENT_TYPE_COLORS['pee']
                    }, {
                        label: 'Change (Caca)',
                        data: [], 
                        backgroundColor: EVENT_TYPE_COLORS['poop'],
                        
                    }, {
                        label: 'Bain',
                        data: [], 
                        backgroundColor: SURVEY_TYPE_COLORS["Bain"],
                        
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

        const data5 = surveys.value.filter(s => s.type === "Bain").map(s => { const d = new Date(s.date); return { y: moment(s.date).startOf("day").toDate().getTime(), x: (d.getMinutes()) / 60 + d.getHours(), id: (s as any)._id } });
        chart.data.datasets[4].data = data5;
        
        chart.update();
    }

    const tableSet = computed(() => {
        const set: {day: string, events: {time: string, icons: string[], id: string}[]}[] = [];
        surveys.value.filter(e => ["Change", "Repas"].indexOf(e.type) !== -1).forEach(s => {
            const day = moment(s.date).format('DD/MM/YYYY');
            const time = moment(s.date).format('HH:mm');
            const icons = [];
            if (s.type === "Repas") {
                icons.push(EVENT_TYPE_ICONS["eat"]);
                if (s.blurp) icons.push(EVENT_TYPE_ICONS["blurp"]);
            } else if (s.type === "Change") {
                if (s.pee) icons.push(EVENT_TYPE_ICONS["pee"]);
                if (s.poop) icons.push(EVENT_TYPE_ICONS["poop"]);
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

    load(query).then(s => surveys.value = s).then(() => updateChart());

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
        background-color: #f3f3f3;
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