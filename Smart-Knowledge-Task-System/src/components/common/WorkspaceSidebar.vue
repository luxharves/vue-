<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1 class="logo">SKTS</h1>
    </div>
    <nav class="sidebar-nav">
      <p class="nav-label">工作空间</p>
      <ul class="workspace-list">
        <li class="workspace-item active">
          <span class="ws-icon">📋</span>
          <span class="ws-name">默认空间</span>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: #f7f8fa;
  border-right: 1px solid #e8eaed;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 20px 16px 12px;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #409eff;
  margin: 0;
}

.sidebar-nav {
  padding: 0 12px;
  flex: 1;
}

.nav-label {
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 8px 4px 6px;
  margin: 0;
}

.workspace-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.workspace-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background 0.15s;
}

.workspace-item:hover {
  background: #e8eaed;
}

.workspace-item.active {
  background: #e6f0ff;
  color: #409eff;
  font-weight: 500;
}

.ws-icon {
  font-size: 16px;
}

.ws-name {
  flex: 1;
}
</style>
