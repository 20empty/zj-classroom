<template>
  <div class="calendar-page">
    <div class="calendar-header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i> 返回
      </button>
      <h2>我的班级</h2>
      <div class="month-switch">
        <button class="month-btn" @click="prevMonth"><i class="fas fa-chevron-left"></i></button>
        <span class="month-label">{{ displayYear }}年{{ displayMonth + 1 }}月</span>
        <button class="month-btn" @click="nextMonth"><i class="fas fa-chevron-right"></i></button>
      </div>
    </div>
    <div class="calendar-body">
      <table class="gantt-table">
        <thead>
          <tr>
            <th class="course-col">班级</th>
            <th v-for="d in daysInMonth" :key="d">{{ d }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(course, idx) in courseRows" :key="course.id">
            <td class="course-name">{{ course.name }}</td>
            <template v-if="course.startDay && course.endDay">
              <td v-for="d in course.startDay-1" :key="'empty-l-'+d"></td>
              <td :colspan="course.endDay - course.startDay + 1" class="gantt-bar-cell">
                <div class="gantt-bar" :style="barStyle(idx)" :title="course.name + '（' + course.startLabel + '~' + course.endLabel + '）'" @click="goToCourse(course.id)">
                  {{ course.name }}
                  <span class="gantt-bar-date">({{ course.startLabel }}~{{ course.endLabel }})</span>
                </div>
              </td>
              <td v-for="d in daysInMonth - course.endDay" :key="'empty-r-'+d"></td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useClassStore } from '@/stores/classStore'
import { computed, ref } from 'vue'

const router = useRouter()
const classStore = useClassStore()

function goBack() {
  router.back()
}

function goToCourse(id) {
          router.push({ name: 'class-detail', params: { id } })
}

const today = new Date()
const displayYear = ref(today.getFullYear())
const displayMonth = ref(today.getMonth())
const daysInMonth = computed(() => new Date(displayYear.value, displayMonth.value + 1, 0).getDate())

function prevMonth() {
  if (displayMonth.value === 0) {
    displayYear.value--
    displayMonth.value = 11
  } else {
    displayMonth.value--
  }
}
function nextMonth() {
  if (displayMonth.value === 11) {
    displayYear.value++
    displayMonth.value = 0
  } else {
    displayMonth.value++
  }
}

const allCourses = computed(() => classStore.classes)
const colorList = ['#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#ec407a', '#26c6da', '#ff7043', '#8d6e63']

const courseRows = computed(() => {
  return allCourses.value.map((c, idx) => {
    let range = { id: c.id, name: c.name, start: '', end: '' }
    try {
      const saved = localStorage.getItem(`course_date_range_${c.id}`)
      if (saved) Object.assign(range, JSON.parse(saved))
    } catch {}
    // 计算本月内的区间
    let start = range.start ? new Date(range.start) : null
    let end = range.end ? new Date(range.end) : null
    let monthStart = new Date(displayYear.value, displayMonth.value, 1)
    let monthEnd = new Date(displayYear.value, displayMonth.value + 1, 0)
    // 只要有重叠就显示
    if (!start || !end || end < monthStart || start > monthEnd) return { ...range }
    let startDay = start > monthStart ? start.getDate() : 1
    let endDay = end < monthEnd ? end.getDate() : daysInMonth.value
    // 标签显示真实日期
    let startLabel = start > monthStart ? range.start : formatDate(monthStart)
    let endLabel = end < monthEnd ? range.end : formatDate(monthEnd)
    return { ...range, startDay, endDay, startLabel, endLabel }
  }).filter(c => c.startDay && c.endDay)
})

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

function barStyle(idx) {
  return {
    background: colorList[idx % colorList.length],
    color: '#fff',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: 500,
    fontSize: '14px',
    height: '32px',
    lineHeight: '32px',
    boxShadow: '0 2px 8px #b3cfff33',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    padding: '0 18px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}
</script>

<style scoped>
.calendar-page {
  max-width: 1100px;
  margin: 40px auto 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 32px rgba(80,120,200,0.13);
  padding: 28px 32px 32px 32px;
}
.calendar-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}
.calendar-header h2 {
  font-size: 1.5rem;
  color: #4285f4;
  font-weight: 600;
  margin: 0;
}
.month-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
.month-label {
  font-size: 1.1rem;
  color: #4285f4;
  font-weight: 600;
  min-width: 110px;
  text-align: center;
}
.month-btn {
  background: #f1f3f4;
  color: #4285f4;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s;
}
.month-btn:hover {
  background: #e3f2fd;
}
.back-btn {
  background-color: #f1f3f4;
  color: #3c4043;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.back-btn:hover {
  background-color: #e8eaed;
  transform: translateY(-1px);
}
.calendar-body {
  overflow-x: auto;
}
.gantt-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  background: #f8fafc;
  border-radius: 10px;
  overflow: hidden;
  table-layout: fixed;
}
.gantt-table th, .gantt-table td {
  padding: 0;
  min-width: 32px;
  height: 36px;
  border-bottom: 1px solid #f0f0f0;
}
.gantt-table .course-col {
  width: 120px;
  background: #f1f3f4;
  color: #4285f4;
  font-weight: 600;
  font-size: 15px;
  border-right: 1px solid #e0e7ff;
}
.course-name {
  background: #f1f3f4;
  color: #4285f4;
  font-weight: 600;
  font-size: 15px;
  border-right: 1px solid #e0e7ff;
}
.gantt-bar-cell {
  padding: 0;
  position: relative;
}
.gantt-bar {
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  border-radius: 8px;
  box-shadow: 0 2px 8px #b3cfff33;
  background: #42a5f5;
  color: #fff;
  position: relative;
  z-index: 2;
  transition: background 0.2s;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
}
.gantt-bar-date {
  font-size: 12px;
  margin-left: 10px;
  color: #e3f2fd;
}
</style> 