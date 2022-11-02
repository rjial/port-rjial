<template>
    <div class="h-screen w-screen flex flex-row justify-center items-center">
        <!-- <span class="text-2xl">Rizal Abdul Basith</span> -->
        <Coba/>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Coba from '@/components/coba.vue'
export default Vue.extend({
    components: {
        Coba
    },
    layout: "default"
})
</script>