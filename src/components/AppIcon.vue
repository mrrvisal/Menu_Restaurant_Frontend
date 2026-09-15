<template>
  <svg v-if="name === 'food'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M3 11h18M3 11v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8M3 11V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/>
  </svg>
  <svg v-else-if="name === 'plate'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M3 14h18v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2Z"/>
    <path d="M3 18h18"/>
    <path d="M8 18v-4"/>
    <path d="M16 18v-4"/>
  </svg>
  <svg v-else-if="name === 'cup'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M7 5h10v2a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V5Z"/>
    <path d="M5 9h14"/>
    <path d="M6 9V5"/>
    <path d="M18 9V5"/>
    <path d="M12 21v-4"/>
    <path d="M9 17h6"/>
    <path d="M10 21h4"/>
    <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
  </svg>
  <svg v-else-if="name === 'soup'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M4 14c0 4 2 6 6 6s6-2 6-6"/>
    <path d="M4 14h16v4a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-4Z"/>
    <path d="M4 18h16"/>
    <path d="M8 18v-3"/>
    <path d="M12 18v-4"/>
    <path d="M16 18v-2"/>
    <path d="M11 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
  </svg>
  <svg v-else-if="name === 'fish'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M3 12c3-3 9-3 15-3s6 3 9 3"/>
    <path d="M3 12c0 4 4 5 9 5s9-1 9-5"/>
    <path d="M21 12l3 3-6 0 3-3"/>
    <path d="M9 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
    <path d="M15 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
  </svg>
  <svg v-else-if="name === 'salad'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M6 18c0-4 2-7 6-7s4 3 6 7"/>
    <path d="M6 18c0-3 1.5-5 4-5s4 2 4 5"/>
    <path d="M14 18c0-2 1-4 3-4s3 2 3 4"/>
    <path d="M8 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/>
    <path d="M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/>
    <path d="M16 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/>
  </svg>
  <svg v-else-if="name === 'burger'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M5 4h14v2a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V4Z"/>
    <path d="M3 10h18"/>
    <path d="M4 14h16"/>
    <circle cx="6" cy="7" r="1" fill="currentColor"/>
    <circle cx="10" cy="7" r="1" fill="currentColor"/>
    <circle cx="14" cy="7" r="1" fill="currentColor"/>
    <circle cx="18" cy="7" r="1" fill="currentColor"/>
    <path d="M9 10h6"/>
  </svg>
  <svg v-else-if="name === 'pizza'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M3 13h18v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-4Z"/>
    <path d="M12 13V5"/>
    <path d="M9 9l3 2 3-2"/>
    <circle cx="10" cy="15" r="1" fill="currentColor"/>
    <circle cx="14" cy="15" r="1" fill="currentColor"/>
  </svg>
  <svg v-else-if="name === 'beer'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M9 4h2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4Z"/>
    <path d="M13 8h2v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1a1 1 0 0 0-1 1v1"/>
    <path d="M9 16h6"/>
    <path d="M10 18h4"/>
    <path d="M12 2v2"/>
  </svg>
  <svg v-else-if="name === 'banana'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M7 22c0-6 2-10 5-10s3 4 3 10c0 2-1 3-2 3"/>
    <path d="M12 22c0-5 1.5-9 4.5-9s3 4 3 9"/>
    <path d="M17 20c0-4 1-7 3-7"/>
  </svg>
  <svg v-else-if="name === 'rice-ball'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M12 3L4 8v8a4 4 0 0 0 3 3.83V17a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-2.17A4 4 0 0 0 20 16V8l-8-5Z"/>
    <path d="M8 13h8"/>
    <path d="M12 9v8"/>
  </svg>
  <svg v-else-if="name === 'candy'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M12 21c-4.97 0-9-2.69-9-6 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.66-1 2-2 2s-1.51-.34-1.51-1c0-1.66 1-2 1-2s.51-.34.51-1c0-1.1.9-2 1-2s1 .9 1 2"/>
    <path d="M12 2v5"/>
    <path d="M12 17a4 4 0 0 0 4-4"/>
    <path d="M12 17a4 4 0 0 1-4-4"/>
  </svg>
  <svg v-else-if="name === 'category'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"/>
  </svg>
  <svg v-else-if="name === 'orders'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
  <svg v-else-if="name === 'lock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
  <svg v-else-if="name === 'key'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
  <svg v-else-if="name === 'telegram'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="m21 4-4.5 16-5.2-5.1L7 19l1.2-6L3 10.8 21 4Z"/>
  </svg>
  <svg v-else-if="name === 'qr'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
  </svg>
  <svg v-else-if="name === 'add'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
  <svg v-else-if="name === 'eye'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
  <svg v-else-if="name === 'search'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>
  <svg v-else-if="name === 'clock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
  <svg v-else-if="name === 'trash'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
  <svg v-else-if="name === 'edit'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
  <svg v-else-if="name === 'check'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
  <svg v-else-if="name === 'x'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
  <svg v-else-if="name === 'note'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
  <svg v-else-if="name === 'money'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <circle cx="12" cy="12" r="10"/>
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
    <line x1="12" y1="18" x2="12" y2="18"/>
  </svg>
  <svg v-else-if="name === 'download'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
  <svg v-else-if="name === 'link'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
  <svg v-else-if="name === 'rocket'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
  <svg v-else-if="name === 'users'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
  <svg v-else-if="name === 'store'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M3 9h18"/>
    <path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/>
    <path d="M3 9l9-6 9 6"/>
    <path d="M9 21V9h6v12"/>
  </svg>
  <svg v-else-if="name === 'settings'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
  <svg v-else-if="name === 'chart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M3 3v18h18"/>
    <path d="M18 17V9"/>
    <path d="M13 17V5"/>
    <path d="M8 17v-3"/>
  </svg>
  <svg v-else-if="name === 'user'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
  <svg v-else-if="name === 'calendar'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
  <svg v-else-if="name === 'phone'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
  <svg v-else-if="name === 'table'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="9" y1="3" x2="9" y2="9"/>
  </svg>
  <svg v-else-if="name === 'clipboard'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
  <svg v-else-if="name === 'book'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
  <svg v-else-if="name === 'clipboard-check'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <path d="M9 14l2 2 4-4"/>
  </svg>
  <svg v-else-if="name === 'user-check'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <polyline points="17 11 19 13 23 9"/>
  </svg>
  <svg v-else-if="name === 'alert-circle'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
  <svg v-else-if="name === 'bell'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
  <svg v-else-if="name === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
  <svg v-else-if="name === 'check-circle'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
  <svg v-else-if="name === 'x-circle'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
  <svg v-else-if="name === 'book-open'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
  <svg v-else-if="name === 'map-pin'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
  <svg v-else-if="name === 'globe'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
  <svg v-else-if="name === 'activity'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
  <svg v-else-if="name === 'clock-check'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
    <path d="M9 14l2 2 4-4"/>
  </svg>
  <svg v-else-if="name === 'chef'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93"/>
    <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93"/>
    <path d="M12 10c-3.5 0-6 1.5-6 3.5S6.5 17 8 17v2h8v-2c1.5 0 3-1 3-3.5S15.5 13 12 13z"/>
  </svg>
  <svg v-else-if="name === 'tick-circle'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
  <svg v-else-if="name === 'x-octagon'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
  <svg v-else-if="name === 'menu'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
  <svg v-else-if="name === 'cart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <circle cx="9" cy="21" r="1"/>
    <circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
  <svg v-else-if="name === 'image'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
  <svg v-else-if="name === 'refresh'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
  <svg v-else-if="name === 'sun'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41 1.41"/>
    <path d="m19.07 4.93-1.41 1.41"/>
  </svg>
  <svg v-else-if="name === 'moon'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
  <svg v-else-if="name === 'expand'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <polyline points="15 3 21 3 21 9"/>
    <polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/>
    <line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
  <svg v-else-if="name === 'minimize'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon" :width="size" :height="size">
    <polyline points="4 14 10 14 10 20"/>
    <polyline points="20 10 14 10 14 4"/>
    <line x1="14" y1="10" x2="21" y2="3"/>
    <line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 20
  }
});
</script>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>