import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '../api/request'

export const useClassStore = defineStore('classes', () => {
  const classes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 获取所有班级
  const fetchClasses = async () => {
    try {
      loading.value = true
      error.value = null
      const data = await request({
        url: '/classes',
        method: 'get'
      })
      classes.value = data
    } catch (err) {
      error.value = err.message
      console.error('获取班级数据失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 更新班级图片
  const updateClassImage = async (classId, imageData) => {
    try {
      const updatedClass = await request({
        url: `/classes/${classId}`,
        method: 'put',
        data: { image: imageData }
      })
      const index = classes.value.findIndex(c => c.id === classId)
      if (index !== -1) {
        classes.value[index] = updatedClass
      }
    } catch (err) {
      console.error('更新班级图片失败:', err)
    }
  }

  // 默认初始待办内容
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

      const newClass = await request({
        url: '/classes',
        method: 'post',
        data: classData
      })
      classes.value.push(newClass)

      // 添加初始待办
      const todos = (customTodos && Array.isArray(customTodos) ? customTodos : defaultTodos).map(t => ({
        ...t,
        classId: newClass.id,
        date: new Date().toISOString().slice(0, 10)
      }))

      // 批量创建待办事项
      for (const todo of todos) {
        await request({
          url: '/todos',
          method: 'post',
          data: todo
        })
      }

      return newClass.id
    } catch (err) {
      console.error('添加新班级失败:', err)
      throw err
    }
  }

  // 带字段创建班级
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

      const newClass = await request({
        url: '/classes',
        method: 'post',
        data: classData
      })
      classes.value.push(newClass)

      const todos = (customTodos && Array.isArray(customTodos) ? customTodos : defaultTodos).map(t => ({
        ...t,
        classId: newClass.id,
        date: new Date().toISOString().slice(0, 10)
      }))

      for (const todo of todos) {
        await request({
          url: '/todos',
          method: 'post',
          data: todo
        })
      }

      return newClass.id
    } catch (err) {
      throw err
    }
  }

  // 删除班级
  const deleteClass = async (classId) => {
    try {
      await request({
        url: `/classes/${classId}`,
        method: 'delete'
      })
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

  // 初始化方法
  const initializeSampleData = async () => {
    try {
      await fetchClasses()
      if (classes.value.length > 0) {
        return
      }
      console.log('数据库为空')
    } catch (err) {
      console.error('初始化数据失败:', err)
    }
  }

  // 获取班级的待办事项
  const fetchTodos = async (classId) => {
    try {
      loading.value = true
      error.value = null
      const data = await request({
        url: `/todos/class/${classId}`,
        method: 'get'
      })
      return data
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
      return await request({
        url: '/todos',
        method: 'post',
        data: todoData
      })
    } catch (err) {
      console.error('创建待办事项失败:', err)
      throw err
    }
  }

  // 删除待办事项
  const deleteTodo = async (todoId) => {
    try {
      return await request({
        url: `/todos/${todoId}`,
        method: 'delete'
      })
    } catch (err) {
      console.error('删除待办事项失败:', err)
      throw err
    }
  }

  // 更新待办事项状态
  const updateTodoStatus = async (todoId, status) => {
    try {
      return await request({
        url: `/todos/${todoId}`,
        method: 'put',
        data: { status }
      })
    } catch (err) {
      console.error('更新待办事项状态失败:', err)
      throw err
    }
  }

  // 添加课程到班级
  const addCourseToClass = async (classId, courseData) => {
    try {
      const classItem = classes.value.find(c => c.id === classId) || await request({ url: `/classes/${classId}`, method: 'get' })
      const courses = classItem.courses || []

      const newCourseId = Date.now()
      const newCourse = {
        id: newCourseId,
        ...courseData,
        createdAt: new Date().toISOString()
      }

      courses.push(newCourse)

      await request({
        url: `/classes/${classId}`,
        method: 'put',
        data: { courses }
      })

      const index = classes.value.findIndex(c => c.id === classId)
      if (index !== -1) {
        classes.value[index].courses = courses
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
      const classItem = classes.value.find(c => c.id === classId) || await request({ url: `/classes/${classId}`, method: 'get' })
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

      await request({
        url: `/classes/${classId}`,
        method: 'put',
        data: { courses }
      })

      const index = classes.value.findIndex(c => c.id === classId)
      if (index !== -1) {
        classes.value[index].courses = courses
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
      const classItem = classes.value.find(c => c.id === classId) || await request({ url: `/classes/${classId}`, method: 'get' })
      const courses = classItem.courses || []
      const filteredCourses = courses.filter(c => c.id !== courseId)

      await request({
        url: `/classes/${classId}`,
        method: 'put',
        data: { courses: filteredCourses }
      })

      const index = classes.value.findIndex(c => c.id === classId)
      if (index !== -1) {
        classes.value[index].courses = filteredCourses
      }

      return true
    } catch (err) {
      console.error('删除班级课程失败:', err)
      throw err
    }
  }

  // 获取班级的公告列表
  const fetchAnnouncements = async (classId) => {
    try {
      loading.value = true
      error.value = null
      const data = await request({
        url: `/announcements/class/${classId}`,
        method: 'get'
      })
      return data
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
      return await request({
        url: '/announcements',
        method: 'post',
        data: announcementData
      })
    } catch (err) {
      console.error('创建公告失败:', err)
      throw err
    }
  }

  // 更新公告
  const updateAnnouncement = async (announcementId, announcementData) => {
    try {
      return await request({
        url: `/announcements/${announcementId}`,
        method: 'put',
        data: announcementData
      })
    } catch (err) {
      console.error('更新公告失败:', err)
      throw err
    }
  }

  // 删除公告
  const deleteAnnouncement = async (announcementId) => {
    try {
      return await request({
        url: `/announcements/${announcementId}`,
        method: 'delete'
      })
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
    fetchTodos,
    createTodo,
    deleteTodo,
    updateTodoStatus,
    addCourseToClass,
    updateClassCourse,
    deleteClassCourse,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
  }
})