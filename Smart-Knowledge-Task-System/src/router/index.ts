import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/workspace/default',
    },
    {
      path: '/workspace/:id',
      name: 'kanban',
      component: () => import('@/views/KanbanView.vue'),//这个叫懒加载
    },
    {
      path: '/workspace/:id/table',
      name: 'table',
      component: () => import('@/views/TableView.vue'),
    },
    {
      path: '/workspace/:id/task/:taskId',
      name: 'detail',
      component: () => import('@/views/DetailView.vue'),
    },
  ],
})

export default router
