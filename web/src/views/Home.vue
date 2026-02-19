<template>
  <div class="home">
    <!-- Hero Header -->
    <div class="hero-header">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title" @click="refreshPage">
            <i class="fas fa-graduation-cap"></i>
            ZJ–Huawei Classroom
          </h1>
          <p class="hero-subtitle">智能培训班级管理平台</p>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <div class="action-bar-left">
        <span class="section-label">
          <i class="fas fa-layer-group"></i>
          我的班级
          <span class="class-count" v-if="classStore.classes.length">{{ classStore.classes.length }}</span>
        </span>
      </div>
      <div class="action-bar-right">
        <button class="action-btn action-btn-primary" @click="handleCreateClass">
          <i class="fas fa-plus"></i>
          <span>新建班级</span>
        </button>
        <button class="action-btn action-btn-accent" @click="openDialog" title="智能解析">
          <i class="fas fa-wand-magic-sparkles"></i>
          <span>智能解析</span>
        </button>
        <div class="action-divider"></div>
        <button class="action-btn action-btn-ghost" @click="goToCalendar" title="课程日历">
          <i class="fas fa-calendar-alt"></i>
        </button>
        <button class="action-btn action-btn-ghost" @click="goToCourseLibrary" title="课程库">
          <i class="fas fa-book"></i>
        </button>
        <button class="action-btn action-btn-ghost" @click="goToTestAPI" title="测试数据库API">
          <i class="fas fa-database"></i>
        </button>
        <button class="action-btn action-btn-ghost" @click="goToSimpleTest" title="简单测试">
          <i class="fas fa-flask"></i>
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="classStore.loading" class="courses-grid">
      <div v-for="n in 3" :key="n" class="skeleton-card">
        <div class="skeleton-image skeleton-pulse"></div>
        <div class="skeleton-body">
          <div class="skeleton-line skeleton-line-title skeleton-pulse"></div>
          <div class="skeleton-line skeleton-line-short skeleton-pulse"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="classStore.classes.length === 0" class="empty-state">
      <div class="empty-illustration">
        <div class="empty-icon-circle">
          <i class="fas fa-chalkboard"></i>
        </div>
      </div>
      <h3 class="empty-title">还没有班级</h3>
      <p class="empty-desc">点击「新建班级」按钮创建你的第一个培训班级，或使用「智能解析」从截图中自动创建</p>
      <div class="empty-actions">
        <button class="action-btn action-btn-primary" @click="handleCreateClass">
          <i class="fas fa-plus"></i>
          <span>新建班级</span>
        </button>
        <button class="action-btn action-btn-accent" @click="openDialog">
          <i class="fas fa-wand-magic-sparkles"></i>
          <span>智能解析</span>
        </button>
      </div>
    </div>

    <!-- Classes Grid -->
    <div v-else class="courses-grid">
      <CourseCard 
        v-for="course in classStore.classes" 
        :key="course.id" 
        :course="course"
        @update-image="classStore.updateClassImage"
        @delete-course="handleDeleteCourse"
      />
    </div>

    <!-- 智能解析弹窗 -->
    <div v-if="showDialog" class="dialog-mask" @click.self="closeDialog">
      <div class="dialog-box tongyi-dialog-box">
        <div class="tongyi-title-bar">
          <h3><i class="fas fa-wand-magic-sparkles"></i> 上传开班邮件截图</h3>
        </div>
        <div class="tongyi-form">
          <div class="tongyi-row">
            <label class="tongyi-label">上传本地图片：</label>
            <input type="file" accept="image/*" ref="fileInputRef" @change="onFileChange" class="tongyi-file-input" />
            <button type="button" class="tongyi-file-btn" @click="triggerFileInput">
              <i class="fas fa-upload"></i> 选择文件
            </button>
            <span v-if="imageBase64" class="tongyi-file-name"><i class="fas fa-check-circle"></i> 已选择</span>
          </div>
          <div class="tongyi-row">
            <button type="button" class="edit-prompt-btn" @click="openPromptDialog">
              <i class="fas fa-edit"></i> 编辑提示词
            </button>
          </div>
          <div class="tongyi-btns">
            <button @click="closeDialog" class="tongyi-cancel-btn">取消</button>
            <button @click="submitTongyi" :disabled="loading || !imageBase64" class="tongyi-confirm-btn">
              <i v-if="!loading" class="fas fa-paper-plane"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              {{ loading ? '解析中...' : '提交解析' }}
            </button>
          </div>
          <div v-if="loading" class="tongyi-progress-bar-wrap">
            <div class="tongyi-progress-bar-bg">
              <div class="tongyi-progress-bar-inner" :style="{width: progress + '%'}"></div>
            </div>
            <div class="tongyi-progress-info">
              <span class="tongyi-progress-text">正在智能生成开班信息，请稍等...</span>
              <span class="tongyi-progress-percent">
                {{ Math.floor(Number(progress) || 0) }}%
              </span>
            </div>
          </div>
          <div v-if="errorMsg" class="tongyi-error-msg">
            <i class="fas fa-exclamation-circle"></i> {{ errorMsg }}
          </div>
        </div>
      </div>
    </div>
    <!-- 校对弹窗 -->
    <div v-if="showCheckDialog" class="dialog-mask" @click.self="showCheckDialog=false">
      <div class="dialog-box check-dialog-box">
        <div class="check-title-bar">
          <h3><i class="fas fa-spell-check"></i> 校对解析结果</h3>
        </div>
        <form @submit.prevent="confirmCreateCourse">
          <div class="check-table-wrap">
            <table class="check-table">
              <tr v-for="(item, idx) in checkFields" :key="item.key">
                <td class="check-key">{{ item.key }}</td>
                <td>
                  <input v-model="item.value" class="check-input" />
                </td>
              </tr>
            </table>
          </div>
          <div class="check-btns">
            <button type="button" @click="showCheckDialog=false" class="check-cancel-btn">取消</button>
            <button type="submit" class="check-confirm-btn">
              <i class="fas fa-check"></i> 确认创建班级
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- 提示词弹窗 -->
    <div v-if="showPromptDialog" class="dialog-mask" @click.self="closePromptDialog">
      <div class="dialog-box prompt-dialog-box">
        <div class="prompt-title-bar">
          <h3><i class="fas fa-edit"></i> 编辑提示词</h3>
        </div>
        <textarea v-model="prompt" class="prompt-textarea"></textarea>
        <div class="prompt-btns">
          <button @click="closePromptDialog" class="prompt-confirm-btn">
            <i class="fas fa-check"></i> 完成
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useClassStore } from '@/stores/classStore'
import { useCoursesStore } from '@/stores/coursesStore'
import CourseCard from '@/components/CourseCard.vue'
import { useRouter } from 'vue-router'


const classStore = useClassStore()
const coursesStore = useCoursesStore()
const router = useRouter()

// 初始化数据
onMounted(async () => {
  await classStore.initializeSampleData()
})
const defaultPrompt = '请根据图片，提取下列信息，以严格的key-value的形式进行输出，如无信息，则为空，如有多行信息，则分行输出，输出模版如下：培训课程：XXX;交付地：xxx；班号：xxx；合同号：xxx；培训时间：xxx；培训对象：xxx；班主任：xxx；讲师：xxx；需求人：xxx。如果有多行信息，则分行输出，如无信息，则为空。如果有多个培训课程，则分行输出，能明确的看出有多个培训课程。只有培训课程放在标题，交付地等信息都放到表格中，如果图片有两个表格，他们的培训课程名称一样，则只输出一个结果'
const prompt = ref(defaultPrompt)
const imageBase64 = ref('')
const showDialog = ref(false)
const loading = ref(false)
const result = ref('')
const showCheckDialog = ref(false)
const checkFields = ref([])
const showPromptDialog = ref(false)
const fileInputRef = ref(null)
const progress = ref(0)
let progressTimer = null
const errorMsg = ref('')

function goToCalendar() {
  router.push({ name: 'calendar' })
}

function goToCourseLibrary() {
  router.push({ name: 'courseLibrary' })
}

function goToTestAPI() {
  router.push({ name: 'test-api' })
}

function goToSimpleTest() {
  router.push({ name: 'simple-test' })
}

function refreshPage() {
  // 刷新页面
  window.location.reload()
}

function openDialog() {
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  loading.value = false
  result.value = ''
  imageBase64.value = ''
  prompt.value = defaultPrompt
  errorMsg.value = ''
}

function triggerFileInput() {
  fileInputRef.value && fileInputRef.value.click()
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    imageBase64.value = ev.target.result // base64字符串
  }
  reader.readAsDataURL(file)
}

async function submitTongyi() {
  if (!imageBase64.value) {
    result.value = '请先上传图片！'
    return
  }
  loading.value = true
  result.value = ''
  progress.value = 0
  if (progressTimer) clearInterval(progressTimer)
  // 匀速进度条：60秒内匀速到99%
  const PROGRESS_DURATION = 60 * 1000 // 60秒
  const PROGRESS_MAX = 99
  const interval = 100 // ms
  const step = PROGRESS_MAX / (PROGRESS_DURATION / interval)
  progressTimer = setInterval(() => {
    if (progress.value < PROGRESS_MAX) {
      progress.value += step
      if (progress.value > PROGRESS_MAX) progress.value = PROGRESS_MAX
    }
  }, interval)
  try {
    const API_BASE_URL = 'http://60.204.206.218:3001'
    const res = await fetch(`${API_BASE_URL}/api/qwen-vl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: imageBase64.value, text: prompt.value })
    })
    if (progressTimer) clearInterval(progressTimer)
    progress.value = 100
    if (res.status === 500) {
      errorMsg.value = '网络状态有误，请在内网下尝试'
      loading.value = false
      if (progressTimer) clearInterval(progressTimer)
      progress.value = 100
      setTimeout(() => { progress.value = 0 }, 600)
      return
    }
    const data = await res.json()
    if (data && data.choices && data.choices[0]?.message?.content) {
      const content = data.choices[0].message.content
      // 解析为可校对字段
      checkFields.value = parseFields(content)
      showCheckDialog.value = true
      showDialog.value = false
    } else {
      result.value = JSON.stringify(data, null, 2)
    }
  } catch (e) {
    if (progressTimer) clearInterval(progressTimer)
    progress.value = 100
    result.value = 'API请求失败'
  } finally {
    if (progressTimer) clearInterval(progressTimer)
    progress.value = 100
    loading.value = false
    setTimeout(() => { progress.value = 0 }, 600)
  }
}

function parseFields(content) {
  // 解析key-value对
  const rows = content.split(/[\n；;]/).map(line => line.trim()).filter(Boolean)
  const fields = []
  rows.forEach(row => {
    const match = row.match(/^(.+?)[:：](.*)$/)
    if (match) {
      fields.push({ key: match[1].trim(), value: match[2].trim() })
    }
  })
  return fields
}

async function confirmCreateCourse() {
  // 从校对内容中提取字段
  const get = (k) => checkFields.value.find(f => f.key && f.key.includes(k))?.value || ''
  const customer = get('培训对象')
  const coordinator = get('班主任')
  const courseName = customer ? customer + '培训' : get('课程名称')
  const teacher = get('讲师')
  const contractNumber = get('合同号')
  const classId = get('班号') || get('班级代码')
  const location = get('交付地')
  const date = get('培训时间')
  
  // 加载课程库数据
  const courseLibrary = await loadCourseLibrary()
  
  // 解析多个培训课程
  const courses = []
  let current = { title: '', duration: '', content: '' }
  let trainingTime = ''
  checkFields.value.forEach(field => {
    if (field.key.includes('培训时间')) {
      trainingTime = field.value
    }
    if (field.key.includes('培训课程')) {
      if (current.title || current.content) courses.push({ ...current })
      current = { title: field.value, duration: '', content: '' }
    } else if (field.key.includes('时长')) {
      current.duration = field.value
    } else {
      current.content += `${field.key}：${field.value}\n`
    }
  })
  if (current.title || current.content) courses.push({ ...current })
  
  // 自动填充时长字段
  if (trainingTime) {
    const match = trainingTime.match(/(\d{4}-\d{1,2}-\d{1,2})\s*[~到-]+\s*(\d{4}-\d{1,2}-\d{1,2})/)
    if (match) {
      const start = new Date(match[1])
      const end = new Date(match[2])
      if (!isNaN(start) && !isNaN(end)) {
        const days = Math.max(1, Math.round((end - start) / (1000*60*60*24)) + 1)
        courses.forEach(c => { if (!c.duration) c.duration = days })
      }
    }
  }
  
  // 智能匹配课程库
  const processedCourses = courses.map(course => {
    // 在课程库中查找匹配的课程
    const matchedCourse = courseLibrary.find(libCourse => 
      libCourse.name && course.title && 
      (libCourse.name === course.title || 
       libCourse.name.includes(course.title) || 
       course.title.includes(libCourse.name))
    )
    
    if (matchedCourse) {
      return {
        ...course,
        courseLibraryId: matchedCourse.id,
        type: '课程库课程',
        duration: matchedCourse.duration || course.duration,
        content: matchedCourse.description || course.content
      }
    } else {
      return {
        ...course,
        type: '自定义课程'
      }
    }
  })
  
  // 创建班级，获取新id
  const newId = await classStore.addClassWithFields({
    name: courseName,
    teacher,
    contractNumber,
    classId,
    location,
    date,
    customer,
    coordinator,
    extraFields: []
  })
  
  showCheckDialog.value = false
}

function handleDeleteCourse(courseId) {
  classStore.deleteClass(courseId)
}

// 加载课程库数据
async function loadCourseLibrary() {
  try {
    return await coursesStore.fetchCourseLibrary()
  } catch (error) {
    return []
  }
}

async function handleCreateClass() {
  try {
    const newId = await classStore.addNewClass()
    if (newId) {
      router.push({ name: 'class-detail', params: { id: newId } })
    }
  } catch (error) {
    console.error(error)
    if (error.response && error.response.status === 401) {
      alert('登录已过期，请重新登录')
      router.push('/login')
    } else {
      const msg = error.response?.data?.message || error.message || '未知错误'
      alert(`创建班级失败: ${msg} (请确保后端服务已启动)`)
    }
  }
}

function openPromptDialog() {
  showPromptDialog.value = true
}
function closePromptDialog() {
  showPromptDialog.value = false
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 28px 40px;
}

/* ===== Hero Header ===== */
.hero-header {
  padding: 32px 0 8px;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: -0.025em;
  transition: color var(--transition-normal);
}

.hero-title:hover {
  color: var(--color-primary);
}

.hero-title i {
  color: var(--color-primary);
  font-size: 1.5rem;
}

.hero-subtitle {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-top: 4px;
  font-weight: 400;
}

/* ===== Action Bar ===== */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  margin-bottom: 28px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px) saturate(1.5);
  -webkit-backdrop-filter: blur(16px) saturate(1.5);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.section-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-label i {
  color: var(--color-primary);
  font-size: 14px;
}

.class-count {
  background: var(--color-primary);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 22px;
  text-align: center;
}

.action-bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-divider {
  width: 1px;
  height: 24px;
  background: var(--color-border);
  margin: 0 4px;
}

/* ===== Action Buttons ===== */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-primary);
  cursor: pointer;
  border: none;
  transition: 
    transform var(--transition-fast),
    background var(--transition-fast),
    box-shadow var(--transition-fast);
  white-space: nowrap;
}

.action-btn:active {
  transform: scale(0.97);
}

.action-btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(79, 110, 247, 0.3);
}

.action-btn-primary:hover {
  box-shadow: 0 4px 16px rgba(79, 110, 247, 0.4);
  transform: translateY(-1px);
}

.action-btn-accent {
  background: linear-gradient(135deg, var(--color-accent) 0%, #14cdb8 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(6, 182, 160, 0.3);
}

.action-btn-accent:hover {
  box-shadow: 0 4px 16px rgba(6, 182, 160, 0.4);
  transform: translateY(-1px);
}

.action-btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  padding: 8px 10px;
}

.action-btn-ghost:hover {
  background: rgba(79, 110, 247, 0.08);
  color: var(--color-primary);
}

/* ===== Loading Skeleton ===== */
.skeleton-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface-solid);
  border: 1px solid var(--color-border);
}

.skeleton-image {
  height: 170px;
  background: #e2e8f0;
}

.skeleton-body {
  padding: 18px 20px;
}

.skeleton-line {
  border-radius: 4px;
  background: #e2e8f0;
}

.skeleton-line-title {
  height: 18px;
  width: 75%;
  margin-bottom: 10px;
}

.skeleton-line-short {
  height: 14px;
  width: 45%;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.skeleton-pulse {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

/* ===== Empty State ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-illustration {
  margin-bottom: 24px;
}

.empty-icon-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(79, 110, 247, 0.1) 0%, rgba(129, 141, 248, 0.15) 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: var(--color-primary-light);
  border: 2px dashed rgba(79, 110, 247, 0.2);
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.empty-desc {
  color: var(--color-text-secondary);
  font-size: 14px;
  max-width: 420px;
  margin: 0 auto 24px;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* ===== Courses Grid ===== */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* ===== Dialog ===== */
.dialog-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: mask-fade-in 0.2s ease;
}

@keyframes mask-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog-box {
  background: var(--color-surface-solid);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  position: relative;
  animation: dialog-pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes dialog-pop-in {
  0% { transform: scale(0.9) translateY(10px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

/* ===== Check Dialog ===== */
.check-dialog-box {
  max-width: 460px;
  width: 95vw;
  max-height: 80vh;
  overflow: auto;
  padding-bottom: 24px;
}

.check-title-bar {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: 20px 0 14px;
  text-align: center;
  color: #fff;
}

.check-title-bar h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.check-table-wrap {
  max-height: 45vh;
  overflow-y: auto;
  margin: 16px 20px;
}

.check-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 6px;
  font-size: 14px;
}

.check-key {
  width: 100px;
  background: rgba(79, 110, 247, 0.06);
  color: var(--color-primary);
  padding: 8px 12px;
  border-radius: var(--radius-sm) 0 0 var(--radius-sm);
  font-weight: 600;
  font-size: 13px;
  border: 1px solid transparent;
}

.check-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-size: 14px;
  font-family: var(--font-primary);
  background: #fafbff;
  transition: border var(--transition-fast), box-shadow var(--transition-fast);
}

.check-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.1);
}

.check-btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin: 0 20px;
}

.check-confirm-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.check-confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 110, 247, 0.3);
}

.check-cancel-btn {
  background: #f1f5f9;
  color: var(--color-text-secondary);
  border: none;
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-primary);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.check-cancel-btn:hover {
  background: #e2e8f0;
}

/* ===== Tongyi Dialog ===== */
.tongyi-dialog-box {
  max-width: 440px;
  width: 95vw;
  padding-bottom: 24px;
}

.tongyi-title-bar {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: 20px 0 14px;
  text-align: center;
  color: #fff;
}

.tongyi-title-bar h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tongyi-form {
  padding: 20px 20px 0;
}

.tongyi-row {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  gap: 10px;
}

.tongyi-label {
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.tongyi-file-input {
  display: none;
}

.tongyi-file-btn {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.tongyi-file-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(6, 182, 160, 0.3);
}

.tongyi-file-name {
  color: var(--color-success);
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tongyi-btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.tongyi-confirm-btn {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
  color: #fff;
  border: none;
  padding: 10px 22px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.tongyi-confirm-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(6, 182, 160, 0.3);
}

.tongyi-confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tongyi-cancel-btn {
  background: #f1f5f9;
  color: var(--color-text-secondary);
  border: none;
  padding: 10px 22px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-primary);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.tongyi-cancel-btn:hover {
  background: #e2e8f0;
}

.tongyi-progress-bar-wrap {
  margin-top: 16px;
}

.tongyi-progress-bar-bg {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.tongyi-progress-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-primary) 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.tongyi-progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.tongyi-progress-text {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.tongyi-progress-percent {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 13px;
}

.tongyi-error-msg {
  color: var(--color-danger);
  font-size: 13px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.06);
  border-radius: var(--radius-sm);
}

/* ===== Edit Prompt ===== */
.edit-prompt-btn {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1.5px solid var(--color-border);
  padding: 7px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all var(--transition-fast);
}

.edit-prompt-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(79, 110, 247, 0.04);
}

/* ===== Prompt Dialog ===== */
.prompt-dialog-box {
  max-width: 500px;
  width: 95vw;
  padding-bottom: 24px;
}

.prompt-title-bar {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: 20px 0 14px;
  text-align: center;
  color: #fff;
}

.prompt-title-bar h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.prompt-textarea {
  width: calc(100% - 40px);
  min-height: 100px;
  margin: 20px 20px 0;
  padding: 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--font-primary);
  background: #fafbff;
  resize: vertical;
  transition: border var(--transition-fast), box-shadow var(--transition-fast);
  line-height: 1.5;
}

.prompt-textarea:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.1);
}

.prompt-btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin: 16px 20px 0;
}

.prompt-confirm-btn {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
  color: #fff;
  border: none;
  padding: 10px 22px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.prompt-confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(6, 182, 160, 0.3);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .home {
    padding: 0 16px 32px;
  }

  .hero-title {
    font-size: 1.35rem;
  }

  .action-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .action-bar-right {
    flex-wrap: wrap;
  }

  .action-btn span {
    display: none;
  }

  .action-btn-primary span,
  .action-btn-accent span {
    display: inline;
  }

  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}
</style>
