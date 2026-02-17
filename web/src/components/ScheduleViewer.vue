<template>
    <div class="schedule-viewer">
      <h2>华为技术培训课表（模拟）</h2>
      <table class="schedule-table">
        <thead>
          <tr>
            <th>时间/星期</th>
            <th v-for="day in days" :key="day">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(section, idx) in sections" :key="section">
            <td class="section-label">{{ section }}</td>
            <td v-for="day in days" :key="day" class="course-cell">
              <div v-if="schedule[day] && schedule[day][idx]">
                <div class="course-title">{{ schedule[day][idx].title }}</div>
                <div class="course-location">{{ schedule[day][idx].location }}</div>
                <div class="course-instructor">讲师: {{ schedule[day][idx].instructor }}</div>
              </div>
              <div v-else class="empty-slot">-</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { reactive } from 'vue'
  
  // 只保留工作日（周一至周五）
  const days = ['周一', '周二', '周三', '周四', '周五']
  // 精简为上午和下午两节课
  const sections = ['上午 (9:00-12:00)', '下午 (14:00-17:00)']
  
  // 更新为技术培训课程数据
  // 所有讲师统一为 Jerry
  const schedule = reactive({
    '周一': [
      { 
        title: '云计算基础', 
        location: '云实验室A', 
        instructor: 'Jerry',
        description: '云计算概念、架构及服务模型'
      },
      { 
        title: '虚拟化技术', 
        location: '虚拟化实验室', 
        instructor: 'Jerry',
        description: 'KVM/Xen虚拟化原理与实践'
      }
    ],
    '周二': [
      { 
        title: '网络基础', 
        location: '网络实验室B', 
        instructor: 'Jerry',
        description: 'TCP/IP协议栈与网络设备配置'
      },
      { 
        title: '存储技术', 
        location: '存储实验室', 
        instructor: 'Jerry',
        description: 'SAN/NAS存储架构与管理'
      }
    ],
    '周三': [
      { 
        title: '数据库管理', 
        location: '数据库实验室', 
        instructor: 'Jerry',
        description: 'MySQL/Oracle数据库运维'
      },
      { 
        title: '大数据入门', 
        location: '大数据实验室', 
        instructor: 'Jerry',
        description: 'Hadoop/Spark基础与应用'
      }
    ],
    '周四': [
      { 
        title: '人工智能导论', 
        location: 'AI实验室', 
        instructor: 'Jerry',
        description: '机器学习与深度学习基础'
      },
      { 
        title: '容器技术', 
        location: '容器实验室', 
        instructor: 'Jerry',
        description: 'Docker/Kubernetes实践'
      }
    ],
    '周五': [
      { 
        title: '项目实战', 
        location: '综合实验室', 
        instructor: 'Jerry',
        description: '云平台部署与运维实战'
      },
      { 
        title: '结业考核', 
        location: '考试中心', 
        instructor: 'Jerry',
        description: '综合能力评估与认证'
      }
    ]
  })
  </script>
  
  <style scoped>
  .schedule-viewer {
    max-width: 900px;
    margin: 40px auto;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(66,133,244,0.08);
    padding: 32px 24px;
  }
  
  .schedule-viewer h2 {
    text-align: center;
    margin-bottom: 24px;
    color: #4285f4;
    font-weight: 600;
  }
  
  .schedule-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
  }
  
  .schedule-table th,
  .schedule-table td {
    border: 1px solid #e3eaf2;
    padding: 12px 8px;
    text-align: center;
  }
  
  .schedule-table th {
    background: #f5f8fa;
    color: #4285f4;
    font-weight: 500;
  }
  
  .section-label {
    background: #f0f4f8;
    color: #666;
    font-weight: 500;
    width: 120px;
  }
  
  .course-cell {
    min-width: 150px;
    min-height: 80px;
    vertical-align: top;
  }
  
  .course-title {
    font-weight: 600;
    color: #222;
    font-size: 15px;
  }
  
  .course-location {
    font-size: 13px;
    color: #4285f4;
    margin-top: 4px;
  }
  
  .course-instructor {
    font-size: 12px;
    color: #888;
    margin-top: 4px;
    font-style: italic;
  }
  
  .empty-slot {
    color: #ccc;
    font-size: 14px;
  }
  </style>