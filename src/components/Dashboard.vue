<template>
    <MealCard></MealCard>
    <ListView :query="{}" :limit="5"></ListView>
</template>

<script setup lang="ts">
import ListView from './ListView.vue';
import MealCard from './MealCard.vue';


</script>