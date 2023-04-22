<script setup lang="ts">
</script>

<template>
  <v-app>
    <v-navigation-drawer>
      <ul class="navitem">
        <li><router-link to="/">Accueil</router-link></li>
        <li><router-link to="/survey">Saisie</router-link></li>
        <li><router-link to="/weight">Courbe de poids</router-link></li>
        <li><router-link to="/height">Courbe de taille</router-link></li>
        <li><router-link to="/meals">Repas</router-link></li>
      </ul>
    </v-navigation-drawer>

    <v-app-bar>
      <template #title>
        <div class="title-app">
          <img src="/baby.png" alt=""/>
          <h1>BabyTrend</h1>
      </div>
      </template>
    </v-app-bar>

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

  .title-app {
    position: relative;
  }

  .title-app img {
    position: absolute;
    top: 0.2em;
    width: 2.1em;
    left: 0;
    height: auto;
  }

  .title-app h1 {
    margin-left: 1.5em;
    font-size: 2em;
    font-family: 'URW Chancery L, cursive';
  }
</style>
