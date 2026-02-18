<template>
  <div class="course-section">
    <div class="section-header">
      <div class="section-title">
        <i class="fas fa-book-reader module-icon-title"></i>
        <h2>课程安排</h2>
        <span class="course-count-badge">{{ courses.length }}</span>
      </div>
      <button class="btn-add-course" @click="openAddCardDialog">
        <i class="fas fa-plus"></i> 添加课程
      </button>
    </div>

    <div class="course-grid">
      <template v-if="courses.length > 0">
        <CourseCardSimple
          v-for="(card, idx) in courses"
          :key="'custom-'+idx"
          :course="card"
          @delete-course="$emit('delete-course', card.title)"
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/coursesStore'
import CourseCardSimple from '@/components/CourseCardSimple.vue'

const props = defineProps({
  courses: { type: Array, default: () => [] }
})

const emit = defineEmits(['add-course', 'delete-course'])

const router = useRouter()
const coursesStore = useCoursesStore()

const showAddCardDialog = ref(false)
const newCardTitle = ref('')
const newCardDuration = ref('')
const newCardContent = ref('')
const addMethod = ref('manual')
const courseLibrary = ref([])
const selectedCourseIds = ref([])

async function loadCourseLibrary() {
  try {
    courseLibrary.value = await coursesStore.fetchCourseLibrary()
  } catch (error) {
    courseLibrary.value = []
  }
}

async function openAddCardDialog() {
  newCardTitle.value = ''
  newCardDuration.value = ''
  newCardContent.value = ''
  addMethod.value = 'manual'
  selectedCourseIds.value = []
  await loadCourseLibrary()
  showAddCardDialog.value = true
}

function closeAddCardDialog() {
  showAddCardDialog.value = false
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

function goToCourseLibrary() {
  router.push({ name: 'courseLibrary' })
}

function viewCourseInLibrary(courseLibraryId) {
  if (!courseLibraryId) return
  router.push({ name: 'courseLibrary', query: { highlight: courseLibraryId } })
}

function editCustomCard(card) {
  // 简化的编辑：直接打开手动添加模式并填充数据
  // 注意：此处如果支持编辑，需要更复杂的逻辑（更新而非添加）
  // 为了保持与ClassDetail一致，这里我们假设编辑 = 重新添加/覆盖？
  // 原代码逻辑：打开Dialog预填充。
  newCardTitle.value = card.title || ''
  newCardDuration.value = String(card.duration || '')
  newCardContent.value = card.content || ''
  selectedCourseIds.value = card.courseLibraryId ? [card.courseLibraryId] : []
  addMethod.value = card.courseLibraryId ? 'library' : 'manual'
  loadCourseLibrary()
  showAddCardDialog.value = true
}

// 添加课程逻辑
async function addCustomCard() {
  // 1. Library Mode
  if (addMethod.value === 'library' && selectedCourseIds.value.length > 0) {
    const cardsToAdd = []
    for (const courseId of selectedCourseIds.value) {
      const selectedCourse = courseLibrary.value.find(c => c.id === courseId)
      if (selectedCourse) {
        cardsToAdd.push({
          title: selectedCourse.name,
          duration: selectedCourse.duration ? String(selectedCourse.duration) : '',
          content: selectedCourse.description || '',
          type: selectedCourse.type || '课程库课程',
          courseLibraryId: selectedCourse.id
        })
      }
    }
    emit('add-course', cardsToAdd)
    closeAddCardDialog()
    return
  }

  // 2. Manual Mode
  const title = newCardTitle.value.trim()
  if (!title) return

  const cardData = {
    title,
    duration: newCardDuration.value ? String(newCardDuration.value).trim() : '',
    content: newCardContent.value ? newCardContent.value.trim() : '',
    type: '自定义课程'
  }
  
  emit('add-course', [cardData])
  closeAddCardDialog()
}
</script>

<style scoped>
/* Copy relevant styles from ClassDetail.vue */
.course-section { padding: 0 0 40px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 0 8px; }
.section-title { display: flex; align-items: center; gap: 12px; }
.section-title h2 { font-size: 24px; font-weight: 700; color: #1e293b; margin: 0; letter-spacing: -0.5px; }
.course-count-badge { background: #f1f5f9; color: #64748b; font-size: 14px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
.btn-add-course { background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(0, 0, 0, 0.05); color: var(--color-primary); font-weight: 600; font-size: 15px; padding: 10px 20px; border-radius: 99px; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03); transition: all 0.2s; backdrop-filter: blur(10px); }
.btn-add-course:hover { background: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15); color: #4f46e5; }
.course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.empty-state-course { grid-column: 1 / -1; background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(20px); border-radius: 24px; border: 2px dashed rgba(0, 0, 0, 0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #94a3b8; cursor: pointer; transition: all 0.3s; }
.empty-state-course:hover { background: rgba(255, 255, 255, 0.9); border-color: var(--color-primary); transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); }
.empty-icon-circle { width: 64px; height: 64px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #cbd5e1; margin-bottom: 20px; transition: all 0.3s; }
.empty-state-course:hover .empty-icon-circle { background: #e0e7ff; color: var(--color-primary); transform: scale(1.1); }
.empty-state-course h3 { font-size: 18px; font-weight: 600; color: #64748b; margin: 0 0 8px 0; }
.empty-state-course p { font-size: 14px; margin: 0; opacity: 0.8; }
.module-icon-title { font-size: 28px; color: var(--color-primary); background: linear-gradient(135deg, #6366f1, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

/* Dialog Styles */
.dialog-mask { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(6px); background: rgba(0, 0, 0, 0.25); }
.add-card-dialog-modern { width: 600px; max-width: 90%; background: #ffffff; display: flex; flex-direction: column; max-height: 85vh; border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); overflow: hidden; animation: calPopIn 0.25s ease-out; }
.dialog-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0, 0, 0, 0.05); }
.dialog-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
.btn-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f1f5f9; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-close:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }
.dialog-tabs { padding: 16px 24px 0; }
.segmented-control { background: #f1f5f9; border-radius: 12px; padding: 4px; display: flex; position: relative; isolation: isolate; }
.segment-btn { flex: 1; border: none; background: transparent; padding: 10px; font-weight: 600; color: #64748b; cursor: pointer; z-index: 2; transition: color 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.segment-btn.active { color: var(--color-primary); }
.segment-divider { width: 1px; background: rgba(0, 0, 0, 0.05); margin: 8px 0; }
.segment-bg { position: absolute; top: 4px; left: 4px; width: calc(50% - 4px); height: calc(100% - 8px); background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1); z-index: 1; }
.dialog-body { padding: 24px; overflow-y: auto; flex: 1; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 8px; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-wrapper i { position: absolute; left: 16px; color: #94a3b8; pointer-events: none; }
.modern-input, .modern-textarea { width: 100%; padding: 12px 16px 12px 42px; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 12px; font-size: 0.95rem; color: #1e293b; transition: all 0.2s; }
.modern-textarea { padding: 12px 16px; min-height: 100px; resize: vertical; }
.input-wrapper.textarea-wrapper { display: block; }
.modern-input:focus, .modern-textarea:focus { background: white; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); outline: none; }
.library-selection-modern { min-height: 300px; }
.empty-library-modern { text-align: center; padding: 40px 0; color: #94a3b8; }
.empty-icon-box { width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #cbd5e1; margin: 0 auto 16px; }
.btn-text-primary { background: none; border: none; color: var(--color-primary); font-weight: 600; cursor: pointer; padding: 8px 16px; }
.course-list-modern { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.course-item-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; position: relative; display: flex; flex-direction: column; gap: 12px; }
.course-item-card:hover { border-color: var(--color-primary); background: #f0fdf4; }
.course-item-card.selected { border-color: var(--color-primary); background: #f0f9ff; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); }
.course-card-icon { width: 40px; height: 40px; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--color-primary); font-size: 1.2rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); }
.course-card-info h4 { margin: 0; font-size: 0.95rem; color: #334155; line-height: 1.4; }
.course-card-meta { display: flex; gap: 8px; font-size: 0.75rem; color: #64748b; margin-top: auto; }
.selection-indicator { position: absolute; top: 12px; right: 12px; width: 24px; height: 24px; border-radius: 50%; border: 2px solid #cbd5e1; display: flex; align-items: center; justify-content: center; color: white; transition: all 0.2s; }
.course-item-card.selected .selection-indicator { background: var(--color-primary); border-color: var(--color-primary); }
.dialog-footer { padding: 20px 24px; border-top: 1px solid rgba(0, 0, 0, 0.05); display: flex; justify-content: flex-end; gap: 12px; background: #f8fafc; }
.btn-cancel-modern { padding: 10px 24px; border-radius: 99px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-cancel-modern:hover { background: #f1f5f9; color: #334155; }
.btn-confirm-modern { padding: 10px 24px; border-radius: 99px; border: none; background: var(--color-primary); color: white; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }
.btn-confirm-modern:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3); }
.btn-confirm-modern:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
</style>
