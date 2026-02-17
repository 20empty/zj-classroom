<template>
  <div class="test-api">
    <h1>API测试页面</h1>
    
    <div class="test-section">
      <h2>班级数据测试</h2>
      <button @click="testClassesAPI" :disabled="loading">测试班级API</button>
      <div v-if="classesResult" class="result">
        <h3>班级数据：</h3>
        <pre>{{ JSON.stringify(classesResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h2>学生数据测试</h2>
      <button @click="testStudentsAPI" :disabled="loading">测试学生API</button>
      <div v-if="studentsResult" class="result">
        <h3>学生数据：</h3>
        <pre>{{ JSON.stringify(studentsResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h2>课程库测试</h2>
      <button @click="testCourseLibraryAPI" :disabled="loading">测试课程库API</button>
      <div v-if="courseLibraryResult" class="result">
        <h3>课程库数据：</h3>
        <pre>{{ JSON.stringify(courseLibraryResult, null, 2) }}</pre>
      </div>
    </div>

    <div v-if="error" class="error">
      <h3>错误：</h3>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)
const error = ref('')
const classesResult = ref(null)
const studentsResult = ref(null)
const courseLibraryResult = ref(null)

const API_BASE_URL = 'http://localhost:3001/api'

const testClassesAPI = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await fetch(`${API_BASE_URL}/classes`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    classesResult.value = await response.json()
  } catch (err) {
    error.value = err.message
    console.error('测试班级API失败:', err)
  } finally {
    loading.value = false
  }
}

const testStudentsAPI = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await fetch(`${API_BASE_URL}/students/class/1`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    studentsResult.value = await response.json()
  } catch (err) {
    error.value = err.message
    console.error('测试学生API失败:', err)
  } finally {
    loading.value = false
  }
}

const testCourseLibraryAPI = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await fetch(`${API_BASE_URL}/course-library`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    courseLibraryResult.value = await response.json()
  } catch (err) {
    error.value = err.message
    console.error('测试课程库API失败:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.test-api {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.test-section h2 {
  margin-top: 0;
  color: #333;
}

button {
  background: #4285f4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover:not(:disabled) {
  background: #3367d6;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result {
  margin-top: 15px;
  background: white;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.result pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.error {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #ffcdd2;
  margin-top: 20px;
}
</style>
