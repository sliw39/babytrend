<template>
<div style="display: flex; padding: .5em;">
    <v-card :color="blurp ? 'rgb(255, 99, 132)' : 'rgb(75, 192, 192)'" class="pa-2" outlined tile v-if="!loading">
        <v-card-title>{{ props.title }}</v-card-title>
        <v-card-subtitle>{{ dateStr }}</v-card-subtitle>
        <v-card-actions>
            <v-switch v-model="blurp" @update:model-value="saveBlurp" :loading="updating" label="Blurp"></v-switch>
        </v-card-actions>
    </v-card>
</div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { get, load, save } from '../io';

    export interface LastMealProps {
        mealId?: string;
        title?: string;
    }

    const props = withDefaults(defineProps<LastMealProps>(), {
        title: 'Dernier repas'
    });

    const emits = defineEmits(["updated"]);

    const dateStr = ref('');
    const blurp = ref(false);
    const updating = ref(false);
    const loading = ref(true);
    let id = ref(props.mealId);

    if(props.mealId) {
        get(props.mealId).then((survey) => {
            dateStr.value = new Date(survey.date).toLocaleString('fr');
            blurp.value = survey.blurp || false;
            loading.value = false;
        });
    } else {
        load({type: "Repas"}, 1, undefined, [{key: 'date', order: 'desc'}]).then((surveys) => {
            const lastSurvey = surveys[surveys.length - 1];
            dateStr.value = new Date(lastSurvey.date).toLocaleString('fr');
            blurp.value = lastSurvey.blurp || false;
            id.value = (lastSurvey as any)._id;
            loading.value = false;
        });
    }

    async function saveBlurp() {
        if(id.value) {
            updating.value = true;
            let survey = await get(id.value);
            survey.blurp = blurp.value;
            await save(survey);
            updating.value = false;
            emits("updated");
        }
    }
</script>