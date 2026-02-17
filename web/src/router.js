import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Home from './views/Home.vue'
import ClassDetail from './views/ClassDetail.vue'
import Leaderboard from './views/Leaderboard.vue'
import SimpleTest from './views/SimpleTest.vue'
import TestAPI from './views/TestAPI.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('./views/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/class/:id',
    name: 'class-detail',
    component: ClassDetail,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/leaderboard/:courseId',
    name: 'leaderboard',
    component: Leaderboard,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/game-management/:courseId',
    name: 'game-management',
    component: () => import('./views/GameManagement.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/game/:id',
    name: 'game-ppt',
    component: () => import('./views/GamePPT.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('./views/Calendar.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/course-library',
    name: 'courseLibrary',
    component: () => import('./views/CourseLibrary.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/test-api',
    name: 'test-api',
    component: TestAPI,
  },
  {
    path: '/simple-test',
    name: 'simple-test',
    component: SimpleTest,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Verify token validity if it exists
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (authStore.isAuthenticated) {
      next({ name: 'home' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router