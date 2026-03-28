<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseCard } from '@mental-health/design-system'

const apiStatus = ref<string>('Not checked')

async function checkHealth() {
  try {
    const res = await fetch('/api/health')
    const json = (await res.json()) as { status: string }
    apiStatus.value = json.status === 'ok' ? 'Connected' : 'Error'
  } catch {
    apiStatus.value = 'Unreachable'
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4">
    <BaseCard title="Mental Health Platform" class="w-full max-w-md">
      <div class="flex flex-col gap-4">
        <p class="text-muted-foreground">Welcome to the mental health platform.</p>

        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">API Status:</span>
          <span class="text-sm">{{ apiStatus }}</span>
        </div>

        <BaseButton @click="checkHealth">Check API Connection</BaseButton>
      </div>
    </BaseCard>
  </main>
</template>
