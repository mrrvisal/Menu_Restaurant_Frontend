<!-- frontend/src/components/FoodFormModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-card pop-in">
          <div class="modal-header">
            <span class="modal-header-title">{{ editFood ? 'កែប្រែ' : 'បន្ថែមម្ហូប' }}</span>
            <button class="close-btn" @click="$emit('close')">✕</button>
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
                <select v-model="form.category" class="form-input">
                  <option v-for="cat in categories" :key="cat.slug" :value="cat.slug">
                    {{ cat.icon }} {{ cat.label_km }}
                  </option>
                </select>
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
                <div class="img-upload-icon">🖼️</div>
                <div class="img-upload-text">ចុចដើម្បីជ្រើសរូបភាព</div>
                <div class="img-upload-sub">JPG, PNG, WEBP · max 5MB</div>
              </div>
              <div v-if="errors.img" class="field-err">{{ errors.img }}</div>
              <div v-if="previewUrl" class="img-preview-wrap">
                <img :src="previewUrl" class="img-preview" alt="preview" />
                <button class="img-remove-btn" @click.prevent="removeImage">✕</button>
              </div>
            </div>

            <!-- Status -->
            <div class="form-group">
              <label class="form-label">ស្ថានភាព</label>
              <select v-model="form.status" class="form-input">
                <option value="available">មាន (Available)</option>
                <option value="unavailable">អស់ (Unavailable)</option>
              </select>
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
  category: 'made-to-order', 
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
        category: props.categories[0]?.slug || 'made-to-order', 
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
  position: fixed; inset: 0; background: rgba(0,0,0,.55);
  z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-card {
  background: white; border-radius: 22px; width: 100%; max-width: 420px;
  max-height: 88vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 18px 0; }
.modal-header-title { font-family: 'Hanuman', serif; font-size: 17px; font-weight: 700; color: var(--green-dark); }
.close-btn {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--green-pale); border: none; cursor: pointer;
  font-size: 17px; font-weight: 700; color: var(--green-dark);
}
.modal-form { padding: 14px 18px 22px; }
.form-group { margin-bottom: 14px; }
.form-label { font-size: 12px; font-weight: 600; color: var(--text-mid); margin-bottom: 5px; display: block; }
.form-input {
  width: 100%; padding: 10px 12px; border: 1.5px solid var(--green-soft);
  border-radius: 10px; font-size: 13px; font-family: inherit;
  outline: none; color: var(--text-dark); transition: border .2s; background: white;
}
.form-input:focus { border-color: var(--green-light); }
.form-input.error { border-color: #e53935; background: #fff8f8; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.field-err { font-size: 11px; color: #e53935; margin-top: 4px; }
.form-success-msg {
  background: #e8f5e9; border: 1.5px solid #a5d6a7;
  border-radius: 10px; padding: 10px 14px; margin-bottom: 14px;
  font-size: 13px; color: #2d7a2d; font-weight: 600;
}
.img-upload-area {
  border: 2px dashed var(--green-soft); border-radius: 12px;
  padding: 20px; text-align: center; cursor: pointer;
  transition: all .2s; background: var(--green-pale);
}
.img-upload-area:hover { border-color: var(--green-mid); background: #d4edda; }
.img-upload-icon { font-size: 28px; margin-bottom: 6px; }
.img-upload-text { font-size: 12px; color: var(--text-mid); font-weight: 600; }
.img-upload-sub  { font-size: 11px; color: var(--text-light); margin-top: 2px; }
.img-preview-wrap { margin-top: 10px; position: relative; }
.img-preview { width: 100%; height: 140px; border-radius: 10px; object-fit: cover; border: 2px solid var(--green-soft); display: block; }
.img-remove-btn {
  position: absolute; top: 6px; right: 6px;
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(0,0,0,.55); color: white; border: none;
  cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;
}
.submit-btn {
  width: 100%; padding: 13px; background: var(--green-mid); color: white;
  border: none; border-radius: 12px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: background .2s;
}
.submit-btn:hover    { background: var(--green-dark); }
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