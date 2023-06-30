<template>
<div style="display: flex; padding: .5em;">
    <v-card class="pa-2" outlined tile>
        <v-card-title>Derniers évènements</v-card-title>
        <v-card-text>
            <table>
                <tr v-for="evt in events" :key="evt.type" :style="{color: evt.level}">
                    <td>{{ evt.type }}</td>
                    <td>{{ evt.date }}</td>
                    <td>
                        <v-icon v-for="icon in evt.icons" :key="icon">{{icon}}</v-icon>
                    </td>
                </tr>
            </table>
        </v-card-text>
    </v-card>
</div>
</template>

<script setup lang="ts">
    import { SurveyType, load } from '../io';
    import { ref } from 'vue';
    import moment from 'moment'
    import 'moment/dist/locale/fr'
    import { EVENT_TYPE_ICONS } from '../consts';

    moment.locale("fr-FR")

    async function getLast(type: SurveyType) {
        const last = await load({ type: type }, 1, undefined, [{ key: "date", order: "desc" }]);
        if(last.length > 0) {
            return last[0];
        }
        return null;
    }

    interface Evt {
        _id?: string;
        type: SurveyType;
        date?: string;
        icons?: string[];
        level: 'inherit' | 'orange' | 'red';
    }

    const events = ref([{
        type: "Repas",
        level: "inherit",
    }, {
        type: "Change",
        level: "inherit",
    }, {
        type: "Visite",
        level: "inherit",
    }, {
        type: "Bain",
        level: "inherit",
    }, {
        type: "Medicament",
        level: "inherit",
    }] as Evt[]);

    function getLevel(warnThreshold: number, errorThreshold: number, diff: number) {
        if(diff >= errorThreshold) {
            return "red";
        } else if(diff >= warnThreshold) {
            return "orange";
        } else {
            return "inherit";
        }
    }
    

    for(const type of ["Repas", "Change", "Visite", "Bain", "Medicament"] as SurveyType[]) {
        getLast(type).then((last) => {
            if(last) {
                const evt = events.value.find((e) => e.type === type);
                if(!evt) return;
                
                evt.date = moment(last.date).fromNow();
                switch(type) {
                    case "Repas":
                        evt.level = getLevel(4, 6, moment().diff(last.date, "hours"));
                        break;
                    case "Change":
                        evt.level = getLevel(3, 5, moment().diff(last.date, "hours"));
                        break;
                    case "Visite":
                        evt.level = getLevel(8, 30, moment().diff(last.date, "days"));
                        break;
                    case "Bain":
                        evt.level = getLevel(4, 6, moment().diff(last.date, "days"));
                        break;
                    case "Medicament":
                        if(moment(last.date).isBefore(moment().subtract(1, "days").startOf("day"))) {
                            evt.level = "red";
                        } else if(moment(last.date).isBefore(moment().startOf("day"))) {
                            if(moment().isAfter(moment().startOf("day").add(18, "hours"))) {
                                    evt.level = "red";
                            } else if (moment().isAfter(moment().startOf("day").add(12, "hours"))) {
                                evt.level = "orange";
                            } else {
                                evt.level = "inherit";
                            }
                        } else {
                            evt.level = "inherit";
                        }
                        break;
                }

                evt._id = (last as any)._id;
                evt.icons = [];
                if(last.eat) evt.icons.push(EVENT_TYPE_ICONS["eat"]);
                if(last.blurp) evt.icons.push(EVENT_TYPE_ICONS["blurp"]);
                if(last.pee) evt.icons.push(EVENT_TYPE_ICONS["pee"]);
                if(last.poop) evt.icons.push(EVENT_TYPE_ICONS["poop"]);
                if(type === "Medicament") evt.icons.push(EVENT_TYPE_ICONS["healthcare"]);
            }
        });
    }

</script>

<style scoped>
    table {
        width: 100%;
    }
    td {
        padding: 0 .5em;
    }
</style>