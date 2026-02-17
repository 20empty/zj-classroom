<template>
  <div class="course-card" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <!-- Card Image -->
    <div class="card-visual">
      <div class="course-image" @click.stop="triggerFileInput">
        <img v-if="course.image" :src="course.image" :alt="course.name" class="course-img">
        <div v-else class="default-image">
          <div class="default-icon-ring">
            <i class="fas fa-graduation-cap"></i>
          </div>
        </div>
        <div class="image-overlay">
          <i class="fas fa-camera"></i>
          <span>上传封面</span>
        </div>
      </div>
      <!-- Floating badge -->
      <div class="card-badge" v-if="course.teacher">
        <i class="fas fa-chalkboard-teacher"></i>
        {{ course.teacher }}
      </div>
      <input 
        type="file" 
        ref="fileInput"
        accept="image/*"
        @change="handleImageUpload"
        class="file-input"
      >
    </div>
    
    <!-- Card Content -->
    <div class="card-content">
      <h3 class="course-title">{{ course.name }}</h3>
      <p v-if="course.location" class="course-meta">
        <i class="fas fa-map-marker-alt"></i>
        {{ course.location }}
      </p>
      <p v-if="course.date" class="course-meta">
        <i class="fas fa-calendar"></i>
        {{ course.date }}
      </p>
    </div>
    
    <!-- Card Actions -->
    <div class="card-actions">
      <button class="enter-btn" @click="goToCourseDetail">
        <span>进入班级</span>
        <i class="fas fa-arrow-right"></i>
      </button>
      <button class="delete-btn" @click.stop="$emit('delete-course', course.id)" title="删除班级">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClassStore } from '@/stores/classStore'

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const classStore = useClassStore()
const fileInput = ref(null)
const isHovered = ref(false)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.type.match('image.*')) {
    alert('请选择图片文件')
    return
  }
  
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过2MB')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    classStore.updateClassImage(props.course.id, e.target.result)
  }
  reader.readAsDataURL(file)
}

const goToCourseDetail = () => {
  router.push({ name: 'class-detail', params: { id: props.course.id } })
}
</script>

<style scoped>
.course-card {
  background: var(--color-surface-solid, #fff);
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
  transition: 
    transform var(--transition-normal, 0.25s ease),
    box-shadow var(--transition-normal, 0.25s ease);
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06));
  border: 1px solid var(--color-border, rgba(148,163,184,0.15));
  position: relative;
}

.course-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg, 0 12px 40px rgba(0,0,0,0.12));
  border-color: rgba(79, 110, 247, 0.15);
}

/* Card Visual */
.card-visual {
  position: relative;
  height: 170px;
  overflow: hidden;
}

.course-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.course-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow, 0.4s ease);
}

.course-card:hover .course-img {
  transform: scale(1.05);
}

.default-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.default-icon-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.default-icon-ring i {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.9);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity var(--transition-normal, 0.25s ease);
  gap: 6px;
}

.course-image:hover .image-overlay {
  opacity: 1;
}

.image-overlay i {
  font-size: 22px;
}

.image-overlay span {
  font-size: 13px;
  font-weight: 500;
}

/* Badge */
.card-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
}

.card-badge i {
  font-size: 11px;
  opacity: 0.85;
}

.file-input {
  display: none;
}

/* Card Content */
.card-content {
  padding: 18px 20px 12px;
  flex-grow: 1;
}

.course-title {
  margin: 0 0 10px 0;
  font-size: 17px;
  color: var(--color-text-primary, #1e293b);
  font-weight: 650;
  line-height: 1.35;
  letter-spacing: -0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  margin: 0 0 6px 0;
  color: var(--color-text-secondary, #64748b);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.course-meta i {
  font-size: 11px;
  color: var(--color-primary-light, #818df8);
  width: 14px;
  text-align: center;
}

/* Card Actions */
.card-actions {
  padding: 0 20px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.enter-btn {
  flex: 1;
  background: linear-gradient(135deg, var(--color-primary, #4f6ef7) 0%, var(--color-primary-light, #818df8) 100%);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: var(--radius-sm, 8px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-primary, inherit);
  transition: 
    background var(--transition-fast, 0.15s ease),
    transform var(--transition-fast, 0.15s ease),
    box-shadow var(--transition-fast, 0.15s ease);
  box-shadow: 0 2px 8px rgba(79, 110, 247, 0.25);
}

.enter-btn:hover {
  background: linear-gradient(135deg, var(--color-primary-dark, #3b53d9) 0%, var(--color-primary, #4f6ef7) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(79, 110, 247, 0.35);
}

.enter-btn:active {
  transform: translateY(0);
}

.enter-btn i {
  font-size: 12px;
  transition: transform var(--transition-fast, 0.15s ease);
}

.enter-btn:hover i {
  transform: translateX(3px);
}

.delete-btn {
  background: none;
  border: 1.5px solid var(--color-border, rgba(148,163,184,0.2));
  color: var(--color-text-muted, #94a3b8);
  cursor: pointer;
  font-size: 14px;
  padding: 9px 12px;
  border-radius: var(--radius-sm, 8px);
  transition: 
    color var(--transition-fast, 0.15s ease),
    background var(--transition-fast, 0.15s ease),
    border-color var(--transition-fast, 0.15s ease);
}

.delete-btn:hover {
  color: var(--color-danger, #ef4444);
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.2);
}

/* Responsive */
@media (max-width: 480px) {
  .card-visual {
    height: 140px;
  }
  .card-content {
    padding: 14px 16px 10px;
  }
  .card-actions {
    padding: 0 16px 14px;
  }
}
</style>