<template>
  <div class="ms">
    <a href="#ms-preview" class="ms-skip" @click.prevent="stageEl?.focus()">
      {{ i18n.t.ms_skip || "Skip to preview" }}
    </a>

    <!-- ─── TOP BAR ─── -->
    <header class="ms-hdr">
      <div class="ms-hdr-l">
        <div class="ms-title-b">
          <h1 class="ms-title">
            <AppIcon name="sparkle" :size="17" class="ms-title-i" />
            <span class="ms-title-t">{{ i18n.t.ms_title || "Generate a menu image" }}</span>
          </h1>
          <p class="ms-sub">{{ i18n.t.ms_sub }}</p>
        </div>
      </div>

      <div class="ms-hdr-r">
        <!-- undo / redo -->
        <div class="ms-undo" role="group" :aria-label="i18n.t.ms_history || 'History'">
          <button class="ms-ic-btn" :disabled="!canUndo" :title="(i18n.t.ms_undo || 'Undo') + ' (Ctrl+Z)'"
            :aria-label="i18n.t.ms_undo || 'Undo'" @click="undo">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 14 4 9 9 4" />
              <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
            </svg>
          </button>
          <button class="ms-ic-btn" :disabled="!canRedo" :title="(i18n.t.ms_redo || 'Redo') + ' (Ctrl+Shift+Z)'"
            :aria-label="i18n.t.ms_redo || 'Redo'" @click="redo">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 14 20 9 15 4" />
              <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
            </svg>
          </button>
        </div>

        <!-- the live region must exist BEFORE its content changes, so it wraps the Transition -->
        <span class="ms-live" role="status" aria-live="polite">
          <Transition name="fade">
            <span v-if="savedRecently" class="ms-saved-pill">
              ✓ {{ i18n.t.ms_saved_auto || "Saved" }}
            </span>
          </Transition>
        </span>
        <button class="lang" @click="i18n.toggleLocale">
          {{ i18n.locale === "km" ? "EN" : "ខ្មែរ" }}
        </button>
        
        <span class="ms-hdr-sep" aria-hidden="true"></span>

        <!-- Desktop/Tablet: visible action buttons -->
        <div class="ms-hdr-actions" ref="actionsEl">
          <button class="ms-btn" :disabled="exporting" :title="i18n.t.ms_print" @click="printMenu">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span class="ms-btn-label">{{ i18n.t.ms_print }}</span>
          </button>
          <button class="ms-btn" :disabled="exporting" :title="i18n.t.ms_pdf" @click="exportPdf">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span class="ms-btn-label">{{ i18n.t.ms_pdf }}</span>
          </button>
          <button class="ms-btn ms-btn-primary" :disabled="exporting" :title="i18n.t.ms_png" @click="exportPng">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span class="ms-btn-label">{{ exporting ? i18n.t.loading : i18n.t.ms_png }}</span>
          </button>
        </div>

        <!-- Mobile: hamburger menu for actions -->
        <div class="ms-hdr-menu" ref="menuEl" :class="{ open: menuOpen }">
          <button type="button" class="ms-ic-btn ms-hdr-menu-btn" :aria-expanded="menuOpen"
            aria-haspopup="menu" aria-controls="ms-hdr-dropdown"
            :aria-label="i18n.t.ms_menu || 'Menu'" @click="toggleMenu" @keydown="onMenuKeyDown">
            <svg v-if="!menuOpen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <Transition name="slide-down">
            <div v-if="menuOpen" id="ms-hdr-dropdown" class="ms-hdr-dropdown" role="menu"
              ref="dropdownEl" @keydown="onDropdownKeyDown">
              <button class="ms-hdr-dd-item" role="menuitem" tabindex="-1" @click="printMenu(); closeMenu()" :disabled="exporting">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                {{ i18n.t.ms_print }}
              </button>
              <button class="ms-hdr-dd-item" role="menuitem" tabindex="-1" @click="exportPdf(); closeMenu()" :disabled="exporting">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {{ i18n.t.ms_pdf }}
              </button>
              <button class="ms-hdr-dd-item ms-hdr-dd-primary" role="menuitem" tabindex="-1" @click="exportPng(); closeMenu()" :disabled="exporting">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {{ exporting ? i18n.t.loading : i18n.t.ms_png }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <!-- no restaurant / no dishes yet -->
    <div v-if="!auth.restaurantId" class="ms-empty">
      <AppIcon name="alert-circle" :size="34" />
      <p>{{ i18n.t.ms_need_restaurant }}</p>
      <button class="ms-btn ms-btn-primary" @click="goBack">
        {{ i18n.t.back }}
      </button>
    </div>
    <div v-else-if="dataLoading && !menuData.categories.length" class="ms-empty">
      <div class="spinner"></div>
      <p>{{ i18n.t.ms_loading }}</p>
    </div>
    <div v-else-if="!menuData.categories.length" class="ms-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".3" aria-hidden="true">
        <path d="M3 11h18M3 11v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8M3 11V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
      </svg>
      <p>{{ i18n.t.ms_need_menu }}</p>
      <button class="ms-btn ms-btn-primary" @click="goBack">
        {{ i18n.t.add_food }}
      </button>
    </div>

    <!-- ─── WORKSPACE ─── -->
    <div v-else class="ms-body">
      <!-- LEFT: controls (fixed bottom sheet on mobile, inline on desktop) -->
      <aside ref="sideEl" class="ms-side" :class="{ open: sideOpen }" id="ms-side"
        :inert="isMobileView && !sideOpen"
        :aria-hidden="isMobileView && !sideOpen ? 'true' : undefined"
        :aria-label="i18n.t.ms_controls || 'Design controls'">
        <div class="ms-tabs" role="tablist" :aria-label="i18n.t.ms_controls || 'Design controls'"
          @keydown="onTabKeydown">
          <button v-for="t in TABS" :id="`ms-tab-${t.id}`" :key="t.id" class="ms-tab" type="button"
            role="tab" :aria-selected="activeTab === t.id" :aria-controls="`ms-panel-${t.id}`"
            :tabindex="activeTab === t.id ? 0 : -1" @click="activeTab = t.id">
            <AppIcon :name="t.icon" :size="16" />
            <span>{{ i18n.t[t.labelKey] || t.fallback }}</span>
          </button>
        </div>
        <!-- Templates -->
        <div id="ms-panel-templates" v-show="activeTab === 'templates'" class="ms-tab-panel"
          role="tabpanel" aria-labelledby="ms-tab-templates" tabindex="0">
        <section class="ms-card">
          <div class="ms-card-h">
            <span><AppIcon name="image" :size="14" />{{ i18n.t.ms_templates }}</span>
            <button class="ms-mini" @click="openGallery()">
              <AppIcon name="image" :size="12" />{{ i18n.t.ms_gallery_browse || "Browse all" }}
            </button>
          </div>
          <div class="ms-tpls">
            <button v-for="(tpl, ti) in MENU_TEMPLATES" :key="tpl.id" class="ms-tpl"
              :class="{ active: design.template === tpl.id }" :aria-pressed="design.template === tpl.id"
              @click="applyTemplate(tpl.id)">
              <span class="ms-tpl-thumb-wrap">
                <canvas :ref="(el) => setThumbEl(el, ti)" class="ms-tpl-thumb" width="96" height="132"
                  aria-hidden="true"></canvas>
                <span class="ms-tpl-check" aria-hidden="true">✓</span>
              </span>
              <span class="ms-tpl-n">{{ i18n.t[tpl.nameKey] || tpl.id }}</span>
            </button>
          </div>
          <p class="ms-tpl-desc">{{ i18n.t[templateDescKey] || "" }}</p>
        </section>
        </div>

        <!-- Size -->
        <div id="ms-panel-layout" v-show="activeTab === 'layout'" class="ms-tab-panel"
          role="tabpanel" aria-labelledby="ms-tab-layout" tabindex="0">
        <section class="ms-card">
          <div class="ms-card-h">
            <span><AppIcon name="expand" :size="14" />{{ i18n.t.ms_size }}</span>
            <div class="ms-seg" role="radiogroup" :aria-label="i18n.t.ms_orientation || 'Orientation'">
              <button role="radio" :class="{ active: design.orientation === 'portrait' }"
                :aria-checked="design.orientation === 'portrait'" @click="patchDesign({ orientation: 'portrait' })">
                {{ i18n.t.ms_portrait }}
              </button>
              <button role="radio" :class="{ active: design.orientation === 'landscape' }"
                :aria-checked="design.orientation === 'landscape'" @click="patchDesign({ orientation: 'landscape' })">
                {{ i18n.t.ms_landscape }}
              </button>
            </div>
          </div>
          <div class="ms-sizes">
            <button v-for="s in SHEET_SIZES" :key="s.key" class="ms-size"
              :class="{ active: design.sizeKey === s.key }" :aria-pressed="design.sizeKey === s.key"
              :title="i18n.t[s.hintKey] || ''" @click="setSize(s.key)">
              <span class="ms-size-shape" :style="shapeStyle(s)" aria-hidden="true"></span>
              <span class="ms-size-l">{{ i18n.t[s.labelKey] || s.key }}</span>
            </button>
          </div>

          <!-- custom size -->
          <div v-if="design.sizeKey === 'custom'" class="ms-custom">
            <label class="ms-fld">
              <span>{{ i18n.t.ms_size_width || "Width" }}</span>
              <input v-model.number="design.custom.w" type="number" min="1" step="any" class="ms-input"
                :aria-label="i18n.t.ms_size_width || 'Width'"
                @change="patchDesign({ custom: design.custom })" />
            </label>
            <span class="ms-custom-x" aria-hidden="true">×</span>
            <label class="ms-fld">
              <span>{{ i18n.t.ms_size_height || "Height" }}</span>
              <input v-model.number="design.custom.h" type="number" min="1" step="any" class="ms-input"
                :aria-label="i18n.t.ms_size_height || 'Height'"
                @change="patchDesign({ custom: design.custom })" />
            </label>
            <label class="ms-fld ms-fld-unit">
              <span>{{ i18n.t.ms_size_unit || "Unit" }}</span>
              <AppSelect v-model="design.custom.unit" size="sm" :options="unitOptions"
                :label="i18n.t.ms_size_unit || 'Unit'" @change="patchDesign({ custom: design.custom })" />
            </label>
          </div>

          <div class="ms-row">
            <label class="ms-fld">
              <span>{{ i18n.t.ms_quality }}</span>
              <AppSelect v-model="design.quality" size="md" :options="qualityOptions"
                :label="i18n.t.ms_quality" @change="patchDesign({ quality: $event })" />
            </label>
            <div class="ms-fld">
              <span>{{ i18n.t.ms_preview }}</span>
              <div class="ms-px">{{ exportSize.w }} × {{ exportSize.h }} px</div>
            </div>
          </div>
        </section>

        <section class="ms-card ms-layout-card">
          <div class="ms-card-h">
            <span><AppIcon name="expand" :size="14" />{{ i18n.t.ms_tab_layout || "Layout" }}</span>
          </div>
          <div class="ms-layout-settings">
            <label class="ms-fld">
              <span>{{ i18n.t.ms_font }}</span>
              <AppSelect v-model="design.font" size="md" :options="fontOptions"
                :label="i18n.t.ms_font" @change="patchDesign({ font: $event })" />
            </label>
            <label class="ms-fld">
              <span>{{ i18n.t.ms_columns }} ({{ design.columns }})</span>
              <input v-model.number="design.columns" type="range" min="1" max="5" step="1" class="ms-range"
                :aria-label="i18n.t.ms_columns" @change="patchDesign({ columns: design.columns })" />
            </label>
          </div>
          <div class="ms-sliders">
            <div v-for="s in SLIDERS" :key="s.key" class="ms-slider">
              <div class="ms-slider-h">
                <label :for="`ms-slider-${s.key}`">{{ i18n.t[s.labelKey] }}</label>
                <output :for="`ms-slider-${s.key}`">{{ Math.round(design[s.key] * 100) }}%</output>
                <button v-if="isChanged(s.key)" type="button" class="ms-slider-reset"
                  :aria-label="`${i18n.t[s.labelKey]}: ${i18n.t.ms_reset_colors || 'Reset'}`"
                  :title="i18n.t.ms_reset_colors || 'Reset'" @click="resetSlider(s.key)">
                  <AppIcon name="refresh" :size="13" />
                </button>
              </div>
              <input :id="`ms-slider-${s.key}`" v-model.number="design[s.key]" type="range"
                :min="s.min" :max="s.max" step="0.05" class="ms-range"
                :aria-label="i18n.t[s.labelKey]"
                @change="patchDesign({ [s.key]: design[s.key] })" />
            </div>
          </div>
        </section>
        </div>

        <!-- Look -->
        <div id="ms-panel-style" v-show="activeTab === 'style'" class="ms-tab-panel"
          role="tabpanel" aria-labelledby="ms-tab-style" tabindex="0">
        <section class="ms-card">
          <div class="ms-card-h">
            <span><AppIcon name="sun" :size="14" />{{ i18n.t.ms_look }}</span>
            <button class="ms-mini" @click="resetDesign">
              <AppIcon name="refresh" :size="12" />{{ i18n.t.ms_reset_colors }}
            </button>
          </div>

          <!-- one-click style presets -->
          <div class="ms-presets" role="group" :aria-label="i18n.t.ms_presets || 'Style presets'">
            <button v-for="p in STYLE_PRESETS" :key="p.id" class="ms-preset"
              :class="{ active: currentPreset === p.id }" :aria-pressed="currentPreset === p.id"
              @click="applyPreset(p)">
              <i class="ms-preset-swatch"
                :style="{ background: `linear-gradient(135deg, ${p.swatch[0]} 50%, ${p.swatch[1]} 50%)` }"></i>
              <span>{{ i18n.t[p.nameKey] || p.id }}</span>
            </button>
          </div>

          <!-- colours -->
          <div class="ms-colors">
            <div v-for="c in COLOR_FIELDS" :key="c.key" class="ms-color">
              <input type="color" :value="design.colors[c.key]" class="ms-color-i"
                :aria-label="i18n.t[c.labelKey] || c.key" @input="setColor(c.key, $event.target.value)" />
              <span>{{ i18n.t[c.labelKey] || c.key }}</span>
            </div>
          </div>

          <!-- quick accent swatches -->
          <div class="ms-swatches" role="group" :aria-label="i18n.t.ms_quick_accent || 'Quick accent colours'">
            <span class="ms-swatches-l">{{ i18n.t.ms_quick_accent || "Quick accent" }}</span>
            <button v-for="sw in ACCENT_SWATCHES" :key="sw" class="ms-swatch"
              :class="{ active: sameColor(design.colors.accent, sw) }" :style="{ background: sw }"
              :aria-label="`${i18n.t.ms_accent_color || 'Accent colour'} ${sw}`"
              :aria-pressed="sameColor(design.colors.accent, sw)" :title="sw" @click="setColor('accent', sw)"></button>
          </div>

          <button class="ms-mini ms-mini-block" :disabled="!auth.restaurant?.themeColor" @click="useBrandColor">
            <AppIcon name="category" :size="12" />
            {{ i18n.t.ms_use_brand }}
            <i v-if="auth.restaurant?.themeColor" class="ms-brand-dot" :style="{ background: auth.restaurant.themeColor }"></i>
          </button>

          <!-- toggles (config-driven) -->
          <div class="ms-toggles" role="group" :aria-label="i18n.t.ms_options || 'Menu options'">
            <template v-for="t in TOGGLES" :key="t.key">
              <div class="ms-toggle">
                <span>{{ i18n.t[t.labelKey] }}</span>
                <button class="ms-sw" :class="{ on: design[t.key] }" role="switch" :aria-checked="!!design[t.key]"
                  :aria-label="i18n.t[t.labelKey]" @click="patchDesign({ [t.key]: !design[t.key] })"><i></i></button>
              </div>
              <div v-if="t.key === 'showLogo' && design.showLogo" class="ms-toggle ms-toggle-sub">
                <span>{{ i18n.t.ms_logo_shape }}</span>
                <div class="ms-seg" role="radiogroup" :aria-label="i18n.t.ms_logo_shape">
                  <button role="radio" :class="{ active: design.logoShape === 'circle' }"
                    :aria-checked="design.logoShape === 'circle'" @click="patchDesign({ logoShape: 'circle' })">{{
                      i18n.t.ms_logo_circle }}</button>
                  <button role="radio" :class="{ active: design.logoShape === 'square' }"
                    :aria-checked="design.logoShape === 'square'" @click="patchDesign({ logoShape: 'square' })">{{
                      i18n.t.ms_logo_square }}</button>
                </div>
              </div>
            </template>
          </div>
        </section>

        </div>
        <!-- Content / texts -->
        <div id="ms-panel-content" v-show="activeTab === 'content'" class="ms-tab-panel"
          role="tabpanel" aria-labelledby="ms-tab-content" tabindex="0">
        <section class="ms-card">
          <div class="ms-card-h">
            <span><AppIcon name="edit" :size="14" />{{ i18n.t.ms_texts }}</span>
          </div>

          <label class="ms-fld">
            <span>{{ i18n.t.ms_title_field }}</span>
            <input :value="design.title" class="ms-input" :placeholder="i18n.t.ms_title_ph"
              @input="patchDesign({ title: $event.target.value })" />
          </label>
          <label class="ms-fld">
            <span>{{ i18n.t.ms_subtitle }}</span>
            <input :value="design.subtitle" class="ms-input" :placeholder="i18n.t.ms_subtitle_ph"
              @input="patchDesign({ subtitle: $event.target.value })" />
          </label>
          <label class="ms-fld">
            <span>{{ i18n.t.ms_contact }}</span>
            <input :value="design.contact" class="ms-input" :placeholder="i18n.t.ms_contact_ph"
              @input="patchDesign({ contact: $event.target.value })" />
          </label>
          <label class="ms-fld">
            <span>{{ i18n.t.ms_footer_note }}</span>
            <input :value="design.footerNote" class="ms-input" :placeholder="i18n.t.ms_footer_ph"
              @input="patchDesign({ footerNote: $event.target.value })" />
          </label>

          <div class="ms-grid2">
            <label class="ms-fld">
              <span>{{ i18n.t.ms_currency }}</span>
              <AppSelect v-model="design.currency" size="sm" :options="currencyOptions"
                :label="i18n.t.ms_currency" @change="patchDesign({ currency: $event })" />
            </label>
          </div>

          <!-- categories -->
          <div class="ms-fld ms-fld-top">
            <span>{{ i18n.t.ms_categories }}</span>
            <div class="ms-cats" role="group" :aria-label="i18n.t.ms_categories">
              <button class="ms-chip" :class="{ active: !design.categoryIds.length }"
                :aria-pressed="!design.categoryIds.length" @click="patchDesign({ categoryIds: [] })">
                {{ i18n.t.ms_cats_all }}
              </button>
              <button v-for="cat in foods.categories" :key="cat.id" class="ms-chip"
                :class="{ active: design.categoryIds.includes(String(cat.id)) }"
                :aria-pressed="design.categoryIds.includes(String(cat.id))" @click="toggleCategory(cat.id)">
                {{ cat.label_km }}
              </button>
            </div>
          </div>
        </section>

        </div>
        <!-- Saved designs -->
        <div id="ms-panel-saved" v-show="activeTab === 'saved'" class="ms-tab-panel"
          role="tabpanel" aria-labelledby="ms-tab-saved" tabindex="0">
        <section class="ms-card">
          <div class="ms-card-h">
            <span><AppIcon name="book" :size="14" />{{ i18n.t.ms_saved }}</span>
            <span v-if="designs.length" class="ms-count">{{ designs.length }}</span>
          </div>

          <div class="ms-save-row">
            <input v-model="designName" class="ms-input" :placeholder="i18n.t.ms_design_name_ph"
              :aria-label="i18n.t.ms_design_name_ph || 'Design name'" @keyup.enter="saveDesign" />
            <button class="ms-btn ms-btn-primary" :disabled="savingDesign || !designName.trim()"
              :title="'Ctrl+S'" @click="saveDesign">
              {{ savingDesign ? i18n.t.loading : activeDesignId ? i18n.t.save : i18n.t.ms_save_as }}
            </button>
          </div>
          <button v-if="activeDesignId" class="ms-mini ms-mini-block" :disabled="savingDesign || !designName.trim()"
            @click="saveAsCopy">
            <AppIcon name="copy" :size="12" />{{ i18n.t.ms_save_copy || "Save as a copy" }}
          </button>
          <div v-if="saveMsg" class="ms-msg ms-msg-ok" role="status">{{ saveMsg }}</div>
          <div v-if="saveError" class="ms-msg ms-msg-err" role="alert">
            {{ saveError }}

            <em v-if="designsError">{{ i18n.t.ms_only_draft }}</em>
          </div>

          <div v-if="designsLoading" class="ms-mini-loading"><div class="spinner"></div></div>
          <div v-else-if="!designs.length" class="ms-saved-empty">{{ i18n.t.ms_saved_empty }}</div>
          <div v-else class="ms-saved">
            <div v-for="row in designs" :key="row.id" class="ms-saved-i"
              :class="{ active: activeDesignId === row.id }">
              <button class="ms-saved-b" @click="openSaved(row)">
                <strong>{{ row.name }}</strong>
                <span>{{ templateLabel(row.template) }} · {{ row.size_key }}</span>
              </button>
              <button class="ms-ic ms-ic-red" :aria-label="`${i18n.t.delete} ${row.name}`" @click="confirmDelete(row)">
                <AppIcon name="trash" :size="13" />
              </button>
            </div>
          </div>
        </section>
        </div>
      </aside>

      <!-- RIGHT: live preview -->
      <section class="ms-stage">
        <div class="ms-stage-h">
          <div class="ms-fit" :class="fitClass" role="status">
            <AppIcon :name="fitIcon" :size="13" />
            {{ fitText }}
          </div>
          <div class="ms-stage-r">
            <span class="ms-dims">{{ sheetDims }}</span>
            <div v-if="menuPages.length > 1" class="ms-page-control" role="group"
              :aria-label="i18n.t.ms_pages || 'Menu pages'">
              <button class="ms-page-btn" :disabled="currentPage === 0"
                :aria-label="i18n.t.ms_previous_page || 'Previous page'"
                @click="previousPage">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <span class="ms-page-count">
                {{ i18n.t.ms_page || "Page" }} {{ currentPage + 1 }} / {{ menuPages.length }}
              </span>
              <button class="ms-page-btn" :disabled="currentPage >= menuPages.length - 1"
                :aria-label="i18n.t.ms_next_page || 'Next page'" @click="nextPage">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
            <button class="ms-mini" :disabled="exporting" @click="copyPng">
              <AppIcon name="copy" :size="12" />{{ i18n.t.ms_copy }}
            </button>
            <button class="ms-mini" :aria-label="i18n.t.ms_shortcuts || 'Keyboard shortcuts'"
              :title="(i18n.t.ms_shortcuts || 'Keyboard shortcuts') + ' (?)'" @click="openHelp">
              ?
            </button>
            <div class="ms-seg ms-zoom" role="radiogroup" :aria-label="i18n.t.ms_zoom || 'Zoom'">
              <button role="radio" :class="{ active: zoom === 'fit' }" :aria-checked="zoom === 'fit'" @click="zoom = 'fit'">
                {{ i18n.t.ms_zoom_fit || "Fit" }}
              </button>
              <button v-for="z in ZOOMS" :key="z" role="radio" :class="{ active: zoom === z }"
                :aria-checked="zoom === z" @click="zoom = z">{{ z }}%</button>
            </div>
          </div>
        </div>

        <div class="ms-stage-scroll" id="ms-preview" tabindex="-1" ref="stageEl">
          <div class="ms-sheet" :style="{ width: zoomPct + '%' }">
            <div class="ms-sheet-wrap">
              <canvas ref="previewEl" class="ms-canvas" role="img" :aria-label="previewLabel"></canvas>
              <!-- click-to-edit overlays (Canva-style): invisible until hovered/focused -->
              <input
                v-for="h in scaledHotspots"
                :key="h.key"
                class="ms-hotspot"
                :class="{ active: activeField === h.key }"
                :style="{
                  left: h.x + 'px',
                  top: h.y + 'px',
                  width: h.w + 'px',
                  height: h.h + 'px',
                  fontSize: h.fs + 'px',
                  lineHeight: h.h + 'px',
                  textAlign: h.align,
                  color: 'transparent',
                  font: h.font,
                }"
                :value="design[h.key]"
                :aria-label="hotspotLabel(h.key)"
                @focus="activeField = h.key"
                @blur="activeField = null"
                @keydown.enter.prevent="$event.target.blur()"
                @input="patchDesign({ [h.key]: $event.target.value })"
              />
            </div>
          </div>
        </div>

        <div class="ms-stage-f">
          <div v-if="exportMsg" class="ms-msg ms-msg-ok" role="status">{{ exportMsg }}</div>
          <div v-if="exportError" class="ms-msg ms-msg-err" role="alert">{{ exportError }}</div>
          <span class="ms-hint">{{ i18n.t.ms_print_hint }}</span>
          <span v-if="menuPages.length > 1" class="ms-hint">
            {{ i18n.t.ms_page_export_hint || "PDF and Print include all pages; PNG exports the current page." }}
          </span>
          <span class="ms-hint ms-kbd">Ctrl+Z · Ctrl+S · ?</span>
        </div>
      </section>
    </div>

    <!-- Mobile controls bottom sheet -->
    <div v-if="sideOpen && auth.restaurantId && menuData.categories.length" class="ms-side-backdrop"
      @click="closeSidePanel()"></div>
    <button v-if="auth.restaurantId && menuData.categories.length && !sideOpen" ref="sideToggleEl" class="ms-fab"
      aria-controls="ms-side"
      :aria-label="i18n.t.ms_templates || 'Menu editor'"
      @click="toggleSidePanel">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    </button>

    <Teleport to="body">
      <!-- delete design (confirm) -->
      <Transition name="fade">
        <div v-if="deleting" class="ms-overlay" @click.self="deleting = null">
          <div class="ms-dlg" ref="dlgEl" tabindex="-1" role="alertdialog" aria-modal="true"
            aria-labelledby="ms-dlg-title" aria-describedby="ms-dlg-desc">
            <div class="ms-dlg-i"><AppIcon name="trash" :size="26" /></div>
            <div id="ms-dlg-title" class="ms-dlg-t">{{ i18n.t.ms_delete_confirm }}</div>
            <div id="ms-dlg-desc" class="ms-dlg-d">{{ deleting.name }}</div>
            <div class="ms-dlg-acts">
              <button class="ms-btn" @click="deleting = null">{{ i18n.t.cancel }}</button>
              <button class="ms-btn ms-btn-danger" @click="doDelete">
                {{ i18n.t.delete }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- keyboard shortcut help -->
      <Transition name="fade">
        <div v-if="showHelp" class="ms-overlay" @click.self="closeHelp">
          <div class="ms-dlg ms-help" ref="helpEl" tabindex="-1" role="dialog" aria-modal="true"
            aria-labelledby="ms-help-title">
            <div id="ms-help-title" class="ms-help-t">{{ i18n.t.ms_shortcuts || "Keyboard shortcuts" }}</div>
            <dl class="ms-help-list">
              <template v-for="s in SHORTCUTS" :key="s.keys">
                <dt><kbd>{{ s.keys }}</kbd></dt>
                <dd>{{ i18n.t[s.labelKey] || s.fallback }}</dd>
              </template>
            </dl>
            <div class="ms-dlg-acts">
              <button class="ms-btn ms-btn-primary" @click="closeHelp">{{ i18n.t.cancel || "Close" }}</button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- starter gallery (choose a template) -->
      <Transition name="fade">
        <div v-if="showGallery" class="ms-gal-overlay" role="dialog" aria-modal="true"
          aria-labelledby="ms-gal-title" @click.self="closeGallery">
          <div class="ms-gal" ref="galleryCardEl" tabindex="-1">
            <div class="ms-gal-h">
              <div>
                <h2 id="ms-gal-title" class="ms-gal-t"><AppIcon name="sparkle" :size="17" class="ms-title-i" /> {{ i18n.t.ms_gallery_title || "Choose a starter" }}</h2>
                <p class="ms-gal-sub">{{ i18n.t.ms_gallery_sub || "Pick a look you like — you can fine-tune every detail later" }}</p>
              </div>
              <button class="ms-gal-x" :aria-label="i18n.t.cancel || 'Close'" @click="closeGallery">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="ms-gal-grid">
              <button v-for="tpl in MENU_TEMPLATES" :key="tpl.id" class="ms-gal-card"
                :class="{ active: design.template === tpl.id }" :aria-pressed="design.template === tpl.id"
                @click="pickFromGallery(tpl.id)">
                <span class="ms-gal-thumb-wrap">
                  <canvas :ref="(el) => setGalleryThumb(el, tpl.id)" class="ms-gal-thumb"
                    width="240" height="340" aria-hidden="true"></canvas>
                  <span v-if="design.template === tpl.id" class="ms-gal-check" aria-hidden="true">✓</span>
                </span>
                <span v-if="tpl.tag" class="ms-gal-tag" :class="`ms-gal-tag-${tpl.tag}`">
                  {{ i18n.t[`ms_tpl_tag_${tpl.tag}`] || tpl.tag }}
                </span>
                <span class="ms-gal-n">{{ i18n.t[tpl.nameKey] || tpl.id }}</span>
                <span class="ms-gal-d">{{ i18n.t[tpl.descKey] || "" }}</span>
              </button>
            </div>
            <button class="ms-gal-skip" @click="skipGallery()">
              {{ i18n.t.ms_gallery_skip || "Skip — I'll build from scratch" }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
import AppSelect from "@/components/AppSelect.vue";
import { useAuthStore } from "@/stores/auth";
import { useFoodsStore } from "@/stores/foods";
import { useI18nStore } from "@/stores/i18n";
import { useMenuStudio } from "@/composables/useMenuStudio";
import { useFocusTrap } from "@/composables/useFocusTrap";
import {
  MENU_TEMPLATES,
  SHEET_SIZES,
  EXPORT_QUALITIES,
  FONT_OPTIONS,
  COLOR_FIELDS,
  templateById,
  createDesign,
  resolveSheet,
} from "@/utils/menuStudio.mjs";
import { renderMenuToCanvas } from "@/utils/menuRender.mjs";

const router = useRouter();
const auth = useAuthStore();
const foods = useFoodsStore();
const i18n = useI18nStore();

const {
  design,
  menuData,
  sheet,
  exportSize,
  fitState,
  menuPages,
  currentPage,
  dataLoading,
  assetTick,
  designs,
  designsLoading,
  designsError,
  designName,
  activeDesignId,
  savingDesign,
  saveMsg,
  saveError,
  exporting,
  exportMsg,
  exportError,
  applyTemplate,
  patchDesign,
  resetDesign,
  setSize,
  renderToCanvas,
  initStudio,
  saveDesign,
  openSaved,
  deleteSaved,
  exportPng,
  exportPdf,
  printMenu,
  copyPng,
} = useMenuStudio();

const previewEl = ref(null);
const stageEl = ref(null);
const thumbEls = [];
// Click-to-edit hotspots (Canva-style) for title / subtitle / contact
const textHotspots = ref([]);
const activeField = ref(null);
const zoom = ref("fit"); // 'fit' | 50 | 75 | 100 | 125 | 150
const ZOOMS = [50, 75, 100, 125, 150];
const deleting = ref(null);
let renderTimer = null;
let unmounted = false;
// ─── AUTOSAVE (debounced; saved designs only, never new ones) ──
let autosaveTimer = null;
let pendingAutosave = false;
let previousBodyOverflow = null;
const savedRecently = ref(false);
// Mobile bottom sheet: the sidebar slides up from the bottom (< 700px)
const sideOpen = ref(false);
const isMobileView = ref(false);
const sideEl = ref(null);
const sideToggleEl = ref(null);
const activeTab = ref("templates");
// Mobile header menu for actions (hamburger dropdown, ≤700px)
const menuOpen = ref(false);
const menuEl = ref(null);
const dropdownEl = ref(null);
const actionsEl = ref(null);
let mobileMq = null;
// Closes the sheet if the viewport grows past the mobile breakpoint
// (e.g. phone rotation to landscape), so no backdrop / scroll lock lingers
function onMobileMqChange(e) {
  isMobileView.value = e.matches;
  if (!e.matches) {
    sideOpen.value = false;
    menuOpen.value = false;
  }
}

function toggleSidePanel() {
  if (sideOpen.value) {
    closeSidePanel();
    return;
  }
  sideOpen.value = true;
  nextTick(() => {
    sideEl.value
      ?.querySelector("button:not(:disabled), input:not(:disabled), select:not(:disabled)")
      ?.focus();
  });
}

function closeSidePanel(restoreFocus = true) {
  sideOpen.value = false;
  if (restoreFocus) nextTick(() => sideToggleEl.value?.focus());
}

function onTabKeydown(e) {
  const currentIndex = TABS.findIndex((tab) => tab.id === activeTab.value);
  let nextIndex = currentIndex;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    nextIndex = (currentIndex + 1) % TABS.length;
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
  } else if (e.key === "Home") {
    nextIndex = 0;
  } else if (e.key === "End") {
    nextIndex = TABS.length - 1;
  } else {
    return;
  }
  e.preventDefault();
  activeTab.value = TABS[nextIndex].id;
  nextTick(() => sideEl.value?.querySelector(`#ms-tab-${activeTab.value}`)?.focus());
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
  if (menuOpen.value) nextTick(focusFirstDropdownItem);
}

function closeMenu(restoreFocus = true) {
  if (!menuOpen.value) return;
  const hadFocusInside =
    dropdownEl.value && dropdownEl.value.contains(document.activeElement);
  menuOpen.value = false;
  // Keep pointer focus on the control the user clicked; restore only for
  // keyboard-initiated closes while focus was in the dropdown.
  if (restoreFocus && hadFocusInside) {
    menuEl.value?.querySelector(".ms-hdr-menu-btn")?.focus();
  }
}

function onDocumentPointerDown(e) {
  if (menuOpen.value && !menuEl.value?.contains(e.target)) {
    closeMenu(false);
  }
}

function focusFirstDropdownItem() {
  dropdownEl.value?.querySelector(".ms-hdr-dd-item")?.focus();
}

function focusLastDropdownItem() {
  const items = dropdownEl.value?.querySelectorAll(".ms-hdr-dd-item");
  items?.[items.length - 1]?.focus();
}

// Hamburger: Enter / Space / ArrowDown open (native button handles Enter +
// Space); ArrowDown also opens and jumps straight to the first item.
function onMenuKeyDown(e) {
  if (e.key === "ArrowDown" && !menuOpen.value) {
    e.preventDefault();
    toggleMenu();
  }
}

// Dropdown: roving focus with Arrow keys, Home / End, Tab closes, Esc handled
// globally by onKeydown (which restores focus via closeMenu).
function onDropdownKeyDown(e) {
  const items = [...(dropdownEl.value?.querySelectorAll(".ms-hdr-dd-item") || [])];
  const i = items.indexOf(document.activeElement);
  if (e.key === "ArrowDown") {
    e.preventDefault();
    items[(i + 1) % items.length]?.focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (i <= 0) focusLastDropdownItem();
    else items[i - 1]?.focus();
  } else if (e.key === "Home") {
    e.preventDefault();
    focusFirstDropdownItem();
  } else if (e.key === "End") {
    e.preventDefault();
    focusLastDropdownItem();
  } else if (e.key === "Tab") {
    // Close and keep focus on the hamburger; a leave Transition keeps the
    // items focusable for ~150ms, so a natural Tab would land on a fading
    // item. The user tabs again to continue past the button.
    e.preventDefault();
    closeMenu();
  }
}

// Config-driven switches (order = order on screen)
const TABS = [
  { id: "templates", icon: "image", labelKey: "ms_tab_templates", fallback: "Templates" },
  { id: "layout", icon: "expand", labelKey: "ms_tab_layout", fallback: "Layout" },
  { id: "style", icon: "sun", labelKey: "ms_tab_style", fallback: "Style" },
  { id: "content", icon: "edit", labelKey: "ms_tab_content", fallback: "Content" },
  { id: "saved", icon: "book", labelKey: "ms_tab_saved", fallback: "Saved" },
];

const SLIDERS = [
  { key: "titleScale", labelKey: "ms_restaurant_name_size", min: 0.3, max: 1.5 },
  { key: "categoryScale", labelKey: "ms_category_text_size", min: 0.3, max: 1.5 },
  { key: "itemScale", labelKey: "ms_item_text_size", min: 0.3, max: 1.5 },
  { key: "itemImageScale", labelKey: "ms_item_image_size", min: 0.3, max: 1.5 },
  { key: "logoScale", labelKey: "ms_logo_size", min: 0.3, max: 1.5 },
  { key: "qrScale", labelKey: "ms_qr_size", min: 0.3, max: 1.5 },
  { key: "margins", labelKey: "ms_margins", min: 0.5, max: 1.8 },
];

const defaults = computed(() => createDesign(design.value.template));
const isChanged = (key) =>
  Math.abs((design.value[key] ?? 1) - (defaults.value[key] ?? 1)) > 0.001;
function resetSlider(key) {
  patchDesign({ [key]: defaults.value[key] ?? 1 });
}

const TOGGLES = [
  { key: "showLogo", labelKey: "ms_show_logo" },
  { key: "showImages", labelKey: "ms_show_images" },
  { key: "showPrice", labelKey: "ms_show_price" },
  { key: "showQr", labelKey: "ms_show_qr" },
  { key: "hideUnavailable", labelKey: "ms_hide_unavailable" },
  { key: "showBrand", labelKey: "ms_show_brand" },
];

// Quick accent colours – a safe subset: they only touch `colors.accent`
const ACCENT_SWATCHES = [
  "#0f766e", "#16a34a", "#2563eb", "#7c3aed",
  "#db2777", "#dc2626", "#ea580c", "#ca8a04", "#1f2937",
  "#0891b2", "#4d7c0f", "#9333ea", "#be123c",
  "#92400e", "#475569", "#0e7490", "#65a30d",
];

// One-click palette presets only change colours; layout and typography remain
// controlled by their own settings.
// `headerBg` / `headerInk` only take effect while the modernKhmer template
// is active (other templates' colour sets have no such fields).
const STYLE_PRESETS = [
  {
    id: "modernKhmer",
    nameKey: "preset_modern_khmer",
    swatch: ["#0f766e", "#f0fdf4"],
    patch: {
      colors: { bg: "#ffffff", ink: "#1f2937", muted: "#6b7280",
                accent: "#0f766e", line: "#e5e7eb",
                headerBg: "#ffffff", headerInk: "#0f766e" },
    },
  },
  {
    id: "angkorGold",
    nameKey: "preset_angkor_gold",
    swatch: ["#b45309", "#fef3c7"],
    patch: {
      colors: { bg: "#fffbeb", ink: "#292524", muted: "#78716c",
                accent: "#b45309", line: "#fde68a",
                headerBg: "#fffbeb", headerInk: "#b45309" },
    },
  },
  {
    id: "streetFood",
    nameKey: "preset_street_food",
    swatch: ["#dc2626", "#fef2f2"],
    patch: {
      colors: { bg: "#ffffff", ink: "#111827", muted: "#4b5563",
                accent: "#dc2626", line: "#fecaca",
                headerBg: "#fef2f2", headerInk: "#dc2626" },
    },
  },
  {
    id: "minimalCafe",
    nameKey: "preset_minimal_cafe",
    swatch: ["#1f2937", "#f8fafc"],
    patch: {
      colors: { bg: "#ffffff", ink: "#0f172a", muted: "#64748b",
                accent: "#1f2937", line: "#e2e8f0",
                headerBg: "#ffffff", headerInk: "#1f2937" },
    },
  },
  {
    id: "oceanBreeze",
    nameKey: "preset_ocean_breeze",
    swatch: ["#0369a1", "#e0f2fe"],
    patch: {
      colors: { bg: "#f0f9ff", panel: "#ffffff", ink: "#0c4a6e",
                muted: "#475569", accent: "#0284c7", line: "#bae6fd",
                headerBg: "#e0f2fe", headerInk: "#075985" },
    },
  },
  {
    id: "lavenderDream",
    nameKey: "preset_lavender_dream",
    swatch: ["#7e22ce", "#f3e8ff"],
    patch: {
      colors: { bg: "#faf5ff", panel: "#ffffff", ink: "#3b0764",
                muted: "#6b5b7a", accent: "#9333ea", line: "#e9d5ff",
                headerBg: "#f3e8ff", headerInk: "#6b21a8" },
    },
  },
  {
    id: "sakuraBlossom",
    nameKey: "preset_sakura_blossom",
    swatch: ["#be185d", "#fce7f3"],
    patch: {
      colors: { bg: "#fff7fb", panel: "#ffffff", ink: "#4a1830",
                muted: "#765466", accent: "#db2777", line: "#fbcfe8",
                headerBg: "#fce7f3", headerInk: "#9d174d" },
    },
  },
  {
    id: "forestHerb",
    nameKey: "preset_forest_herb",
    swatch: ["#3f6212", "#ecfccb"],
    patch: {
      colors: { bg: "#f7fee7", panel: "#ffffff", ink: "#263314",
                muted: "#58634a", accent: "#4d7c0f", line: "#d9f99d",
                headerBg: "#ecfccb", headerInk: "#3f6212" },
    },
  },
  {
    id: "midnightBlue",
    nameKey: "preset_midnight_blue",
    swatch: ["#1e3a8a", "#dbeafe"],
    patch: {
      colors: { bg: "#eff6ff", panel: "#ffffff", ink: "#172554",
                muted: "#536581", accent: "#2563eb", line: "#bfdbfe",
                headerBg: "#dbeafe", headerInk: "#1e40af" },
    },
  },
  {
    id: "terracotta",
    nameKey: "preset_terracotta",
    swatch: ["#9a3412", "#ffedd5"],
    patch: {
      colors: { bg: "#fffaf5", panel: "#ffffff", ink: "#431c0c",
                muted: "#70584b", accent: "#c2410c", line: "#fed7aa",
                headerBg: "#ffedd5", headerInk: "#9a3412" },
    },
  },
];

const currentPreset = computed(() =>
  STYLE_PRESETS.find((preset) =>
    Object.entries(preset.patch.colors).every(([key, value]) =>
      sameColor(design.value.colors[key], value),
    ),
  )?.id ?? null,
);

function applyPreset(p) {
  patchDesign(p.patch);
}

// ─── FOCUS TRAPS (delete dialog, starter gallery, shortcut help) ──
const dlgEl = ref(null);
const helpEl = ref(null);
const galleryCardEl = ref(null);
const deleteTrap = useFocusTrap(dlgEl);
const helpTrap = useFocusTrap(helpEl);
const galleryTrap = useFocusTrap(galleryCardEl);

// ─── SHORTCUT HELP ───────────────────────────────────────────
const showHelp = ref(false);
const SHORTCUTS = [
  { keys: "Ctrl/⌘ + Z", labelKey: "ms_sc_undo", fallback: "Undo" },
  { keys: "Ctrl/⌘ + Shift + Z", labelKey: "ms_sc_redo", fallback: "Redo" },
  { keys: "Ctrl/⌘ + Y", labelKey: "ms_sc_redo", fallback: "Redo" },
  { keys: "Ctrl/⌘ + S", labelKey: "ms_sc_save", fallback: "Save design" },
  { keys: "? or Ctrl/⌘ + /", labelKey: "ms_sc_help", fallback: "Show this help" },
  { keys: "Esc", labelKey: "ms_sc_close", fallback: "Close dialog or panel" },
  { keys: "Enter", labelKey: "ms_sc_enter", fallback: "Finish editing text on the preview" },
];

function openHelp() {
  showHelp.value = true;
}
function closeHelp() {
  showHelp.value = false;
}

watch(showHelp, async (open) => {
  await nextTick();
  if (open) helpTrap.activate();
  else helpTrap.deactivate();
});

watch(deleting, async (row) => {
  await nextTick();
  if (row) deleteTrap.activate();
  else deleteTrap.deactivate();
});

// ─── STARTER GALLERY (choose-a-template modal) ───────────────
// Shown on first visit (no "ms_gallery_seen" flag) and whenever the
// owner clicks "Browse all". The flag is written only when the owner
// picks a template or skips; Esc / backdrop just close it.
// Focus is managed by the focus trap (saved on open, restored on close).
const showGallery = ref(false);
const galleryThumbs = ref({}); // template id → canvas element

// Same sample content as the side-panel thumbnails, so every card shows
// a populated, appetising menu preview
const GALLERY_SAMPLE = {
  restaurantName: "សាលាមីនុយ",
  logoUrl: "",
  categories: [
    {
      id: 1,
      label: "អាហារ",
      items: [
        { id: 1, name: "អាមោក", priceText: "25,000៛", img: "" },
        { id: 2, name: "ឡុកឡាក់", priceText: "30,000៛", img: "" },
      ],
    },
    {
      id: 2,
      label: "ភេសជ្ជៈ",
      items: [{ id: 3, name: "តែម្លប់", priceText: "4,000៛", img: "" }],
    },
  ],
  qrUrl: "",
  qrCaption: "",
  brandText: "",
};

function setGalleryThumb(el, id) {
  if (el) galleryThumbs.value[id] = el;
  else delete galleryThumbs.value[id];
}

function renderGalleryThumbs() {
  MENU_TEMPLATES.forEach((tpl) => {
    const el = galleryThumbs.value[tpl.id];
    if (!el) return;
    try {
      const d = createDesign(tpl.id);
      const s = resolveSheet(d);
      renderCanvasWithDPR(el, {
        design: d,
        sheet: s,
        data: GALLERY_SAMPLE,
        images: new Map(),
        pxPerUnit: 96 / s.w,
        allowTainted: true,
      });
    } catch (err) {
      console.warn("[MenuStudio] gallery thumb render:", err.message);
    }
  });
}

function markGallerySeen() {
  try {
    localStorage.setItem("ms_gallery_seen", "1");
  } catch {
    /* private mode — the gallery simply shows again next visit */
  }
}

function openGallery() {
  showGallery.value = true;
}

function closeGallery() {
  showGallery.value = false;
}

function pickFromGallery(id) {
  markGallerySeen();
  applyTemplate(id);
  closeGallery();
}

function skipGallery() {
  markGallerySeen();
  closeGallery();
}

// Paint the previews once the cards exist in the DOM, then trap focus
// inside the dialog (the trap saves the opener and restores it on close)
watch(showGallery, async (open) => {
  await nextTick();
  if (open) {
    renderGalleryThumbs();
    galleryTrap.activate();
  } else {
    galleryTrap.deactivate();
  }
});

// ─── COMPUTED ────────────────────────────────────────────────
const templateDescKey = computed(
  () => templateById(design.value.template).descKey,
);
const qualityOptions = computed(() =>
  EXPORT_QUALITIES.map((q) => ({
    value: q.key,
    label: i18n.t[q.labelKey] || q.key,
  }))
);
const fontOptions = computed(() =>
  FONT_OPTIONS.map((f) => ({
    value: f.key,
    label: i18n.t[f.labelKey] || f.key,
  }))
);
const currencyOptions = computed(() => [
  { value: "auto", label: i18n.t.ms_currency_auto },
  { value: "KHR", label: i18n.t.currency_khr || "KHR" },
  { value: "USD", label: i18n.t.currency_usd || "USD" },
]);
const unitOptions = computed(() => [
  { value: "mm", label: "mm" },
  { value: "cm", label: "cm" },
  { value: "in", label: "in" },
  { value: "px", label: "px" },
]);
const fitClass = computed(() => ({
  "ms-fit-ok": !fitState.value.overflow && fitState.value.fit >= 0.99,
  "ms-fit-shrunk": !fitState.value.overflow && fitState.value.fit < 0.99,
  "ms-fit-over": fitState.value.overflow,
}));
const fitIcon = computed(() =>
  fitState.value.overflow
    ? "alert-circle"
    : fitState.value.fit < 0.99
      ? "info"
      : "check-circle",
);
const fitText = computed(() =>
  fitState.value.overflow
    ? i18n.t.ms_overflow
    : fitState.value.fit < 0.99
      ? i18n.t.ms_fit_small
      : i18n.t.ms_fit_ok,
);
const sheetDims = computed(() => {
  const s = sheet.value;
  const preset = SHEET_SIZES.find((x) => x.key === s.key);
  const w = Number(s.w).toFixed(s.unit === "px" ? 0 : 1).replace(/\.0$/, "");
  const h = Number(s.h).toFixed(s.unit === "px" ? 0 : 1).replace(/\.0$/, "");
  const label = (preset && i18n.t[preset.labelKey]) || s.key;
  return `${w} × ${h} ${s.unit} · ${label}`;
});

// Canvas alt text: template + sheet size, so screen-reader users know what is drawn
const previewLabel = computed(
  () =>
    `${i18n.t.ms_preview || "Menu preview"}: ${templateLabel(design.value.template)}, ${sheetDims.value}`,
);

// Human-readable names for the click-to-edit overlay inputs
const HOTSPOT_LABELS = {
  title: "ms_title_field",
  subtitle: "ms_subtitle",
  contact: "ms_contact",
  footerNote: "ms_footer_note",
};
function hotspotLabel(key) {
  return i18n.t[HOTSPOT_LABELS[key]] || key;
}

// ─── ZOOM (incl. "Fit": whole sheet visible, no scrolling) ───
const stageBox = ref({ w: 0, h: 0 });
let resizeObs = null;

const fitPct = computed(() => {
  const { w, h } = stageBox.value;
  const s = sheet.value;
  const ratio = Number(s.w) / Number(s.h);
  if (!w || !h || !Number.isFinite(ratio) || ratio <= 0) return 100;
  const usableW = Math.max(w - 40, 1); // 20px padding each side
  const usableH = Math.max(h - 40, 1);
  const pct = ((usableH * ratio) / usableW) * 100;
  return Math.max(20, Math.min(100, Math.floor(pct)));
});
const zoomPct = computed(() =>
  zoom.value === "fit" ? fitPct.value : zoom.value,
);

// Hotspots come back in canvas-internal pixels; the canvas is displayed at a
// different CSS size, so convert to displayed pixels. Reads zoomPct / sheet
// so the cached value re-scales on zoom changes, "Fit" re-measures and sheet
// swaps (clientWidth / clientHeight already reflect the current layout).
const scaledHotspots = computed(() => {
  const hs = textHotspots.value;
  const el = previewEl.value;
  const zoom = zoomPct.value;
  const s = sheet.value;
  if (!hs.length || !el || !el.width || !zoom || !s) return [];
  const sx = el.clientWidth / el.width;
  const sy = el.clientHeight / el.height;
  if (!Number.isFinite(sx) || sx <= 0 || !Number.isFinite(sy) || sy <= 0) return [];
  return hs.map((h) => {
    const fs = Math.max(9, h.fs * sx);
    // ctx.font looks like "700 24px 'Hanuman',..." — rebuild it with the
    // scaled size so the input matches the drawn type at any zoom
    const fm = /^(\d{3})\s+\d+(?:\.\d+)?px\s+(.+)$/.exec(h.font || "");
    return {
      ...h,
      x: h.x * sx,
      y: h.y * sy,
      w: h.w * sx,
      h: h.h * sy,
      fs,
      font: fm ? `${fm[1]} ${fs.toFixed(2)}px ${fm[2]}` : h.font,
    };
  });
});

function measureStage() {
  const el = stageEl.value;
  if (el) stageBox.value = { w: el.clientWidth, h: el.clientHeight };
}

function previousPage() {
  currentPage.value = Math.max(0, currentPage.value - 1);
}

function nextPage() {
  currentPage.value = Math.min(menuPages.value.length - 1, currentPage.value + 1);
}

// ─── CONTROLS ────────────────────────────────────────────────
function goBack() {
  router.push("/dashboard");
}

// Small shape indicator showing the aspect ratio of each preset
function shapeStyle(s) {
  let ratio = s.key === "custom" ? design.value.custom.w / design.value.custom.h : s.w / s.h;
  if (!Number.isFinite(ratio) || ratio <= 0) ratio = 1;
  const h = ratio >= 1 ? 12 / ratio : 12;
  const w = ratio >= 1 ? 12 : 12 * ratio;
  return { width: `${w}px`, height: `${h}px` };
}

function setColor(key, value) {
  design.value.colors = { ...design.value.colors, [key]: value };
}

function sameColor(a, b) {
  return String(a || "").toLowerCase() === String(b || "").toLowerCase();
}

function useBrandColor() {
  const brand = auth.restaurant?.themeColor;
  if (!brand) return;
  design.value.colors = { ...design.value.colors, accent: brand };
}

function toggleCategory(id) {
  const current = new Set(design.value.categoryIds.map(String));
  const key = String(id);
  if (current.has(key)) current.delete(key);
  else current.add(key);
  patchDesign({ categoryIds: [...current] });
}

function templateLabel(id) {
  const tpl = templateById(id);
  return i18n.t[tpl.nameKey] || tpl.id;
}

// Save the currently opened design under a new name instead of overwriting it
async function saveAsCopy() {
  const base = designName.value.trim();
  if (!base) return;
  activeDesignId.value = null; // next save creates a new row
  if (designs.value.some((d) => d.name === base)) {
    designName.value = `${base} (${i18n.t.ms_copy_word || "copy"})`;
  }
  await saveDesign();
}

// ─── DELETE CONFIRM ──────────────────────────────────────────
function confirmDelete(row) {
  deleting.value = row;
}
async function doDelete() {
  const row = deleting.value;
  deleting.value = null;
  if (row) await deleteSaved(row);
}

// ─── UNDO / REDO ─────────────────────────────────────────────
// Snapshot history of the design object. Edits are coalesced (400ms) so a
// slider drag becomes one step. NOTE: restoring relies on `patchDesign`
// accepting a full design object (it already takes partial patches).
const HISTORY_MAX = 60;
const history = ref([]);
const histIdx = ref(-1);
let histTimer = null;
let restoringHistory = false;

const canUndo = computed(() => histIdx.value > 0);
const canRedo = computed(() => histIdx.value < history.value.length - 1);

function snap() {
  return JSON.stringify(design.value);
}

function resetHistory() {
  clearTimeout(histTimer);
  history.value = [snap()];
  histIdx.value = 0;
}

function pushHistory() {
  const s = snap();
  if (s === history.value[histIdx.value]) return;
  const next = history.value.slice(0, histIdx.value + 1);
  next.push(s);
  if (next.length > HISTORY_MAX) next.shift();
  history.value = next;
  histIdx.value = next.length - 1;
}

function scheduleHistory() {
  if (restoringHistory) return;
  clearTimeout(histTimer);
  histTimer = setTimeout(pushHistory, 400);
}

async function restoreAt(i) {
  clearTimeout(histTimer);
  histIdx.value = i;
  restoringHistory = true;
  try {
    patchDesign(JSON.parse(history.value[i]));
    await nextTick();
    // patchDesign may normalise values, so retain the exact restored snapshot.
    history.value[i] = snap();
  } finally {
    restoringHistory = false;
  }
}

function undo() {
  // flush a pending edit first so it can itself be undone
  if (histTimer) {
    clearTimeout(histTimer);
    histTimer = null;
    pushHistory();
  }
  if (canUndo.value) restoreAt(histIdx.value - 1);
}
function redo() {
  if (canRedo.value) restoreAt(histIdx.value + 1);
}

// ─── KEYBOARD SHORTCUTS ──────────────────────────────────────
function isTextField(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT") {
    return !["range", "color", "checkbox", "radio", "button"].includes(el.type);
  }
  return el.isContentEditable === true;
}

function onKeydown(e) {
  // Esc closes the top-most layer first (the focus traps don't handle Esc)
  if (e.key === "Escape" && showHelp.value) {
    closeHelp();
    return;
  }
  if (e.key === "Escape" && deleting.value) {
    deleting.value = null;
    return;
  }
  if (e.key === "Escape" && showGallery.value) {
    closeGallery();
    return;
  }
  if (e.key === "Escape" && sideOpen.value) {
    closeSidePanel();
    return;
  }
  if (e.key === "Escape" && menuOpen.value) {
    closeMenu();
    return;
  }
  const mod = e.ctrlKey || e.metaKey;

  // Shortcut help: "?" or Ctrl/Cmd + "/" (never while typing)
  if (
    (e.key === "?" || (mod && e.key === "/")) &&
    !isTextField(e.target) &&
    !deleting.value &&
    !showGallery.value
  ) {
    e.preventDefault();
    openHelp();
    return;
  }

  if (!mod) return;
  const k = e.key.toLowerCase();

  if (k === "s") {
    e.preventDefault();
    if (!designName.value.trim()) {
      activeTab.value = "saved";
      if (isMobileView.value) sideOpen.value = true;
      nextTick(() => sideEl.value?.querySelector("#ms-panel-saved .ms-input")?.focus());
    } else if (!savingDesign.value) {
      saveDesign();
    }
    return;
  }
  // let text inputs keep their native undo
  if (isTextField(e.target)) return;
  if (k === "z" && !e.shiftKey) {
    e.preventDefault();
    undo();
  } else if ((k === "z" && e.shiftKey) || k === "y") {
    e.preventDefault();
    redo();
  }
}

// ─── THUMBNAILS (one small render per template) ──────────────
function setThumbEl(el, index) {
  if (el) thumbEls[index] = el;
}

// ─── THUMBNAILS (one small render per template) ──────────────
function renderCanvasWithDPR(el, opts) {
  // Render at the canvas's display size times DPR to avoid stretching a
  // 96px render across the wider gallery cards.
  const dpr = window.devicePixelRatio || 1;
  const width = el.width;
  if (width === 0) return;
  renderMenuToCanvas(el, {
    ...opts,
    pxPerUnit: (width * dpr) / opts.sheet.w,
  });
}

function renderThumbs() {
  const sample = {
    restaurantName: "សាលាមីនុយ",
    logoUrl: "",
    categories: [
      {
        id: 1,
        label: "អាហារ",
        items: [
          { id: 1, name: "អាមោក", priceText: "25,000៛", img: "" },
          { id: 2, name: "ឡុកឡាក់", priceText: "30,000៛", img: "" },
        ],
      },
      {
        id: 2,
        label: "ភេសជ្ជៈ",
        items: [{ id: 3, name: "តែម្លប់", priceText: "4,000៛", img: "" }],
      },
    ],
    qrUrl: "",
    qrCaption: "",
    brandText: "",
  };
  MENU_TEMPLATES.forEach((tpl, index) => {
    const el = thumbEls[index];
    if (!el) return;
    try {
      const d = createDesign(tpl.id);
      const s = resolveSheet(d);
      renderCanvasWithDPR(el, {
        design: d,
        sheet: s,
        data: sample,
        images: new Map(),
        pxPerUnit: 96 / s.w,
        allowTainted: true,
      });
    } catch (err) {
      console.warn("[MenuStudio] thumb render:", err.message);
    }
  });
}

// ─── LIVE PREVIEW ────────────────────────────────────────────
function renderPreview() {
  if (unmounted) return;
  const result = renderToCanvas(previewEl.value, {});
  textHotspots.value = result?.hotspots || [];
}

function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderPreview, 90);
}

// Re-render whenever the look or the rendered content changes (the
// composable bumps `assetTick` when photos / the QR finish loading)
watch([design, menuData, assetTick], scheduleRender, { deep: true });
watch(sheet, scheduleRender);
watch(currentPage, scheduleRender);

// Record history on every design edit (the `design` object only)
watch(design, scheduleHistory, { deep: true });

// Autosave: debounce design edits by 1.5s and save silently — but only
// when a design row is already open (submitDesign() PATCHes in that case;
// a new design would POST a brand-new row on every keystroke instead).
watch(
  design,
  () => {
    if (!activeDesignId.value) return; // new design: no autosave
    pendingAutosave = true;
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(runAutosave, 1500);
  },
  { deep: true },
);

async function runAutosave() {
  if (!pendingAutosave || !activeDesignId.value) return;
  if (savingDesign.value) {
    autosaveTimer = setTimeout(runAutosave, 500);
    return;
  }

  const savedSnapshot = snap();
  await saveDesign();
  if (saveError.value) return;

  if (snap() !== savedSnapshot) {
    autosaveTimer = setTimeout(runAutosave, 1500);
    return;
  }

  pendingAutosave = false;
  savedRecently.value = true;
  setTimeout(() => (savedRecently.value = false), 2000);
}

// Opening a saved design starts a fresh undo history — and cancels any
// pending autosave so it can never overwrite the freshly loaded design
// (openSaved() updates `design` BEFORE `activeDesignId`, so this watcher
// is what voids the autosave that the design change just scheduled).
watch(activeDesignId, () => {
  pendingAutosave = false;
  clearTimeout(autosaveTimer);
  autosaveTimer = null;
  nextTick(resetHistory);
});

// Lock body scroll while the mobile bottom sheet is open
watch(sideOpen, (open) => {
  if (open) {
    if (previousBodyOverflow === null) previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  } else if (previousBodyOverflow !== null) {
    document.body.style.overflow = previousBodyOverflow;
    previousBodyOverflow = null;
  }
  // The two mobile panels never stack: opening the sheet closes the menu
  if (open) menuOpen.value = false;
});

onMounted(async () => {
  window.addEventListener("keydown", onKeydown);
  document.addEventListener("pointerdown", onDocumentPointerDown);
  await initStudio();
  if (unmounted) return;
  await nextTick();
  resetHistory();
  renderThumbs();
  renderPreview();

  // First visit → open the starter gallery (the flag is written only when
  // the owner picks a template or skips; closing via Esc leaves it missing)
  let gallerySeen = false;
  try {
    gallerySeen = !!localStorage.getItem("ms_gallery_seen");
  } catch {
    /* private mode */
  }
  if (!gallerySeen) showGallery.value = true;

  if (stageEl.value && "ResizeObserver" in window) {
    resizeObs = new ResizeObserver(measureStage);
    resizeObs.observe(stageEl.value);
  } else {
    window.addEventListener("resize", measureStage, { passive: true });
  }
  measureStage();

  // Close the bottom sheet if the viewport grows past the mobile breakpoint
  if (window.matchMedia) {
    mobileMq = window.matchMedia("(max-width: 700px)");
    isMobileView.value = mobileMq.matches;
    mobileMq.addEventListener("change", onMobileMqChange);
  }

  // Web fonts change the text metrics once they land → repaint
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      if (unmounted) return;
      renderThumbs();
      scheduleRender();
      if (showGallery.value) renderGalleryThumbs();
    });
  }
});

onUnmounted(() => {
  unmounted = true;
  clearTimeout(renderTimer);
  clearTimeout(histTimer);
  clearTimeout(autosaveTimer);
  pendingAutosave = false;
  mobileMq?.removeEventListener("change", onMobileMqChange);
  if (previousBodyOverflow !== null) {
    document.body.style.overflow = previousBodyOverflow;
    previousBodyOverflow = null;
  }
  window.removeEventListener("keydown", onKeydown);
  document.removeEventListener("pointerdown", onDocumentPointerDown);
  resizeObs?.disconnect();
  if (!resizeObs) window.removeEventListener("resize", measureStage);
});
</script>
<style scoped>
/* ═══ MENU STUDIO ═══ */
.ms {
  --ms-primary: var(--primary, #0f766e);
  --ms-primary-dark: var(--primary-dark, #0d5e57);
  --ms-border: var(--border, #e2e8f0);
  --ms-surface: var(--surface, #ffffff);
  --ms-muted: var(--muted, #6b7280);
  --ms-red: var(--red, #c62828);
  min-height: 100vh;
  min-height: 100dvh;
  background: #f8fafc;
  color: var(--text, #0f172a);
  /* Latin gets the system UI stack; Khmer must resolve to the app's
     webfont (body uses it) — without it the browser picks a random system
     Khmer font whose line metrics inflate every control only in km locale */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Kantumruy Pro", sans-serif;
  padding: 0 26px 48px;
  -webkit-font-smoothing: antialiased;
}

/* keyboard focus ring for every control – two-tone so it stays visible on
   teal (active toggles / chips) as well as on white */
.ms button:focus-visible,
.ms input:focus-visible,
.ms select:focus-visible,
.ms [tabindex]:focus-visible {
  outline: 2px solid var(--ms-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px #fff;
}

/* skip link (visible only on keyboard focus) */
.ms-skip {
  position: absolute;
  left: -9999px;
  top: 8px;
}

.ms-skip:focus {
  left: 12px;
  z-index: 400;
  padding: 8px 14px;
  background: var(--ms-primary);
  color: #fff;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

/* live region wrapper for the autosave pill */
.ms-live {
  display: inline-flex;
  align-items: center;
}

/* ─── TOP BAR ─── */
.ms-hdr {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 16px 0 14px;
  /* frosted sticky bar: page content slides under it cleanly */
  background: #f8fafc;
  backdrop-filter: saturate(180%) blur(12px);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 2px solid var(--ms-border);
}

.ms-hdr-l {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1 1 auto; /* allows the title block to shrink so ellipsis kicks in */
}

.ms-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 6px 12px;
  border: 1px solid var(--ms-border);
  border-radius: 8px;
  background: var(--ms-surface);
  color: var(--ms-muted);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  /* Khmer "normal" line-height would push this button past 34px and
     break the shared header baseline */
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.ms-back:hover {
  color: var(--ms-primary);
  border-color: var(--ms-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--primary-glow, rgba(15, 118, 110, 0.15));
}

.ms-title-b {
  min-width: 0;
  flex: 0 1 auto;
}

.ms-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--ink, #14532d);
  letter-spacing: -0.3px;
  min-width: 0;
  /* fixed ratio: Khmer fonts' "normal" line-height is ~1.9× and would
     grow the header / drop the toolbar only in km locale */
  line-height: 1.35;
}

/* long titles ellipsis instead of pushing the toolbar off-screen.
   The padding/negative-margin pair keeps the outer box size unchanged
   while giving Khmer coeng stacks headroom inside the overflow clip. */
.ms-title-t {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-block: 3px;
  margin-block: -3px;
}

.ms-title-i {
  color: var(--ms-primary);
  flex-shrink: 0;
}

.ms-sub {
  margin: 2px 0 0;
  font-size: 11.5px;
  line-height: 1.4;
  color: var(--ms-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ms-hdr-r {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 0 0 auto; /* the toolbar never squeezes — the title absorbs it */
}

/* vertical divider: separates the utility tools (undo / saved / language)
   from the export actions, so the row reads as two groups instead of a
   flat line of mixed controls */
.ms-hdr-sep {
  width: 1px;
  height: 24px;
  background: var(--ms-border);
  border-radius: 1px;
  flex-shrink: 0;
}

/* undo / redo pair */
.ms-undo {
  display: inline-flex;
  border: 1px solid var(--ms-border);
  border-radius: 8px;
  background: var(--ms-surface);
  overflow: hidden;
}

/* unified 34px height with .ms-btn / .lang so every control in the header
   shares one baseline (was 32px, which left the undo pair sitting 1px low) */
.ms-ic-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text, #0f172a);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.ms-ic-btn+.ms-ic-btn {
  border-left: 1px solid var(--ms-border);
}

.ms-ic-btn:hover:not(:disabled) {
  background: var(--surface-green, #f0fdf4);
  color: var(--ms-primary);
}

.ms-ic-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* autosave "Saved" pill (fades in/out with the shared .fade transition) */
.ms-saved-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 22px;
  padding: 3px 10px;
  border: none;
  border-radius: 999px;
  background: var(--ms-primary);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

/* Pill, not a fixed circle: "ខ្មែរ" is ~5 glyphs wide and overflowed the
   old 34px circle in km→EN direction (visible as a squished glyph) */
.lang {
  width: auto;
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--ms-border);
  background: var(--ms-surface);
  color: var(--ink, #14532d);
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang:hover {
  border-color: var(--ms-primary);
  transform: translateY(-1px);
}

.ms-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  padding: 6px 14px;
  border: 1px solid var(--ms-border);
  border-radius: 8px;
  background: var(--ms-surface);
  color: var(--text, #0f172a);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  /* keeps every header button exactly 34px tall in BOTH locales —
     Khmer's larger default line-height made "បោះពុម្ព" taller than
     the sibling PDF / PNG buttons */
  line-height: 1.2;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.ms-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
}

.ms-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ms-btn-primary {
  background: var(--ms-primary);
  border-color: var(--ms-primary);
  color: #fff;
}

.ms-btn-primary:hover:not(:disabled) {
  background: var(--ms-primary-dark);
  box-shadow: 0 4px 14px var(--primary-glow-strong, rgba(15, 118, 110, 0.25));
}

.ms-btn-danger {
  background: var(--ms-red);
  border-color: var(--ms-red);
  color: #fff;
}

.ms-btn-danger:hover:not(:disabled) {
  background: var(--red-dark, #b71c1c);
}

/* ─── WORKSPACE ─── */
.ms-body {
  display: grid;
  grid-template-columns: 336px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
  padding-top: 18px;
}

.ms-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.ms-side-close {
  display: none;
}

.ms-tabs {
  position: sticky;
  top: -2px;
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 3px;
  padding: 4px;
  /* border-radius: 13px; */
  background: #f1f5f9;
}

.ms-tab {
  display: flex;
  min-width: 0;
  min-height: 48px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 4px 2px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--ms-muted);
  font: inherit;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.1;
  cursor: pointer;
}

.ms-tab span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ms-tab.active,
.ms-tab[aria-selected="true"] {
  background: var(--ms-surface);
  color: var(--ms-primary);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
}

.ms-tab:focus-visible,
.ms-slider-reset:focus-visible {
  outline: 2px solid var(--ms-primary);
  outline-offset: 2px;
}

.ms-tab-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ms-layout-settings {
  display: grid;
  gap: 12px;
}

.ms-sliders {
  display: grid;
  gap: 12px;
}

.ms-slider {
  display: grid;
  min-width: 0;
  gap: 6px;
}

.ms-slider-h {
  display: flex;
  min-height: 28px;
  align-items: center;
  gap: 8px;
  color: var(--ms-muted);
  font-size: 10.5px;
  font-weight: 600;
}

.ms-slider-h label {
  min-width: 0;
  flex: 1;
}

.ms-slider-h output {
  color: var(--text, #0f172a);
  font-variant-numeric: tabular-nums;
}

.ms-slider-reset {
  display: inline-flex;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--ms-border);
  border-radius: 7px;
  background: var(--ms-surface);
  color: var(--ms-primary);
  cursor: pointer;
}

.ms-card {
  background: var(--ms-surface);
  border: 1px solid var(--ms-border);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ms-card-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--ms-muted);
}

.ms-card-h>span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ms-count {
  background: var(--ms-surface, #fff);
  border: 1px solid var(--ms-border);
  border-radius: 999px;
  padding: 0 8px;
  line-height: 17px;
  font-size: 10px;
  color: var(--ms-primary);
}

/* ── Template gallery ── */
.ms-tpls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-height: none;
  overflow: visible;
  align-content: start;
  padding: 2px;
  margin: -2px;
  scrollbar-width: thin;
}

.ms-tpls::-webkit-scrollbar {
  width: 6px;
}

.ms-tpls::-webkit-scrollbar-thumb {
  background: var(--ms-border);
  border-radius: 999px;
}

.ms-tpls::-webkit-scrollbar-track {
  background: transparent;
}

.ms-tpl {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 6px 6px 7px;
  border: 1.5px solid var(--ms-border);
  border-radius: 10px;
  background: var(--ms-surface);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}

.ms-tpl:hover {
  border-color: var(--ms-primary);
  transform: translateY(-1px);
}

.ms-tpl.active {
  border-color: var(--ms-primary);
  background: var(--surface-green, #f0fdf4);
  box-shadow: 0 0 0 3px var(--primary-glow, rgba(15, 118, 110, 0.15));
}

.ms-tpl-thumb-wrap {
  position: relative;
  display: block;
  width: 100%;
}

.ms-tpl-check {
  position: absolute;
  right: 6px;
  top: 6px;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: var(--ms-primary);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);
  opacity: 0;
  transform: scale(0.75);
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 2;
}

.ms-tpl.active .ms-tpl-check {
  opacity: 1;
  transform: scale(1);
}

.ms-tpl-thumb {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 5px;
  border: 1px solid var(--ms-border);
  background: #fff;
}

.ms-tpl-n {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text, #0f172a);
  text-align: center;
}

.ms-tpl.active .ms-tpl-n {
  color: var(--ms-primary);
}

.ms-tpl-desc {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--ms-muted);
}

/* ── Sizes ── */
.ms-seg {
  display: inline-flex;
  gap: 3px;
  background: #eef2f7;
  padding: 3px;
  border-radius: 9px;
}

.ms-seg button {
  border: none;
  background: transparent;
  border-radius: 7px;
  padding: 4px 10px;
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--ms-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.ms-seg button.active {
  background: var(--ms-primary);
  color: #fff;
  box-shadow: 0 1px 4px var(--primary-glow, rgba(15, 118, 110, 0.2));
}

.ms-sizes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.ms-size {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 6px 9px;
  border: 1.5px solid var(--ms-border);
  border-radius: 9px;
  background: var(--ms-surface);
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  color: var(--text, #0f172a);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.ms-size:hover {
  border-color: var(--ms-primary);
}

.ms-size.active {
  border-color: var(--ms-primary);
  background: var(--surface-green, #f0fdf4);
  color: var(--ms-primary);
}

.ms-size-shape {
  display: block;
  border: 1.8px solid currentColor;
  border-radius: 2px;
  flex-shrink: 0;
  opacity: 0.75;
}

.ms-size-l {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ms-custom {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.ms-custom-x {
  padding-bottom: 9px;
  color: var(--ms-muted);
  font-size: 12px;
}

.ms-fld {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.ms-fld>span {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--ms-muted);
}

.ms-fld-top {
  gap: 6px;
}

.ms-input {
  width: 100%;
  min-height: 34px;
  padding: 6px 10px;
  border: 1px solid var(--ms-border);
  border-radius: 8px;
  background: var(--ms-surface);
  color: var(--text, #0f172a);
  font-family: inherit;
  font-size: 12px;
  outline: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.ms-input:focus {
  border-color: var(--ms-primary);
  box-shadow: 0 0 0 3px var(--primary-glow, rgba(15, 118, 110, 0.15));
}

.ms-row,
.ms-grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.ms-px {
  min-height: 34px;
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border: 1px dashed var(--ms-border);
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ms-primary);
  background: var(--surface-green, #f0fdf4);
}

/* ─── EMPTY STATES ─── */
.ms-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 20px;
  color: var(--ms-muted);
  text-align: center;
}

.ms-empty p {
  margin: 0;
  font-size: 13px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2.5px solid var(--ms-border);
  border-top-color: var(--ms-primary);
  border-radius: 50%;
  animation: ms-spin 0.6s linear infinite;
  display: inline-block;
}

@keyframes ms-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Colours ── */
.ms-colors {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.ms-color {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.ms-color span {
  font-size: 11px;
  color: var(--ms-muted);
  text-align: center;
}

.ms-color-i {
  width: 100%;
  height: 30px;
  padding: 2px;
  border: 1px solid var(--ms-border);
  border-radius: 8px;
  background: var(--ms-surface);
  cursor: pointer;
}

/* quick accent swatches */
.ms-swatches {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.ms-swatches-l {
  width: 100%;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--ms-muted);
}

.ms-swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px var(--ms-border);
  cursor: pointer;
  padding: 0;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.ms-swatch:hover {
  transform: scale(1.15);
}

.ms-swatch.active {
  box-shadow: 0 0 0 2px var(--ms-primary);
}

/* ── Style presets ── */
.ms-presets {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.ms-preset {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 7px 10px;
  border: 1.5px solid var(--ms-border);
  border-radius: 9px;
  background: var(--ms-surface);
  color: var(--text, #0f172a);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ms-preset:hover {
  border-color: var(--ms-primary);
}

.ms-preset.active {
  border-color: var(--ms-primary);
  background: var(--surface-green, #f0fdf4);
  color: var(--ms-primary);
  box-shadow: 0 0 0 3px var(--primary-glow, rgba(15, 118, 110, 0.15));
}

.ms-preset-swatch {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.12);
}

.ms-preset span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-mini {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border: 1px solid var(--ms-border);
  border-radius: 7px;
  background: var(--ms-surface);
  color: var(--ms-muted);
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 600;
  /* Khmer labels ("ចម្លងរូបភាព") are long — keep them on one line so the
     stage bar never grows a two-row button */
  line-height: 1.3;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ms-mini:hover:not(:disabled) {
  color: var(--ms-primary);
  border-color: var(--ms-primary);
}

.ms-mini:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ms-mini-block {
  width: 100%;
  justify-content: center;
}

.ms-brand-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.15);
}

/* ── Sliders ── */
.ms-range {
  width: 100%;
  accent-color: var(--ms-primary);
  cursor: pointer;
}

/* ── Toggles ── */
.ms-toggles {
  display: flex;
  flex-direction: column;
  border-top: 1px dashed var(--ms-border);
  padding-top: 6px;
}

.ms-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 34px;
  font-size: 12px;
  color: var(--text, #0f172a);
}

.ms-toggle-sub {
  padding-left: 10px;
  border-left: 2px solid var(--ms-border);
  margin-left: 3px;
  min-height: 30px;
  font-size: 11px;
}

.ms-sw {
  position: relative;
  width: 38px;
  height: 21px;
  border: none;
  border-radius: 999px;
  background: #cbd5e1;
  cursor: pointer;
  transition: background 0.18s ease;
  flex-shrink: 0;
  padding: 0;
}

.ms-sw i {
  position: absolute;
  top: 2.5px;
  left: 2.5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.18s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.ms-sw.on {
  background: var(--ms-primary);
}

.ms-sw.on i {
  transform: translateX(17px);
}

/* ── Category chips ── */
.ms-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ms-chip {
  padding: 5px 11px;
  border: 1px solid var(--ms-border);
  border-radius: 999px;
  background: var(--ms-surface);
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  color: var(--ms-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.ms-chip:hover {
  border-color: var(--ms-primary);
  color: var(--text, #0f172a);
}

.ms-chip.active {
  background: var(--ms-primary);
  border-color: var(--ms-primary);
  color: #fff;
}

/* ── Saved designs ── */
.ms-save-row {
  display: flex;
  gap: 8px;
}

.ms-save-row .ms-input {
  flex: 1;
  min-width: 0;
}

.ms-msg {
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
}

.ms-msg-ok {
  background: var(--surface-green, #f0fdf4);
  color: var(--green-dark, #16a34a);
  border: 1px solid var(--border-green, #bbf7d0);
}

.ms-msg-err {
  background: #fef2f2;
  color: var(--ms-red);
  border: 1px solid #fecaca;
}

.ms-msg-err em {
  display: block;
  font-style: normal;
  font-weight: 500;
  opacity: 0.8;
  margin-top: 2px;
}

.ms-mini-loading {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.ms-saved-empty {
  font-size: 11px;
  color: var(--ms-muted);
  text-align: center;
  padding: 12px 8px;
  border: 1px dashed var(--ms-border);
  border-radius: 8px;
}

.ms-saved {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 260px;
  overflow-y: auto;
}

.ms-saved-i {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--ms-border);
  border-radius: 9px;
  background: var(--ms-surface);
  transition: all 0.15s ease;
}

.ms-saved-i:hover {
  border-color: var(--ms-primary);
  box-shadow: 0 2px 8px var(--primary-glow, rgba(15, 118, 110, 0.15));
}

.ms-saved-i.active {
  border-color: var(--ms-primary);
  background: var(--surface-green, #f0fdf4);
}

.ms-saved-b {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
}

.ms-saved-b strong {
  font-size: 12px;
  color: var(--text, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-saved-b span {
  font-size: 9.5px;
  color: var(--ms-muted);
}

.ms-ic {
  width: 26px;
  height: 26px;
  margin-right: 6px;
  border: 1px solid var(--ms-border);
  border-radius: 6px;
  background: var(--ms-surface);
  color: var(--ms-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.ms-ic:hover {
  color: var(--ms-red);
  border-color: #fecaca;
  background: #fef2f2;
}

/* ─── STAGE (live preview) ─── */
.ms-stage {
  position: sticky;
  top: 78px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-height: calc(100vh - 96px);
  background: var(--ms-surface);
  border: 1px solid var(--ms-border);
  border-radius: 14px;
  overflow: hidden;
}

.ms-stage-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border-bottom: 1px solid var(--ms-border);
}

.ms-fit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
}

.ms-fit-ok {
  color: var(--green-dark, #16a34a);
}

/* amber #f59e0b on white is ~2.1:1 (fails); #b45309 is ~5:1 */
.ms-fit-shrunk {
  color: #b45309;
}

.ms-fit-over {
  color: var(--ms-red);
}

.ms-stage-r {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ms-dims {
  font-size: 11px;
  font-weight: 700;
  color: var(--ms-primary);
  font-variant-numeric: tabular-nums;
}

.ms-page-control {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  border: 1px solid var(--ms-border);
  border-radius: 8px;
  background: var(--ms-surface);
}

.ms-page-btn {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--ms-primary);
  cursor: pointer;
}

.ms-page-btn:hover:not(:disabled) {
  background: var(--surface-green, #f0fdf4);
}

.ms-page-btn:disabled {
  color: var(--ms-muted);
  opacity: 0.45;
  cursor: not-allowed;
}

.ms-page-count {
  min-width: 54px;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  color: var(--ms-muted);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.ms-zoom button {
  min-width: 34px;
}

.ms-stage-scroll {
  /* fixed height so "Fit" can measure it (stage max-height = 100vh - 96px) */
  height: calc(100vh - 220px);
  min-height: 320px;
  overflow: auto;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  /* checkerboard so the sheet edges are obvious on any page colour */
  background: repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%) 50% /
    18px 18px;
}

.ms-sheet {
  max-width: none;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

.ms-canvas {
  width: 100%;
  height: auto;
  display: block;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.22);
}

/* ── Click-to-edit overlays (Canva-style) ── */
.ms-sheet-wrap {
  position: relative;
  width: 100%;
}

.ms-hotspot {
  position: absolute;
  border: 1px dashed transparent;
  background: transparent;
  padding: 0;
  margin: 0;
  outline: none;
  box-sizing: border-box;
  cursor: text;
  border-radius: 3px;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.ms-hotspot:hover {
  border-color: var(--ms-primary);
  background: rgba(15, 118, 110, 0.06);
}

.ms-hotspot:focus-visible {
  border-style: solid;
  border-color: var(--ms-primary);
}

.ms-hotspot.active {
  border-color: var(--ms-primary);
  border-style: solid;
  background: #fff;
  color: var(--text) !important;
  box-shadow: 0 0 0 3px var(--primary-glow, rgba(15, 118, 110, 0.15));
  z-index: 5;
}

.ms-stage-f {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 9px 14px;
  border-top: 1px solid var(--ms-border);
}

.ms-stage-f .ms-msg {
  flex: 1;
  min-width: 160px;
}

.ms-hint {
  font-size: 10.5px;
  color: var(--ms-muted);
}

/* no opacity here: it dropped --ms-muted below 4.5:1 */
.ms-kbd {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}

/* ─── DELETE / HELP DIALOGS ─── */
.ms-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.ms-dlg {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 320px;
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-green, #bbf7d0);
  outline: none;
}

.ms-dlg-i {
  color: var(--ms-red);
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
}

.ms-dlg-t {
  font-size: 15px;
  font-weight: 700;
  color: var(--ms-red);
  margin-bottom: 4px;
}

.ms-dlg-d {
  font-size: 12px;
  color: #374151;
  margin-bottom: 16px;
  word-break: break-word;
}

.ms-dlg-acts {
  display: flex;
  gap: 8px;
}

.ms-dlg-acts .ms-btn {
  flex: 1;
}

/* shortcut help */
.ms-help {
  max-width: 420px;
  text-align: left;
}

.ms-help-t {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink, #14532d);
  margin-bottom: 12px;
}

.ms-help-list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 14px;
  margin: 0 0 16px;
  font-size: 12px;
  align-items: center;
}

.ms-help-list dt,
.ms-help-list dd {
  margin: 0;
}

.ms-help-list kbd {
  display: inline-block;
  padding: 2px 7px;
  border: 1px solid var(--ms-border);
  border-bottom-width: 2px;
  border-radius: 6px;
  background: #f8fafc;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ─── RESPONSIVE ─── */
/* Desktop (≥1101px): the control rail scrolls on its own next to the
   sticky stage, so 32 templates never push the save list off-screen */
@media (min-width: 1101px) {
  .ms-side {
    position: sticky;
    top: 78px;
    max-height: calc(100vh - 96px);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 2px 6px 8px 2px;
  }

  .ms-side::-webkit-scrollbar {
    width: 8px;
  }

  .ms-side::-webkit-scrollbar-thumb {
    background: var(--ms-border);
    border-radius: 999px;
  }

  .ms-side::-webkit-scrollbar-track {
    background: transparent;
  }
}

@media (max-width: 1100px) {
  .ms-body {
    grid-template-columns: 1fr;
  }

  .ms-stage {
    position: static;
    max-height: none;
    order: -1;
  }

  .ms-stage-scroll {
    height: 70vh;
    height: 70dvh;
    min-height: min(320px, 45dvh);
    height: 70dvh;
  }

  .ms-kbd {
    display: none;
  }

  /* Keep controls in one predictable scan order on tablet. */
  .ms-side {
    display: flex;
    flex-direction: column;
    width: min(100%, 760px);
    margin-inline: auto;
  }
}

@media (min-width: 701px) and (max-width: 1100px) {
  .ms-sliders {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(4, auto);
    grid-auto-flow: column;
    column-gap: 20px;
    row-gap: 16px;
  }
}

/* Header compaction before the phone breakpoint, so export buttons and
   the title share one row on tablets / narrow windows */
@media (max-width: 900px) {
  .ms-side {
    gap: 12px;
  }

  .ms-hdr {
    gap: 10px;
    padding: 12px 0 10px;
  }

  .ms-sub {
    display: none;
  }

  .ms-title {
    font-size: 17px;
  }
}

/* ─── RESPONSIVE HEADER MENU ───
   ≥901px: full labelled buttons.
   701–900px: icon-only buttons (labels hidden, aria-labels via title text).
   ≤700px: buttons collapse into a hamburger dropdown menu. */
.ms-hdr-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ms-hdr-menu {
  position: relative; /* anchors the absolute dropdown + backdrop */
  display: none;
  align-items: center;
}

/* Tablet: compact icon-only action buttons (still fully labelled a11y-wise
   because each button keeps its text, just visually hidden) */
@media (max-width: 900px) {
  .ms-hdr-actions {
    gap: 4px;
  }

  .ms-hdr-actions .ms-btn {
    padding: 6px 9px;
  }

  .ms-btn-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
}

/* Mobile: hide the action row and show the hamburger menu */
@media (max-width: 700px) {
  .ms-hdr-actions {
    display: none;
  }

  /* the divider only separates tools from actions — no actions, no divider */
  .ms-hdr-sep {
    display: none;
  }

  .ms-hdr-menu {
    display: flex;
  }

  .ms-hdr-menu-btn {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: var(--text, #0f172a);
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .ms-hdr-menu-btn:hover,
  .ms-hdr-menu-btn:focus-visible {
    background: var(--surface-green, #f0fdf4);
    color: var(--ms-primary);
  }

  .ms-hdr-menu-btn[aria-expanded="true"] {
    background: var(--surface-green, #f0fdf4);
    color: var(--ms-primary);
  }

  .ms-hdr-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 170px;
    max-width: min(240px, calc(100vw - 24px));
    background: #fff;
    border: 1px solid var(--ms-border);
    border-radius: 10px;
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
    overflow: hidden;
    z-index: 100;
  }

  .ms-hdr-dd-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 44px; /* touch target */
    padding: 10px 14px;
    border: none;
    background: transparent;
    color: var(--text, #0f172a);
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.35;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .ms-hdr-dd-item:hover:not(:disabled),
  .ms-hdr-dd-item:focus-visible:not(:disabled) {
    background: var(--surface-green, #f0fdf4);
    color: var(--ms-primary);
    outline: none;
  }

  .ms-hdr-dd-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ms-hdr-dd-item + .ms-hdr-dd-item {
    border-top: 1px solid var(--ms-border);
  }

  .ms-hdr-dd-primary {
    color: var(--ms-primary);
    font-weight: 600;
  }

  .ms-hdr-dd-primary:hover:not(:disabled) {
    background: var(--surface-green, #f0fdf4);
  }
}

/* slide-down transition for the header dropdown (scoped so the shared
   .fade timing elsewhere is untouched) */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ─── STARTER GALLERY (choose a template) ─── */
.ms-gal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* 0.2s fade scoped to the gallery, so the shared .fade used by the
   delete dialog keeps its original 0.15s timing */
.ms-gal-overlay.fade-enter-active,
.ms-gal-overlay.fade-leave-active {
  transition: opacity 0.2s ease;
}

.ms-gal-overlay.fade-enter-from,
.ms-gal-overlay.fade-leave-to {
  opacity: 0;
}

.ms-gal {
  width: 100%;
  max-width: 1100px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--ms-surface, #ffffff);
  border: 1px solid var(--ms-border);
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.28);
  outline: none;
}

.ms-gal-h {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.ms-gal-t {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: var(--ink, #14532d);
}

.ms-gal-sub {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--ms-muted);
}

.ms-gal-x {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ms-border);
  border-radius: 8px;
  background: var(--ms-surface, #fff);
  color: var(--ms-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.ms-gal-x:hover {
  color: var(--ms-primary);
  border-color: var(--ms-primary);
}

.ms-gal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
}

.ms-gal-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 10px;
  border: 1.5px solid var(--ms-border);
  border-radius: 12px;
  background: var(--ms-surface, #fff);
  cursor: pointer;
  font-family: inherit;
  text-align: center;
  transition: transform 0.15s ease, border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.ms-gal-card:hover {
  transform: translateY(-4px);
  border-color: var(--ms-primary);
  box-shadow: 0 10px 26px var(--primary-glow, rgba(15, 118, 110, 0.18));
}

.ms-gal-card.active {
  border-color: var(--ms-primary);
  background: var(--surface-green, #f0fdf4);
  box-shadow: 0 0 0 3px var(--primary-glow, rgba(15, 118, 110, 0.15));
}

.ms-gal-thumb-wrap {
  position: relative;
  display: block;
  width: 100%;
}

.ms-gal-check {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: var(--primary);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);
  z-index: 2;
}

.ms-gal-thumb {
  width: 100%;
  height: auto;
  display: block;
  border: 1px solid var(--ms-border);
  border-radius: 8px;
  background: #fff;
}

.ms-gal-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  pointer-events: none;
}

.ms-gal-tag-new {
  background: #dbeafe;
  color: #1d4ed8;
}

.ms-gal-tag-popular {
  background: #fef3c7;
  color: #b45309;
}

.ms-gal-n {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.ms-gal-card.active .ms-gal-n {
  color: var(--ms-primary);
}

.ms-gal-d {
  font-size: 11px;
  line-height: 1.45;
  color: var(--ms-muted);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 1.45em;
}

.ms-gal-skip {
  display: block;
  margin: 16px auto 0;
  padding: 6px 10px;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--ms-muted);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.15s ease;
}

.ms-gal-skip:hover {
  color: var(--ms-primary);
}

/* Very small phones: the header right group stays on one line — but it must
   NOT scroll or clip (overflow on .ms-hdr-r would cut off the dropdown),
   so at this width the export buttons are already collapsed into the
   hamburger and the remaining chips fit without scrolling. */
@media (max-width: 480px) {
  .ms-hdr {
    align-items: flex-start;
    gap: 6px;
    padding-bottom: 10px;
  }

  .ms-hdr-l {
    flex: 1 1 100%;
  }

  .ms-hdr-r {
    width: 100%;
    flex: 1 1 100%;
    flex-wrap: nowrap;
    justify-content: space-between;
    gap: 8px;
  }

  .ms-hdr-r>* {
    flex-shrink: 0;
  }

  .ms-live {
    flex: 1;
    min-width: 0;
  }

  .ms-stage-h {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
  }

  .ms-fit {
    align-items: flex-start;
    line-height: 1.4;
  }

  .ms-stage-r {
    display: grid;
    width: 100%;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 8px;
  }

  .ms-dims {
    grid-column: 1 / -1;
    min-width: 0;
    overflow-wrap: anywhere;
    line-height: 1.4;
  }

  .ms-page-control {
    justify-self: start;
    max-width: 100%;
  }

  .ms-stage-r > .ms-mini {
    min-height: 40px;
    justify-self: end;
    white-space: nowrap;
  }

  /* Zoom choices scroll horizontally rather than wrapping into extra rows. */
  .ms-zoom {
    grid-column: 1 / -1;
    display: flex;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    justify-content: space-between;
    scrollbar-width: none;
  }

  .ms-zoom::-webkit-scrollbar {
    display: none;
  }

  .ms-zoom button {
    flex: 0 0 auto;
    min-width: 44px;
    min-height: 40px;
    padding-inline: 8px;
  }
}

@media (max-width: 700px) {
  .ms {
    padding: 0 calc(12px + env(safe-area-inset-right, 0px)) 32px
      calc(12px + env(safe-area-inset-left, 0px));
  }

  .ms-hdr {
    padding-top: calc(16px + env(safe-area-inset-top, 0px));
  }

  .ms-title {
    font-size: 16px;
  }

  .ms-back-t {
    display: none;
  }

  .ms-tpls {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .ms-sizes {
    grid-template-columns: 1fr;
  }

  .ms-row,
  .ms-grid2 {
    grid-template-columns: 1fr;
  }

  .ms-colors {
    grid-template-columns: repeat(3, 1fr);
  }

  .ms-gal-overlay {
    padding: 12px;
  }

  .ms-gal {
    max-height: 92vh;
    max-height: 92dvh;
    padding: 14px;
  }

  .ms-gal-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  /* ── Sidebar as a Canva-style bottom sheet ── */
  .ms-side {
    display: flex;
    flex-direction: column;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: min(70vh, calc(100vh - 24px));
    max-height: min(70dvh, calc(100dvh - 24px));
    overflow-y: auto;
    overscroll-behavior: contain;
    scroll-padding-block: 12px;
    -webkit-overflow-scrolling: touch;
    background: #fff;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
    transform: translateY(100%);
    transition: transform 0.25s ease;
    z-index: 60;
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
  }

  /* drag handle */
  .ms-side::before {
    content: "";
    display: block;
    width: 40px;
    height: 4px;
    border-radius: 999px;
    background: #cbd5e1;
    /* margin: 10px auto 0; */
  }

  .ms-side.open {
    transform: translateY(0);
  }

  .ms-side-close {
    position: relative;
    top: 0;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    align-self: flex-end;
    min-height: 40px;
    margin: 6px 14px 0 auto;
    padding: 0 12px;
    border: 1px solid var(--ms-border);
    border-radius: 999px;
    background: var(--ms-surface);
    color: var(--text, #0f172a);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .ms-side-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    z-index: 50;
  }

  .ms-fab {
    display: flex;
    position: fixed;
    bottom: calc(20px + env(safe-area-inset-bottom));
    right: 20px;
    width: 52px;
    height: 52px;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: var(--ms-primary);
    color: #fff;
    cursor: pointer;
    box-shadow: 0 8px 20px var(--primary-glow-strong, rgba(15, 118, 110, 0.35));
    z-index: 70;
    transition: transform 0.15s ease;
  }

  .ms-fab:active {
    transform: scale(0.94);
  }
}

/* bottom-sheet controls only exist on mobile (enabled by the media block
   above); on desktop / tablet the sheet is inline in the grid. NOTE: these
   must be scoped to min-width — a plain rule after the max-width:700px
   block would win the cascade and hide the FAB/backdrop on phones too. */
@media (min-width: 701px) {
  .ms-fab {
    display: none;
  }

  .ms-side-backdrop {
    display: none;
  }
}

/* ─── TOUCH TARGETS (WCAG 2.5.5 / 2.5.8) ───
   Only on coarse pointers, so desktop density is unchanged. Controls with
   room grow directly; tiny ones keep their visual size and get an invisible
   44px hit area via ::after. */
@media (pointer: coarse) {
  .ms-tab {
    min-height: 52px;
  }

  .ms-slider-reset {
    position: relative;
    width: 32px;
    height: 32px;
  }

  .ms-slider-reset::after {
    content: "";
    position: absolute;
    inset: -6px;
  }

  .ms-ic-btn {
    width: 44px;
    height: 44px;
  }

  .ms-btn,
  .ms-back,
  .ms-input,
  .ms-size,
  .ms-preset,
  .lang {
    min-height: 44px;
  }

  .lang {
    min-width: 44px;
  }

  .ms-color-i {
    height: 44px;
  }

  .ms-chip {
    min-height: 44px;
    padding: 0 14px;
    display: inline-flex;
    align-items: center;
  }

  .ms-cats {
    gap: 8px;
  }

  .ms-seg button {
    min-height: 44px;
    min-width: 44px;
  }

  .ms-page-btn {
    width: 36px;
    height: 36px;
  }

  .ms-toggle {
    min-height: 48px;
  }

  .ms-tpls,
  .ms-saved,
  .ms-sizes,
  .ms-presets {
    gap: 8px;
  }

  .ms-swatch,
  .ms-sw,
  .ms-mini,
  .ms-ic {
    position: relative;
  }

  .ms-swatch::after,
  .ms-sw::after,
  .ms-mini::after,
  .ms-ic::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: max(100%, 44px);
    height: 44px;
    transform: translate(-50%, -50%);
  }

  .ms-ic {
    width: 32px;
    height: 32px;
  }

  /* 22px swatch + 22px gap keeps the 44px hit areas from overlapping */
  .ms-swatches {
    gap: 22px;
  }

  .ms-mini {
    margin-block: 6px;
  }
}

/* ─── REDUCED MOTION ───
   Keep opacity fades only; no movement, no spinners, no lift-on-hover. */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition-property: opacity !important;
    transition-duration: 0.01ms !important;
  }

  .ms-side {
    transition: none !important;
  }

  .ms-btn:hover:not(:disabled),
  .ms-back:hover,
  .lang:hover,
  .ms-tpl:hover,
  .ms-gal-card:hover,
  .ms-swatch:hover,
  .ms-fab:active {
    transform: none !important;
  }
}
</style>