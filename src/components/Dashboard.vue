<template>
    <div class="cards">
        <QuickActions :key="rerender" @updated="rerender++"></QuickActions>
        <LastEvents :key="rerender" @updated="rerender++"></LastEvents>
    </div>
    <Timeline :key="rerender" @updated="rerender++"></Timeline>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LastEvents from './LastEvents.vue';
import QuickActions from './QuickActions.vue';
import Timeline from './Timeline.vue';

const rerender = ref(0);

</script>

<style scoped>

.cards {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: stretch;
    flex-wrap: wrap;
}

</style>