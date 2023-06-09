<template>
    <v-data-table-server
    :headers="headers"
    v-model:items-per-page="itemsPerPage"
    v-model:sort-by="sortBy"
    :items="data"
    :loading="loading"
    :items-length="limit"
    :server-items-length="total"
    @update:options="loadItems"
    class="elevation-1"
  >
    <template v-slot:item.date="{ item }">
        {{ new Date(item.raw.date).toLocaleDateString("fr") }}&nbsp;{{ new Date(item.raw.date).toLocaleTimeString("fr") }}
    </template>

    <template v-slot:item.events="{ item }">
        <v-icon :color="item.raw.events.pee ? undefined : 'grey'" :icon="EVENT_TYPE_ICONS['pee']"></v-icon>
        <v-icon :color="item.raw.events.poop ? undefined : 'grey'" :icon="EVENT_TYPE_ICONS['poop']"></v-icon>
        <v-icon :color="item.raw.events.blurp ? undefined : 'grey'" :icon="EVENT_TYPE_ICONS['blurp']"></v-icon>
        <v-icon :color="item.raw.events.eat ? undefined : 'grey'" :icon="EVENT_TYPE_ICONS['eat']"></v-icon>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        class="me-2"
        @click="gotoDetail(item.raw)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        size="small"
        @click="deleteItem(item.raw)"
      >
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn
        color="primary"
        @click="initialize"
      >
        Reset
      </v-btn>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
    import { onMounted, ref } from 'vue';
    import { Survey, SurveyQuery, count, load, remove } from '../io';
    import { gotoDetail } from '../navigation';
    import { EVENT_TYPE_ICONS } from '../consts';
    export interface ListViewProps {
        query: SurveyQuery;
        limit?: number;
    }

    const { query, limit } = withDefaults(defineProps<ListViewProps>(), {
      limit: 20, 
    });
    const emits = defineEmits(["updated"]);

    const loading = ref(false);
    const total = ref(0);
    const itemsPerPage = ref(20);
    const sortBy = [{ key: 'date', order: 'desc' }];

    const headers = [
        { title: 'Date', key: 'date' },
        { title: 'Type', key: 'type' },
        { title: 'Poids', key: 'weight' },
        { title: 'Taille', key: 'height' },
        { title: 'Temperature', key: 'temperature' },
        { title: 'Evenements', key: 'events', sortable: false },
        { title: 'Actions', key: 'actions', sortable: false },
    ];

    interface DataTableData {
        date: number;
        type: string;
        weight?: number;
        height?: number;
        temperature?: number;
        events: { pee: boolean, poop: boolean, blurp: boolean, eat: boolean };
        raw: Survey;
    }

    async function initialize(): Promise<void> {
        try {
            loading.value = true;
            total.value = await count(query);
        } finally {
            loading.value = false;
        }
    }

    async function loadItems({ page, itemsPerPage, sortBy }: { page: number, itemsPerPage: number, sortBy: {key:string, order: 'asc'|'desc'}[] }) {
        if(sortBy === undefined || sortBy.length === 0) sortBy = [];
        try {
            loading.value = true;
            data.value = parseIo(await load(query, itemsPerPage, (page-1) * itemsPerPage, sortBy));
        } finally {
            loading.value = false;
        }
    }

    function parseIo(data: Survey[]): DataTableData[] {
        return data.map(s => ({
            date: s.date,
            type: s.type,
            weight: s.weight,
            height: s.height,
            temperature: s.temperature,
            events: { pee: s.pee || false, poop: s.poop|| false, blurp: s.blurp|| false, eat: s.eat|| false },
            raw: s
        }));
    }

    async function deleteItem(item: any) {
        await remove(item.raw._id);
        emits("updated");
    }

    let data = ref<DataTableData[]>([]);

    initialize();
</script>