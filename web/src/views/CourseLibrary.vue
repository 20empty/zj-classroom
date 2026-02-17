<template>
  <div class="course-library">
    <div class="header">
      <div class="header-title-section">
        <h1 class="site-title" @click="goToHome">
          <i class="fas fa-graduation-cap"></i>
          ZJ-Huawei Classroom
        </h1>
      </div>
      <div class="header-actions">
        <button class="add-course-btn" @click="addNewCourse">
          <i class="fas fa-plus"></i> 添加课程
        </button>
        <button class="back-btn" @click="goBack" title="返回主页">
          <i class="fas fa-arrow-left"></i> 返回
        </button>
      </div>
    </div>
    <div class="library-content">
      <div class="category-list">
        <div
          v-for="cat in categories"
          :key="cat"
          :class="['category-item', { active: selectedCategory === cat }]"
          @click="selectCategory(cat)"
        >
          {{ cat }}
        </div>
      </div>
      <div class="courses-grid">
        <CourseCardSimple 
          v-for="course in filteredCourses" 
          :key="course.id" 
          :course="course"
          :data-course-id="course.id"
          @delete-course="handleDeleteCourse"
          @edit-course="handleEditCourse"
          @manage-schedule="handleManageSchedule"
        />
        <!-- 如果没有课程，显示空状态 -->
        <div v-if="filteredCourses.length === 0" class="empty-state">
          <i class="fas fa-book-open"></i>
          <h3>暂无课程</h3>
          <p>点击"添加课程"开始创建您的第一个课程</p>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑课程弹窗 -->
    <div v-if="showAddDialog" class="dialog-mask">
      <div class="dialog-box">
        <div class="dialog-title">
          <h3>{{ isEditing ? '编辑课程' : '添加新课程' }}</h3>
        </div>
        <form @submit.prevent="confirmAddCourse">
          <div class="form-group">
            <label>课程名称：</label>
            <input v-model="newCourse.name" type="text" required class="form-input" />
          </div>
          <div class="form-group">
            <label>课程描述：</label>
            <textarea v-model="newCourse.description" class="form-textarea" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>课程时长（小时）：</label>
            <input v-model="newCourse.duration" type="number" min="1" class="form-input" />
          </div>
          <div class="form-group">
            <label>课程分类：</label>
            <select v-model="newCourse.category" class="form-select">
              <option value="华为云">华为云</option>
              <option value="华为云Stack">华为云Stack</option>
              <option value="AI">AI</option>
              <option value="大数据">大数据</option>
              <option value="5G">5G</option>
            </select>
          </div>
          <div class="dialog-buttons">
            <button type="submit" class="confirm-btn">{{ isEditing ? '确认修改' : '确认添加' }}</button>
            <button type="button" @click="showAddDialog = false" class="cancel-btn">取消</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 课表管理弹窗 -->
    <div v-if="showScheduleDialog" class="dialog-mask">
      <div class="dialog-box schedule-dialog">
        <div class="dialog-title">
          <h3>课表管理 - {{ currentCourse?.name }}</h3>
          <button class="close-btn" @click="showScheduleDialog = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="schedule-content">
          <ScheduleUpload 
            :course-id="currentCourse?.id"
            @upload-success="handleScheduleUploadSuccess"
            @upload-error="handleScheduleUploadError"
          />
          <ScheduleViewer 
            :course-id="currentCourse?.id"
            @schedule-deleted="handleScheduleDeleted"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCoursesStore } from '@/stores/coursesStore'
import CourseCardSimple from '@/components/CourseCardSimple.vue'
import ScheduleUpload from '@/components/ScheduleUpload.vue'
import ScheduleViewer from '@/components/ScheduleViewer.vue'

const router = useRouter()
const route = useRoute()
const coursesStore = useCoursesStore()
const courses = ref([])
const showAddDialog = ref(false)
const showScheduleDialog = ref(false)
const isEditing = ref(false)
const editingCourseId = ref(null)
const currentCourse = ref(null)
const newCourse = ref({
  name: '',
  description: '',
  duration: '',
  category: '华为云'
})

const categories = [
  '全部',
  '华为云',
  '华为云Stack',
  'AI',
  '大数据',
  '5G'
]
const selectedCategory = ref('全部')

const filteredCourses = computed(() => {
  if (selectedCategory.value === '全部') return courses.value
  return courses.value.filter(course => course.category === selectedCategory.value)
})

function selectCategory(cat) {
  selectedCategory.value = cat
}

onMounted(async () => {
  await loadCourses()
  // 检查是否需要高亮显示某个课程
  const highlightId = route.query.highlight
  if (highlightId) {
    // 滚动到对应课程并高亮显示
    nextTick(() => {
      highlightCourse(highlightId)
    })
  }
})

async function loadCourses() {
  try {
    courses.value = await coursesStore.fetchCourseLibrary()
    console.log('从数据库加载课程库数据:', courses.value)
  } catch (error) {
    console.error('加载课程库数据失败:', error)
    courses.value = []
  }
}

// 已改为数据库存储，不再需要localStorage
// function saveCourses() {
//   try {
//     localStorage.setItem('course_library', JSON.stringify(courses.value))
//   } catch (error) {
//     console.error('保存课程数据失败:', error)
//   }
// }

function addNewCourse() {
  isEditing.value = false
  editingCourseId.value = null
  showAddDialog.value = true
  newCourse.value = {
    name: '',
    description: '',
    duration: '',
    category: '华为云'
  }
}

async function confirmAddCourse() {
  if (!newCourse.value.name.trim()) {
    alert('请输入课程名称')
    return
  }
  
  try {
    const courseData = {
      name: newCourse.value.name.trim(),
      description: newCourse.value.description.trim(),
      duration: newCourse.value.duration,
      category: newCourse.value.category,
      type: '课程库课程'
    }
    
    if (isEditing.value) {
      // 编辑现有课程
      await coursesStore.updateCourseLibrary(editingCourseId.value, courseData)
      // 重新加载课程列表
      await loadCourses()
    } else {
      // 添加新课程
      await coursesStore.createCourseLibrary(courseData)
      // 重新加载课程列表
      await loadCourses()
    }
    
    showAddDialog.value = false
    isEditing.value = false
    editingCourseId.value = null
  } catch (error) {
    console.error('保存课程失败:', error)
    alert('保存课程失败，请重试')
  }
}

async function handleDeleteCourse(courseId) {
  if (confirm('确定要删除这个课程吗？')) {
    try {
      await coursesStore.deleteCourseLibrary(courseId)
      // 重新加载课程列表
      await loadCourses()
    } catch (error) {
      console.error('删除课程失败:', error)
      alert('删除课程失败，请重试')
    }
  }
}

function handleEditCourse(course) {
  isEditing.value = true
  editingCourseId.value = course.id
  newCourse.value = {
    name: course.name,
    description: course.description || '',
    duration: course.duration || '',
    category: course.category || '华为云'
  }
  showAddDialog.value = true
}

function handleManageSchedule(course) {
  currentCourse.value = course
  showScheduleDialog.value = true
}

function handleScheduleUploadSuccess(schedule) {
  console.log('课表上传成功:', schedule)
}

function handleScheduleUploadError(error) {
  console.error('课表上传失败:', error)
}

function handleScheduleDeleted() {
  console.log('课表已删除')
}

function goBack() {
  router.push({ name: 'home' })
}

function goToHome() {
  router.push({ name: 'home' })
}

function highlightCourse(courseId) {
  // 查找对应的课程卡片元素并高亮显示
  const courseElement = document.querySelector(`[data-course-id="${courseId}"]`)
  if (courseElement) {
    courseElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    courseElement.classList.add('highlighted')
    setTimeout(() => {
      courseElement.classList.remove('highlighted')
    }, 3000)
  }
}
</script>

<style scoped>
.course-library {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-title-section {
  flex: 1;
}

.site-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #202124;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  user-select: none;
}

.site-title:hover {
  color: #4285f4;
  transform: translateY(-1px);
}

.site-title:active {
  transform: translateY(0);
}

.site-title i {
  color: #4285f4;
  font-size: 1.6rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.add-course-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-course-btn:hover {
  background-color: #3367d6;
}

.back-btn {
  background-color: #f1f3f4;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #e8eaed;
}

.library-content {
  display: flex;
  flex-direction: row;
  gap: 24px;
}
.category-list {
  width: 160px;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  height: fit-content;
}
.category-item {
  padding: 10px 24px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
  transition: background 0.2s, color 0.2s;
}
.category-item.active, .category-item:hover {
  background: #4285f4;
  color: #fff;
}
.courses-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .site-title {
    font-size: 1.5rem;
  }
  
  .site-title i {
    font-size: 1.4rem;
  }
}

.dialog-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-box {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
  width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  animation: popIn 0.25s cubic-bezier(0.4, 1.4, 0.6, 1);
}

@keyframes popIn {
  0% {
    transform: scale(0.92);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.dialog-title {
  margin-bottom: 20px;
  text-align: center;
}

.dialog-title h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.confirm-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.confirm-btn:hover {
  background-color: #3367d6;
}

.cancel-btn {
  background-color: #f1f3f4;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #e8eaed;
}

/* 课表管理弹窗样式 */
.schedule-dialog {
  min-width: 600px;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
}

.schedule-dialog .dialog-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f1f3f4;
  color: #333;
}

.schedule-content {
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  padding: 20px 0;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state i {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 20px;
  font-weight: 500;
}

.empty-state p {
  margin: 0;
  color: #888;
  font-size: 14px;
}

/* 高亮效果 */
.course-card-simple.highlighted {
  animation: highlightPulse 2s ease-in-out;
  box-shadow: 0 0 20px rgba(66, 133, 244, 0.3);
}

@keyframes highlightPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(66, 133, 244, 0.4);
  }
}
</style> 