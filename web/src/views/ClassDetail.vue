<template>
  <div class="class-detail">
    <!-- 头部组件 -->
    <ClassHeader @go-home="goToHome" />

    <!-- 班级信息与 Widget 组件 -->
    <ClassInfoWidgets
      :class-info="classInfo"
      :widget-order="widgetOrder"
      :date-range="classDateRange"
      @update:widgetOrder="updateWidgetOrder"
      @update-class-info="updateClassInfo"
      @update-date-range="updateDateRange"
      @open-calendar="showCalendar = true"
    />

    <!-- 日历弹窗 -->
    <ClassCalendar
      v-model:visible="showCalendar"
      :date-range="classDateRange"
      :courses="uniqueCustomCards"
    />

    <!-- 课程与侧边栏布局 -->
    <div class="course-main-content">
      <div class="left-column">
        <!-- 课程列表组件 -->
        <ClassCourses
          :courses="uniqueCustomCards"
          @add-course="onAddCourse"
          @delete-course="removeCustomCard"
        />

        <!-- 待办事项组件 -->
        <ClassTodos :class-id="classId" />
      </div>

      <!-- 侧边栏-操作按钮组 -->
      <div class="course-sidebar">
        <div class="action-buttons">
          <button class="action-btn" @click="goToLeaderboard">
            <i class="fas fa-trophy"></i> 排行榜
          </button>
          <button class="action-btn" @click="goToGameManagement">
            <i class="fas fa-gamepad"></i> 游戏管理
          </button>
          <!-- 信息公告栏组件 -->
          <AnnouncementBoard :class-id="classId" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClassStore } from '@/stores/classStore'
import AnnouncementBoard from '@/components/AnnouncementBoard.vue'
import ClassHeader from '@/components/class-detail/ClassHeader.vue'
import ClassInfoWidgets from '@/components/class-detail/ClassInfoWidgets.vue'
import ClassCalendar from '@/components/class-detail/ClassCalendar.vue'
import ClassCourses from '@/components/class-detail/ClassCourses.vue'
import ClassTodos from '@/components/class-detail/ClassTodos.vue'

const route = useRoute()
const router = useRouter()
const classStore = useClassStore()

// 班级 ID
const classId = ref(Number(route.params.id))

// ===== 核心数据获取 =====
const classInfo = computed(() => {
  return classStore.getClassById(classId.value) || {
    name: '未知班级',
    teacher: '未知教师',
    image: '',
    coordinator: '暂无数据'
  }
})

onMounted(async () => {
  if (classStore.classes.length === 0) {
    await classStore.fetchClasses()
  }
  loadCustomCards()
})

// ===== Widget 逻辑委托给子组件，这里只负责持久化 =====
const defaultWidgets = ['hero', 'people_schedule', 'meta']
const widgetOrderKey = computed(() => `widget_order_${classId.value}`)
const widgetOrder = ref([...defaultWidgets])

onMounted(() => {
  const saved = localStorage.getItem(widgetOrderKey.value)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      const valid = parsed.filter(w => defaultWidgets.includes(w))
      const missing = defaultWidgets.filter(w => !valid.includes(w))
      widgetOrder.value = [...valid, ...missing]
    } catch {
      widgetOrder.value = [...defaultWidgets]
    }
  }
})

function updateWidgetOrder(newOrder) {
  widgetOrder.value = newOrder
  localStorage.setItem(widgetOrderKey.value, JSON.stringify(newOrder))
}

function updateClassInfo({ key, value }) {
  const classIdx = classStore.classes.findIndex(c => c.id === classId.value)
  if (classIdx !== -1) {
    classStore.classes[classIdx][key] = value
    // 持久化 update
    fetch(`http://localhost:3001/api/classes/${classId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value })
    })
  }
}

// ===== 日历日期范围逻辑 =====
const classDateRangeKey = computed(() => `class_date_range_${classId.value}`)
const classDateRange = ref({ start: '', end: '' })
const showCalendar = ref(false)

onMounted(() => {
  const saved = localStorage.getItem(classDateRangeKey.value)
  if (saved) classDateRange.value = JSON.parse(saved)
})

function updateDateRange(range) {
  classDateRange.value = range
  localStorage.setItem(classDateRangeKey.value, JSON.stringify(range))
}

// ===== 课程列表逻辑 =====
const customCards = ref([])

function loadCustomCards() {
  const currentClass = classStore.getClassById(classId.value)
  if (currentClass && currentClass.courses && currentClass.courses.length > 0) {
    customCards.value = currentClass.courses
  } else {
    // Fallback to localstorage
    const cardKey = `class_custom_cards_${classId.value}`
    const cardSaved = localStorage.getItem(cardKey)
    if (cardSaved) {
      try { customCards.value = JSON.parse(cardSaved) } catch {}
    }
  }
}

const uniqueCustomCards = computed(() => {
  const seen = new Set()
  return customCards.value.filter(card => {
    if (!card.title) return true
    if (seen.has(card.title)) return false
    seen.add(card.title)
    return true
  })
})

function removeCustomCard(title) {
  const idx = customCards.value.findIndex(c => c.title === title)
  if (idx !== -1) {
    customCards.value.splice(idx, 1)
    syncCourses()
  }
}

async function onAddCourse(newCards) {
  for (const card of newCards) {
    if (!customCards.value.some(c => c.title === card.title)) {
      customCards.value.push(card)
      await classStore.addCourseToClass(classId.value, card)
    }
  }
}

async function syncCourses() {
    const newValue = customCards.value
    localStorage.setItem(`class_custom_cards_${classId.value}`, JSON.stringify(newValue))
    try {
      await fetch(`http://localhost:3001/api/classes/${classId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: newValue })
      })
    } catch(e) {}
}

const goToHome = () => router.push({ name: 'home' })
const goToLeaderboard = () => router.push({ name: 'leaderboard', params: { courseId: classId.value } })
const goToGameManagement = () => router.push({ name: 'game-management', params: { courseId: classId.value } })
</script>

<style scoped>
.class-detail {
  font-family: var(--font-primary, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  color: #1e293b;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 60px;
  min-height: 100vh;
}

.course-main-content {
  display: flex;
  gap: 32px;
}

.left-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.course-sidebar {
    width: 300px;
    flex-shrink: 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-btn {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: none;
  background: white;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-btn i {
  font-size: 1.4rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 10px;
  color: var(--color-primary);
  transition: all 0.3s;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.action-btn:hover i {
  background: var(--color-primary);
  color: white;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .course-main-content {
    flex-direction: column;
  }
  
  .course-sidebar {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .action-buttons {
    flex-direction: row;
  }

  .action-btn {
      flex: 1;
  }
}

@media (max-width: 768px) {
  .class-detail {
    padding: 0 16px 40px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
