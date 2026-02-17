import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE_URL = 'http://localhost:3001/api'

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref([])
  const courseLibrary = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 保存到API的辅助函数
  const saveToAPI = async (method, url, data = null) => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      }
      if (data) {
        options.body = JSON.stringify(data)
      }
      
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`)
      }
      return await response.json()
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // 课程库管理方法
  // 获取所有课程库课程
  const fetchCourseLibrary = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(`${API_BASE_URL}/course-library`)
      if (!response.ok) {
        throw new Error('获取课程库失败')
      }
      const data = await response.json()
      courseLibrary.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('获取课程库失败:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // 创建课程库课程
  const createCourseLibrary = async (courseData) => {
    try {
      const response = await saveToAPI('POST', `${API_BASE_URL}/course-library`, courseData)
      // 重新加载课程库
      await fetchCourseLibrary()
      return response
    } catch (err) {
      console.error('创建课程库课程失败:', err)
      throw err
    }
  }

  // 更新课程库课程
  const updateCourseLibrary = async (courseId, courseData) => {
    try {
      const response = await saveToAPI('PUT', `${API_BASE_URL}/course-library/${courseId}`, courseData)
      // 重新加载课程库
      await fetchCourseLibrary()
      return response
    } catch (err) {
      console.error('更新课程库课程失败:', err)
      throw err
    }
  }

  // 删除课程库课程
  const deleteCourseLibrary = async (courseId) => {
    try {
      const response = await saveToAPI('DELETE', `${API_BASE_URL}/course-library/${courseId}`)
      // 重新加载课程库
      await fetchCourseLibrary()
      return response
    } catch (err) {
      console.error('删除课程库课程失败:', err)
      throw err
    }
  }

  // 班级课程管理方法
  // 获取班级的所有课程
  const fetchClassCourses = async (classId) => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(`${API_BASE_URL}/courses/class/${classId}`)
      if (!response.ok) {
        throw new Error('获取班级课程失败')
      }
      const data = await response.json()
      return data
    } catch (err) {
      error.value = err.message
      console.error('获取班级课程失败:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // 创建班级课程
  const createClassCourse = async (courseData) => {
    try {
      const response = await saveToAPI('POST', `${API_BASE_URL}/courses`, courseData)
      return response
    } catch (err) {
      console.error('创建班级课程失败:', err)
      throw err
    }
  }

  // 更新班级课程
  const updateClassCourse = async (courseId, courseData) => {
    try {
      const response = await saveToAPI('PUT', `${API_BASE_URL}/courses/${courseId}`, courseData)
      return response
    } catch (err) {
      console.error('更新班级课程失败:', err)
      throw err
    }
  }

  // 删除班级课程
  const deleteClassCourse = async (courseId) => {
    try {
      const response = await saveToAPI('DELETE', `${API_BASE_URL}/courses/${courseId}`)
      return response
    } catch (err) {
      console.error('删除班级课程失败:', err)
      throw err
    }
  }

  return {
    // 状态
    courses,
    courseLibrary,
    loading,
    error,
    
    // 课程库方法
    fetchCourseLibrary,
    createCourseLibrary,
    updateCourseLibrary,
    deleteCourseLibrary,
    
    // 班级课程方法
    fetchClassCourses,
    createClassCourse,
    updateClassCourse,
    deleteClassCourse
  }
})
