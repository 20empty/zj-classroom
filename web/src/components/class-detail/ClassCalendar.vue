<template>
  <div v-if="visible" class="calendar-mask" @click.self="close">
    <div class="calendar-dialog">
      <!-- 头部 -->
      <div class="cal-header">
        <button class="cal-nav-btn" @click="monthOffset--"><i class="fas fa-chevron-left"></i></button>
        <span class="cal-month-title">{{ monthLabel }}</span>
        <button class="cal-nav-btn" @click="monthOffset++"><i class="fas fa-chevron-right"></i></button>
        <button class="cal-close-btn" @click="close"><i class="fas fa-times"></i></button>
      </div>

      <!-- 班级时间段摘要 -->
      <div class="cal-range-bar" v-if="dateRange.start && dateRange.end">
        <i class="fas fa-calendar-check"></i>
        <span>{{ dateRange.start }} ~ {{ dateRange.end }}</span>
        <span class="cal-range-days">共 {{ dayCount }} 天</span>
      </div>
      <div class="cal-range-bar cal-range-empty" v-else>
        <i class="fas fa-info-circle"></i>
        <span>尚未设置培训时间段</span>
      </div>

      <!-- 日历网格 -->
      <div class="cal-grid">
        <div class="cal-weekday" v-for="w in ['一','二','三','四','五','六','日']" :key="w">{{ w }}</div>
        <div
          v-for="cell in calendarCells"
          :key="cell.key"
          :class="['cal-cell', {
            'cal-cell-empty': !cell.day,
            'cal-cell-today': cell.isToday,
            'cal-cell-class': cell.isInRange,
            'cal-cell-start': cell.isStart,
            'cal-cell-end': cell.isEnd,
            'cal-cell-outside': cell.isOutside
          }]"
        >
          <span class="cal-day">{{ cell.day }}</span>
        </div>
      </div>

      <!-- 课程列表摘要 -->
      <div class="cal-courses" v-if="courses && courses.length > 0">
        <div class="cal-courses-title">课程安排（{{ courses.length }}门）</div>
        <div class="cal-course-item" v-for="(card, idx) in courses" :key="idx">
          <span class="cal-course-dot" :style="{ background: courseColors[idx % courseColors.length] }"></span>
          <span class="cal-course-name">{{ card.title }}</span>
          <span class="cal-course-dur" v-if="card.duration">{{ card.duration }}天</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  dateRange: { type: Object, default: () => ({ start: '', end: '' }) },
  courses: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:visible'])

function close() {
  emit('update:visible', false)
}

const monthOffset = ref(0)
const courseColors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

const monthLabel = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() + monthOffset.value)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
})

const dayCount = computed(() => {
  if (!props.dateRange.start || !props.dateRange.end) return 0
  const s = new Date(props.dateRange.start)
  const e = new Date(props.dateRange.end)
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1
})

const calendarCells = computed(() => {
  const today = new Date()
  const d = new Date()
  d.setMonth(d.getMonth() + monthOffset.value)
  const year = d.getFullYear()
  const month = d.getMonth()
  const firstDay = new Date(year, month, 1)
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const rangeStart = props.dateRange.start || ''
  const rangeEnd = props.dateRange.end || ''

  const cells = []
  for (let i = 0; i < startOffset; i++) {
    cells.push({ key: `pre-${i}`, day: '', isToday: false, isInRange: false, isStart: false, isEnd: false, isOutside: true })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dateObj = new Date(year, month, day)
    const isToday = dateObj.toDateString() === today.toDateString()
    const isInRange = rangeStart && rangeEnd && dateStr >= rangeStart && dateStr <= rangeEnd
    const isStart = dateStr === rangeStart
    const isEnd = dateStr === rangeEnd
    cells.push({ key: dateStr, day, isToday, isInRange, isStart, isEnd, isOutside: false })
  }
  const remainder = cells.length % 7
  if (remainder > 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      cells.push({ key: `post-${i}`, day: '', isToday: false, isInRange: false, isStart: false, isEnd: false, isOutside: true })
    }
  }
  return cells
})
</script>

<style scoped>
.calendar-mask {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(6px); background: rgba(0, 0, 0, 0.25);
}
.calendar-dialog {
  background: #fff; border-radius: 20px; width: 380px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden; animation: calPopIn 0.25s ease-out;
}
@keyframes calPopIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

.cal-header { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
.cal-month-title { flex: 1; text-align: center; font-size: 1.05rem; font-weight: 600; color: var(--text-primary); }
.cal-nav-btn, .cal-close-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.cal-nav-btn:hover { background: #f1f5f9; color: var(--text-primary); }
.cal-close-btn:hover { background: #fee2e2; color: #ef4444; }

.cal-range-bar { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #f0f4ff; font-size: 0.85rem; font-weight: 500; color: #4f46e5; }
.cal-range-days { margin-left: auto; background: #e0e7ff; padding: 2px 10px; border-radius: 99px; font-size: 0.78rem; font-weight: 600; }
.cal-range-empty { background: #fefce8; color: #a16207; }

.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); padding: 16px 16px 12px; gap: 2px; }
.cal-weekday { text-align: center; font-size: 0.72rem; font-weight: 600; color: var(--text-light); text-transform: uppercase; padding-bottom: 8px; }

.cal-cell { display: flex; align-items: center; justify-content: center; height: 38px; position: relative; }
.cal-day { font-size: 0.85rem; font-weight: 500; color: var(--text-primary); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 10px; transition: all 0.15s; position: relative; z-index: 1; }
.cal-cell-empty .cal-day, .cal-cell-outside .cal-day { color: transparent; }
.cal-cell-today .cal-day { font-weight: 700; color: #4f46e5; box-shadow: inset 0 0 0 2px #4f46e5; }
.cal-cell-class { background: #ede9fe; }
.cal-cell-class .cal-day { color: #4f46e5; font-weight: 600; }
.cal-cell-start { border-radius: 10px 0 0 10px; }
.cal-cell-end { border-radius: 0 10px 10px 0; }
.cal-cell-start.cal-cell-end { border-radius: 10px; }
.cal-cell-today.cal-cell-class .cal-day { background: #4f46e5; color: white; box-shadow: none; }

.cal-courses { padding: 12px 20px 16px; border-top: 1px solid #f1f5f9; }
.cal-courses-title { font-size: 0.78rem; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
.cal-course-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
.cal-course-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.cal-course-name { flex: 1; font-size: 0.88rem; font-weight: 500; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cal-course-dur { font-size: 0.78rem; color: var(--text-light); font-weight: 500; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; }
</style>
