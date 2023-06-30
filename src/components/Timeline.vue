<template>
    <!-- a vertical timeline with infinite scroll -->
    <div class="timeline">
        <div class="timeline__container" ref="container">
            <div class="timeline__item" v-for="event in events" :key="event._id" @click="gotoDetail(event)">
                <div class="timeline__item__cicle" :style="{backgroundColor: SURVEY_TYPE_COLORS[event.type]}">
                    <v-icon :icon="SURVEY_TYPE_ICONS[event.type]"></v-icon>
                </div>
                <div class="timeline__datemilestone">
                    <div class="timeline__datemilestone__date" v-if="isFirstOfDay(event)">{{ moment(event.date).format('DD/MM') }}</div>
                </div>                
                <div class="timeline__content">
                    <div class="timeline__title">{{event.type}}</div>
                    <div class="timeline__date">{{ moment(event.date).format('HH:mm') }}</div>
                    <div class="timeline__description">
                        <v-icon v-if="event.pee" :icon="EVENT_TYPE_ICONS['pee']"></v-icon>
                        <v-icon v-if="event.poop" :icon="EVENT_TYPE_ICONS['poop']"></v-icon>
                        <v-icon v-if="event.blurp" :icon="EVENT_TYPE_ICONS['blurp']"></v-icon>
                        <v-icon v-if="event.eat" :icon="EVENT_TYPE_ICONS['eat']"></v-icon>
                    </div>
                </div>
            </div>
            <!-- loader -->
            <div class="timeline__loader" ref="loader">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { Survey, load } from '../io';
    import moment from 'moment';
    import { gotoDetail } from '../navigation';
    import { EVENT_TYPE_ICONS, SURVEY_TYPE_COLORS, SURVEY_TYPE_ICONS } from '../consts';

    const events = ref([] as (Survey & {_id?: string})[]);
    const batchSize = 30;

    // load first batch
    load({}, batchSize, 0, [{key: "date", order: "desc"}]).then((res) => {
        events.value.push(...res);
    });

    // infinite scroll
    const loader = ref<HTMLElement | null>(null);
    function handleScroll() {
        let isLoading = false;
        return async () => {
            if(isLoading) return;
            isLoading = true;
            // if loader is visible, load next batch
            if(loader.value?.getBoundingClientRect().top! < window.innerHeight) {
                const res = await load({}, batchSize, events.value.length, [{key: "date", order: "desc"}]);
                events.value.push(...res);
            }
            isLoading = false;
        }
    }
    const scroller = handleScroll();
    setInterval(() => {
        scroller();
    }, 1000);

    // check if event is the first of the day
    function isFirstOfDay(event: Survey & {_id?: string}) {
        const index = events.value.findIndex((e) => e._id === event._id);
        if(index === 0) return true;
        const prev = events.value[index - 1];
        return !moment(event.date).isSame(prev.date, 'day');
    }


</script>

<style>
    /* background has a fadeout effect at end of container */
    .timeline {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    .timeline::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 200px;
        background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%);
    }

    /* container is the scrollable part */
    .timeline__container {
        position: relative;
        width: 100%;
        height: 100%;
        scroll-behavior: smooth;
    }

    /* item is a 2em circle, the text is written on the left of it */
    .timeline__item {
        position: relative;
        width: 100%;
        margin: 1.5em 0 0 0;
        display: flex;
    }
    .timeline__item:hover {
        background: #f0f0f0;
        cursor: pointer;
    }
    .timeline__datemilestone {
        width: 70px;
    }
    .timeline__item__cicle {
        content: "";
        position: absolute;
        top: 0.1em;
        left: 70px;
        width: 2em;
        height: 2em;
        border-radius: 50%;
        background: #000;
        z-index: 1;
        color: white !important;
        text-align: center;
        line-height: 1.8em;
    }
    .timeline__item::after {
        content: "";
        position: absolute;
        top: 0;
        left: calc(70px + 1em - 2.5px);
        width: 5px;
        height: calc(100% + 1.5em);
        background: #8a8a8a;
    }

    .timeline__content {
        display: flex;
        flex-direction: column;
        margin-left: 3em;
        flex-flow: wrap;
        line-height: 2em;
    }
    .timeline__title {
        width: 100px;
    }
    .timeline__date {
        width: 80px;
    }

    /* loader is a centered icon */
    .timeline__loader {
        position: relative;
        width: 100%;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #000;
    }

</style>