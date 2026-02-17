<template>
  <div class="game-management">
    <button class="back-btn" @click="goBack">
      <i class="fas fa-arrow-left"></i> 返回
    </button>
    <div class="header-row">
      <h1>Game Management</h1>
      <div class="header-actions">
        <button class="ai-btn" @click="showAIDialog = true">
          <i class="fas fa-robot"></i> 生成新游戏
        </button>
        <button class="dice-btn" :class="{ rolling: diceRolling }" @click="rollDice" :disabled="diceRolling">
          <i class="fas fa-dice"></i>
        </button>
      </div>
    </div>
    <div class="games-grid">
      <div
        v-for="(game, idx) in games"
        :key="game.id"
        class="game-card"
        :class="{ 'selected-card': selectedIndex === idx }"
      >
        <div class="card-header">
          <div class="game-image" @click.stop="triggerFileInput(idx)">
            <img v-if="game.image" :src="game.image" alt="game cover" class="game-img" />
            <div v-else class="default-image">
              <i v-if="game.isAI" class="fas fa-robot"></i>
              <i v-else class="fas fa-gamepad"></i>
            </div>
            <div class="image-overlay">
              <i class="fas fa-camera"></i>
              <span>上传封面</span>
            </div>
          </div>
          <input
            type="file"
            :ref="el => fileInputs[idx] = el"
            accept="image/*"
            class="file-input"
            @change="e => onImageChange(e, idx)"
          />
        </div>
        <div class="card-body">
          <div class="game-title-row">
            <template v-if="editIndex === idx">
              <input
                v-model="editTitle"
                class="edit-title-input"
                @keyup.enter="saveTitle(idx, game)"
                @blur="saveTitle(idx, game)"
                @keyup.esc="cancelEdit"
                maxlength="20"
                autofocus
              />
              <button class="edit-cancel-btn" @click="cancelEdit"><i class="fas fa-times"></i></button>
            </template>
            <template v-else>
              <h3 class="game-title" @click="startEdit(idx, game)">{{ game.title }}</h3>
              <button class="edit-btn" @click="startEdit(idx, game)"><i class="fas fa-pen"></i></button>
            </template>
          </div>
        </div>
        <div class="card-footer">
          <button class="enter-btn" @click="goToGame(game.id)">
            Enter Game <i class="fas fa-arrow-right"></i>
          </button>
          <button class="delete-btn" @click="deleteGame(idx, game)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
    <!-- AI对话框 -->
    <div v-if="showAIDialog" class="ai-dialog-mask">
      <div class="ai-dialog">
        <h3>生成新游戏</h3>
        <textarea v-model="aiInput" placeholder="请输入你想要的游戏需求..." rows="4"></textarea>
        <div class="ai-dialog-actions">
          <button @click="showAIDialog = false">取消</button>
          <button :disabled="aiLoading || !aiInput.trim()" @click="generateAIGame">{{ aiLoading ? '生成中...' : '生成' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const games = ref([
  { id: 1, title: 'Kahoot', image: '' },
  { id: 2, title: 'bodoudou', image: '' },
  { id: 3, title: '游戏三', image: '' },
])
const fileInputs = ref([])

// AI相关
const showAIDialog = ref(false)
const aiInput = ref('')
aiInput.value = ''
const aiLoading = ref(false)
let aiGameId = 1000

// 编辑相关
const editIndex = ref(-1)
const editTitle = ref('')

// 骰子相关
const diceRolling = ref(false)
const selectedIndex = ref(-1)

// 读取本地存储的图片
onMounted(() => {
  games.value.forEach((game, idx) => {
    const savedImg = localStorage.getItem(`game_image_${game.id}`)
    if (savedImg) {
      games.value[idx].image = savedImg
    }
    const savedTitle = localStorage.getItem(`game_title_${game.id}`)
    if (savedTitle) {
      games.value[idx].title = savedTitle
    }
  })
  // 读取AI生成的游戏
  const aiGames = JSON.parse(localStorage.getItem('ai_games') || '[]')
  aiGames.forEach(g => {
    games.value.push(g)
  })
  if (aiGames.length) {
    aiGameId = Math.max(...aiGames.map(g => g.id)) + 1
  }
})

function triggerFileInput(idx) {
  fileInputs.value[idx] && fileInputs.value[idx].click()
}

function onImageChange(event, idx) {
  const file = event.target.files[0]
  if (!file) return
  if (!file.type.match('image.*')) {
    alert('请选择图片文件')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过2MB')
    return
  }
  const reader = new FileReader()
  reader.onload = e => {
    games.value[idx].image = e.target.result
    localStorage.setItem(`game_image_${games.value[idx].id}`, e.target.result)
  }
  reader.readAsDataURL(file)
}

function goToGame(id) {
  if (id === 1) {
    window.open('https://create.kahoot.it/', '_blank')
  } else if (id === 2) {
    window.open('https://www.bodoudou.com', '_blank')
  } else {
    router.push({ path: `/game/${id}` })
  }
}

function goBack() {
  window.history.length > 1 ? router.back() : router.push({ name: 'home' })
}

// mock AI生成PDF
function generateAIGame() {
  aiLoading.value = true
  setTimeout(() => {
    // 生成一个简单的PDF base64（这里只是模拟，实际应调用API）
    const fakePdfBase64 = 'data:application/pdf;base64,JVBERi0xLjQKJc...' // 这里应替换为真实API返回
    const newGame = {
      id: aiGameId++,
      title: 'AI游戏-' + aiInput.value.slice(0, 8),
      image: '',
      isAI: true
    }
    // 存储PPT到localStorage
    localStorage.setItem(`ppt_file_${newGame.id}`, fakePdfBase64)
    localStorage.setItem(`ppt_type_${newGame.id}`, 'pdf')
    localStorage.setItem(`ppt_name_${newGame.id}`, newGame.title + '.pdf')
    // 存储AI游戏到本地
    const aiGames = JSON.parse(localStorage.getItem('ai_games') || '[]')
    aiGames.push(newGame)
    localStorage.setItem('ai_games', JSON.stringify(aiGames))
    games.value.push(newGame)
    showAIDialog.value = false
    aiInput.value = ''
    aiLoading.value = false
  }, 1800)
}

function rollDice() {
  if (games.value.length === 0) return
  diceRolling.value = true
  // 动效持续150ms，仅变色无缩放
  setTimeout(() => {
    let total = games.value.length
    let rounds = 3 + Math.floor(Math.random() * 2)
    let steps = rounds * total + Math.floor(Math.random() * total)
    let cur = 0
    let interval = 80
    function highlightStep() {
      selectedIndex.value = cur % total
      cur++
      if (cur <= steps) {
        if (steps - cur < 6) interval += 40
        setTimeout(highlightStep, interval)
      } else {
        diceRolling.value = false
        setTimeout(() => {
          goToGame(games.value[selectedIndex.value].id)
          selectedIndex.value = -1
        }, 400)
      }
    }
    highlightStep()
  }, 150)
}

function startEdit(idx, game) {
  editIndex.value = idx
  editTitle.value = game.title
}
function cancelEdit() {
  editIndex.value = -1
  editTitle.value = ''
}
function saveTitle(idx, game) {
  if (!editTitle.value.trim()) {
    cancelEdit()
    return
  }
  games.value[idx].title = editTitle.value.trim()
  // 普通游戏保存图片名
  localStorage.setItem(`game_title_${game.id}`, games.value[idx].title)
  // AI游戏同步ai_games
  if (game.isAI) {
    const aiGames = JSON.parse(localStorage.getItem('ai_games') || '[]')
    const aiIdx = aiGames.findIndex(g => g.id === game.id)
    if (aiIdx !== -1) {
      aiGames[aiIdx].title = games.value[idx].title
      localStorage.setItem('ai_games', JSON.stringify(aiGames))
    }
  }
  // 如果有PPT，更新PPT文件名
  if (localStorage.getItem(`ppt_file_${game.id}`)) {
    localStorage.setItem(`ppt_name_${game.id}`, games.value[idx].title + '.pdf')
  }
  cancelEdit()
}

function deleteGame(idx, game) {
  if (!confirm(`确定要删除“${game.title}”吗？`)) return
  // 删除本地图片
  localStorage.removeItem(`game_image_${game.id}`)
  // 删除PPT
  localStorage.removeItem(`ppt_file_${game.id}`)
  localStorage.removeItem(`ppt_type_${game.id}`)
  localStorage.removeItem(`ppt_name_${game.id}`)
  // 如果是AI游戏，更新ai_games
  if (game.isAI) {
    const aiGames = JSON.parse(localStorage.getItem('ai_games') || '[]')
    const newAiGames = aiGames.filter(g => g.id !== game.id)
    localStorage.setItem('ai_games', JSON.stringify(newAiGames))
  }
  games.value.splice(idx, 1)
}
</script>

<style scoped>
.game-management {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ai-btn {
  background-color: #34a853;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}
.ai-btn:hover {
  background-color: #219a43;
}
.dice-btn {
  background: #fffbe6;
  color: #fbc02d;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.18s;
  position: relative;
}
.dice-btn:active,
.dice-btn.rolling {
  background: #ffe082;
}
.ai-dialog-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-dialog {
  background: #fff;
  border-radius: 10px;
  padding: 28px 32px 20px 32px;
  min-width: 340px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.13);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ai-dialog textarea {
  width: 100%;
  border-radius: 6px;
  border: 1px solid #ddd;
  padding: 10px;
  font-size: 1rem;
  resize: vertical;
}
.ai-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 24px;
}
.game-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 2px solid transparent;
}
.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}
.card-header {
  position: relative;
  height: 160px;
}
.game-image {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}
.game-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.default-image {
  color: #ccc;
  font-size: 48px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}
.game-image:hover .image-overlay {
  opacity: 1;
}
.image-overlay i {
  font-size: 24px;
  margin-bottom: 8px;
}
.file-input {
  display: none;
}
.card-body {
  padding: 16px;
  flex-grow: 1;
}
.game-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
  text-align: center;
}
.game-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.edit-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 16px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.2s;
}
.edit-btn:hover {
  background: #f1f3f4;
}
.edit-title-input {
  font-size: 17px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #bbb;
  width: 120px;
}
.edit-cancel-btn {
  background: none;
  border: none;
  color: #e53935;
  cursor: pointer;
  font-size: 16px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.2s;
}
.edit-cancel-btn:hover {
  background: #ffeaea;
}
.card-footer {
  padding: 0 16px 16px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.enter-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}
.enter-btn i {
  font-size: 15px;
}
.enter-btn:hover {
  background-color: #3367d6;
}
.back-btn {
  background-color: #f1f3f4;
  color: #3c4043;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  transition: all 0.2s;
}
.back-btn:hover {
  background-color: #e8eaed;
  transform: translateY(-1px);
}
.back-btn i {
  font-size: 1rem;
}
.ai-image {
  background: #e3f2fd;
  color: #2196f3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}
.delete-btn {
  background: #fff0f0;
  color: #e53935;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
}
.delete-btn:hover {
  background: #ffcdd2;
}
.selected-card {
  box-shadow: 0 0 0 4px #ff9800, 0 6px 16px rgba(0,0,0,0.15) !important;
  border: 2px solid #ff9800;
  z-index: 2;
  position: relative;
  transition: box-shadow 0.2s, border 0.2s;
  /* 移除任何transform、scale、动画等效果 */
}
</style>