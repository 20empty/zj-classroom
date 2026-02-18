<template>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClassStore } from '@/stores/classStore'

const props = defineProps({
  classId: { type: [Number, String], required: true }
})

const classStore = useClassStore()

const todoInput = ref('')
const todoDate = ref(new Date().toISOString().slice(0,10))
const todos = ref([])

const statusList = [
  { key: 'planning', label: '规划', color: '#42a5f5' },
  { key: 'doing', label: '进行中', color: '#00bfae' },
  { key: 'done', label: '已完成', color: '#43a047' }
]

onMounted(async () => {
  try {
    todos.value = await classStore.fetchTodos(props.classId)
  } catch (error) {
    // 失败静默处理
  }
})

const todosByDate = computed(() => {
  const groups = {}
  for (const todo of todos.value) {
    if (!groups[todo.date]) groups[todo.date] = []
    groups[todo.date].push(todo)
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
})

async function addTodo() {
  if (!todoInput.value.trim()) return
  try {
    const todoData = {
      text: todoInput.value.trim(),
      status: 'planning',
      date: todoDate.value,
      classId: props.classId
    }
    const newTodo = await classStore.createTodo(todoData)
    todos.value.unshift(newTodo)
    todoInput.value = ''
    todoDate.value = new Date().toISOString().slice(0,10)
  } catch (error) {
    alert('创建待办事项失败，请重试')
  }
}

async function setTodoStatus(todo, status) {
  try {
    await classStore.updateTodoStatus(todo.id, status)
    todo.status = status
  } catch (error) {
    alert('更新待办事项状态失败，请重试')
  }
}

async function deleteTodo(todo) {
  try {
    await classStore.deleteTodo(todo.id)
    const idx = todos.value.indexOf(todo)
    if (idx !== -1) todos.value.splice(idx, 1)
  } catch (error) {
    alert('删除待办事项失败，请重试')
  }
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
.todos-area { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border-radius: 24px; padding: 32px; box-shadow: var(--shadow-lg); border: 1px solid rgba(255, 255, 255, 0.4); }
.todos-area h3 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 24px; display: flex; align-items: center; gap: 12px; position: relative; }
.todos-area h3::before { content: ''; width: 6px; height: 24px; background: var(--color-primary); border-radius: 3px; display: inline-block; }
.todo-edit-row { display: flex; gap: 12px; background: white; padding: 16px; border-radius: 16px; box-shadow: var(--shadow-sm); margin-bottom: 24px; border: 1px solid rgba(0, 0, 0, 0.03); }
.todo-input { flex: 1; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 16px; font-size: 0.95rem; transition: all 0.2s; background: var(--bg-secondary); }
.todo-input:focus { background: white; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
.todo-date-input { border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; background: var(--bg-secondary); color: var(--text-primary); }
.todo-post-btn { background: var(--color-primary); color: white; border: none; padding: 0 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.todo-post-btn:hover { background: var(--primary-hover); transform: translateY(-1px); }

/* Timeline Layout */
.todo-board { position: relative; }
.todo-date-group { margin-bottom: 32px; }
.todo-date-label { font-size: 0.9rem; font-weight: 600; color: var(--text-light); margin-bottom: 12px; padding-left: 12px; border-left: 2px solid var(--border-color); }
.todo-status-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.todo-status-cols-fixed { margin-bottom: 16px; position: sticky; top: 0; z-index: 10; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); padding: 10px 0; border-radius: 12px; }
.todo-status-title { text-align: center; font-size: 0.9rem; font-weight: 700; padding: 8px; border-radius: 8px; color: white; }
.todo-item { background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.03); transition: all 0.2s; position: relative; }
.todo-item:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06); }
.todo-content-planning { border-left: 4px solid #42a5f5; }
.todo-content-doing { border-left: 4px solid #00bfae; }
.todo-content-done { border-left: 4px solid #43a047; opacity: 0.7; }
.todo-text { font-size: 0.95rem; color: var(--text-primary); margin-bottom: 8px; line-height: 1.5; }
.todo-actions { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }
.todo-actions button { font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
.todo-actions button:hover { background: var(--bg-secondary); color: var(--text-primary); }
.todo-delete-btn { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: #ef4444; cursor: pointer; opacity: 0; transition: all 0.2s; }
.todo-item:hover .todo-delete-btn { opacity: 1; }

.todo-edit-input { width: 100%; padding: 4px 8px; border: 1px solid #e2e8f0; border-radius: 4px; }
.todo-save-btn, .todo-cancel-btn { background: none; border: none; cursor: pointer; color: #64748b; }
.todo-save-btn:hover { color: var(--color-primary); }
.todo-cancel-btn:hover { color: #ef4444; }

@media (max-width: 768px) {
  .todo-status-cols { grid-template-columns: 1fr; }
}
</style>
