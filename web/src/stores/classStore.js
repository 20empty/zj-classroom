import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE_URL = 'http://localhost:3001/api'

export const useClassStore = defineStore('classes', () => {
  const classes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 从API获取所有班级
  const fetchClasses = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(`${API_BASE_URL}/classes`)
      if (!response.ok) {
        throw new Error('获取班级数据失败')
      }
      classes.value = await response.json()
    } catch (err) {
      error.value = err.message
      console.error('获取班级数据失败:', err)
    } finally {
      loading.value = false
    }
  }

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

  // 更新班级图片
  const updateClassImage = async (classId, imageData) => {
    try {
      const updatedClass = await saveToAPI('PUT', `${API_BASE_URL}/classes/${classId}`, {
        image: imageData
      })
      const index = classes.value.findIndex(c => c.id === classId)
      if (index !== -1) {
        classes.value[index] = updatedClass
      }
    } catch (err) {
      console.error('更新班级图片失败:', err)
    }
  }

  // 默认初始待办内容（可自定义）
  let defaultTodos = [
    { text: '撰写策划报告', status: 'planning' },
    { text: '打印考勤表', status: 'planning' }
  ]

  // 添加新班级，并自动添加初始待办
  const addNewClass = async (customTodos) => {
    try {
      const classData = {
        name: '新班级',
        teacher: '新老师',
        image: '',
        contractNumber: '',
        classId: '',
        location: '',
        date: '',
        customer: '',
        coordinator: ''
      }

      const newClass = await saveToAPI('POST', `${API_BASE_URL}/classes`, classData)
      classes.value.push(newClass)

      // 添加初始待办
      const todos = (customTodos && Array.isArray(customTodos) ? customTodos : defaultTodos).map(t => ({
        ...t,
        classId: newClass.id,
        date: new Date().toISOString().slice(0, 10)
      }))

      // 批量创建待办事项
      for (const todo of todos) {
        await saveToAPI('POST', `${API_BASE_URL}/todos`, todo)
      }

      return newClass.id
    } catch (err) {
      console.error('添加新班级失败:', err)
      throw err
    }
  }

  // 带字段创建班级，并支持后续添加智能待办
  const addClassWithFields = async ({ name, teacher, date, extraFields, contractNumber, classId, location, customer, coordinator, customTodos }) => {
    try {
      const classData = {
        name: name || 'AI生成班级',
        teacher: teacher || 'AI助手',
        image: '',
        contractNumber: contractNumber || '',
        classId: classId || '',
        location: location || '',
        date: date || '',
        customer: customer || '',
        coordinator: coordinator || ''
      }

      const newClass = await saveToAPI('POST', `${API_BASE_URL}/classes`, classData)
      classes.value.push(newClass)

      const todos = (customTodos && Array.isArray(customTodos) ? customTodos : defaultTodos).map(t => ({
        ...t,
        classId: newClass.id,
        date: new Date().toISOString().slice(0, 10)
      }))

      for (const todo of todos) {
        await saveToAPI('POST', `${API_BASE_URL}/todos`, todo)
      }

      return newClass.id
    } catch (err) {
      throw err
    }
  }

  // 删除班级
  const deleteClass = async (classId) => {
    try {
      await saveToAPI('DELETE', `${API_BASE_URL}/classes/${classId}`)
      classes.value = classes.value.filter(c => c.id !== classId)
    } catch (err) {
      console.error('删除班级失败:', err)
    }
  }

  // 获取单个班级
  const getClassById = computed(() => (id) => {
    return classes.value.find(c => c.id === id) || {
      name: '未知班级',
      teacher: '未知教师',
      image: '',
      contractNumber: '暂无数据',
      classId: '暂无数据',
      location: '暂无数据',
      coordinator: '暂无数据',
      customer: '暂无数据'
    }
  })

  // 初始化方法，使用API
  const initializeSampleData = async () => {
    try {
      // 先获取现有数据
      await fetchClasses()

      // 如果已有数据，不需要初始化
      if (classes.value.length > 0) {
        console.log('数据库已有数据，跳过示例数据初始化')
        return
      }

      console.log('数据库为空，示例数据将由后端自动初始化')
    } catch (err) {
      console.error('初始化数据失败:', err)
    }
  }

  // 待办事项管理方法
  // 获取班级的待办事项
  const fetchTodos = async (classId) => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(`${API_BASE_URL}/todos/class/${classId}`)
      if (!response.ok) {
        throw new Error('获取待办事项失败')
      }
      return await response.json()
    } catch (err) {
      error.value = err.message
      console.error('获取待办事项失败:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // 创建待办事项
  const createTodo = async (todoData) => {
    try {
      const response = await saveToAPI('POST', `${API_BASE_URL}/todos`, todoData)
      return response
    } catch (err) {
      console.error('创建待办事项失败:', err)
      throw err
    }
  }

  // 删除待办事项
  const deleteTodo = async (todoId) => {
    try {
      const response = await saveToAPI('DELETE', `${API_BASE_URL}/todos/${todoId}`)
      return response
    } catch (err) {
      console.error('删除待办事项失败:', err)
      throw err
    }
  }

  // 更新待办事项状态
  const updateTodoStatus = async (todoId, status) => {
    try {
      const response = await saveToAPI('PUT', `${API_BASE_URL}/todos/${todoId}`, { status })
      return response
    } catch (err) {
      console.error('更新待办事项状态失败:', err)
      throw err
    }
  }

  // 班级课程管理方法
  // 添加课程到班级
  const addCourseToClass = async (classId, courseData) => {
    try {
      const classItem = await saveToAPI('GET', `${API_BASE_URL}/classes/${classId}`)
      const courses = classItem.courses || []

      // 生成新课程ID
      const newCourseId = Date.now()
      const newCourse = {
        id: newCourseId,
        ...courseData,
        createdAt: new Date().toISOString()
      }

      courses.push(newCourse)

      // 更新班级的课程列表
      await saveToAPI('PUT', `${API_BASE_URL}/classes/${classId}`, { courses })

      // 更新本地数据
      const localClass = classes.value.find(c => c.id === classId)
      if (localClass) {
        localClass.courses = courses
      }

      return newCourse
    } catch (err) {
      console.error('添加课程到班级失败:', err)
      throw err
    }
  }

  // 更新班级课程
  const updateClassCourse = async (classId, courseId, courseData) => {
    try {
      const classItem = await saveToAPI('GET', `${API_BASE_URL}/classes/${classId}`)
      const courses = classItem.courses || []

      const courseIndex = courses.findIndex(c => c.id === courseId)
      if (courseIndex === -1) {
        throw new Error('课程不存在')
      }

      courses[courseIndex] = {
        ...courses[courseIndex],
        ...courseData,
        updatedAt: new Date().toISOString()
      }

      // 更新班级的课程列表
      await saveToAPI('PUT', `${API_BASE_URL}/classes/${classId}`, { courses })

      // 更新本地数据
      const localClass = classes.value.find(c => c.id === classId)
      if (localClass) {
        localClass.courses = courses
      }

      return courses[courseIndex]
    } catch (err) {
      console.error('更新班级课程失败:', err)
      throw err
    }
  }

  // 删除班级课程
  const deleteClassCourse = async (classId, courseId) => {
    try {
      const classItem = await saveToAPI('GET', `${API_BASE_URL}/classes/${classId}`)
      const courses = classItem.courses || []

      const filteredCourses = courses.filter(c => c.id !== courseId)

      // 更新班级的课程列表
      await saveToAPI('PUT', `${API_BASE_URL}/classes/${classId}`, { courses: filteredCourses })

      // 更新本地数据
      const localClass = classes.value.find(c => c.id === classId)
      if (localClass) {
        localClass.courses = filteredCourses
      }

      return true
    } catch (err) {
      console.error('删除班级课程失败:', err)
      throw err
    }
  }

  // 公告管理方法
  // 获取班级的公告列表
  const fetchAnnouncements = async (classId) => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(`${API_BASE_URL}/announcements/class/${classId}`)
      if (!response.ok) {
        throw new Error('获取公告失败')
      }
      return await response.json()
    } catch (err) {
      error.value = err.message
      console.error('获取公告失败:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // 创建公告
  const createAnnouncement = async (announcementData) => {
    try {
      const response = await saveToAPI('POST', `${API_BASE_URL}/announcements`, announcementData)
      return response
    } catch (err) {
      console.error('创建公告失败:', err)
      throw err
    }
  }

  // 更新公告
  const updateAnnouncement = async (announcementId, announcementData) => {
    try {
      const response = await saveToAPI('PUT', `${API_BASE_URL}/announcements/${announcementId}`, announcementData)
      return response
    } catch (err) {
      console.error('更新公告失败:', err)
      throw err
    }
  }

  // 删除公告
  const deleteAnnouncement = async (announcementId) => {
    try {
      const response = await saveToAPI('DELETE', `${API_BASE_URL}/announcements/${announcementId}`)
      return response
    } catch (err) {
      console.error('删除公告失败:', err)
      throw err
    }
  }

  return {
    classes,
    loading,
    error,
    fetchClasses,
    updateClassImage,
    addNewClass,
    addClassWithFields,
    deleteClass,
    getClassById,
    initializeSampleData,
    // 待办事项方法
    fetchTodos,
    createTodo,
    deleteTodo,
    updateTodoStatus,
    // 班级课程方法
    addCourseToClass,
    updateClassCourse,
    deleteClassCourse,
    // 公告管理方法
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
  }
})