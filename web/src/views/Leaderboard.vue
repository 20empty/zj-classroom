<template>
  <div class="leaderboard">
    <div class="header">
      <h2>排行榜 - {{ course.name }}</h2>
      <div class="actions">
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i> 返回班级
        </button>
        <button class="add-btn" @click="showAddDialog = true">
          <i class="fas fa-plus"></i> 添加学生
        </button>
        <button class="export-btn" @click="exportToExcel">
          <i class="fas fa-download"></i> 导出Excel
        </button>
      </div>
    </div>

    <!-- 添加学生对话框 -->
    <div v-if="showAddDialog" class="modal">
      <div class="modal-content">
        <h3>添加新学生</h3>
        <input 
          v-model="newStudentName" 
          type="text" 
          placeholder="请输入学生姓名"
          class="name-input"
        >
        <div class="modal-actions">
          <button @click="addNewStudent" class="confirm-btn">确定</button>
          <button @click="showAddDialog = false" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>

    <!-- 加分对话框 -->
    <div v-if="showPointsDialog" class="modal">
      <div class="modal-content">
        <h3>为 {{ selectedStudent.name }} 加分</h3>
        <div class="points-input-group">
          <input 
            v-model.number="pointsToAdd" 
            type="number" 
            min="1"
            placeholder="Points"
            class="points-input"
          >
                  <input 
          v-model="pointsDescription" 
          type="text" 
          placeholder="加分原因（可选）"
          class="description-input"
        >
        </div>
        <div class="modal-actions">
          <button @click="confirmAddPoints" class="confirm-btn">OK</button>
          <button @click="showPointsDialog = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteDialog" class="modal">
      <div class="modal-content">
        <h3>确认删除</h3>
        <p>确定要删除学生 "{{ studentToDelete.name }}" 吗？</p>
        <div class="modal-actions">
          <button @click="confirmDelete" class="delete-confirm-btn">删除</button>
          <button @click="showDeleteDialog = false" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>

    <div class="leaderboard-list">
      <div class="leaderboard-header">
        <span>排名</span>
        <span>学生姓名</span>
        <span>分数</span>
        <span>操作</span>
      </div>
      
      <div 
        v-for="(student, index) in sortedStudents" 
        :key="student.id" 
        class="leaderboard-item"
        :class="{ 
          'top-1': index === 0,
          'top-2': index === 1,
          'top-3': index === 2
        }"
      >
        <span class="rank">{{ index + 1 }}</span>
        <span class="name">
          <span v-if="!student.isEditing" @click="startEditName(student)" class="editable-name">
            {{ student.name }}
            <i class="fas fa-edit edit-icon"></i>
          </span>
          <div v-else class="edit-name-container">
            <input 
              v-model="student.editingName" 
              type="text" 
              class="edit-name-input"
              @keyup.enter="saveName(student)"
              @blur="saveName(student)"
              @keyup.esc="cancelEdit(student)"
              ref="nameInput"
              :placeholder="student.name"
            >
          </div>
        </span>
        <span class="points">{{ student.points }}</span>
        <span class="actions">
          <button @click="openPointsDialog(student)" class="add-points-btn">
            <i class="fas fa-plus-circle"></i> 加分
          </button>
          <button @click="showRecords(student)" class="view-records-btn">
            <i class="fas fa-history"></i> 记录
          </button>
          <button @click="openDeleteDialog(student)" class="delete-btn">
            <i class="fas fa-trash"></i> 删除
          </button>
        </span>
      </div>
    </div>

    <!-- 记录对话框 -->
    <div v-if="showRecordsDialog" class="modal">
      <div class="modal-content records-modal">
        <h3>{{ viewingStudent.name }} 的加分记录</h3>
        <div class="records-list">
          <div v-for="(record, idx) in viewingStudent.records" :key="idx" class="record-item">
            <div class="record-date">{{ record.date }}</div>
            <div class="record-points">+{{ record.points }}</div>
            <div class="record-desc">{{ record.description }}</div>
          </div>
          <div v-if="viewingStudent.records.length === 0" class="no-records">
            暂无记录
          </div>
        </div>
        <button @click="showRecordsDialog = false" class="close-btn">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClassStore } from '@/stores/classStore'
import { useLeaderboardStore } from '@/stores/leaderboardStore'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const route = useRoute()
const router = useRouter()
const classStore = useClassStore()
const leaderboardStore = useLeaderboardStore()

const course = computed(() => {
  return classStore.getClassById(Number(route.params.courseId)) || { name: 'Unknown Class' }
})

const sortedStudents = computed(() => leaderboardStore.sortedStudents)

// 添加学生相关
const showAddDialog = ref(false)
const newStudentName = ref('')

const addNewStudent = () => {
  if (newStudentName.value.trim()) {
    leaderboardStore.addStudent(newStudentName.value.trim())
    newStudentName.value = ''
    showAddDialog.value = false
  }
}

// 加分相关
const showPointsDialog = ref(false)
const selectedStudent = ref(null)
const pointsToAdd = ref(1)
const pointsDescription = ref('')

const openPointsDialog = (student) => {
  selectedStudent.value = student
  pointsToAdd.value = 1
  pointsDescription.value = ''
  showPointsDialog.value = true
}

const confirmAddPoints = () => {
  if (pointsToAdd.value > 0) {
    // 加分原因现在是可选的，如果没有填写则使用默认值
    const description = pointsDescription.value.trim() || '加分'
    leaderboardStore.addPoints(
      selectedStudent.value.id, 
      pointsToAdd.value,
      description
    )
    showPointsDialog.value = false
  }
}

// 删除学生相关
const showDeleteDialog = ref(false)
const studentToDelete = ref(null)

const openDeleteDialog = (student) => {
  studentToDelete.value = student
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  leaderboardStore.deleteStudent(studentToDelete.value.id)
  showDeleteDialog.value = false
}

// 编辑姓名相关
const startEditName = (student) => {
  // 先重置所有学生的编辑状态
  leaderboardStore.students.forEach(s => {
    s.isEditing = false
    s.editingName = ''
  })
  
  // 设置当前学生为编辑状态
  student.isEditing = true
  student.editingName = student.name
  
  // 使用 nextTick 确保 DOM 更新后再聚焦
  nextTick(() => {
    const input = document.querySelector('.edit-name-input')
    if (input) {
      input.focus()
      input.select()
    }
  })
}

const saveName = (student) => {
  const newName = student.editingName.trim()
  if (newName && newName !== student.name) {
    try {
      // 直接更新本地数据并保存到 localStorage
      student.name = newName
      
      // 手动保存到 localStorage
      const key = `leaderboardStudents_${route.params.courseId}`
      const currentStudents = JSON.parse(localStorage.getItem(key) || '[]')
      const studentIndex = currentStudents.findIndex(s => s.id === student.id)
      if (studentIndex !== -1) {
        currentStudents[studentIndex].name = newName
        localStorage.setItem(key, JSON.stringify(currentStudents))
        console.log('姓名更新成功:', newName)
      }
      
      // 尝试调用 store 方法（如果可用）
      if (typeof leaderboardStore.updateStudentName === 'function') {
        leaderboardStore.updateStudentName(student.id, newName)
      }
    } catch (error) {
      console.error('更新姓名时发生错误:', error)
    }
  }
  
  // 确保所有学生都退出编辑状态
  leaderboardStore.students.forEach(s => {
    s.isEditing = false
    s.editingName = ''
  })
}

const cancelEdit = (student) => {
  // 取消编辑，恢复原姓名
  student.editingName = student.name
  // 重置所有编辑状态
  leaderboardStore.students.forEach(s => {
    s.isEditing = false
    s.editingName = ''
  })
}

// 导出Excel功能
const exportToExcel = () => {
  try {
    // 准备导出数据
    const exportData = sortedStudents.value.map((student, index) => {
      // 获取学生的加分记录
      const records = student.records || []
      const recordDetails = records.map(record => 
        `${record.date}: +${record.points}分 (${record.description})`
      ).join('; ')
      
      return {
        '排名': index + 1,
        '学生姓名': student.name,
        '总分': student.points,
        '加分记录': recordDetails || '暂无记录'
      }
    })
    
    // 添加表头信息
    const headerInfo = [
      {
        '班级名称': course.value.name,
        '导出时间': new Date().toLocaleString('zh-CN'),
        '学生总数': exportData.length
      }
    ]
    
    // 创建工作簿
    const wb = XLSX.utils.book_new()
    
    // 创建表头信息工作表
    const headerWs = XLSX.utils.json_to_sheet(headerInfo)
    XLSX.utils.book_append_sheet(wb, headerWs, '班级信息')
    
    // 创建排行榜数据工作表
    const dataWs = XLSX.utils.json_to_sheet(exportData)
    XLSX.utils.book_append_sheet(wb, dataWs, '排行榜')
    
    // 设置列宽
    const colWidths = [
      { wch: 8 },   // 排名
      { wch: 15 },  // 学生姓名
      { wch: 10 },  // 总分
      { wch: 50 }   // 加分记录
    ]
    
    dataWs['!cols'] = colWidths
    
    // 设置表头样式
    const headerRange = XLSX.utils.decode_range(dataWs['!ref'])
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!dataWs[cellAddress]) continue
      
      dataWs[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4285F4" } },
        alignment: { horizontal: "center" }
      }
    }
    
    // 生成文件名
    const fileName = `${course.value.name}_排行榜_${new Date().toISOString().slice(0, 10)}.xlsx`
    
    // 导出文件
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, fileName)
    
    console.log('Excel导出成功:', fileName)
    
    // 显示成功提示
    const successMessage = `排行榜已成功导出到文件：${fileName}`
    alert(successMessage)
  } catch (error) {
    console.error('Excel导出失败:', error)
    alert('导出失败，请重试')
  }
}

// 查看记录相关
const showRecordsDialog = ref(false)
const viewingStudent = ref(null)

const showRecords = (student) => {
  viewingStudent.value = student
  showRecordsDialog.value = true
}

const goBack = () => {
        router.push({ name: 'class-detail', params: { id: route.params.courseId } })
}

onMounted(() => {
  leaderboardStore.loadForCourse(Number(route.params.courseId))
  
  // 确保所有学生都处于非编辑状态
  leaderboardStore.students.forEach(student => {
    student.isEditing = false
    student.editingName = ''
  })
  
  // 调试：检查 store 方法是否正确加载
  console.log('LeaderboardStore methods:', Object.keys(leaderboardStore))
  console.log('updateStudentName method:', leaderboardStore.updateStudentName)
})

onUnmounted(() => {
  // 页面离开时重置所有编辑状态
  leaderboardStore.students.forEach(student => {
    student.isEditing = false
    student.editingName = ''
  })
})
</script>

<style scoped>
.leaderboard {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 10px;
}

button {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.back-btn {
  background-color: #fbbc05;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
}

.back-btn:hover {
  background-color: #e8ac04;
}

.add-btn {
  background-color: #34a853;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
}

.add-btn:hover {
  background-color: #2d9248;
}

.export-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
}

.export-btn:hover {
  background-color: #3367d6;
}

.leaderboard-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.leaderboard-header {
  display: grid;
  grid-template-columns: 80px 2fr 100px 250px;
  background-color: #4285f4;
  color: white;
  padding: 12px 16px;
  font-weight: bold;
}

.leaderboard-header span {
  text-align: center;
}

.leaderboard-header span:nth-child(2) {
  text-align: left;
}

.leaderboard-item {
  display: grid;
  grid-template-columns: 80px 2fr 100px 250px;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.leaderboard-item:last-child {
  border-bottom: none;
}

.rank, .points {
  text-align: center;
}

.name {
  text-align: left;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.add-points-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
}

.add-points-btn:hover {
  background-color: #3367d6;
}

.view-records-btn {
  background-color: #fbbc05;
  color: #333;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
}

.view-records-btn:hover {
  background-color: #e8ac04;
}

/* 前三名特殊样式 */
.top-1 {
  background-color: #fff8e1;
}

.top-1 .rank {
  color: #fbbc05;
  font-weight: bold;
}

.top-2 {
  background-color: #f1f8e9;
}

.top-2 .rank {
  color: #34a853;
  font-weight: bold;
}

.top-3 {
  background-color: #e8f5e9;
}

.top-3 .rank {
  color: #4285f4;
  font-weight: bold;
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.records-modal {
  width: 500px;
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.confirm-btn {
  background-color: #34a853;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
}

.cancel-btn {
  background-color: #f1f1f1;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
}

.close-btn {
  width: 100%;
  margin-top: 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
}

.name-input, .points-input, .description-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

.points-input-group {
  display: flex;
  gap: 10px;
}

.points-input {
  width: 80px;
}

.description-input {
  flex: 1;
}

/* 编辑姓名样式 */
.editable-name {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.editable-name:hover {
  background-color: #f5f5f5;
}

.edit-icon {
  font-size: 12px;
  color: #999;
  opacity: 0;
  transition: opacity 0.2s;
}

.editable-name:hover .edit-icon {
  opacity: 1;
}

.edit-name-container {
  display: flex;
  align-items: center;
}

.edit-name-input {
  width: 100%;
  padding: 4px 8px;
  border: 2px solid #4285f4;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  outline: none;
}

.edit-name-input:focus {
  border-color: #34a853;
  box-shadow: 0 0 0 2px rgba(52, 168, 83, 0.2);
}

/* 记录列表样式 */
.records-list {
  max-height: 400px;
  overflow-y: auto;
}

.record-item {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.record-item:last-child {
  border-bottom: none;
}

.record-date {
  color: #666;
  font-size: 13px;
}

.record-points {
  color: #34a853;
  font-weight: bold;
  margin: 4px 0;
}

.record-desc {
  color: #333;
}

.no-records {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .leaderboard-header,
  .leaderboard-item {
    grid-template-columns: 50px 1fr 70px 150px;
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .actions {
    flex-direction: column;
    gap: 6px;
  }
  
  .add-points-btn,
  .view-records-btn,
  .delete-btn {
    padding: 4px 6px;
    font-size: 11px;
    min-width: 50px;
    max-width: 70px;
  }
  
  .export-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
.delete-confirm-btn {
  background-color: #ea4335;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
}

.delete-confirm-btn:hover {
  background-color: #d33426;
}

/* 调整操作按钮间距 */
.actions {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 100%;
}

/* 操作按钮基础样式 */
.add-points-btn,
.view-records-btn,
.delete-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  min-width: 60px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

.add-points-btn {
  background-color: #34a853;
  color: white;
}

.add-points-btn:hover {
  background-color: #2d9248;
}

.view-records-btn {
  background-color: #4285f4;
  color: white;
}

.view-records-btn:hover {
  background-color: #3367d6;
}

.delete-btn {
  background-color: #ea4335;
  color: white;
}

.delete-btn:hover {
  background-color: #d33426;
}

@media (max-width: 480px) {
  .leaderboard-header,
  .leaderboard-item {
    grid-template-columns: 40px 1fr 60px 120px;
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .add-points-btn,
  .view-records-btn,
  .delete-btn {
    padding: 3px 5px;
    font-size: 10px;
    min-width: 45px;
    max-width: 60px;
  }
  
  .delete-btn {
    margin-left: 0;
  }
}
</style>