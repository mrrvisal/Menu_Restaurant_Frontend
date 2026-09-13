<template>
  <div class="post-page">
    <SiteNav />

    <main class="post-main">
      <router-link to="/blog" class="post-back">
        <AppIcon name="book-open" :size="14" /> {{ i18n.t.back_to_blog }}
      </router-link>

      <article v-if="post" class="post-article">
        <div class="post-meta">
          <span class="post-tag">{{ post.tag }}</span>
          <span class="post-date"><AppIcon name="calendar" :size="13" /> {{ dateStr(post.date) }}</span>
          <span class="post-read"><AppIcon name="clock" :size="13" /> {{ post.read_min }} {{ i18n.t.min_read }}</span>
        </div>
        <h1>{{ post.title }}</h1>
        <img class="post-cover" :src="post.image" :alt="post.title" />
        <div class="post-content">
          <template v-for="(b, i) in post.content" :key="i">
            <h2 v-if="b.t === 'h'">{{ b.x }}</h2>
            <p v-else-if="b.t === 'p'">{{ b.x }}</p>
            <ul v-else-if="b.t === 'ul'">
              <li v-for="(li, j) in b.xs" :key="j">{{ li }}</li>
            </ul>
          </template>
        </div>
      </article>

      <div v-else class="post-missing">
        <AppIcon name="alert-circle" :size="46" />
        <p>{{ i18n.t.post_not_found }}</p>
        <router-link to="/blog" class="post-back post-back-center">{{ i18n.t.back_to_blog }}</router-link>
      </div>

      <!-- RELATED POSTS -->
      <section v-if="related.length" class="post-related">
        <h2>{{ i18n.t.related_posts }}</h2>
        <div class="post-related-grid">
          <router-link
            v-for="r in related"
            :key="r.slug"
            :to="'/blog/' + r.slug"
            class="post-related-card"
          >
            <img :src="r.image" :alt="r.title" loading="lazy" />
            <div class="post-related-body">
              <h3>{{ r.title }}</h3>
              <span class="post-related-read">{{ r.read_min }} {{ i18n.t.min_read }}</span>
            </div>
          </router-link>
        </div>
      </section>

      <!-- CTA -->
      <section class="post-cta">
        <h2>{{ i18n.t.blog_cta_title }}</h2>
        <p>{{ i18n.t.blog_cta_desc }}</p>
        <div class="post-cta-actions">
          <router-link to="/demo" class="post-btn post-btn-demo">{{ i18n.t.try_demo }}</router-link>
          <router-link to="/register" class="post-btn post-btn-reg">{{ i18n.t.get_started_free }}</router-link>
        </div>
      </section>
    </main>

    <!-- FOOTER -->
    <footer class="post-footer">
      <div class="post-footer-inner">
        <strong>{{ i18n.t.app_name }}</strong>
        <p>{{ i18n.t.blog_footer_note }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18nStore } from "@/stores/i18n";
import { demoBlogPosts } from "@/data/demo";
import SiteNav from "@/components/SiteNav.vue";
import AppIcon from "@/components/AppIcon.vue";

const i18n = useI18nStore();
const route = useRoute();

function localize(p) {
  const km = i18n.locale === "km";
  return {
    ...p,
    title: km ? p.title_km : p.title_en,
    tag: km ? p.tag_km : p.tag_en,
    content: km ? p.content_km : p.content_en,
  };
}

const post = computed(() => {
  const found = demoBlogPosts.find((p) => p.slug === route.params.slug);
  return found ? localize(found) : null;
});

const related = computed(() =>
  demoBlogPosts
    .filter((p) => p.slug !== route.params.slug)
    .slice(0, 2)
    .map(localize)
);

function dateStr(date) {
  return new Date(date).toLocaleDateString(i18n.locale === "km" ? "km-KH" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

watch(
  () => route.params.slug,
  () => window.scrollTo(0, 0),
  { immediate: true }
);
</script>

<style scoped>
.post-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbf9 0%, #effaf2 100%);
  color: #1a2e1e;
  font-family: "Kantumruy Pro", "Hanuman", "Noto Sans Khmer", system-ui, sans-serif;
}
.post-main {
  max-width: 780px;
  margin: 0 auto;
  padding: 28px 20px 60px;
}
.post-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #166534;
  text-decoration: none;
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 22px;
  padding: 8px 14px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}
.post-back:hover {
  border-color: #22c55e;
  background: #f0fdf4;
}
.post-article {
  background: #fff;
  border-radius: 20px;
  padding: 30px 32px 34px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
}
.post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
}
.post-tag {
  font-size: 11px;
  font-weight: 800;
  color: #15803d;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 4px 11px;
  border-radius: 20px;
}
.post-date,
.post-read {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #8a9a8e;
}
.post-article h1 {
  margin: 0 0 22px;
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 900;
  line-height: 1.25;
  color: #14532d;
}
.post-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 14px;
  margin-bottom: 26px;
}
.post-content {
  font-size: 15px;
  line-height: 1.85;
  color: #3a4a3e;
}
.post-content h2 {
  margin: 28px 0 10px;
  font-size: 20px;
  font-weight: 900;
  color: #14532d;
}
.post-content p {
  margin: 0 0 14px;
}
.post-content ul {
  margin: 0 0 16px;
  padding-left: 22px;
}
.post-content li {
  margin-bottom: 7px;
}
.post-missing {
  text-align: center;
  color: #9ca3af;
  padding: 70px 20px;
}
.post-missing p {
  margin: 14px 0 18px;
  font-size: 15px;
}
.post-back-center {
  margin: 0 auto;
}
.post-related {
  margin-top: 34px;
}
.post-related > h2 {
  margin: 0 0 16px;
  font-size: 19px;
  font-weight: 900;
  color: #14532d;
}
.post-related-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.post-related-card {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  padding: 10px;
}
.post-related-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(20, 83, 45, 0.12);
}
.post-related-card img {
  width: 86px;
  height: 86px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}
.post-related-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
  min-width: 0;
}
.post-related-body h3 {
  margin: 0;
  font-size: 13.5px;
  font-weight: 800;
  color: #14532d;
  line-height: 1.45;
}
.post-related-read {
  font-size: 11.5px;
  color: #8a9a8e;
}
.post-cta {
  margin-top: 34px;
  border-radius: 20px;
  padding: 36px 28px;
  text-align: center;
  background:
    radial-gradient(ellipse at 80% 0%, rgba(255, 255, 255, 0.12), transparent 55%),
    linear-gradient(135deg, #14532d, #15803d);
  color: #fff;
}
.post-cta h2 {
  margin: 0 0 10px;
  font-size: clamp(19px, 3vw, 26px);
  font-weight: 900;
}
.post-cta p {
  margin: 0 auto 20px;
  max-width: 480px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13.5px;
  line-height: 1.7;
}
.post-cta-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.post-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 800;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.post-btn:hover {
  transform: translateY(-2px);
}
.post-btn-demo {
  background: #fff;
  color: #166534;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}
.post-btn-reg {
  background: linear-gradient(135deg, #22c55e, #4ade80);
  color: #14532d;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
}
.post-footer {
  background: linear-gradient(135deg, #166534, #15803d);
  padding: 34px 24px;
  text-align: center;
  color: #fff;
}
.post-footer-inner strong {
  font-size: 15px;
  font-weight: 800;
}
.post-footer-inner p {
  margin: 6px 0 0;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.7);
}
@media (max-width: 640px) {
  .post-article {
    padding: 22px 18px 26px;
  }
  .post-related-grid {
    grid-template-columns: 1fr;
  }
}</style>