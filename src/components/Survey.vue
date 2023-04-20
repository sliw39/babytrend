<script setup lang="ts">
import { ref } from 'vue';
import { save, get, Survey, SurveyType } from '../io';

export interface SurveyProps {
    surveyId?: string;
  }

  //define props with defaults
  const props = defineProps<SurveyProps>();
  
  const saving = ref(false);
  const valid = ref(false);
  const loading = ref(props.surveyId ? true : false);

  const weight = ref<number | undefined>(undefined);
  const height = ref<number | undefined>(undefined);
  const type = ref<SurveyType>('Change');
  const poop = ref(false);
  const pee = ref(false);
  const eat = ref(false);
  const blurp = ref(false);
  const temperature = ref<number | undefined>(undefined);
  const commentaire = ref<string | undefined>(undefined);
  
  const fullDate = ref(Date.now());
  const date = ref(new Date(fullDate.value).toISOString().split('T')[0])
  const time = ref(new Date(fullDate.value).toLocaleTimeString())

  async function load() {
    if (props.surveyId) {
      const survey = await get(props.surveyId);
      if (survey) {
        fullDate.value = survey.date;
        date.value = new Date(fullDate.value).toISOString().split('T')[0];
        time.value = new Date(fullDate.value).toLocaleTimeString();

        valid.value = true;
        weight.value = survey.weight;
        height.value = survey.height;
        type.value = survey.type;
        poop.value = survey.poop || false;
        pee.value = survey.pee || false;
        eat.value = survey.eat || false;
        blurp.value = survey.blurp || false;
        temperature.value = survey.temperature;
        commentaire.value = survey.commentaire;
      }
      loading.value = false;
    }
  }
  load();

  async function saveForm() {
    // convert zoned time to UTC
    const datetime = new Date(date.value + 'T' + time.value);

    // agragate form values
    const data: Survey = {
      date: datetime.getTime(),
      type: type.value,
      weight: weight.value || undefined,
      height: height.value || undefined,
      poop: poop.value,
      pee: pee.value,
      eat: eat.value,
      blurp: blurp.value,
      temperature: temperature.value || undefined,
      commentaire: commentaire.value,
    }

    // save to database
    try {
      saving.value = true;
      await save({...data, _id: props.surveyId});
      if(props.surveyId) {
        document.location.href = `#/survey/${props.surveyId}`;
      } else {
        reset();
      }
    } finally {
      saving.value = false;
      valid.value = true;
    }
  }

  function reset() {
    fullDate.value = Date.now();
    date.value = new Date(fullDate.value).toISOString().split('T')[0];
    time.value = new Date(fullDate.value).toLocaleTimeString();

    weight.value = undefined;
    height.value = undefined;
    type.value = 'Change';
    poop.value = false;
    pee.value = false;
    eat.value = false;
    blurp.value = false;
    temperature.value = undefined;
    commentaire.value = undefined;
  }
</script>

<template>
  <v-form
    v-model="valid"
    v-if="!loading"
    lazy-validation
  >
    <v-container>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            label="Date"
            v-model="date"
            type="date"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Heure"
            v-model="time"
            type="time"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-radio-group v-model="type">
          <v-radio label="Change" value="Change"></v-radio>
          <v-radio label="Sommeil" value="Sommeil"></v-radio>
          <v-radio label="Bain" value="Bain"></v-radio>
          <v-radio label="Repas" value="Repas"></v-radio>
          <v-radio label="Visite" value="Visite"></v-radio>
        </v-radio-group>
      </v-row>

      <v-row>
        <v-text-field
          label="Poids"
          v-model="weight"
          type="number"
          suffix="g"
          prepend-icon="mdi-weight"
        ></v-text-field>
      </v-row>

      <v-row>
        <v-text-field
          label="Taille"
          v-model="height"
          type="number"
          suffix="cm"
          prepend-icon="mdi-ruler"
        ></v-text-field>
      </v-row>
      
      <v-row>
        <v-text-field
          label="Température"
          v-model="temperature"
          type="number"
          suffix="°C"
          prepend-icon="mdi-thermometer"
        ></v-text-field>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-checkbox 
            density="compact"
            label="Caca"
            v-model="poop"
          ></v-checkbox>
        </v-col>

        <v-col cols="12" md="6">
          <v-checkbox 
            density="compact"
            label="Pipi"
            v-model="pee"
          ></v-checkbox>
        </v-col>

        <v-col cols="12" md="6">
          <v-checkbox 
            density="compact"
            label="Mange"
            v-model="eat"
          ></v-checkbox>
        </v-col>

        <v-col cols="12" md="6">
          <v-checkbox 
            density="compact"
            label="Blurp"
            v-model="blurp"
          ></v-checkbox>
        </v-col>
      </v-row>

      <v-row>
        <v-textarea
          label="Commentaire"
          v-model="commentaire"
        ></v-textarea>
      </v-row>

      <v-row align-content="center">
        <v-btn
          color="success"
          :disabled="!valid || saving"
          :prepend-icon="saving ? 'mdi-loading' : 'mdi-content-save'"
          @click="saveForm"
        >
          Sauvegarder
        </v-btn>
      </v-row>
    </v-container>
  </v-form>
  <v-icon icon="mdi-loading" v-else></v-icon>
</template>

<style scoped>

</style>
