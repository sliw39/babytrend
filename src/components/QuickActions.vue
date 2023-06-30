<template>
<div style="display: flex; padding: .5em;">
    <v-card>
        <v-card-title>Actions rapides</v-card-title>
        <v-card-text>
            <v-btn-toggle v-model="choices" multiple>
                <v-btn v-for="evt of ['eat', 'blurp', 'pee', 'poop', 'healthcare'] as (keyof typeof EVENT_TYPE_ICONS)[]" :value="evt"><v-icon size="x-large">{{EVENT_TYPE_ICONS[evt]}}</v-icon></v-btn>
            </v-btn-toggle>
        </v-card-text>
        <v-card-actions>
            <v-btn @click="submit" prepend-icon="mdi-content-save"  color="success" :disabled="!choices.length || saving">Enregistrer</v-btn>
        </v-card-actions>
    </v-card>
</div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { load, save } from '../io';
    import { EVENT_TYPE_ICONS } from '../consts';

    const choices = ref<("eat"|"blurp"|"pee"|"poop"|"healthcare")[]>([]);
    const saving = ref(false);

    const emits = defineEmits(["updated"]);

    const submit = async () => {
        saving.value = true;
        if(choices.value.indexOf("eat") !== -1) {
            await save({
                date: new Date().getTime(),
                type: "Repas",
                blurp: choices.value.indexOf("blurp") !== -1,
                eat: choices.value.indexOf("eat") !== -1,
            });
        } else if(choices.value.indexOf("blurp") !== -1) {
            const last = await load({ type: "Repas" }, 1, undefined, [{ key: "date", order: "desc" }]);
            if(last.length > 0) {
                last[0].blurp = true;
                await save(last[0]);
            }
        }
        if(choices.value.indexOf("pee") !== -1 || choices.value.indexOf("poop") !== -1) {
            await save({
                date: new Date().getTime(),
                type: "Change",
                pee: choices.value.indexOf("pee") !== -1,
                poop: choices.value.indexOf("poop") !== -1,
            });
        }
        if(choices.value.indexOf("healthcare") !== -1) {
            await save({
                date: new Date().getTime(),
                type: "Medicament",
            });
        }
        choices.value = [];
        saving.value = false;
        emits("updated");
    }
</script>