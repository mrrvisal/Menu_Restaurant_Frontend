<template>
  <div class="blog-page">
    <SiteNav />

    <!-- HERO -->
    <header class="blog-hero">
      <div class="blog-hero-inner">
        <span class="blog-hero-badge"><AppIcon name="book-open" :size="14" /> {{ i18n.t.blog }}</span>
        <h1>{{ i18n.t.blog_hero_title }}</h1>
        <p>{{ i18n.t.blog_hero_subtitle }}</p>
      </div>
    </header>

    <main class="blog-main">
      <!-- FEATURED POST -->
      <router-link :to="'/blog/' + featured.slug" class="blog-featured">
        <div class="blog-featured-img">
          <img :src="featured.image" :alt="featured.title" />
        </div>
        <div class="blog-featured-body">
          <div class="blog-meta">
            <span class="blog-tag">{{ featured.tag }}</span>
            <span class="blog-date"><AppIcon name="calendar" :size="13" /> {{ dateStr(featured.date) }}</span>
            <span class="blog-read"><AppIcon name="clock" :size="13" /> {{ featured.read_min }} {{ i18n.t.min_read }}</span>
          </div>
          <h2>{{ featured.title }}</h2>
          <p>{{ featured.excerpt }}</p>
          <span class="blog-readmore">{{ i18n.t.read_more }} <span aria-hidden="true">→</span></span>
        </div>
      </router-link>

      <!-- POSTS GRID -->
      <div class="blog-grid-head">
        <h3>{{ i18n.t.latest_posts }}</h3>
        <span class="blog-count">{{ posts.length }} {{ i18n.t.blog_articles }}</span>
      </div>
      <div class="blog-grid">
        <router-link
          v-for="post in rest"
          :key="post.slug"
          :to="'/blog/' + post.slug"
          class="blog-card"
        >
          <div class="blog-card-img">
            <img :src="post.image" :alt="post.title" loading="lazy" />
          </div>
          <div class="blog-card-body">
            <div class="blog-meta">
              <span class="blog-tag">{{ post.tag }}</span>
              <span class="blog-read"><AppIcon name="clock" :size="13" /> {{ post.read_min }} {{ i18n.t.min_read }}</span>
            </div>
            <h3>{{ post.title }}</h3>
            <p>{{ post.excerpt }}</p>
            <span class="blog-readmore">{{ i18n.t.read_more }} <span aria-hidden="true">→</span></span>
          </div>
        </router-link>
      </div>

      <!-- CTA -->
      <section class="blog-cta">
        <h2>{{ i18n.t.blog_cta_title }}</h2>
        <p>{{ i18n.t.blog_cta_desc }}</p>
        <div class="blog-cta-actions">
          <router-link to="/demo" class="blog-btn blog-btn-demo">{{ i18n.t.try_demo }}</router-link>
          <router-link to="/register" class="blog-btn blog-btn-reg">{{ i18n.t.get_started_free }}</router-link>
        </div>
      </section>
    </main>

    <!-- FOOTER -->
    <footer class="blog-footer">
      <div class="blog-footer-inner">
        <strong>{{ i18n.t.app_name }}</strong>
        <p>{{ i18n.t.blog_footer_note }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18nStore } from "@/stores/i18n";
import { demoBlogPosts } from "@/data/demo";
import SiteNav from "@/components/SiteNav.vue";
import AppIcon from "@/components/AppIcon.vue";

const i18n = useI18nStore();

function localizePost(p) {
  const km = i18n.locale === "km";
  return {
    ...p,
    title: km ? p.title_km : p.title_en,
    excerpt: km ? p.excerpt_km : p.excerpt_en,
    tag: km ? p.tag_km : p.tag_en,
  };
}

const posts = computed(() => demoBlogPosts.map(localizePost));
const featured = computed(() => posts.value[0]);
const rest = computed(() => posts.value.slice(1));

function dateStr(date) {
  return new Date(date).toLocaleDateString(i18n.locale === "km" ? "km-KH" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<style scoped>
.blog-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbf9 0%, #effaf2 100%);
  color: #1a2e1e;
  font-family: "Kantumruy Pro", "Hanuman", "Noto Sans Khmer", system-ui, sans-serif;
}
.blog-hero {
  background:
    radial-gradient(ellipse at 20% 0%, rgba(34, 197, 94, 0.1), transparent 55%),
    linear-gradient(135deg, #14532d 0%, #15803d 60%, #22c55e 100%);
  color: #fff;
  padding: 54px 24px 44px;
  text-align: center;
}
.blog-hero-inner {
  max-width: 720px;
  margin: 0 auto;
}
.blog-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 13px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.blog-hero h1 {
  margin: 0 0 12px;
  font-size: clamp(26px, 4.4vw, 42px);
  font-weight: 900;
  line-height: 1.2;
}
.blog-hero p {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
  line-height: 1.7;
}
.blog-main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 34px 20px 70px;
}
.blog-featured {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 26px;
  align-items: center;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.07);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: transform 0.25s, box-shadow 0.25s;
}
.blog-featured:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(20, 83, 45, 0.14);
}
.blog-featured-img {
  min-height: 260px;
  background: #f0fdf4;
}
.blog-featured-img img {
  width: 100%;
  height: 100%;
  min-height: 260px;
  object-fit: cover;
}
.blog-featured-body {
  padding: 10px 26px 26px 6px;
}
.blog-featured-body h2 {
  margin: 12px 0 10px;
  font-size: clamp(20px, 2.6vw, 27px);
  font-weight: 900;
  color: #14532d;
  line-height: 1.3;
}
.blog-featured-body p {
  margin: 0 0 14px;
  font-size: 13.5px;
  line-height: 1.7;
  color: #5b6f60;
}
.blog-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.blog-tag {
  font-size: 11px;
  font-weight: 800;
  color: #15803d;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 3px 10px;
  border-radius: 20px;
}
.blog-date,
.blog-read {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #8a9a8e;
}
.blog-readmore {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 800;
  color: #166534;
}
.blog-grid-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 44px 0 16px;
  gap: 12px;
  flex-wrap: wrap;
}
.blog-grid-head h3 {
  margin: 0;
  font-size: 19px;
  font-weight: 900;
  color: #14532d;
}
.blog-count {
  font-size: 12px;
  font-weight: 700;
  color: #8a9a8e;
}
.blog-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}
.blog-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: transform 0.22s, box-shadow 0.22s;
  display: flex;
  flex-direction: column;
}
.blog-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(20, 83, 45, 0.13);
}
.blog-card-img {
  height: 180px;
  background: #f0fdf4;
}
.blog-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.blog-card-body {
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.blog-card-body h3 {
  margin: 0;
  font-size: 16.5px;
  font-weight: 900;
  color: #14532d;
  line-height: 1.4;
}
.blog-card-body p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: #5b6f60;
  flex: 1;
}
.blog-cta {
  margin-top: 44px;
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  background:
    radial-gradient(ellipse at 80% 0%, rgba(255, 255, 255, 0.12), transparent 55%),
    linear-gradient(135deg, #14532d, #15803d);
  color: #fff;
}
.blog-cta h2 {
  margin: 0 0 10px;
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 900;
}
.blog-cta p {
  margin: 0 auto 22px;
  max-width: 520px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  line-height: 1.7;
}
.blog-cta-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.blog-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 26px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 800;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.blog-btn:hover {
  transform: translateY(-2px);
}
.blog-btn-demo {
  background: #fff;
  color: #166534;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}
.blog-btn-reg {
  background: linear-gradient(135deg, #22c55e, #4ade80);
  color: #14532d;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
}
.blog-footer {
  background: linear-gradient(135deg, #166534, #15803d);
  padding: 34px 24px;
  text-align: center;
  color: #fff;
}
.blog-footer-inner strong {
  font-size: 15px;
  font-weight: 800;
}
.blog-footer-inner p {
  margin: 6px 0 0;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.7);
}
@media (max-width: 760px) {
  .blog-featured {
    grid-template-columns: 1fr;
  }
  .blog-featured-img,
  .blog-featured-img img {
    min-height: 200px;
  }
  .blog-featured-body {
    padding: 4px 22px 24px;
  }
  .blog-grid {
    grid-template-columns: 1fr;
  }
}</style>