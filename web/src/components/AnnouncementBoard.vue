<template>
  <div class="announcement-board">
    <h3>信息公告栏</h3>
    <form class="add-form" @submit.prevent="addAnnouncement">
      <input v-model="newAnnouncement" placeholder="输入新公告内容..." />
      <input v-model="newAnnouncementFilePath" placeholder="本地文件/文件夹路径或公网URL（可选）" style="max-width: 220px;" />
      <button type="submit">添加</button>
    </form>
    <ul class="announcement-list">
      <template v-if="announcements.length === 0">
        <li class="empty-tip">
          <i class="fas fa-bell"></i>
          <div>什么都没有，快来添加你的第一条公告吧</div>
        </li>
      </template>
      <template v-else>
        <li v-for="(item, idx) in announcements" :key="idx" class="announcement-item">
          <span class="announcement-text">
            <template v-if="editingIdx === idx">
              <input v-model="editText" style="width: 60%; margin-right: 8px;" />
              <input v-model="editFilePath" style="width: 36%;" placeholder="本地文件/文件夹路径或公网URL（可选）" />
            </template>
            <template v-else>
              <template v-for="(part, i) in parseAnnouncement(item.text)" :key="i">
                <template v-if="part.type === 'link'">
                  <a :href="part.text" class="announcement-link" target="_blank">{{ part.text }}</a>
                </template>
                <template v-else>
                  {{ part.text }}
                </template>
              </template>
            </template>
          </span>
          <template v-if="item.filePath && editingIdx !== idx">
            <div class="file-actions">
              <button
                v-if="isUrl(item.filePath)"
                class="action-btn open-btn"
                @click.prevent="openLink(item.filePath)"
                :title="getLinkType(item.filePath)"
              >
                <i :class="getLinkIcon(item.filePath)"></i>
                {{ getLinkType(item.filePath) }}
              </button>
              <button class="copy-btn" @click.prevent="copyFilePath(item.filePath)" title="复制路径">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </template>
          <div class="announcement-ops">
            <button class="icon-btn edit-btn" @click.prevent="startEdit(idx)" v-if="editingIdx !== idx" title="编辑">
              <i class="fas fa-pen"></i>
            </button>
            <button class="icon-btn delete-btn" @click.prevent="deleteAnnouncement(idx)" title="删除">
              <i class="fas fa-trash"></i>
            </button>
            <button class="icon-btn save-btn" @click.prevent="saveEdit(idx)" v-if="editingIdx === idx" title="保存">
              <i class="fas fa-check"></i>
            </button>
            <button class="icon-btn cancel-btn" @click.prevent="cancelEdit" v-if="editingIdx === idx" title="取消">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </li>
      </template>
    </ul>
    <div class="common-links">
      <a v-for="site in commonSites" :key="site.name" :href="site.url" target="_blank" :title="site.name" class="icon-link">
        <i :class="site.icon"></i>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useClassStore } from '@/stores/classStore'
const props = defineProps({ classId: [String, Number] })
const classStore = useClassStore()
const announcements = ref([])
const newAnnouncement = ref('')
const newAnnouncementFilePath = ref('')

// 编辑相关
const editingIdx = ref(-1)
const editText = ref('')
const editFilePath = ref('')

const commonSites = [
  { name: '浙华OA', url: 'https://zhoa.huawei-zjhw.com/seeyon/main.do?method=main', icon: 'fas fa-globe' },
  { name: '知乎', url: 'https://www.zhihu.com', icon: 'fab fa-zhihu' },
  { name: 'B站', url: 'https://www.bilibili.com', icon: 'fab fa-bilibili' }
]

onMounted(async () => {
  try {
    announcements.value = await classStore.fetchAnnouncements(props.classId)
  } catch (error) {
    announcements.value = []
  }
})
async function addAnnouncement() {
  if (!newAnnouncement.value.trim()) return
  try {
    const announcementData = {
      text: newAnnouncement.value.trim(),
      filePath: newAnnouncementFilePath.value.trim(),
      classId: props.classId
    }
    const newAnnouncementObj = await classStore.createAnnouncement(announcementData)
    announcements.value.unshift(newAnnouncementObj)
    newAnnouncement.value = ''
    newAnnouncementFilePath.value = ''
  } catch (error) {
    alert('添加公告失败，请重试')
  }
}
async function deleteAnnouncement(idx) {
  try {
    const announcement = announcements.value[idx]
    await classStore.deleteAnnouncement(announcement.id)
    announcements.value.splice(idx, 1)
  } catch (error) {
    alert('删除公告失败，请重试')
  }
}
function startEdit(idx) {
  editingIdx.value = idx
  editText.value = announcements.value[idx].text
  editFilePath.value = announcements.value[idx].filePath
}
async function saveEdit(idx) {
  try {
    const announcement = announcements.value[idx]
    const updatedData = {
      text: editText.value.trim(),
      filePath: editFilePath.value.trim()
    }
    const updatedAnnouncement = await classStore.updateAnnouncement(announcement.id, updatedData)
    announcements.value[idx] = updatedAnnouncement
    editingIdx.value = -1
  } catch (error) {
    alert('更新公告失败，请重试')
  }
}
function cancelEdit() {
  editingIdx.value = -1
}

// 判断链接类型
function isUrl(path) {
  return /^https?:\/\//i.test(path) || /^ftp:\/\//i.test(path) || /^mailto:/i.test(path)
}

// 获取链接类型描述
function getLinkType(path) {
  if (!path) return ''
  if (isUrl(path)) {
    if (path.includes('mailto:')) return '发送邮件'
    return '打开链接'
  }
  return '打开文件夹'
}

// 获取链接图标
function getLinkIcon(path) {
  if (!path) return 'fas fa-link'
  if (isUrl(path)) {
    if (path.includes('mailto:')) return 'fas fa-envelope'
    return 'fas fa-external-link-alt'
  }
  return 'fas fa-folder-open'
}

// 统一的链接打开函数
function openLink(path) {
  if (!path) return
  if (isUrl(path)) {
    window.open(path, '_blank')
  }
  // 本地路径不做任何跳转
}

// 解析文本为链接和普通文本
function parseAnnouncement(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const result = []
  let lastIndex = 0
  let match
  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({ type: 'text', text: text.slice(lastIndex, match.index) })
    }
    result.push({ type: 'link', text: match[0] })
    lastIndex = urlRegex.lastIndex
  }
  if (lastIndex < text.length) {
    result.push({ type: 'text', text: text.slice(lastIndex) })
  }
  return result
}

function copyFilePath(path) {
  if (!path) return
  if (navigator.clipboard) {
    navigator.clipboard.writeText(path)
  } else {
    const input = document.createElement('input')
    input.value = path
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }
}
</script>

<style scoped>

.announcement-board {
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
  border: 1px solid rgba(0,0,0,0.05);
  margin-top: 24px;
  transition: all 0.3s ease;
}

.announcement-board:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.announcement-board h3 {
  margin-bottom: 20px;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.announcement-board h3::before {
  content: '';
  display: block;
  width: 4px;
  height: 24px;
  background: var(--primary-color);
  border-radius: 2px;
}

.add-form {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.add-form input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: var(--bg-secondary);
}

.add-form input:focus {
  background: white;
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.add-form button {
  padding: 10px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-form button:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.announcement-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
}

.announcement-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
  border-radius: 8px;
}

.announcement-item:hover {
  background: var(--bg-secondary);
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-text {
  flex: 1;
  margin-right: 16px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-primary);
  word-break: break-word;
}



.announcement-ops {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}

.announcement-item:hover .announcement-ops {
  opacity: 1;
}

.icon-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}



.copy-btn {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 2px;
  font-size: 0.8rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.copy-btn:hover {
  opacity: 1;
  color: var(--primary-color);
}

.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: var(--text-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-tip i {
  font-size: 2rem;
  opacity: 0.5;
}

.common-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.icon-link {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  color: var(--text-secondary);
  transition: all 0.2s;
  font-size: 1.1rem;
}

.icon-link:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}
</style>
