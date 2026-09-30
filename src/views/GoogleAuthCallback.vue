<template>
  <div class="page">
    <div class="box">
      <span class="spinner" aria-hidden="true"></span>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { useGoogleAuthCallback } from "@/composables/useGoogleAuthCallback";

const message = useGoogleAuthCallback();
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
  font-family: system-ui, -apple-system, sans-serif;
}

.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: #14532d;
  text-align: center;
  padding: 20px;
}

.spinner {
  width: 34px;
  height: 34px;
  border: 3px solid #bbf7d0;
  border-top-color: #16a34a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

p {
  margin: 0;
  font-size: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
