<template>
  <div class="header-top">
    <h1 class="site-title" @click="$emit('go-home')">
      <i class="fas fa-graduation-cap"></i>
      ZJ-Huawei Classroom
    </h1>
    <button class="home-btn" @click="$emit('go-home')">
      <i class="fas fa-home"></i> Back to Home
    </button>
  </div>
</template>

<script setup>
defineEmits(['go-home'])
</script>

<style scoped>
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 10px;
}

.site-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.site-title i {
  color: var(--color-primary);
  font-size: 1.6rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.site-title:hover {
  transform: translateY(-1px);
  text-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.home-btn {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #64748b; /* Fallback for --text-secondary */
  padding: 8px 16px;
  border-radius: 99px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.home-btn:hover {
  background: white;
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
