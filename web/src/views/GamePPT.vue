<template>
  <div class="ppt-page">
    <button class="back-btn" @click="goBack">
      <i class="fas fa-arrow-left"></i> 返回
    </button>
    <h2>PPT演示</h2>
    <div class="upload-section">
      <input type="file" accept="application/pdf,image/*" @change="onFileChange" />
    </div>
    <div v-if="fileType === 'pdf' && pdfUrl" class="ppt-preview">
      <iframe :src="pdfUrl" width="100%" height="600px"></iframe>
      <div class="file-name">{{ fileName }}</div>
    </div>
    <div v-else-if="fileType === 'image' && imageUrl" class="ppt-preview">
      <img :src="imageUrl" alt="PPT图片" class="ppt-image" />
      <div class="file-name">{{ fileName }}</div>
    </div>
    <div v-else class="ppt-placeholder">
      <i class="fas fa-file-powerpoint"></i>
      <p>请上传PPT（PDF或图片）</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const gameId = route.params.id

const fileType = ref('')
const pdfUrl = ref('')
const imageUrl = ref('')
const fileName = ref('')

// 读取本地存储
onMounted(() => {
  const saved = localStorage.getItem(`ppt_file_${gameId}`)
  const savedType = localStorage.getItem(`ppt_type_${gameId}`)
  const savedName = localStorage.getItem(`ppt_name_${gameId}`)
  if (saved && savedType) {
    fileType.value = savedType
    fileName.value = savedName || ''
    if (savedType === 'pdf') {
      pdfUrl.value = saved
    } else if (savedType === 'image') {
      imageUrl.value = saved
    }
  }
})

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  fileName.value = file.name
  if (file.type === 'application/pdf') {
    fileType.value = 'pdf'
    const reader = new FileReader()
    reader.onload = ev => {
      pdfUrl.value = ev.target.result
      imageUrl.value = ''
      // 存储
      localStorage.setItem(`ppt_file_${gameId}`, pdfUrl.value)
      localStorage.setItem(`ppt_type_${gameId}`, 'pdf')
      localStorage.setItem(`ppt_name_${gameId}`, file.name)
    }
    reader.readAsDataURL(file)
  } else if (file.type.startsWith('image/')) {
    fileType.value = 'image'
    const reader = new FileReader()
    reader.onload = ev => {
      imageUrl.value = ev.target.result
      pdfUrl.value = ''
      // 存储
      localStorage.setItem(`ppt_file_${gameId}`, imageUrl.value)
      localStorage.setItem(`ppt_type_${gameId}`, 'image')
      localStorage.setItem(`ppt_name_${gameId}`, file.name)
    }
    reader.readAsDataURL(file)
  } else {
    alert('仅支持PDF或图片文件')
  }
}

function goBack() {
  window.history.length > 1 ? router.back() : router.push({ name: 'game-management' })
}
</script>

<style scoped>
.ppt-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 16px;
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
  margin-bottom: 18px;
  transition: all 0.2s;
}
.back-btn:hover {
  background-color: #e8eaed;
  transform: translateY(-1px);
}
.back-btn i {
  font-size: 1rem;
}
.upload-section {
  margin-bottom: 24px;
}
.ppt-preview {
  margin-bottom: 16px;
  text-align: center;
}
.ppt-image {
  max-width: 100%;
  max-height: 600px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.file-name {
  margin-top: 8px;
  color: #666;
  font-size: 15px;
}
.ppt-placeholder {
  text-align: center;
  color: #bbb;
  margin-top: 60px;
}
.ppt-placeholder i {
  font-size: 60px;
  margin-bottom: 16px;
}
</style> 