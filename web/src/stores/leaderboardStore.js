import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE_URL = 'http://localhost:3001/api'

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const courseId = ref(null)
  const students = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 从API获取学生数据
  const fetchStudents = async (classId) => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(`${API_BASE_URL}/students/class/${classId}`)
      if (!response.ok) {
        throw new Error('获取学生数据失败')
      }
      students.value = await response.json()
    } catch (err) {
      error.value = err.message
      console.error('获取学生数据失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 切换课程时加载对应排行榜
  const loadForCourse = async (cid) => {
    courseId.value = cid
    await fetchStudents(cid)
  }

  // 按分数降序排列
  const sortedStudents = computed(() => {
    return [...students.value].sort((a, b) => b.points - a.points)
  })

  // 添加新学生
  const addStudent = async (name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: courseId.value,
          name,
          points: 0,
          records: []
        })
      })
      if (!response.ok) {
        throw new Error('添加学生失败')
      }
      const newStudent = await response.json()
      students.value.push(newStudent)
    } catch (err) {
      error.value = err.message
      console.error('添加学生失败:', err)
    }
  }

  // 给学生加分
  const addPoints = async (studentId, points, description) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}/add-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, description })
      })
      if (!response.ok) {
        throw new Error('加分失败')
      }
      const updatedStudent = await response.json()
      const index = students.value.findIndex(s => s.id === studentId)
      if (index !== -1) {
        students.value[index] = updatedStudent
      }
    } catch (err) {
      error.value = err.message
      console.error('加分失败:', err)
    }
  }

  // 删除学生
  const deleteStudent = async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('删除学生失败')
      }
      students.value = students.value.filter(s => s.id !== studentId)
    } catch (err) {
      error.value = err.message
      console.error('删除学生失败:', err)
    }
  }

  // 更新学生姓名
  const updateStudentName = async (studentId, newName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      })
      if (!response.ok) {
        throw new Error('更新学生姓名失败')
      }
      const updatedStudent = await response.json()
      const index = students.value.findIndex(s => s.id === studentId)
      if (index !== -1) {
        students.value[index] = updatedStudent
      }
    } catch (err) {
      error.value = err.message
      console.error('更新学生姓名失败:', err)
    }
  }

  return {
    students,
    loading,
    error,
    sortedStudents,
    addStudent,
    addPoints,
    deleteStudent,
    updateStudentName,
    loadForCourse,
    fetchStudents,
  }
})