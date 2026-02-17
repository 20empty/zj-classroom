<template>
  <div class="simple-test">
    <h1>简单API测试</h1>
    <button @click="testAPI" :disabled="loading">
      {{ loading ? '测试中...' : '测试API' }}
    </button>
    
    <button @click="testAddClass" :disabled="loading" style="margin-left: 10px; background: #4caf50;">
      {{ loading ? '创建中...' : '测试Add Class' }}
    </button>
    
    <div v-if="result" class="result">
      <h3>API响应：</h3>
      <pre>{{ result }}</pre>
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
const result = ref('')
const error = ref('')

const testAPI = async () => {
  try {
    loading.value = true
    error.value = ''
    result.value = ''
    
    console.log('开始测试API...')
    
    const response = await fetch('http://localhost:3001/api/classes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log('API响应状态:', response.status)
    console.log('API响应头:', response.headers)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('API返回数据:', data)
    
    result.value = `✅ 成功获取 ${data.length} 个班级数据\n\n` + JSON.stringify(data, null, 2)
  } catch (err) {
    error.value = `❌ API测试失败: ${err.message}`
    console.error('API测试失败:', err)
  } finally {
    loading.value = false
  }
}

const testAddClass = async () => {
  try {
    loading.value = true
    error.value = ''
    result.value = ''
    
    console.log('开始测试Add Class...')
    
    const classData = {
      name: `前端测试班级_${Date.now()}`,
      teacher: '前端测试老师',
      image: '',
      contractNumber: `FT-${Date.now()}`,
      classId: `FT-${Date.now()}`,
      location: '前端测试地点',
      date: new Date().toISOString().slice(0,10),
      customer: '前端测试客户',
      coordinator: '前端测试班主任'
    }
    
    const response = await fetch('http://localhost:3001/api/classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classData)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const newClass = await response.json()
    console.log('创建班级成功:', newClass)
    
    result.value = `✅ 成功创建班级！\n\n班级信息：\n` + JSON.stringify(newClass, null, 2)
  } catch (err) {
    error.value = `❌ Add Class测试失败: ${err.message}`
    console.error('Add Class测试失败:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.simple-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

button {
  background: #4285f4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
}

button:hover:not(:disabled) {
  background: #3367d6;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result, .error {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
}

.result pre {
  background: white;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}
</style>
