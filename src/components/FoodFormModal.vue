<!-- frontend/src/components/FoodFormModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-card pop-in">
          <div class="modal-header">
            <span class="modal-header-title">{{ editFood ? 'កែប្រែ' : 'បន្ថែមម្ហូប' }}</span>
            <button class="close-btn" @click="$emit('close')"><AppIcon name="x" :size="16" /></button>
          </div>
          <div class="modal-form">
            <div v-if="successMsg" class="form-success-msg">{{ successMsg }}</div>

            <!-- Name -->
            <div class="form-group">
              <label class="form-label">ឈ្មោះម្ហូប *</label>
              <input v-model="form.name" class="form-input" :class="{ error: errors.name }"
                placeholder="ឈ្មោះម្ហូប..." @input="errors.name = ''" />
              <div v-if="errors.name" class="field-err">{{ errors.name }}</div>
            </div>

            <!-- Price & Category -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">ថ្លៃ (៛) *</label>
                <input v-model="form.price" type="number" step="100" min="0"
                  class="form-input" :class="{ error: errors.price }"
                  placeholder="0" @input="errors.price = ''" />
                <div v-if="errors.price" class="field-err">{{ errors.price }}</div>
              </div>
              <div class="form-group">
                <label class="form-label">ប្រភេទ *</label>
                <AppSelect
                  v-model="form.category"
                  block
                  size="md"
                  tone="soft"
                  :options="categories"
                  option-value="id"
                  option-label="label_km"
                  placeholder="ជ្រើសរើសប្រភេទ"
                />
              </div>
            </div>

            <!-- Image upload -->
            <div class="form-group">
              <label class="form-label">រូបភាព</label>
              <div class="img-upload-area" @click="triggerFileInput">
                <input 
                  ref="fileInput" 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,image/gif" 
                  style="display:none"
                  @change="onFileChange" 
                />
                <div class="img-upload-icon"><AppIcon name="image" :size="36" /></div>
                <div class="img-upload-text">ចុចដើម្បីជ្រើសរូបភាព</div>
                <div class="img-upload-sub">JPG, PNG, WEBP · max 5MB</div>
              </div>
              <div v-if="errors.img" class="field-err">{{ errors.img }}</div>
              <div v-if="previewUrl" class="img-preview-wrap">
                <img :src="previewUrl" class="img-preview" alt="preview" />
                <button class="img-remove-btn" @click.prevent="removeImage"><AppIcon name="x" :size="12" /></button>
              </div>
            </div>

            <!-- Status -->
            <div class="form-group">
              <label class="form-label">ស្ថានភាព</label>
              <AppSelect
                v-model="form.status"
                block
                size="md"
                tone="soft"
                :options="[
                  { value: 'available', label: 'មាន (Available)' },
                  { value: 'unavailable', label: 'អស់ (Unavailable)' },
                ]"
              />
            </div>

            <button class="submit-btn" :disabled="submitting" @click="submit">
              {{ submitting ? 'កំពុងរក្សាទុក...' : (editFood ? 'រក្សាទុក' : 'បន្ថែម') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useFoodsStore } from '@/stores/foods';
import AppSelect from '@/components/AppSelect.vue';
import AppIcon from '@/components/AppIcon.vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  editFood: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
});
const emit = defineEmits(['close', 'saved']);

const foods = useFoodsStore();
const fileInput = ref(null);
const previewUrl = ref('');
const selectedFile = ref(null);
const submitting = ref(false);
const successMsg = ref('');
const errors = ref({ name: '', price: '', img: '' });

const form = ref({ 
  name: '', 
  price: '', 
  category: null, 
  status: 'available' 
});

// Reset form when modal opens
watch(() => props.show, (isVisible) => {
  if (isVisible) {
    successMsg.value = '';
    errors.value = { name: '', price: '', img: '' };
    selectedFile.value = null;
    previewUrl.value = '';
    
    if (props.editFood) {
      form.value = { 
        name: props.editFood.name, 
        price: props.editFood.price, 
        category: props.editFood.category, 
        status: props.editFood.status 
      };
      previewUrl.value = props.editFood.img_url || '';
    } else {
      form.value = { 
        name: '', 
        price: '', 
        category: props.categories[0]?.id || null, 
        status: 'available' 
      };
      previewUrl.value = '';
    }
  }
});

function triggerFileInput() {
  fileInput.value?.click();
}

function onFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    errors.value.img = 'រូបភាពធំពេក (max 5MB)';
    return;
  }
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.value.img = 'សូមជ្រើសរើសរូបភាពប្រភេទ JPG, PNG, WEBP, ឬ GIF';
    return;
  }
  
  errors.value.img = '';
  selectedFile.value = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  selectedFile.value = null;
  previewUrl.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function validate() {
  let isValid = true;
  if (!form.value.name.trim()) {
    errors.value.name = 'សូមបញ្ចូលឈ្មោះម្ហូប';
    isValid = false;
  }
  if (!form.value.price || isNaN(form.value.price) || parseFloat(form.value.price) < 0) {
    errors.value.price = 'សូមបញ្ចូលតម្លៃត្រឹមត្រូវ';
    isValid = false;
  }
  return isValid;
}

async function submit() {
  if (!validate()) return;
  
  submitting.value = true;
  successMsg.value = '';
  
  try {
    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('price', form.value.price);
    formData.append('category', form.value.category);
    formData.append('status', form.value.status);
    
    // IMPORTANT: Only append file if a new file is selected
    if (selectedFile.value) {
      formData.append('image', selectedFile.value);
    }
    
    if (props.editFood) {
      await foods.updateFood(props.editFood.id, formData);
      successMsg.value = 'រក្សាទុកបានជោគជ័យ!';
    } else {
      await foods.addFood(formData);
      successMsg.value = 'បន្ថែមម្ហូបបានជោគជ័យ!';
    }
    
    emit('saved');
    setTimeout(() => emit('close'), 1000);
  } catch (error) {
    console.error('Submit error:', error);
    errors.value.name = error.response?.data?.error || error.message || 'មានបញ្ហា សូមព្យាយាមម្ដងទៀត';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  /* Teleported to <body> — colors come from the theme store's <html> vars
     (stores/theme.js) so the form follows the owner's chosen color, with
     original-green fallbacks everywhere. */
  position: fixed; inset: 0; background: var(--modal-overlay, rgba(0,0,0,.55));
  z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-card {
  background: white; border-radius: 22px; width: 100%; max-width: 420px;
  max-height: 88vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 18px 0; }
.modal-header-title { font-family: 'Hanuman', serif; font-size: 17px; font-weight: 700; color: var(--ink, var(--green-dark, #1a4a1a)); }
.close-btn {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--surface-green, var(--green-pale, #e8f5e9)); border: none; cursor: pointer;
  font-size: 17px; font-weight: 700; color: var(--primary-strong, var(--green-dark, #1a4a1a));
}
.modal-form { padding: 14px 18px 22px; }
.form-group { margin-bottom: 14px; }
.form-label { font-size: 12px; font-weight: 600; color: var(--ink-light, var(--text-mid, #3a5a3a)); margin-bottom: 5px; display: block; }
.form-input {
  width: 100%; padding: 10px 12px; border: 1.5px solid var(--border-green, var(--green-soft, #c8e6c9));
  border-radius: 10px; font-size: 13px; font-family: inherit;
  outline: none; color: var(--text-dark, #1b2e1b); transition: border .2s, box-shadow .2s; background-color: white;
}
.form-input:focus { border-color: var(--primary, var(--green-light, #4caf50)); box-shadow: 0 0 0 3px var(--primary-glow, transparent); }
.form-input.error { border-color: #e53935; background: #fff8f8; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.field-err { font-size: 11px; color: #e53935; margin-top: 4px; }
.form-success-msg {
  background: #e8f5e9; border: 1.5px solid #a5d6a7;
  border-radius: 10px; padding: 10px 14px; margin-bottom: 14px;
  font-size: 13px; color: #2d7a2d; font-weight: 600;
}
.img-upload-area {
  border: 2px dashed var(--border-green, var(--green-soft, #c8e6c9)); border-radius: 12px;
  padding: 20px; text-align: center; cursor: pointer;
  transition: all .2s; background: var(--surface-green, var(--green-pale, #e8f5e9));
}
.img-upload-area:hover { border-color: var(--primary, var(--green-mid, #2d7a2d)); background: var(--tint-hover, #d4edda); }
.img-upload-icon { margin-bottom: 6px; color: var(--primary, var(--green-mid, #2d7a2d)); line-height: 1; display: flex; justify-content: center; }
.img-upload-text { font-size: 12px; color: var(--ink-light, var(--text-mid, #3a5a3a)); font-weight: 600; }
.img-upload-sub  { font-size: 11px; color: var(--text-light, #6a8f6a); margin-top: 2px; }
.img-preview-wrap { margin-top: 10px; position: relative; }
.img-preview { width: 100%; height: 140px; border-radius: 10px; object-fit: cover; border: 2px solid var(--border-green, var(--green-soft, #c8e6c9)); display: block; }
.img-remove-btn {
  position: absolute; top: 6px; right: 6px;
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(0,0,0,.55); color: white; border: none;
  cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;
}
.submit-btn {
  width: 100%; padding: 13px; background: var(--primary, var(--green-mid, #2d7a2d)); color: var(--on-primary, #fff);
  border: none; border-radius: 12px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: background .2s, box-shadow .2s;
  box-shadow: 0 4px 14px var(--primary-glow, transparent);
}
.submit-btn:hover    { background: var(--primary-dark, var(--green-dark, #1a4a1a)); }
.submit-btn:disabled { background: #9e9e9e; cursor: not-allowed; }

/* TRANSITIONS */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.pop-in { animation: popIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes popIn {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}
</style>