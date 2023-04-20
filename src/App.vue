<script setup lang="ts">
</script>

<template>
  <v-app>
    <v-navigation-drawer>
      <ul class="navitem">
        <li><router-link to="/">Accueil</router-link></li>
        <li><router-link to="/survey">Saisie</router-link></li>
        <li><router-link to="/weight">Courbe de poids</router-link></li>
        <li><router-link to="/meals">Repas</router-link></li>
      </ul>
    </v-navigation-drawer>

    <v-app-bar title="BabyTrend"></v-app-bar>

    <v-main style="min-height: 300px;">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<style scoped>
  .navitem {
    list-style-type: none;
    padding: 2em;
  }

  .navitem li {
    margin-bottom: 1em;
  }
</style>
