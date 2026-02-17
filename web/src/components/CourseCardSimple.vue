<template>
  <div v-if="course" class="course-card-apple">
    <!-- 顶部：图标与类型 -->
    <div class="card-top">
      <div class="icon-squircle">
        <i class="fas fa-graduation-cap"></i>
      </div>
      <div class="more-actions">
        <!-- 这里可以放更多操作，目前悬停显示 -->
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="card-content">
      <div class="course-badges">
        <span class="badge badge-type">{{ course.type || (course.courseLibraryId ? '标准课程' : '自定义') }}</span>
        <span v-if="course.courseLibraryId" class="badge badge-library"><i class="fas fa-book"></i> 课程库</span>
      </div>
      
      <h3 class="course-title">{{ course.title || course.name || '未命名课程' }}</h3>
      <p class="course-desc">{{ course.content || course.description || '暂无描述' }}</p>
      
      <div class="course-meta">
        <div v-if="course.duration" class="meta-item">
          <i class="fas fa-clock"></i>
          <span>{{ course.duration }}{{ typeof course.duration === 'string' && course.duration.includes('小时') ? '' : '天' }}</span>
        </div>
      </div>
    </div>
    
    <!-- 底部操作栏 (悬停显示或固定) -->
    <div class="card-actions">
      <button class="action-btn btn-schedule" @click="manageSchedule" title="排课">
        <i class="fas fa-calendar-alt"></i>
      </button>
      <button v-if="course.courseLibraryId" class="action-btn btn-view" @click="viewInLibrary" title="查看来源">
        <i class="fas fa-external-link-alt"></i>
      </button>
      <div class="spacer"></div>
      <button class="action-btn btn-edit" @click="editCourse" title="编辑">
        <i class="fas fa-pen"></i>
      </button>
      <button class="action-btn btn-delete" @click="deleteCourse" title="删除">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete-course', 'edit-course', 'view-in-library', 'manage-schedule'])

function deleteCourse() {
  emit('delete-course', props.course.title || props.course.id)
}

function editCourse() {
  emit('edit-course', props.course)
}

function viewInLibrary() {
  emit('view-in-library', props.course.courseLibraryId)
}

function manageSchedule() {
  emit('manage-schedule', props.course)
}
</script>

<style scoped>
.course-card-apple {
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  height: 100%;
  min-height: 280px;
}

.course-card-apple:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08); /* Apple style soft shadow */
}

/* 顶部图标区 */
.card-top {
  padding: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.icon-squircle {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #6366f1, #818cf8);
  border-radius: 18px; /* Squircle approximation */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.25);
}

/* 内容区 */
.card-content {
  padding: 20px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-type {
  background: #f3f4f6;
  color: #6b7280;
}

.badge-library {
  background: #ecfdf5;
  color: #10b981;
}

.course-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.course-meta {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 底部操作栏 */
.card-actions {
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fafafa;
}

.spacer {
  flex: 1;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: white;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.action-btn:hover {
  transform: translateY(-2px);
  color: #111827;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Hover shadow */
}

/* Specific button colors on hover */
.btn-schedule:hover { color: #f59e0b; }
.btn-view:hover { color: #10b981; }
.btn-edit:hover { color: #6366f1; }
.btn-delete:hover { color: #ef4444; background: #fee2e2; }

@media (max-width: 768px) {
  .course-card-apple {
    min-height: 240px;
  }
}
</style> 