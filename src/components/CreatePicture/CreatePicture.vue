<template>
  <div class="createPicture" :class="{ 'is-mobile': isMobile }">

    <!-- ────────────────── Sidebar (AIForm) ────────────────── -->
    <div class="sidebar" :style="sidebarStyle">
      <!-- Mobile-only collapse header -->
      <div
          v-if="isMobile"
          class="mobile-sidebar-header"
          @click="toggleMobileSidebar"
      >
        <span class="header-label">⚙ 参数设置</span>
        <span class="header-arrow">{{ mobileSidebarOpen ? '▲' : '▼' }}</span>
      </div>

      <div class="sidebar-inner" :class="{ 'sidebar-inner--hidden': isMobile && !mobileSidebarOpen }">
        <AIForm @submit="addTask" />
      </div>
    </div>

    <!-- ── Handle 1: col-resize (desktop) / row-resize (mobile) ── -->
    <div
        class="resize-handle resize-handle--primary"
        @mousedown.prevent="startPrimaryResize"
        @touchstart.prevent="startPrimaryResizeTouch"
        :title="isMobile ? '拖动调整高度' : '拖动调整宽度'"
    >
      <span class="rh-bar"></span>
      <span class="rh-dots">
        <i></i><i></i><i></i>
      </span>
    </div>

    <!-- ────────────────── Content area ────────────────── -->
    <div ref="content" class="content">

      <!-- Preview -->
      <div class="preview-wrap" :style="previewStyle">
        <div class="previewDiv" v-show="tasks.length > 0">
          <EffectPreview
              v-for="task in tasks"
              :key="task"
              :taskId="task"
              :isHistory="true"
              @delete="deleteTask"
              @view="viewImage"
              @share="showShareFormView"
          />
        </div>

        <div class="no-preview" v-show="tasks.length === 0">
          <div class="no-preview-inner">
            <img src="@/assets/找不到结果.png" class="no-preview-img" alt="暂无预览" />
            <span class="no-preview-title">暂无生成记录</span>
            <span class="no-preview-sub">在左侧填写参数后点击「生成」开始创作</span>
          </div>
        </div>
      </div>

      <!-- ── Handle 2: row-resize (always vertical) ── -->
      <div
          class="resize-handle resize-handle--secondary"
          @mousedown.prevent="startSecondaryResize"
          @touchstart.prevent="startSecondaryResizeTouch"
          title="拖动调整高度"
      >
        <span class="rh-bar"></span>
        <span class="rh-dots">
          <i></i><i></i><i></i>
        </span>
      </div>

      <!-- Operations -->
      <div class="operations-wrap">
        <OtherOperations
            @refresh="getRecentlyGenerated"
            @show-history="showHistory"
            @share="share"
            @recharge="rechargeAccount"
            @logout="logout"
        />
      </div>

    </div>

    <!-- ────────────────── Overlays ────────────────── -->
    <XyzTransition xyz="fade flip-left perspective-1">
      <div class="square" v-if="showImageView">
        <ImageView @close="showImageView = false" :src="showImageViewSrc" />
      </div>
    </XyzTransition>

    <XyzTransition xyz="fade flip-left perspective-1">
      <div class="square" v-if="showShareForm">
        <ShareForm
            @close="showShareForm = false"
            :src="shareInfo.src"
            :task-id="shareInfo.taskId"
        />
      </div>
    </XyzTransition>

  </div>
</template>

<script>
import AIForm from "@/components/CreatePicture/AIForm.vue";
import EffectPreview from "@/components/CreatePicture/EffectPreview.vue";
import ImageView from "@/components/CreatePicture/ImageView.vue";
import OtherOperations from "@/components/CreatePicture/OtherOperations.vue";
import ShareForm from "@/components/CreatePicture/ShareForm.vue";
import axios from "axios";
import urlObj from "@/urlObj";

// ── LocalStorage keys ──────────────────────────────────────────────────────
const K_SIDEBAR_W   = "cp_sidebarW";
const K_PREVIEW_H   = "cp_previewH";
const K_M_SIDEBAR_H = "cp_mobileSidebarH";

// ── Desktop constants ──────────────────────────────────────────────────────
const DT_SIDEBAR_MIN     = 220;
const DT_SIDEBAR_MAX     = 680;
const DT_SIDEBAR_DEFAULT = 320;
const DT_CONTENT_MIN     = 380;  // minimum content panel width

// ── Mobile constants ───────────────────────────────────────────────────────
const MB_BREAKPOINT       = 768;
const MB_SIDEBAR_HEADER_H = 48;   // collapsed header height
const MB_SIDEBAR_MIN      = MB_SIDEBAR_HEADER_H;
const MB_SIDEBAR_MAX      = 620;
const MB_SIDEBAR_DEFAULT  = 280;

// ── Shared constants ───────────────────────────────────────────────────────
const HANDLE_SIZE          = 10;
const PREVIEW_MIN          = 80;
const OPS_MIN              = 60;
const PREVIEW_DEFAULT_RATIO        = 0.58; // 58 % of content height initially
const PREVIEW_DEFAULT_RATIO_MOBILE = 0.40; // 40 % on mobile — leaves more room for operations

export default {
  name: "CreatePicture",
  components: { ShareForm, ImageView, AIForm, EffectPreview, OtherOperations },

  // ── State ──────────────────────────────────────────────────────────────
  data() {
    return {
      tasks: [],
      showImageView: false,
      showImageViewSrc: "",
      showShareForm: false,
      shareInfo: {},

      // Desktop layout
      sidebarWidth: DT_SIDEBAR_DEFAULT,

      // Mobile layout
      isMobile: false,
      mobileSidebarOpen: true,
      mobileSidebarHeight: MB_SIDEBAR_DEFAULT,

      // Shared layout
      previewHeight: 0,   // initialised in mounted
    };
  },

  // ── Computed ───────────────────────────────────────────────────────────
  computed: {
    sidebarStyle() {
      if (this.isMobile) {
        const h = this.mobileSidebarOpen
            ? this.mobileSidebarHeight
            : MB_SIDEBAR_HEADER_H;
        return { height: h + "px", overflow: "hidden" };
      }
      return { width: this.sidebarWidth + "px" };
    },

    previewStyle() {
      return { flex: `0 0 ${this.previewHeight}px`, minHeight: "0" };
    },
  },

  // ── Lifecycle ─────────────────────────────────────────────────────────
  created() {
    this.getRecentlyGenerated();
  },

  mounted() {
    this.isMobile = window.innerWidth < MB_BREAKPOINT;
    const ratio = this.isMobile ? PREVIEW_DEFAULT_RATIO_MOBILE : PREVIEW_DEFAULT_RATIO;
    this.previewHeight = Math.round(window.innerHeight * ratio);
    this._loadStorage();
    this._clampAll();
    window.addEventListener("resize", this._onWindowResize);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this._onWindowResize);
    this._resetBodyStyles();
  },

  // ── Methods ───────────────────────────────────────────────────────────
  methods: {

    // ── Business logic ─────────────────────────────────────────────────

    addTask(taskId) {
      if (this.tasks.length >= 10) this.tasks.pop();
      this.tasks.unshift(taskId);
    },

    getRecentlyGenerated() {
      axios.get(urlObj.aiImage.recentlyGenerated).then((res) => {
        if (res.data.code === 200) this.tasks = res.data.data.records;
      });
    },

    deleteTask(taskId) {
      this.tasks.splice(this.tasks.indexOf(taskId), 1);
    },

    viewImage(url) {
      this.showImageViewSrc = url;
      this.showImageView = true;
    },

    showShareFormView(data) {
      this.shareInfo = { src: data.src, taskId: data.taskId };
      this.showShareForm = true;
    },

    showHistory()    { this.$router.push("/history");  },
    share()          { this.$router.push("/share");    },
    rechargeAccount(){ this.$router.push("/recharge"); },

    logout() {
      axios.get(urlObj.user.logout).then((res) => {
        if (res.data.code === 200) {
          localStorage.removeItem("satoken");
          this.$router.push("/login");
        }
      });
    },

    toggleMobileSidebar() {
      this.mobileSidebarOpen = !this.mobileSidebarOpen;
      this.$nextTick(this._clampPreviewHeight);
    },

    // ── Storage ────────────────────────────────────────────────────────

    _loadStorage() {
      const sw  = parseFloat(localStorage.getItem(K_SIDEBAR_W));
      const ph  = parseFloat(localStorage.getItem(K_PREVIEW_H));
      const msh = parseFloat(localStorage.getItem(K_M_SIDEBAR_H));
      if (sw  > 0) this.sidebarWidth       = sw;
      if (ph  > 0) this.previewHeight      = ph;
      if (msh > 0) this.mobileSidebarHeight = msh;
    },

    _saveStorage() {
      localStorage.setItem(K_SIDEBAR_W,   this.sidebarWidth);
      localStorage.setItem(K_PREVIEW_H,   this.previewHeight);
      localStorage.setItem(K_M_SIDEBAR_H, this.mobileSidebarHeight);
    },

    // ── Clamping ───────────────────────────────────────────────────────

    _clampAll() {
      this._clampSidebarWidth();
      this._clampMobileSidebarHeight();
      this._clampPreviewHeight();
    },

    _clampSidebarWidth() {
      const maxByViewport = Math.max(
          DT_SIDEBAR_MIN,
          window.innerWidth - DT_CONTENT_MIN - HANDLE_SIZE
      );
      const maxAllowed = Math.min(DT_SIDEBAR_MAX, maxByViewport);
      this.sidebarWidth = Math.max(DT_SIDEBAR_MIN, Math.min(this.sidebarWidth, maxAllowed));
    },

    _clampMobileSidebarHeight() {
      this.mobileSidebarHeight = Math.max(
          MB_SIDEBAR_MIN,
          Math.min(this.mobileSidebarHeight, MB_SIDEBAR_MAX)
      );
    },

    _clampPreviewHeight() {
      const contentEl = this.$refs.content;
      const contentH  = contentEl
          ? contentEl.clientHeight
          : window.innerHeight * 0.7;
      const maxH = contentH - OPS_MIN - HANDLE_SIZE;
      this.previewHeight = Math.max(PREVIEW_MIN, Math.min(this.previewHeight, maxH));
    },

    _onWindowResize() {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < MB_BREAKPOINT;
      if (wasMobile !== this.isMobile) {
        // Reset preview ratio on layout flip
        const ratio = this.isMobile ? PREVIEW_DEFAULT_RATIO_MOBILE : PREVIEW_DEFAULT_RATIO;
        this.previewHeight = Math.round(window.innerHeight * ratio);
      }
      this._clampAll();
    },

    // ── Resize handlers ────────────────────────────────────────────────

    startPrimaryResize(e)      { this._beginDrag(e.clientX, e.clientY, "primary"); },
    startPrimaryResizeTouch(e) { this._beginDrag(e.touches[0].clientX, e.touches[0].clientY, "primary"); },

    startSecondaryResize(e)      { this._beginDrag(e.clientX, e.clientY, "secondary"); },
    startSecondaryResizeTouch(e) { this._beginDrag(e.touches[0].clientX, e.touches[0].clientY, "secondary"); },

    // ── Core drag engine ───────────────────────────────────────────────

    _beginDrag(startX, startY, type) {
      const isHorizontal = type === "primary" && !this.isMobile;
      document.body.style.userSelect = "none";
      document.body.style.cursor     = isHorizontal ? "col-resize" : "row-resize";

      const onMove = (cx, cy) => {
        if (type === "primary") {
          if (this.isMobile) {
            // Mobile: cy = distance from viewport top = sidebar height
            let h = Math.max(MB_SIDEBAR_MIN, Math.min(cy, MB_SIDEBAR_MAX));
            this.mobileSidebarHeight = h;
            // Auto-expand if dragged past header zone
            this.mobileSidebarOpen = h > MB_SIDEBAR_HEADER_H + 16;
          } else {
            // Desktop: cx = distance from viewport left = sidebar width
            const maxByViewport = Math.max(
                DT_SIDEBAR_MIN,
                window.innerWidth - DT_CONTENT_MIN - HANDLE_SIZE
            );
            const maxAllowed = Math.min(DT_SIDEBAR_MAX, maxByViewport);
            this.sidebarWidth = Math.max(DT_SIDEBAR_MIN, Math.min(cx, maxAllowed));
          }
        } else {
          // Secondary: always row-resize for preview height
          const contentEl = this.$refs.content;
          if (!contentEl) return;
          const top      = contentEl.getBoundingClientRect().top;
          const contentH = contentEl.clientHeight;
          const maxH     = contentH - OPS_MIN - HANDLE_SIZE;
          this.previewHeight = Math.max(PREVIEW_MIN, Math.min(cy - top, maxH));
        }
      };

      const onMouseMove = (e)  => onMove(e.clientX, e.clientY);
      const onTouchMove = (e)  => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); };
      const stop = () => {
        this._resetBodyStyles();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup",   stop);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend",  stop);
        this._saveStorage();
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup",   stop);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend",  stop);
    },

    _resetBodyStyles() {
      document.body.style.userSelect = "";
      document.body.style.cursor     = "";
    },
  },
};
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   Root container
═══════════════════════════════════════════════════════════════ */
.createPicture {
  display: flex;
  flex-direction: row;          /* desktop default */
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #111113;
}

/* ═══════════════════════════════════════════════════════════════
   Sidebar
═══════════════════════════════════════════════════════════════ */
.sidebar {
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.55);
  z-index: 2;
  transition: height 0.22s ease;  /* smooth mobile collapse */
}

.sidebar-inner {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
.sidebar-inner--hidden {
  display: none;
}

/* mobile collapse header (only rendered when isMobile) */
.mobile-sidebar-header {
  flex-shrink: 0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  cursor: pointer;
  background: #1e1e24;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.header-label {
  font-size: 13px;
  font-weight: 600;
  color: #b0b0bc;
  letter-spacing: 0.04em;
}
.header-arrow {
  font-size: 11px;
  color: #606070;
}

/* ═══════════════════════════════════════════════════════════════
   Resize handles — shared base
═══════════════════════════════════════════════════════════════ */
.resize-handle {
  flex-shrink: 0;
  position: relative;
  z-index: 3;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}

/* thin accent bar */
.rh-bar {
  position: absolute;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 2px;
  transition: background 0.18s ease, transform 0.18s ease;
  pointer-events: none;
}

/* dot group */
.rh-dots {
  display: flex;
  gap: 3px;
  position: relative;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.18s ease;
}
.rh-dots i {
  display: block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  font-style: normal;
}

.resize-handle:hover .rh-bar,
.resize-handle:active .rh-bar {
  background: rgba(255, 255, 255, 0.22);
  transform: scale(1.5);
}
.resize-handle:hover .rh-dots,
.resize-handle:active .rh-dots {
  opacity: 1;
}

/* ── Primary handle (col-resize on desktop) ── */
.resize-handle--primary {
  width: 10px;
  height: 100%;
  cursor: col-resize;
  flex-direction: column;
}
.resize-handle--primary .rh-bar {
  top: 0; bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
}
.resize-handle--primary:hover .rh-bar,
.resize-handle--primary:active .rh-bar {
  transform: translateX(-50%) scaleX(1.5);
}
.resize-handle--primary .rh-dots {
  flex-direction: column;
}

/* ── Secondary handle (row-resize, always) ── */
.resize-handle--secondary {
  width: 100%;
  height: 10px;
  cursor: row-resize;
  flex-direction: row;
}
.resize-handle--secondary .rh-bar {
  left: 0; right: 0;
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
}
.resize-handle--secondary:hover .rh-bar,
.resize-handle--secondary:active .rh-bar {
  transform: translateY(-50%) scaleY(1.5);
}

/* ═══════════════════════════════════════════════════════════════
   Content (preview + operations)
═══════════════════════════════════════════════════════════════ */
.content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ── Preview panel ── */
.preview-wrap {
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.previewDiv {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  height: 100%;
  padding: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  box-sizing: border-box;
  align-items: stretch;
}
.previewDiv::-webkit-scrollbar { height: 6px; }
.previewDiv::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
.previewDiv::-webkit-scrollbar-track { background: transparent; }

.no-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #171719;
}
.no-preview-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.no-preview-img {
  width: 72px;
  opacity: 0.18;
  filter: grayscale(1);
}
.no-preview-title {
  font-size: 15px;
  font-weight: 600;
  color: #9090a0;
}
.no-preview-sub {
  font-size: 12px;
  color: #464655;
}

/* ── Operations panel ── */
.operations-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: #161618;
}

/* ═══════════════════════════════════════════════════════════════
   Mobile overrides  (.is-mobile)
═══════════════════════════════════════════════════════════════ */
.is-mobile {
  flex-direction: column;
}

/* Sidebar becomes full-width, height-driven */
.is-mobile .sidebar {
  width: 100% !important;
  height: auto;            /* controlled by inline style */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.55);
  transition: height 0.22s ease;
}

/* Primary handle becomes row-resize on mobile */
.is-mobile .resize-handle--primary {
  width: 100%;
  height: 10px;
  cursor: row-resize;
}
.is-mobile .resize-handle--primary .rh-bar {
  /* override vertical bar → horizontal */
  top: 50%; bottom: auto;
  left: 0;  right: 0;
  width: auto;
  height: 2px;
  transform: translateY(-50%);
}
.is-mobile .resize-handle--primary:hover .rh-bar,
.is-mobile .resize-handle--primary:active .rh-bar {
  transform: translateY(-50%) scaleY(1.5);
}
.is-mobile .resize-handle--primary .rh-dots {
  flex-direction: row;
}

/* Content fills remaining height */
.is-mobile .content {
  flex: 1;
  width: 100%;
  height: auto;
}

/* Preview wraps on mobile for better space usage */
.is-mobile .previewDiv {
  flex-wrap: wrap;
  overflow-x: hidden;
  overflow-y: auto;
  align-items: flex-start;
}
.is-mobile .previewDiv::-webkit-scrollbar { width: 4px; height: 0; }

/* ═══════════════════════════════════════════════════════════════
   Overlay layers
═══════════════════════════════════════════════════════════════ */
.square {
  position: fixed;
  inset: 0;
  z-index: 100;
}
</style>