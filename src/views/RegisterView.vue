<template>
  <div class="page">
    <div class="card pop-in">
      <div class="icon">🏪</div>
      <div class="title">{{ i18n.t.register_title }}</div>

      <form @submit.prevent="submit">
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>

        <div class="section-title">{{ i18n.t.restaurant_name }}</div>

        <div class="form-group">
          <label>{{ i18n.t.restaurant_name }} *</label>
          <input v-model="form.restaurantName" class="input" :placeholder="i18n.t.restaurant_name" required />
        </div>

        <div class="section-title">{{ i18n.t.login }}</div>

        <div class="form-group">
          <label>{{ i18n.t.email }} *</label>
          <input v-model="form.email" type="email" class="input" placeholder="your@email.com" required />
        </div>
        <div class="form-group">
          <label>{{ i18n.t.password }} *</label>
          <input v-model="form.password" type="password" class="input" :placeholder="i18n.t.password" minlength="6" required />
        </div>

        <button type="submit" class="btn" :disabled="submitting">
          {{ submitting ? i18n.t.loading : i18n.t.register }}
        </button>
      </form>

      <div class="links">{{ i18n.t.have_account }} <router-link to="/login">{{ i18n.t.login }}</router-link></div>
      <button class="lang-toggle" @click="i18n.toggleLocale">{{ i18n.locale === 'km' ? 'English' : 'ភាសាខ្មែរ' }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";

const router = useRouter();
const auth = useAuthStore();
const i18n = useI18nStore();

const form = reactive({
  restaurantName: "", logoFile: null,
  email: "", fullName: "", password: "",
});
const errorMsg = ref("");
const successMsg = ref("");
const submitting = ref(false);
const logoPreview = ref("");

function onLogoChange(e) {
  const file = e.target.files[0];
  if (file) {
    form.logoFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => { logoPreview.value = ev.target.result; };
    reader.readAsDataURL(file);
  }
}

async function submit() {
  errorMsg.value = "";
  successMsg.value = "";
  submitting.value = true;
  try {
    const fd = new FormData();
    fd.append("email", form.email.trim());
    fd.append("password", form.password);
    fd.append("fullName", form.fullName.trim());
    fd.append("restaurantName", form.restaurantName.trim());
    if (form.logoFile) fd.append("logo", form.logoFile);

    const data = await auth.register(fd);
    successMsg.value = data.message || i18n.t.success;
    setTimeout(() => router.push("/dashboard"), 2000);
  } catch (err) {
    errorMsg.value = err.response?.data?.error || err.message || i18n.t.error;
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: linear-gradient(135deg, #f0fdf4, #dcfce7); display: flex; align-items: center; justify-content: center; padding: 20px; }
.card { background: white; border-radius: 22px; width: 100%; max-width: 500px; padding: 36px 28px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
.icon { font-size: 48px; margin-bottom: 8px; }
.title { font-family: "Hanuman", serif; font-size: 20px; font-weight: 700; color: #14532d; margin-bottom: 20px; }
.section-title { font-family: "Hanuman", serif; font-size: 13px; font-weight: 700; color: #0f766e; text-align: left; margin: 16px 0 10px; padding-bottom: 6px; border-bottom: 1.5px solid #e8f5e9; }
.form-group { margin-bottom: 12px; text-align: left; }
.form-group label { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 5px; display: block; }
.input { width: 100%; padding: 10px 12px; border: 1.5px solid #bbf7d0; border-radius: 10px; font-size: 13px; font-family: inherit; outline: none; box-sizing: border-box; background: white; }
.input:focus { border-color: #4ade80; }
.btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #0f766e, #22c55e); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; }
.btn:disabled { background: #9e9e9e; cursor: not-allowed; }
.error-msg { background: #fbe9e7; border: 1.5px solid #ffccbc; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #c62828; margin-bottom: 12px; }
.success-msg { background: #e8f5e9; border: 1.5px solid #a5d6a7; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #2d7a2d; margin-bottom: 12px; }
.links { margin-top: 12px; font-size: 13px; color: #6b7280; }
.links a { color: #16a34a; font-weight: 600; text-decoration: none; }
.logo-preview { margin-top: 6px; }
.logo-preview img { width: 60px; height: 60px; object-fit: cover; border-radius: 10px; border: 2px solid #bbf7d0; }
.lang-toggle { margin-top: 14px; background: none; border: 1.5px solid #bbf7d0; border-radius: 20px; padding: 6px 16px; font-size: 12px; font-family: inherit; color: #16a34a; cursor: pointer; }
.pop-in { animation: popIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>