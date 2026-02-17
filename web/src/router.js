import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import ClassDetail from './views/ClassDetail.vue'
import Leaderboard from './views/Leaderboard.vue'
import SimpleTest from './views/SimpleTest.vue'
import TestAPI from './views/TestAPI.vue'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/class/:id',
      name: 'class-detail',
      component: ClassDetail,
      props: true
    },
    {
      path: '/leaderboard/:courseId',
      name: 'leaderboard',
      component: Leaderboard,
      props: true
    },
    {
      path: '/game-management/:courseId',
      name: 'game-management',
      component: () => import('./views/GameManagement.vue'),
      props: true
    },
    {
      path: '/game/:id',
      name: 'game-ppt',
      component: () => import('./views/GamePPT.vue'),
      props: true
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('./views/Calendar.vue'),
    },
    {
      path: '/course-library',
      name: 'courseLibrary',
      component: () => import('./views/CourseLibrary.vue'),
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
})

export default router