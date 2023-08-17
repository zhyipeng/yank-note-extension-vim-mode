<script setup lang="ts">
import { getActions } from '@/utils'
import { onMounted, ref } from 'vue'
import { ctx } from '@yank-note/runtime-api'

const yn = ref<string[]>([])
const editor = ref<string[]>([])

onMounted(() => {
  const { ynActions, editorActions } = getActions(ctx)
  yn.value = ynActions
  editor.value = editorActions
})
</script>

<template>
  <div style="height: 70vh; overflow: auto;">
    <p>Yank Note</p>
    <div v-for="(item, idx) in yn" :key="idx" style="padding-left: 10px; margin-bottom: 2px;">{{ item }}</div>

    <p>Monaco Editor</p>
    <div v-for="(item, idx) in editor" :key="idx" style="padding-left: 10px; margin-bottom: 2px;">{{ item }}</div>
  </div>
</template>
