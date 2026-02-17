<template>
  <div id="app">
    <header class="app-header">
      <div class="header-inner">
        <div class="header-brand">
          <img src="../public/img/small-logo.png" alt="Logo" class="header-logo">
          <h1 class="header-title">ZJ–Huawei Classroom</h1>
        </div>
      </div>
    </header>
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="app-footer">
      <span class="footer-text">如有任何问题和意见，请联系开发人：李义华wx1343135</span>
    </footer>
  </div>
</template>

<style>
/* ===== CSS Design Tokens ===== */
:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --color-primary: #4f6ef7;
  --color-primary-dark: #3b53d9;
  --color-primary-light: #818df8;
  --color-accent: #06b6a0;
  --color-accent-dark: #059684;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --color-success: #10b981;
  --color-surface: rgba(255, 255, 255, 0.72);
  --color-surface-solid: #ffffff;
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
  --color-border: rgba(148, 163, 184, 0.2);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-xl: 0 24px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --glass-bg: rgba(255, 255, 255, 0.65);
  --glass-border: rgba(255, 255, 255, 0.3);
  --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== Global Reset & Base ===== */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-primary);
  min-height: 100vh;
  color: var(--color-text-primary);
  background: #f0f4ff;
  background-image:
    radial-gradient(ellipse 80% 60% at 10% 20%, rgba(129, 141, 248, 0.15) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 90% 80%, rgba(6, 182, 160, 0.12) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(245, 158, 11, 0.06) 0%, transparent 60%);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
}

/* ===== App Layout ===== */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ===== App Header ===== */
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  background: rgba(255, 255, 255, 0.75);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-logo {
  height: 36px;
  transition: transform var(--transition-normal);
}

.header-logo:hover {
  transform: scale(1.08) rotate(-3deg);
}

.header-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

/* ===== App Main ===== */
.app-main {
  flex: 1;
  padding-bottom: 40px;
}

/* ===== App Footer ===== */
.app-footer {
  text-align: center;
  padding: 20px 16px;
  color: var(--color-text-muted);
  font-size: 13px;
}

.footer-text {
  opacity: 0.7;
}

/* ===== Page Transition ===== */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ===== Utility Classes ===== */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(16px) saturate(1.5);
  -webkit-backdrop-filter: blur(16px) saturate(1.5);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

/* ===== Scrollbar ===== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>