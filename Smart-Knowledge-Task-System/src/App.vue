<template>
  <div class="app-shell">
    <WorkspaceSidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import WorkspaceSidebar from '@/components/common/WorkspaceSidebar.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  background: #fff;
}

.main-content {
  flex: 1;
  overflow: auto;
  min-width: 0;
}
</style>
