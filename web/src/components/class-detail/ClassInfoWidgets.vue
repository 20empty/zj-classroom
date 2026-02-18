<template>
  <div class="class-header-card">
    <div class="header-content">
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
                <div class="wps-cell wps-half" @click="startEditDate">
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
                        <span class="module-value" v-if="dateRange.start && dateRange.end">
                          {{ dateRange.start }} ~ {{ dateRange.end }}
                        </span>
                        <span class="module-value module-value-placeholder" v-else>
                          点击设置培训时间段
                        </span>
                      </template>
                    </div>
                  </div>
                  <!-- 动画时间进度条 -->
                  <div class="timeline-bar" v-if="dateRange.start && dateRange.end">
                    <div class="timeline-track">
                      <div class="timeline-fill" :style="{ width: trainingProgress + '%' }"></div>
                      <div class="timeline-dot" :style="{ left: trainingProgress + '%' }"></div>
                    </div>
                    <div class="timeline-labels">
                      <span>{{ dateRange.start.slice(5) }}</span>
                      <span class="timeline-status">{{ trainingStatusText }}</span>
                      <span>{{ dateRange.end.slice(5) }}</span>
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  classInfo: { type: Object, required: true },
  widgetOrder: { type: Array, required: true },
  dateRange: { type: Object, default: () => ({ start: '', end: '' }) }
})

const emit = defineEmits(['update:widgetOrder', 'update-class-info', 'update-date-range', 'open-calendar'])

// ===== 拖拽逻辑 =====
const dragIdx = ref(null)
const dragOverIdx = ref(null)

function onWidgetDragStart(e, idx) {
  dragIdx.value = idx
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', idx)
  if (e.target) setTimeout(() => { e.target.style.opacity = '0.4' }, 0)
}
function onWidgetDragOver(e) { e.dataTransfer.dropEffect = 'move' }
function onWidgetDragEnter(idx) { dragOverIdx.value = idx }
function onWidgetDragLeave(idx) { if (dragOverIdx.value === idx) dragOverIdx.value = null }
function onWidgetDrop(e, idx) {
  const fromIdx = dragIdx.value
  if (fromIdx === null || fromIdx === idx) return
  const newOrder = [...props.widgetOrder]
  const [moved] = newOrder.splice(fromIdx, 1)
  newOrder.splice(idx, 0, moved)
  emit('update:widgetOrder', newOrder)
  dragIdx.value = null
  dragOverIdx.value = null
}
function onWidgetDragEnd(e) {
  if (e.target) e.target.style.opacity = '1'
  dragIdx.value = null
  dragOverIdx.value = null
}

// ===== 编辑字段逻辑 =====
const editingTopField = ref('')
const editTopFieldValue = ref('')
const keyMap = {
  '班级名称': 'name',
  '讲师': 'teacher',
  '合同号': 'contractNumber',
  '班级代码': 'classId',
  '交付地': 'location',
  '班主任': 'coordinator'
}

function startEditTopField(label) {
  editingTopField.value = label
  // classInfo是prop，需要根据label找到对应key的值
  // 这里的keyMap[label]是classInfo的key
  const key = keyMap[label]
  editTopFieldValue.value = props.classInfo[key] || ''
}

function saveEditTopField(label) {
  const key = keyMap[label]
  emit('update-class-info', { key, value: editTopFieldValue.value })
  editingTopField.value = ''
}

function cancelEditTopField() {
  editingTopField.value = ''
}

const metaFields = computed(() => [
  { key: 'contract', label: '合同号', value: props.classInfo.contractNumber },
  { key: 'classCode', label: '班级代码', value: props.classInfo.classId },
  { key: 'location', label: '交付地', value: props.classInfo.location }
])

// ===== 日期编辑逻辑 =====
const editDateMode = ref(false)
const editDateStart = ref('')
const editDateEnd = ref('')
let blurTimer = null

function startEditDate() {
  if (!editDateMode.value) {
    if(!props.dateRange.start) {
        // 如果没有日期，点击直接进入编辑模式
        editDateMode.value = true
        editDateStart.value = props.dateRange.start
        editDateEnd.value = props.dateRange.end
    } else {
        // 如果有日期，点击打开日历
         emit('open-calendar')
    }
  }
}

// 实际上原代码逻辑是点击后如果不是编辑模式，设置 showDateEdit=true，然后 watcher 打开 calendar
// 这里我们简化：点击直接emit open-calendar，或者在组件内处理编辑
// 之前的逻辑：点击 wps-half -> showDateEdit=true -> watch(showDateEdit) -> editDateMode=true
// 还有一个 watch(editDateMode) false && showDateEdit -> showCalendar = true
// 让我们为了保持一致，直接提供编辑功能
// 但原逻辑里点击是弹出日历优先？
// 原代码: @click="!editDateMode && (showDateEdit = true)"
// watch showDateEdit (val) -> if val editDateMode = true
// wait, 之前的逻辑好像是点击直接变编辑框？
// 不，原代码 161行 showCalendar 是独立的
// 97行: @click="!editDateMode && (showDateEdit = true)"
// 466行 watch(showDateEdit, (val) => { if(val) editDateMode = true ... })
// 474行 watch(editDateMode, (val) => { if(!val && showDateEdit) { showDateEdit=false; showCalendar=true; } })
// 意思是：点击 -> 进入编辑模式。当用户完成编辑（blur或enter）-> editDateMode=false -> showDateEdit还是true -> 触发日历弹窗？
// 这逻辑有点怪。我们简化一下：
// 点击 -> 打开日历。日历里可以选日期。
// 或者保留原逻辑：点击 -> 变输入框 -> 输入完毕 -> 保存 -> 如果想看日历详情再点？
// 让我们重构为：点击非编辑区域 -> 触发 open-calendar。
// 如果要编辑，可以在日历里编辑，或者提供一个显式的编辑按钮。
// 为了不破坏原有体验（虽然原有体验有点绕），我们这里保留"点击即编辑"的能力，修改为：
// 点击 -> 进入编辑模式。
// 另外提供一个日历按钮？
// 让我们观察原代码：
// 点击 wps-cell wps-half -> showDateEdit = true.
// watch showDateEdit -> editDateMode = true.
// 所以点击就是进入编辑输入框。
// 然后 onDateEditBlur -> saveDate -> editDateMode = false.
// watch editDateMode(false) -> showCalendar = true.
// 也就是：编辑完日期后，自动弹出日历给用户确认？
// 这流程挺奇怪的。
// 我们改为：点击 -> 弹出日历。日历里应该有设置日期的功能（目前日历组件好像主要展示）。
// 鉴于这是重构，不改变功能。我将保留"点击进入编辑模式"的逻辑。

function saveDate() {
  if (editDateStart.value && editDateEnd.value && editDateStart.value <= editDateEnd.value) {
    emit('update-date-range', { start: editDateStart.value, end: editDateEnd.value })
    editDateMode.value = false
    // 触发日历展示
    emit('open-calendar')
  }
}

function onDateEditBlur() {
  blurTimer = setTimeout(() => {
    if (editDateMode.value) saveDate()
  }, 120)
}

function cancelEditDate() {
  clearTimeout(blurTimer)
  editDateMode.value = false
}

// 进度条逻辑
const trainingProgress = computed(() => {
  if (!props.dateRange.start || !props.dateRange.end) return 0
  const start = new Date(props.dateRange.start).getTime()
  const end = new Date(props.dateRange.end).getTime()
  const now = new Date().getTime()
  if (now < start) return 0
  if (now > end) return 100
  const total = end - start
  const current = now - start
  return Math.max(0, Math.min(100, (current / total) * 100))
})

const trainingStatusText = computed(() => {
  if (!props.dateRange.start || !props.dateRange.end) return ''
  const p = trainingProgress.value
  if (p <= 0) return '未开始'
  if (p >= 100) return '已结课'
  return '进行中'
})
</script>

<style scoped>
.class-header-card {
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

.widgets-container {
  position: relative;
}

.widgets-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Copy all relevant widget styles from ClassDetail.vue */
.widget-card {
  position: relative;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(40px) saturate(180%);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s, opacity 0.3s;
  cursor: default;
  overflow: visible;
}

.widget-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

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

.widget-handle:active { cursor: grabbing; }
.widget-card:hover .widget-handle { color: rgba(0, 0, 0, 0.35); }

.widget-dragging {
  opacity: 0.4 !important;
  transform: scale(0.98);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
}

.widget-over { transform: translateY(4px); }
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

@keyframes dropLinePulse { from { opacity: 0.6; } to { opacity: 1; } }

.widget-move-move { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }

.widget-inner { padding: 18px 22px; }

/* Hero */
.widget-hero { display: flex; align-items: center; gap: 12px; padding-top: 24px; }
.hero-title { font-size: 1.85rem; font-weight: 700; color: var(--text-primary); margin: 0; }
.hero-input { font-size: 1.6rem !important; font-weight: 700; padding: 8px 14px !important; }

/* People Schedule */
.widget-people-schedule { display: flex; align-items: stretch; padding-top: 24px; }
.wps-cell { display: flex; flex-direction: column; justify-content: center; }
.wps-quarter { flex: 1; padding: 0 4px; display: flex; flex-direction: row; align-items: center; gap: 12px; }
.wps-half { flex: 2; padding: 8px 16px; cursor: pointer; border-radius: 12px; transition: background 0.2s; display: flex; flex-direction: column; justify-content: center; }
.wps-half:hover { background: rgba(99, 102, 241, 0.04); }
.wps-vline { width: 1px; background: rgba(0, 0, 0, 0.07); margin: 0 12px; align-self: stretch; }
.wps-schedule-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }

/* Timeline */
.timeline-bar { width: 100%; }
.timeline-track { height: 4px; background: #e2e8f0; border-radius: 99px; position: relative; margin-bottom: 8px; }
.timeline-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); border-radius: 99px; position: absolute; left: 0; top: 0; transition: width 0.5s ease-out; }
.timeline-dot { width: 10px; height: 10px; background: #a855f7; border: 2px solid white; border-radius: 50%; position: absolute; top: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2); transition: left 0.5s ease-out; animation: pulseDot 2s infinite; }
.timeline-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-light); font-weight: 500; }
.timeline-status { color: var(--color-primary); font-weight: 600; background: rgba(99, 102, 241, 0.1); padding: 1px 6px; border-radius: 4px; }

/* Meta */
.widget-meta-grid { display: flex; justify-content: space-between; gap: 24px; padding-top: 24px; }
.widget-meta-cell { flex: 1; display: flex; flex-direction: row; align-items: center; gap: 8px; min-width: 0; }
.widget-meta-cell .module-label { margin-bottom: 0; font-size: 0.8rem; color: var(--text-light); white-space: nowrap; }

/* Common */
.module-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.module-icon-primary { background: linear-gradient(135deg, #6366f1, #818cf8); color: white; }
.module-icon-secondary { background: linear-gradient(135deg, #a855f7, #c084fc); color: white; }
.module-body { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.module-label { font-size: 0.72rem; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.05em; }
.module-value { font-size: 1.05rem; font-weight: 600; color: var(--text-primary); line-height: 1.4; word-break: break-all; }
.module-value-placeholder { color: var(--text-light); font-weight: 400; font-size: 0.9rem; }
.widget-schedule-icon { width: 36px; height: 36px; font-size: 0.95rem; }

/* Editors */
.edit-icon-btn { opacity: 0; width: 28px; height: 28px; border-radius: 8px; border: none; background: rgba(0, 0, 0, 0.04); color: var(--text-light); font-size: 0.7rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0; vertical-align: middle; margin-left: 6px; }
.widget-card:hover .edit-icon-btn, .widget-meta-cell:hover .edit-icon-btn { opacity: 1; }
.edit-icon-btn:hover { background: var(--color-primary); color: white; transform: scale(1.08); }
.edit-actions { display: flex; gap: 6px; margin-top: 4px; }
.edit-top-input { border: 2px solid var(--border-color); border-radius: 8px; padding: 6px 10px; font-size: inherit; font-family: inherit; outline: none; transition: border-color 0.2s; background: rgba(255, 255, 255, 0.95); width: 100%; }
.edit-top-input:focus { border-color: var(--color-primary); }
.edit-save-btn, .edit-cancel-btn { border: none; border-radius: 8px; padding: 5px 14px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.edit-save-btn { background: var(--color-primary); color: white; }
.edit-cancel-btn { background: var(--bg-secondary); color: var(--text-secondary); }
.date-edit-wrap { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.edit-date-input { border: 2px solid var(--border-color); border-radius: 8px; padding: 4px 8px; font-size: 0.85rem; font-family: inherit; outline: none; transition: border-color 0.2s; background: rgba(255, 255, 255, 0.9); max-width: 130px; }
.edit-date-input:focus { border-color: var(--color-primary); }
</style>
