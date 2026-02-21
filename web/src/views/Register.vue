<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Create Account</h2>
      <p class="subtitle">Join ZJ Classroom today</p>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Username</label>
          <input 
            type="text" 
            v-model="username" 
            required 
            placeholder="Choose a username"
            class="glass-input"
          />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input 
            type="email" 
            v-model="email" 
            required 
            placeholder="Enter your email"
            class="glass-input"
          />
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input 
            type="password" 
            v-model="password" 
            required 
            placeholder="Create a password"
            class="glass-input"
          />
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button type="submit" :disabled="loading" class="primary-btn">
          {{ loading ? 'Creating Account...' : 'Sign Up' }}
        </button>
      </form>
      
      <div class="auth-footer">
        Already have an account? 
        <router-link to="/login">Sign In</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value
    });
    router.push('/');
  } catch (err) {
    error.value = err.message || 'Registration failed.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import '../assets/styles/auth.css';
</style>
