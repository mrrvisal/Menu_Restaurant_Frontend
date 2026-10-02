<template>
  <div class="nf-art" aria-hidden="true">
    <svg viewBox="0 0 180 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- bright green suit — light mode -->
        <linearGradient id="nfWaiterSuit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#4ade80" />
          <stop offset="1" stop-color="#22c55e" />
        </linearGradient>
        <linearGradient id="nfWaiterTray" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fcd34d" />
          <stop offset="1" stop-color="#f59e0b" />
        </linearGradient>
      </defs>

      <!-- ground shadow -->
      <ellipse cx="90" cy="188" rx="46" ry="8" fill="#0f2e1d" opacity="0.06" />

      <!-- legs — light -->
      <rect x="72" y="128" width="16" height="56" rx="8" fill="#166534" />
      <rect x="92" y="128" width="16" height="56" rx="8" fill="#166534" />

      <!-- left arm, relaxed at the side -->
      <rect x="46" y="74" width="18" height="50" rx="9" fill="url(#nfWaiterSuit)" />
      <circle cx="55" cy="128" r="9" fill="#d8ab84" />

      <!-- torso / apron with a white shirt stripe -->
      <rect x="56" y="60" width="68" height="82" rx="22" fill="#22c55e" />
      <rect x="82" y="64" width="16" height="74" rx="8" fill="#ffffff" />

      <!-- right arm holding the tray -->
      <rect x="114" y="78" width="40" height="18" rx="9" fill="url(#nfWaiterSuit)" />
      <circle cx="156" cy="86" r="10" fill="#d8ab84" />

      <!-- tray -->
      <ellipse cx="156" cy="72" rx="24" ry="8" fill="url(#nfWaiterTray)" />
      <ellipse cx="156" cy="70" rx="16" ry="4.5" fill="#ffffff" opacity="0.35" />

      <!-- head — light skin -->
      <circle cx="90" cy="40" r="24" fill="#d8ab84" />

      <!-- the "?" — the missing page -->
      <text x="120" y="24" font-family="'Kantumruy Pro','Noto Sans Khmer',system-ui,sans-serif" font-size="30"
        font-weight="900" fill="#f59e0b">?</text>
    </svg>
  </div>
</template>

<style scoped>
.nf-art {
  position: relative;
  width: 150px;
  height: 167px;
  margin-bottom: 6px;
  filter: drop-shadow(0 12px 18px rgba(22, 101, 52, 0.14));
  animation: nfBob 4.5s ease-in-out infinite;
}

.nf-art svg {
  display: block;
  width: 100%;
  height: 100%;
}

@keyframes nfBob {

  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }

  50% {
    transform: translateY(-10px) rotate(2deg);
  }
}

@media (max-width: 480px) {
  .nf-art {
    width: 124px;
    height: 138px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nf-art {
    animation: none;
  }
}
</style>
