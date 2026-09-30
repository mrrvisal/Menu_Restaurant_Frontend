<template>
    <footer class="footer sel-light">
      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} {{ i18n.t.app_name }}. {{ i18n.t.all_rights_reserved }}</p>
      </div>
    </footer>
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";

const i18n = useI18nStore();
</script>
<style scoped>
/* ============================================================
   FOOTER — rounded inset card, centered brand, socials
   ============================================================ */
.footer {
  position: relative;
  z-index: 1;
  margin: 0 12px 12px;
  padding: 20px 32px 20px;
  border-radius: 24px;
  background: linear-gradient(135deg, #166534 0%, #1f9a4a 55%, #22c55e 100%);
  overflow: hidden;
}

.footer-bottom {
  position: relative;
  z-index: 2;
  width: min(1180px, 100%);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-bottom p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

@media (max-width: 640px) {
  .footer {
    margin: 0 8px 8px;
    border-radius: 20px;
  }

  .footer-name {
    font-size: 22px;
  }

  .footer-bottom {
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }

  .footer-nav {
    justify-content: center;
    gap: 20px;
  }
}
</style>
