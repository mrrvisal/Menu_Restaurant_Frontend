<template>
  <form @submit.prevent="emit('submit')">
    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
    <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
    <div class="form-group">
      <label>{{ i18n.t.email }}</label>
      <input :value="email" type="email" class="input" placeholder="your@email.com" required
        @input="emit('update:email', $event.target.value)" />
    </div>
    <button type="submit" class="btn" :disabled="submitting">
      {{ submitting ? i18n.t.loading : i18n.t.send_reset_link }}
    </button>
  </form>
</template>

<script setup>
defineProps([
  "email",
  "errorMsg",
  "successMsg",
  "submitting",
  "i18n",
]);
const emit = defineEmits(["submit", "update:email"]);
</script>

<style scoped>
.form-group {
  margin-bottom: 14px;
  text-align: left;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 5px;
  display: block;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #bbf7d0;
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}

.input:focus {
  border-color: #4ade80;
}

.btn {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #0f766e, #22c55e);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}

.btn:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}

.error-msg {
  background: #fbe9e7;
  border: 1.5px solid #ffccbc;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #c62828;
  margin-bottom: 12px;
}

.success-msg {
  background: #e8f5e9;
  border: 1.5px solid #a5d6a7;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #2d7a2d;
  margin-bottom: 12px;
}
</style>
