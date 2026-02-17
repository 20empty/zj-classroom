<template>
  <div class="class-detail">
    <!-- 班级头部信息 -->
    <div class="class-header">
      <div class="header-content">
        <!-- 导航栏 -->
        <div class="header-top">
          <h1 class="site-title" @click="goToHome">
            <i class="fas fa-graduation-cap"></i>
            ZJ-Huawei Classroom
          </h1>
          <button class="home-btn" @click="goToHome">
            <i class="fas fa-home"></i> Back to Home
          </button>
        </div>

        <!-- iOS 负一屏风格可拖拽小组件 -->
        <div class="widgets-container">
          <transition-group name="widget-move" tag="div" class="widgets-list">
            <div
              v-for="(widget, idx) in widgetOrder"
              :key="widget"
              class="widget-card"
              :class="{ 'widget-dragging': dragIdx === idx, 'widget-over': dragOverIdx === idx && dragIdx !== idx }"
              draggable="true"
              @dragstart="onWidgetDragStart($event, idx)"
              @dragover.prevent="onWidgetDragOver($event, idx)"
              @dragenter.prevent="onWidgetDragEnter(idx)"
              @dragleave="onWidgetDragLeave(idx)"
              @drop.prevent="onWidgetDrop($event, idx)"
              @dragend="onWidgetDragEnd"
            >
              <!-- 拖拽手柄 -->
              <div class="widget-handle"><i class="fas fa-grip-lines"></i></div>

              <!-- 班级名称 Widget -->
              <template v-if="widget === 'hero'">
                <div class="widget-inner widget-hero">
                  <template v-if="editingTopField==='班级名称'">
                    <input v-model="editTopFieldValue" class="edit-top-input hero-input" @keyup.enter="saveEditTopField('班级名称')" />
                    <div class="edit-actions">
                      <button class="edit-save-btn" @click="saveEditTopField('班级名称')">保存</button>
                      <button class="edit-cancel-btn" @click="cancelEditTopField">取消</button>
                    </div>
                  </template>
                  <template v-else>
                    <h2 class="hero-title">{{ classInfo.name || '暂无数据' }}</h2>
                    <button class="edit-icon-btn" @click="startEditTopField('班级名称')"><i class="fas fa-pen"></i></button>
                  </template>
                </div>
              </template>

              <!-- 人员 + 培训时间 合并 Widget (1/4 + 1/4 + 1/2) -->
              <template v-if="widget === 'people_schedule'">
                <div class="widget-inner widget-people-schedule">
                  <!-- 讲师 1/4 -->
                  <div class="wps-cell wps-quarter">
                    <div class="module-icon module-icon-primary"><i class="fas fa-chalkboard-teacher"></i></div>
                    <div class="module-body">
                      <span class="module-label">讲师</span>
                      <template v-if="editingTopField==='讲师'">
                        <input v-model="editTopFieldValue" class="edit-top-input" @keyup.enter="saveEditTopField('讲师')" />
                        <div class="edit-actions">
                          <button class="edit-save-btn" @click="saveEditTopField('讲师')">保存</button>
                          <button class="edit-cancel-btn" @click="cancelEditTopField">取消</button>
                        </div>
                      </template>
                      <template v-else>
                        <span class="module-value">{{ classInfo.teacher || '暂无数据' }}</span>
                        <button class="edit-icon-btn" @click="startEditTopField('讲师')"><i class="fas fa-pen"></i></button>
                      </template>
                    </div>
                  </div>
                  <!-- 竖分隔线 -->
                  <div class="wps-vline"></div>
                  <!-- 班主任 1/4 -->
                  <div class="wps-cell wps-quarter">
                    <div class="module-icon module-icon-secondary"><i class="fas fa-user-tie"></i></div>
                    <div class="module-body">
                      <span class="module-label">班主任</span>
                      <template v-if="editingTopField==='班主任'">
                        <input v-model="editTopFieldValue" class="edit-top-input" @keyup.enter="saveEditTopField('班主任')" />
                        <div class="edit-actions">
                          <button class="edit-save-btn" @click="saveEditTopField('班主任')">保存</button>
                          <button class="edit-cancel-btn" @click="cancelEditTopField">取消</button>
                        </div>
                      </template>
                      <template v-else>
                        <span class="module-value">{{ classInfo.coordinator || '暂无数据' }}</span>
                        <button class="edit-icon-btn" @click="startEditTopField('班主任')"><i class="fas fa-pen"></i></button>
                      </template>
                    </div>
                  </div>
                  <!-- 竖分隔线 -->
                  <div class="wps-vline"></div>
                  <!-- 培训时间 1/2 -->
                  <div class="wps-cell wps-half" @click="!editDateMode && (showDateEdit = true)">
                    <div class="wps-schedule-top">
                      <div class="widget-schedule-icon"><i class="fas fa-calendar-alt"></i></div>
                      <div class="widget-schedule-body">
                        <span class="module-label">培训时间</span>
                        <template v-if="editDateMode">
                          <div class="date-edit-wrap" tabindex="0" @focusout="onDateEditBlur" @click.stop>
                            <input type="date" v-model="editDateStart" class="edit-date-input" @keyup.enter="saveDate" />
                            <span class="date-sep">~</span>
                            <input type="date" v-model="editDateEnd" class="edit-date-input" @keyup.enter="saveDate" />
                            <button class="edit-cancel-btn" @click.stop="cancelEditDate"><i class="fas fa-times"></i></button>
                          </div>
                        </template>
                        <template v-else>
                          <span class="module-value" v-if="classDateRange.start && classDateRange.end">
                            {{ classDateRange.start }} ~ {{ classDateRange.end }}
                          </span>
                          <span class="module-value module-value-placeholder" v-else>
                            点击设置培训时间段
                          </span>
                        </template>
                      </div>
                    </div>
                    <!-- 动画时间进度条 -->
                    <div class="timeline-bar" v-if="classDateRange.start && classDateRange.end">
                      <div class="timeline-track">
                        <div class="timeline-fill" :style="{ width: trainingProgress + '%' }"></div>
                        <div class="timeline-dot" :style="{ left: trainingProgress + '%' }"></div>
                      </div>
                      <div class="timeline-labels">
                        <span>{{ classDateRange.start.slice(5) }}</span>
                        <span class="timeline-status">{{ trainingStatusText }}</span>
                        <span>{{ classDateRange.end.slice(5) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 元数据 Widget -->
              <template v-if="widget === 'meta'">
                <div class="widget-inner widget-meta-grid">
                  <div class="widget-meta-cell" v-for="field in metaFields" :key="field.key">
                    <span class="module-label">{{ field.label }}</span>
                    <template v-if="editingTopField===field.label">
                      <input v-model="editTopFieldValue" class="edit-top-input" @keyup.enter="saveEditTopField(field.label)" />
                      <div class="edit-actions">
                        <button class="edit-save-btn" @click="saveEditTopField(field.label)">保存</button>
                        <button class="edit-cancel-btn" @click="cancelEditTopField">取消</button>
                      </div>
                    </template>
                    <template v-else>
                      <span class="module-value">{{ field.value || '—' }}</span>
                      <button class="edit-icon-btn" @click="startEditTopField(field.label)"><i class="fas fa-pen"></i></button>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
    <!-- 日历弹窗 -->
    <div v-if="showCalendar" class="calendar-mask" @click.self="showCalendar = false">
      <div class="calendar-dialog">
        <!-- 头部 -->
        <div class="cal-header">
          <button class="cal-nav-btn" @click="calendarMonth--"><i class="fas fa-chevron-left"></i></button>
          <span class="cal-month-title">{{ calendarMonthLabel }}</span>
          <button class="cal-nav-btn" @click="calendarMonth++"><i class="fas fa-chevron-right"></i></button>
          <button class="cal-close-btn" @click="showCalendar = false"><i class="fas fa-times"></i></button>
        </div>

        <!-- 班级时间段摘要 -->
        <div class="cal-range-bar" v-if="classDateRange.start && classDateRange.end">
          <i class="fas fa-calendar-check"></i>
          <span>{{ classDateRange.start }} ~ {{ classDateRange.end }}</span>
          <span class="cal-range-days">共 {{ classDayCount }} 天</span>
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
        <div class="cal-courses" v-if="uniqueCustomCards.length > 0">
          <div class="cal-courses-title">课程安排（{{ uniqueCustomCards.length }}门）</div>
          <div class="cal-course-item" v-for="(card, idx) in uniqueCustomCards" :key="idx">
            <span class="cal-course-dot" :style="{ background: courseColors[idx % courseColors.length] }"></span>
            <span class="cal-course-name">{{ card.title }}</span>
            <span class="cal-course-dur" v-if="card.duration">{{ card.duration }}天</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 课程展示区 -->
    <div class="course-section">
      <div class="section-header">
        <div class="section-title">
          <i class="fas fa-book-reader module-icon-title"></i>
          <h2>课程安排</h2>
          <span class="course-count-badge">{{ uniqueCustomCards.length }}</span>
        </div>
        <button class="btn-add-course" @click="openAddCardDialog">
          <i class="fas fa-plus"></i> 添加课程
        </button>
      </div>
      
      <div class="course-grid">
        <template v-if="uniqueCustomCards.length > 0">
          <CourseCardSimple
            v-for="(card, idx) in uniqueCustomCards"
            :key="'custom-'+idx"
            :course="card"
            @delete-course="removeCustomCard(card.title)"
            @edit-course="editCustomCard"
            @view-in-library="viewCourseInLibrary"
          />
        </template>
        
        <!-- 空状态 -->
        <div v-else class="empty-state-course" @click="openAddCardDialog">
          <div class="empty-icon-circle">
            <i class="fas fa-plus"></i>
          </div>
          <h3>暂无课程安排</h3>
          <p>点击此处或右上角按钮添加新课程</p>
        </div>
      </div>
    </div>
        <!-- 添加课程卡片弹窗 (New UI) -->
        <div v-if="showAddCardDialog" class="dialog-mask" @click.self="closeAddCardDialog">
          <div class="dialog-box add-card-dialog-modern">
            <div class="dialog-header">
              <h3>添加课程</h3>
              <button class="btn-close" @click="closeAddCardDialog"><i class="fas fa-times"></i></button>
            </div>
            
            <!-- 选择添加方式 (Segmented Control) -->
            <div class="dialog-tabs">
              <div class="segmented-control">
                <button 
                  :class="['segment-btn', { active: addMethod === 'manual' }]" 
                  @click="addMethod = 'manual'"
                >
                  <i class="fas fa-pen-fancy"></i> 手动添加
                </button>
                <div class="segment-divider"></div>
                <button 
                  :class="['segment-btn', { active: addMethod === 'library' }]" 
                  @click="addMethod = 'library'"
                >
                  <i class="fas fa-book"></i> 从课程库选择
                </button>
                <div class="segment-bg" :style="{ transform: addMethod === 'manual' ? 'translateX(0)' : 'translateX(100%)' }"></div>
              </div>
            </div>
            
            <div class="dialog-body">
              <!-- 手动添加表单 -->
              <div v-if="addMethod === 'manual'" class="manual-form-modern">
                <div class="form-group">
                  <label>课程名称</label>
                  <div class="input-wrapper">
                    <i class="fas fa-heading"></i>
                    <input v-model="newCardTitle" class="modern-input" placeholder="例如：Vue.js 高级实战" />
                  </div>
                </div>
                
                <div class="form-group">
                  <label>时长 (天)</label>
                  <div class="input-wrapper">
                    <i class="fas fa-clock"></i>
                    <input v-model="newCardDuration" class="modern-input" placeholder="例如：2" type="number" />
                  </div>
                </div>
                
                <div class="form-group">
                  <label>课程描述</label>
                  <div class="input-wrapper textarea-wrapper">
                    <textarea v-model="newCardContent" class="modern-textarea" placeholder="简要描述课程内容..."></textarea>
                  </div>
                </div>
              </div>
              
              <!-- 课程库选择 -->
              <div v-else class="library-selection-modern">
                <div v-if="courseLibrary.length === 0" class="empty-library-modern">
                  <div class="empty-icon-box">
                    <i class="fas fa-book-open"></i>
                  </div>
                  <p>课程库暂无数据</p>
                  <button @click="goToCourseLibrary" class="btn-text-primary">
                    去添加课程 <i class="fas fa-arrow-right"></i>
                  </button>
                </div>
                
                <div v-else class="course-list-modern">
                  <div
                    v-for="course in courseLibrary"
                    :key="course.id"
                    :class="['course-item-card', { selected: isCourseSelected(course.id) }]"
                    @click="toggleCourseSelection(course)"
                  >
                    <div class="course-card-icon">
                      <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="course-card-info">
                      <h4>{{ course.name }}</h4>
                      <div class="course-card-meta">
                        <span class="badge-tag">{{ course.type }}</span>
                        <span v-if="course.duration" class="meta-text"><i class="fas fa-clock"></i> {{ course.duration }}小时</span>
                      </div>
                    </div>
                    <div class="selection-indicator">
                      <i class="fas fa-check"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="dialog-footer">
              <button @click="closeAddCardDialog" class="btn-cancel-modern">取消</button>
              <button @click="addCustomCard" class="btn-confirm-modern" :disabled="(addMethod === 'manual' && !newCardTitle.trim()) || (addMethod === 'library' && selectedCourseIds.length === 0)">
                确认添加
              </button>
            </div>
          </div>
        </div>


    <!-- 待办事项区 -->
    <div class="course-main-content">
      <div class="todos-area">
        <h3>待办事项</h3>
        <div class="todo-edit-row">
          <input v-model="todoInput" class="todo-input" placeholder="请输入待办事项..." @keyup.enter="addTodo" />
          <input type="date" v-model="todoDate" class="todo-date-input" />
          <button class="todo-post-btn" @click="addTodo">Post</button>
        </div>
        <!-- 只保留一行状态列，所有待办按日期分组，时间轴和圆点只在左侧分隔日期 -->
        <div class="todo-board">
          <div class="todo-timeline-vertical">
            <div v-for="([date], idx) in todosByDate" :key="date" class="todo-timeline-dot" :style="{top: (idx*120+32)+'px'}"></div>
          </div>
          <div class="todo-status-cols todo-status-cols-fixed">
            <div class="todo-status-col" v-for="status in statusList" :key="status.key">
              <div class="todo-status-title" :style="{background: status.color}">{{ status.label }}</div>
            </div>
          </div>
          <div v-for="([date, group], idx) in todosByDate" :key="date" class="todo-date-group">
            <div class="todo-date-label">{{ date }}</div>
            <div class="todo-status-cols">
              <div class="todo-status-col" v-for="status in statusList" :key="status.key">
                <div class="todo-list">
                  <div v-for="(todo, idx2) in group.filter(t=>t.status===status.key)" :key="todo.text+todo.date" class="todo-item">
                    <div class="todo-content" :class="'todo-content-' + todo.status">
                      <button class="todo-delete-btn" @click="deleteTodo(todo)">×</button>
                      <div class="todo-text" v-if="!todo.editing" @click="startEditTodo(todo)" style="cursor:pointer;">{{ todo.text }}</div>
                      <div v-if="todo.editing" style="display:flex;align-items:center;gap:6px;">
                        <input v-model="todo.editText" class="todo-edit-input" @keyup.enter="saveEditTodo(todo)" @keyup.esc="cancelEditTodo(todo)" />
                        <button class="icon-btn todo-save-btn" @click="saveEditTodo(todo)" title="保存"><i class="fas fa-check"></i></button>
                        <button class="icon-btn todo-cancel-btn" @click="cancelEditTodo(todo)" title="取消"><i class="fas fa-times"></i></button>
                      </div>
                      <div class="todo-date">{{ todo.date }}</div>
                      <div class="todo-actions">
                        <button v-if="status.key!=='planning'" @click="setTodoStatus(todo, 'planning')">规划</button>
                        <button v-if="status.key!=='doing'" @click="setTodoStatus(todo, 'doing')">进行中</button>
                        <button v-if="status.key!=='done'" @click="setTodoStatus(todo, 'done')">完成</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
import { useCoursesStore } from '@/stores/coursesStore'
import CourseCardSimple from '@/components/CourseCardSimple.vue'
import AnnouncementBoard from '@/components/AnnouncementBoard.vue'

const route = useRoute()
const router = useRouter()
const classStore = useClassStore()
const coursesStore = useCoursesStore()

// 班级日期条相关
const showDateEdit = ref(false)
const editDateMode = ref(false)
const showCalendar = ref(false)
const classDateRangeKey = computed(() => `class_date_range_${classId.value}`)
const classDateRange = ref({ start: '', end: '' })
const editDateStart = ref('')
const editDateEnd = ref('')

// 定义classId为响应式变量
const classId = ref(Number(route.params.id))


onMounted(() => {
  const saved = localStorage.getItem(classDateRangeKey.value)
  if (saved) classDateRange.value = JSON.parse(saved)
})
function saveDate() {
  if (editDateStart.value && editDateEnd.value && editDateStart.value <= editDateEnd.value) {
    classDateRange.value = { start: editDateStart.value, end: editDateEnd.value }
    localStorage.setItem(classDateRangeKey.value, JSON.stringify(classDateRange.value))
    editDateMode.value = false
  }
}
let blurTimer = null
function onDateEditBlur() {
  // 延迟，避免点击×时被提前保存
  blurTimer = setTimeout(() => {
    if (editDateMode.value) saveDate()
  }, 120)
}
function cancelEditDate() {
  clearTimeout(blurTimer)
  editDateMode.value = false
  editDateStart.value = classDateRange.value.start
  editDateEnd.value = classDateRange.value.end
  showDateEdit.value = false // 防止弹出日历
}
watch(showDateEdit, (val) => {
  if (val) {
    editDateMode.value = true
    editDateStart.value = classDateRange.value.start
    editDateEnd.value = classDateRange.value.end
  }
})
// 点击日期条弹出日历
watch(editDateMode, (val) => {
  if (!val && showDateEdit.value) {
    showDateEdit.value = false
    showCalendar.value = true
  }
})

// ===== iOS 负一屏可拖拽小组件系统 =====
const defaultWidgets = ['hero', 'people_schedule', 'meta']
const widgetOrderKey = computed(() => `widget_order_${classId.value}`)
const widgetOrder = ref([...defaultWidgets])

// 从 localStorage 恢复排列顺序
onMounted(() => {
  const saved = localStorage.getItem(widgetOrderKey.value)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // 确保包含所有widget（防止新增widget丢失）
      const valid = parsed.filter(w => defaultWidgets.includes(w))
      const missing = defaultWidgets.filter(w => !valid.includes(w))
      widgetOrder.value = [...valid, ...missing]
    } catch {
      widgetOrder.value = [...defaultWidgets]
    }
  }
})

// 拖拽状态
const dragIdx = ref(null)
const dragOverIdx = ref(null)

function onWidgetDragStart(e, idx) {
  dragIdx.value = idx
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', idx)
  // 设置拖拽图像的透明度
  if (e.target) {
    setTimeout(() => {
      e.target.style.opacity = '0.4'
    }, 0)
  }
}

function onWidgetDragOver(e, idx) {
  e.dataTransfer.dropEffect = 'move'
}

function onWidgetDragEnter(idx) {
  dragOverIdx.value = idx
}

function onWidgetDragLeave(idx) {
  if (dragOverIdx.value === idx) {
    dragOverIdx.value = null
  }
}

function onWidgetDrop(e, idx) {
  const fromIdx = dragIdx.value
  if (fromIdx === null || fromIdx === idx) return
  // 交换位置
  const newOrder = [...widgetOrder.value]
  const [moved] = newOrder.splice(fromIdx, 1)
  newOrder.splice(idx, 0, moved)
  widgetOrder.value = newOrder
  // 保存到 localStorage
  localStorage.setItem(widgetOrderKey.value, JSON.stringify(newOrder))
  dragIdx.value = null
  dragOverIdx.value = null
}

function onWidgetDragEnd(e) {
  if (e.target) {
    e.target.style.opacity = '1'
  }
  dragIdx.value = null
  dragOverIdx.value = null
}

// 元数据字段 computed
const metaFields = computed(() => [
  { key: 'contract', label: '合同号', value: classInfo.value.contractNumber },
  { key: 'classCode', label: '班级代码', value: classInfo.value.classId },
  { key: 'location', label: '交付地', value: classInfo.value.location }
])
const todoInput = ref('')
const todoDate = ref(new Date().toISOString().slice(0,10))
const todos = ref([])
const customCards = ref([])

// 加载本班级的待办和卡片
onMounted(async () => {
  try {
    await classStore.fetchClasses()
  } catch (error) {
    // 加载班级数据失败时静默处理
  }

  try {
    todos.value = await classStore.fetchTodos(classId.value)
  } catch (error) {
    const todoKey = `class_todos_${classId.value}`
    const todoSaved = localStorage.getItem(todoKey)
    if (todoSaved) {
      try { todos.value = JSON.parse(todoSaved) } catch {}
    }
  }

  try {
    if (classStore.classes.length === 0) {
      await classStore.fetchClasses()
    }
    const currentClass = classStore.getClassById(classId.value)
    if (currentClass && currentClass.courses && currentClass.courses.length > 0) {
      customCards.value = currentClass.courses
    } else {
      const cardKey = `class_custom_cards_${classId.value}`
      const cardSaved = localStorage.getItem(cardKey)
      if (cardSaved) {
        try { customCards.value = JSON.parse(cardSaved) } catch {}
      }
    }
  } catch (error) {
    const cardKey = `class_custom_cards_${classId.value}`
    const cardSaved = localStorage.getItem(cardKey)
    if (cardSaved) {
      try { customCards.value = JSON.parse(cardSaved) } catch {}
    }
  }
})
watch(customCards, async (newValue) => {
  localStorage.setItem(`class_custom_cards_${classId.value}`, JSON.stringify(newValue))
  try {
    await fetch(`http://localhost:3001/api/classes/${classId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courses: newValue })
    })
  } catch (error) {
    // 同步失败静默处理，本地数据已保存
  }
}, { deep: true })

const statusList = [
  { key: 'planning', label: '规划', color: '#42a5f5' },
  { key: 'doing', label: '进行中', color: '#00bfae' },
  { key: 'done', label: '已完成', color: '#43a047' }
]
async function addTodo() {
  if (!todoInput.value.trim()) return
  
  try {
    const todoData = {
      text: todoInput.value.trim(),
      status: 'planning',
      date: todoDate.value,
      classId: classInfo.value.id
    }
    
    // 调用API创建待办事项
    const newTodo = await classStore.createTodo(todoData)
    
    // 添加到前端数组
    todos.value.unshift(newTodo)
    
    // 清空输入
    todoInput.value = ''
    todoDate.value = new Date().toISOString().slice(0,10)
  } catch (error) {
    alert('创建待办事项失败，请重试')
  }
}
async function setTodoStatus(todo, status) {
  try {
    // 调用API更新待办事项状态
    await classStore.updateTodoStatus(todo.id, status)
    
    // 更新前端状态
    todo.status = status
  } catch (error) {
    alert('更新待办事项状态失败，请重试')
  }
}

async function deleteTodo(todo) {
  try {
    // 调用API删除待办事项
    await classStore.deleteTodo(todo.id)
    
    // 从前端数组移除
    const idx = todos.value.indexOf(todo)
    if (idx !== -1) todos.value.splice(idx, 1)
  } catch (error) {
    alert('删除待办事项失败，请重试')
  }
}

// 分组：按日期分组待办
const todosByDate = computed(() => {
  const groups = {}
  for (const todo of todos.value) {
    if (!groups[todo.date]) groups[todo.date] = []
    groups[todo.date].push(todo)
  }
  // 按日期倒序排列
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
})

const classInfo = computed(() => {
  return classStore.getClassById(classId.value) || {
    name: '未知班级',
    teacher: '未知教师',
    image: ''
  }
})

const goToHome = () => {
  router.push({ name: 'home' })
}

const goToLeaderboard = () => {
  router.push({ name: 'leaderboard', params: { courseId: classId.value } })
}

const goToGameManagement = () => {
  router.push({ name: 'game-management', params: { courseId: classId.value } })
}

// 日历模块相关
const calendarMonth = ref(0) // 0=当月, -1=上月, 1=下月
const courseColors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

const calendarMonthLabel = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() + calendarMonth.value)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
})

const classDayCount = computed(() => {
  if (!classDateRange.value.start || !classDateRange.value.end) return 0
  const s = new Date(classDateRange.value.start)
  const e = new Date(classDateRange.value.end)
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1
})

const trainingProgress = computed(() => {
  if (!classDateRange.value.start || !classDateRange.value.end) return 0
  const start = new Date(classDateRange.value.start).getTime()
  const end = new Date(classDateRange.value.end).getTime()
  const now = new Date().getTime()
  
  if (now < start) return 0
  if (now > end) return 100
  
  const total = end - start
  const current = now - start
  return Math.max(0, Math.min(100, (current / total) * 100))
})

const trainingStatusText = computed(() => {
  if (!classDateRange.value.start || !classDateRange.value.end) return ''
  const p = trainingProgress.value
  if (p <= 0) return '未开始'
  if (p >= 100) return '已结课'
  return '进行中'
})

const calendarCells = computed(() => {
  const today = new Date()
  const d = new Date()
  d.setMonth(d.getMonth() + calendarMonth.value)
  const year = d.getFullYear()
  const month = d.getMonth()
  const firstDay = new Date(year, month, 1)
  // 周一为起始（将 getDay() 0=周日 转为 0=周一）
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const rangeStart = classDateRange.value.start || ''
  const rangeEnd = classDateRange.value.end || ''

  const cells = []
  // 上月填充
  for (let i = 0; i < startOffset; i++) {
    cells.push({ key: `pre-${i}`, day: '', isToday: false, isInRange: false, isStart: false, isEnd: false, isOutside: true })
  }
  // 本月日期
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dateObj = new Date(year, month, day)
    const isToday = dateObj.toDateString() === today.toDateString()
    const isInRange = rangeStart && rangeEnd && dateStr >= rangeStart && dateStr <= rangeEnd
    const isStart = dateStr === rangeStart
    const isEnd = dateStr === rangeEnd
    cells.push({ key: dateStr, day, isToday, isInRange, isStart, isEnd, isOutside: false })
  }
  // 下月填充到 7 的倍数
  const remainder = cells.length % 7
  if (remainder > 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      cells.push({ key: `post-${i}`, day: '', isToday: false, isInRange: false, isStart: false, isEnd: false, isOutside: true })
    }
  }
  return cells
})

const showAddCardDialog = ref(false)
const newCardTitle = ref('')
const newCardDuration = ref('')
const newCardContent = ref('')
const addMethod = ref('manual')
const courseLibrary = ref([])
const selectedCourseIds = ref([])

async function openAddCardDialog() {
  newCardTitle.value = ''
  newCardDuration.value = ''
  newCardContent.value = ''
  addMethod.value = 'manual'
  selectedCourseIds.value = []
  await loadCourseLibrary()
  showAddCardDialog.value = true
}

function toggleCourseSelection(course) {
  const idx = selectedCourseIds.value.indexOf(course.id)
  if (idx === -1) {
    selectedCourseIds.value.push(course.id)
  } else {
    selectedCourseIds.value.splice(idx, 1)
  }
}

function isCourseSelected(courseId) {
  return selectedCourseIds.value.includes(courseId)
}

async function loadCourseLibrary() {
  try {
    courseLibrary.value = await coursesStore.fetchCourseLibrary()
  } catch (error) {
    courseLibrary.value = []
  }
}

function selectCourse(course) {
  toggleCourseSelection(course)
}

function goToCourseLibrary() {
  router.push({ name: 'courseLibrary' })
}
function closeAddCardDialog() {
  showAddCardDialog.value = false
}
async function addCustomCard() {
  // 如果是从课程库选择，支持批量添加
  if (addMethod.value === 'library' && selectedCourseIds.value.length > 0) {
    for (const courseId of selectedCourseIds.value) {
      const selectedCourse = courseLibrary.value.find(c => c.id === courseId)
      if (selectedCourse) {
        const cardData = {
          title: selectedCourse.name,
          duration: selectedCourse.duration ? String(selectedCourse.duration) : '',
          content: selectedCourse.description || '',
          type: selectedCourse.type || '课程库课程',
          courseLibraryId: selectedCourse.id
        }
        if (!customCards.value.some(card => card.title === cardData.title)) {
          customCards.value.push(cardData)
          try {
            await classStore.addCourseToClass(classId.value, cardData)
          } catch (error) {
            // 即使数据库保存失败，仍然保留本地显示
          }
        }
      }
    }
    showAddCardDialog.value = false
    selectedCourseIds.value = []
    return
  }

  // 手动添加模式 - 标题为必填
  const title = newCardTitle.value.trim()
  if (!title) return

  // 手动添加模式
  if (customCards.value.some(card => card.title === title)) {
    showAddCardDialog.value = false
    return
  }

  const cardData = {
    title,
    duration: newCardDuration.value ? String(newCardDuration.value).trim() : '',
    content: newCardContent.value ? newCardContent.value.trim() : ''
  }

  if (selectedCourseIds.value.length > 0) {
    cardData.courseLibraryId = selectedCourseIds.value[0]
    const selectedCourse = courseLibrary.value.find(c => c.id === selectedCourseIds.value[0])
    if (selectedCourse) {
      cardData.type = selectedCourse.type || '课程库课程'
      if (!cardData.duration && selectedCourse.duration) {
        cardData.duration = String(selectedCourse.duration)
      }
    }
  } else {
    cardData.type = '自定义课程'
  }
  
  customCards.value.push(cardData)

  try {
    await classStore.addCourseToClass(classId.value, cardData)
  } catch (error) {
    // 即使数据库保存失败，仍然保留本地显示
  }

  showAddCardDialog.value = false
  newCardTitle.value = ''
  newCardDuration.value = ''
  newCardContent.value = ''
  selectedCourseIds.value = []
}

const editingTopField = ref('')
const editTopFieldValue = ref('')
function startEditTopField(key) {
  editingTopField.value = key
  editTopFieldValue.value = classInfo.value[keyMap[key]] || ''
}
function saveEditTopField(key) {
  const currentClassId = classId.value
  const classIdx = classStore.classes.findIndex(c => c.id === currentClassId)
  if (classIdx !== -1) {
    classStore.classes[classIdx][keyMap[key]] = editTopFieldValue.value
    // 更新到数据库
    fetch(`http://localhost:3001/api/classes/${currentClassId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [keyMap[key]]: editTopFieldValue.value })
    })
  }
  editingTopField.value = ''
}
function cancelEditTopField() {
  editingTopField.value = ''
}
const keyMap = {
  '班级名称': 'name',
  '讲师': 'teacher',
  '合同号': 'contractNumber',
  '班级代码': 'classId',
  '交付地': 'location',
  '班主任': 'coordinator'
}

// 只保留课程名称唯一的卡片
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
  if (idx !== -1) customCards.value.splice(idx, 1)
}

function editCustomCard(card) {
  // 打开编辑弹窗，预填充数据
  newCardTitle.value = card.title || ''
  newCardDuration.value = String(card.duration || '')
  newCardContent.value = card.content || ''
  selectedCourseIds.value = card.courseLibraryId ? [card.courseLibraryId] : []
  addMethod.value = card.courseLibraryId ? 'library' : 'manual'
  loadCourseLibrary()
  showAddCardDialog.value = true
}

function viewCourseInLibrary(courseLibraryId) {
  if (!courseLibraryId) return
  router.push({ name: 'courseLibrary', query: { highlight: courseLibraryId } })
}

function startEditTodo(todo) {
  todo.editing = true
  todo.editText = todo.text
}
function saveEditTodo(todo) {
  if (todo.editText && todo.editText.trim()) {
    todo.text = todo.editText.trim()
  }
  todo.editing = false
}
function cancelEditTodo(todo) {
  todo.editing = false
}
</script>

<style scoped>
/* ===== 基础布局 ===== */
.class-detail {
  font-family: var(--font-primary, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  color: #1e293b;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 60px;
  min-height: 100vh;
}

/* ===== 顶部导航栏 ===== */
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 10px;
}

.site-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.site-title i {
  color: var(--color-primary);
  font-size: 1.6rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.site-title:hover {
  transform: translateY(-1px);
  text-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.home-btn {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 99px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.home-btn:hover {
  background: white;
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* ===== 班级头部信息卡片 ===== */
.class-header {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(240, 240, 255, 0.25));
  backdrop-filter: blur(30px) saturate(150%);
  -webkit-backdrop-filter: blur(30px) saturate(150%);
  border-radius: 24px;
  padding: 28px 32px 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5);
  margin-bottom: 32px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.header-content {
  position: relative;
  z-index: 2;
}

/* ===== iOS 负一屏可拖拽小组件 ===== */
.widgets-container {
  position: relative;
}

.widgets-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 单个 Widget 卡片 — 毛玻璃 */
.widget-card {
  position: relative;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s ease;
  cursor: default;
  overflow: visible;
}

.widget-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

/* 拖拽手柄 */
.widget-handle {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: 10;
  color: rgba(0, 0, 0, 0.15);
  font-size: 0.7rem;
  transition: color 0.2s;
  border-radius: 0 0 8px 8px;
}

.widget-handle:active {
  cursor: grabbing;
}

.widget-card:hover .widget-handle {
  color: rgba(0, 0, 0, 0.35);
}

/* 拖拽状态 */
.widget-dragging {
  opacity: 0.4 !important;
  transform: scale(0.98);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
}

.widget-over {
  transform: translateY(4px);
}

.widget-over::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 16px;
  right: 16px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  border-radius: 99px;
  opacity: 1;
  animation: dropLinePulse 0.8s ease-in-out infinite alternate;
}

@keyframes dropLinePulse {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

/* transition-group 动画 */
.widget-move-move {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Widget 内容区 */
.widget-inner {
  padding: 18px 22px;
}

/* Hero Widget */
.widget-hero {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 24px;
}

.hero-title {
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin: 0;
}

.hero-input {
  font-size: 1.6rem !important;
  font-weight: 700;
  padding: 8px 14px !important;
}

/* People + Schedule 合并 Widget (1/4 + 1/4 + 1/2) */
.widget-people-schedule {
  display: flex;
  align-items: stretch;
  padding-top: 24px;
}

.wps-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.wps-quarter {
  flex: 1; /* 1/4 */
  padding: 0 4px;
  display: flex;
  flex-direction: row; /* allow icon + body horizontal */
  align-items: center;
  gap: 12px;
}

.wps-half {
  flex: 2; /* 1/2 */
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 12px;
  transition: background 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.wps-half:hover {
  background: rgba(99, 102, 241, 0.04);
}

.wps-vline {
  width: 1px;
  background: rgba(0, 0, 0, 0.07);
  margin: 0 12px;
  align-self: stretch;
}

.wps-schedule-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

/* 进度条样式 */
.timeline-bar {
  width: 100%;
}

.timeline-track {
  height: 4px;
  background: #e2e8f0;
  border-radius: 99px;
  position: relative;
  margin-bottom: 8px;
  overflow: visible;
}

.timeline-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 99px;
  position: absolute;
  left: 0;
  top: 0;
  transition: width 0.5s ease-out;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  background: #a855f7;
  border: 2px solid white;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
  transition: left 0.5s ease-out;
  animation: pulseDot 2s infinite;
}

@keyframes pulseDot {
  0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(168, 85, 247, 0); }
  100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
}

.timeline-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-light);
  font-weight: 500;
}

.timeline-status {
  color: var(--color-primary);
  font-weight: 600;
  background: rgba(99, 102, 241, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
}

/* Meta Grid - Horizontal Layout */
.widget-meta-grid {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding-top: 24px;
}

.widget-meta-cell {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px; /* Spacing between label and value */
  min-width: 0; /* Enable truncation for flex children */
}

/* Adjust label/value for horizontal flow */
.widget-meta-cell .module-label {
  margin-bottom: 0; /* Remove potential bottom margin from old vertical layout */
  font-size: 0.8rem;
  color: var(--text-light);
  white-space: nowrap;
}

.widget-meta-cell:hover .edit-icon-btn {
  opacity: 1;
}

/* Schedule icon & body overrides if needed */
.widget-schedule-icon {
  width: 36px;
  height: 36px;
  font-size: 0.95rem; /* smaller icon for denser layout */
}

/* 共用模块样式 */
.module-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.module-icon-primary {
  background: linear-gradient(135deg, #6366f1, #818cf8);
  color: white;
}

.module-icon-secondary {
  background: linear-gradient(135deg, #a855f7, #c084fc);
  color: white;
}

.module-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.module-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.module-value {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  word-break: break-all;
}

.module-value-placeholder {
  color: var(--text-light);
  font-weight: 400;
  font-size: 0.9rem;
}

/* 编辑图标按钮 */
.edit-icon-btn {
  opacity: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-light);
  font-size: 0.7rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  vertical-align: middle;
  margin-left: 6px;
}

.widget-card:hover .edit-icon-btn {
  opacity: 1;
}

.edit-icon-btn:hover {
  background: var(--color-primary);
  color: white;
  transform: scale(1.08);
}

.edit-actions {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

/* 编辑输入框和按钮 */
.edit-top-input {
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: inherit;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  background: rgba(255, 255, 255, 0.95);
  width: 100%;
}

.edit-top-input:focus {
  border-color: var(--color-primary);
}

.edit-save-btn, .edit-cancel-btn {
  border: none;
  border-radius: 8px;
  padding: 5px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-save-btn {
  background: var(--color-primary);
  color: white;
}

.edit-save-btn:hover {
  filter: brightness(1.1);
}

.edit-cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.edit-cancel-btn:hover {
  background: rgba(0, 0, 0, 0.08);
}

.date-edit-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.date-sep {
  color: var(--text-light);
  font-weight: 500;
}

.edit-date-input {
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  background: rgba(255, 255, 255, 0.9);
  max-width: 130px;
}

.edit-date-input:focus {
  border-color: var(--color-primary);
}

/* ===== 课程内容区域 ===== */
/* ===== 课程内容区域 ===== */
.course-section {
  padding: 0 0 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.module-icon-title {
  font-size: 28px;
  color: var(--color-primary);
  background: linear-gradient(135deg, #6366f1, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-title h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.5px;
}

.course-count-badge {
  background: #f1f5f9;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.btn-add-course {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: var(--color-primary);
  font-weight: 600;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 99px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.btn-add-course:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  color: #4f46e5;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.empty-state-course {
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 2px dashed rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s;
}

.empty-state-course:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: var(--color-primary);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #cbd5e1;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.empty-state-course:hover .empty-icon-circle {
  background: #e0e7ff;
  color: var(--color-primary);
  transform: scale(1.1);
}

.empty-state-course h3 {
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 8px 0;
}

.empty-state-course p {
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
}



/* ===== 待办事项与侧边栏 ===== */
.course-main-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}

.todos-area {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.todos-area h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.todos-area h3::before {
  content: '';
  width: 6px;
  height: 24px;
  background: var(--color-primary);
  border-radius: 3px;
  display: inline-block;
}

.todo-edit-row {
  display: flex;
  gap: 12px;
  background: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.todo-input {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: var(--bg-secondary);
}

.todo-input:focus {
  background: white;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.todo-date-input {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.todo-post-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.todo-post-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

/* 待办列表样式 - 优化版 */
.todo-board {
  position: relative;
}

.todo-date-group {
  margin-bottom: 32px;
}

.todo-date-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 12px;
  padding-left: 12px;
  border-left: 2px solid var(--border-color);
}

.todo-status-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.todo-status-cols-fixed {
  margin-bottom: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  padding: 10px 0;
  border-radius: 12px;
}

.todo-status-title {
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 8px;
  border-radius: 8px;
  color: white;
}

.todo-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: all 0.2s;
  position: relative;
}

.todo-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
}

.todo-content-planning { border-left: 4px solid #42a5f5; }
.todo-content-doing { border-left: 4px solid #00bfae; }
.todo-content-done { border-left: 4px solid #43a047; opacity: 0.7; }

.todo-text {
  font-size: 0.95rem;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.5;
}

.todo-actions {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.todo-actions button {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.todo-actions button:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.todo-delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.todo-item:hover .todo-delete-btn {
  opacity: 1;
}

/* 侧边栏按钮 */
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

/* ===== 弹窗样式 ===== */
.dialog-mask, .calendar-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
  background: rgba(0, 0, 0, 0.25);
}

.dialog-box {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: calPopIn 0.25s ease-out;
}

@keyframes calPopIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

/* ===== 简洁日历弹窗 ===== */
.calendar-dialog {
  background: #fff;
  border-radius: 20px;
  width: 380px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: calPopIn 0.25s ease-out;
}

/* 日历头部 */
.cal-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.cal-month-title {
  flex: 1;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
}

.cal-nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.cal-nav-btn:hover {
  background: #f1f5f9;
  color: var(--text-primary);
}

.cal-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-light);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  transition: all 0.15s;
}

.cal-close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* 日期范围摘要 */
.cal-range-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f0f4ff;
  font-size: 0.85rem;
  font-weight: 500;
  color: #4f46e5;
}

.cal-range-bar i {
  font-size: 0.9rem;
}

.cal-range-days {
  margin-left: auto;
  background: #e0e7ff;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 600;
}

.cal-range-empty {
  background: #fefce8;
  color: #a16207;
}

/* 日历网格 */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 16px 16px 12px;
  gap: 2px;
}

.cal-weekday {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  padding-bottom: 8px;
}

.cal-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  position: relative;
}

.cal-day {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.15s;
  position: relative;
  z-index: 1;
}

.cal-cell-empty .cal-day,
.cal-cell-outside .cal-day {
  color: transparent;
}

/* 今天 */
.cal-cell-today .cal-day {
  font-weight: 700;
  color: #4f46e5;
  box-shadow: inset 0 0 0 2px #4f46e5;
}

/* 班级日期范围内 */
.cal-cell-class {
  background: #ede9fe;
}

.cal-cell-class .cal-day {
  color: #4f46e5;
  font-weight: 600;
}

/* 范围起始/结束圆角 */
.cal-cell-start {
  border-radius: 10px 0 0 10px;
}

.cal-cell-end {
  border-radius: 0 10px 10px 0;
}

.cal-cell-start.cal-cell-end {
  border-radius: 10px;
}

/* 今天同时在范围中 */
.cal-cell-today.cal-cell-class .cal-day {
  background: #4f46e5;
  color: white;
  box-shadow: none;
}

/* 课程列表摘要 */
.cal-courses {
  padding: 12px 20px 16px;
  border-top: 1px solid #f1f5f9;
}

.cal-courses-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}

.cal-course-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.cal-course-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cal-course-name {
  flex: 1;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cal-course-dur {
  font-size: 0.78rem;
  color: var(--text-light);
  font-weight: 500;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
}

.add-card-title-bar {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  padding: 20px;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .course-main-content {
    grid-template-columns: 1fr;
  }
  
  .course-sidebar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  .action-buttons {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .widget-people-schedule {
    flex-direction: column;
  }
  
  .wps-vline {
    display: none;
  }
  
  .wps-quarter, .wps-half {
    width: 100%;
    padding: 12px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  .wps-half {
    border-bottom: none;
    padding-top: 20px;
  }
  
  .widget-meta-grid {
    flex-direction: column;
    gap: 16px;
  }
  
  .hero-title {
    font-size: 1.4rem;
  }
  
  .parsed-cards-wrap {
    grid-template-columns: 1fr;
  }
  
  .course-sidebar {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .todo-status-cols {
    grid-template-columns: 1fr;
  }
  
  .class-detail {
    padding: 0 16px 40px;
  }
}
</style>

<style scoped>
/* ===== 现代化添加课程弹窗 CSS ===== */
.add-card-dialog-modern {
  width: 600px;
  max-width: 90%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.dialog-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: rotate(90deg);
}

/* 顶部 Tab 切换 */
.dialog-tabs {
  padding: 16px 24px 0;
}

.segmented-control {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  display: flex;
  position: relative;
  isolation: isolate;
}

.segment-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  z-index: 2;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.segment-btn.active {
  color: var(--color-primary);
}

.segment-divider {
  width: 1px;
  background: rgba(0, 0, 0, 0.05);
  margin: 8px 0;
}

.segment-bg {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 1;
}

/* 表单內容區 */
.dialog-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 16px;
  color: #94a3b8;
  pointer-events: none;
}

.modern-input, .modern-textarea {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #1e293b;
  transition: all 0.2s;
}

.modern-textarea {
  padding: 12px 16px;
  min-height: 100px;
  resize: vertical;
}

.textarea-wrapper {
  display: block;
}

.modern-input:focus, .modern-textarea:focus {
  background: white;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  outline: none;
}

/* 课程库选择列表 */
.library-selection-modern {
  min-height: 300px;
}

.empty-library-modern {
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
}

.empty-icon-box {
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #cbd5e1;
  margin: 0 auto 16px;
}

.btn-text-primary {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-text-primary:hover {
  background: rgba(99, 102, 241, 0.05);
  border-radius: 8px;
}

.course-list-modern {
  display: grid;
  gap: 12px;
}

.course-item-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.course-item-card:hover {
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.course-item-card.selected {
  background: rgba(99, 102, 241, 0.04);
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.course-card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: var(--color-primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 16px;
}

.course-card-info {
  flex: 1;
}

.course-card-info h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: #1e293b;
}

.course-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-tag {
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 6px;
  border-radius: 4px;
}

.meta-text {
  font-size: 0.8rem;
  color: #94a3b8;
}

.selection-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  transition: all 0.2s;
}

.selected .selection-indicator {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

/* 底部按钮 */
.dialog-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f8fafc;
}

.btn-cancel-modern {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-modern:hover {
  background: #f1f5f9;
  color: #475569;
}

.btn-confirm-modern {
  padding: 10px 24px;
  border: none;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(79, 110, 247, 0.3);
  transition: all 0.2s;
}

.btn-confirm-modern:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

.btn-confirm-modern:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
