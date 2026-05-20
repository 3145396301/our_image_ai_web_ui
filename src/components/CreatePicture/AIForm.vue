<template>
  <div class="ai-panel">
    <div class="panel-scroll">

      <!-- ── 顶部栏 ── -->
      <div class="panel-topbar">
        <span class="panel-title"><i class="icon-spark">✦</i> AI 绘图</span>
        <button class="lock-btn" @click="lockInfo" :class="{ locked }">
          {{ locked ? '🔒 已锁定' : '🔓 未锁定' }}
        </button>
      </div>

      <!-- ── 生成按钮 ── -->
      <button @click="generateImage" class="generate-btn" :disabled="locked">
        <span>⚡</span> {{ file ? '图生图' : '文生图' }}
      </button>
      <!-- ── 生成模型 ── -->
      <section class="card" v-if="admin">
        <div class="card-header">
          <span class="section-label">🤖 生成模型</span>
          <span class="current-tag">{{ checkpoint }}</span>
        </div>
        <div class="model-grid">
          <label v-for="item in checkpoints" :key="item.title"
                 class="model-card" :class="{ selected: checkpoint === item.title }"
                 @click="!locked && selectCheckpoint(item.title)">
            <img v-if="item.imagePath" :src="item.imagePath" class="model-img" alt="preview" />
            <div v-else class="model-placeholder">🎨</div>
            <div class="model-footer">
              <span class="model-name" :title="item.title">{{ item.title }}</span>
              <input type="radio" :value="item.title" v-model="checkpoint" :disabled="locked" class="model-radio" />
            </div>
          </label>
        </div>
      </section>

      <!-- ── 风格插件 (LoRA) ── -->
      <section class="card">
        <div class="card-header">
          <span class="section-label">🎨 风格插件 (LoRA)</span>
          <span class="badge">{{ selectedLoras.length }} 已选</span>
        </div>
        <div class="lora-grid">
          <label v-for="item in loras" :key="item.name"
                 class="lora-card" :class="{ selected: selectedLoras.includes(item.name) }">
            <div v-if="item.imagePath" class="lora-img-wrap">
              <img :src="item.imagePath" class="lora-img" alt="preview" @error="item.imagePath = null" />
            </div>
            <div v-else class="lora-placeholder">🖼️</div>
            <div class="lora-footer">
              <span class="lora-name" :title="item.name">{{ item.name }}</span>
              <input type="checkbox" :value="item.name" :disabled="locked"
                     @change="loraChange(item.name)" class="lora-check" />
            </div>
          </label>
        </div>
      </section>
      <!-- ── 提示词 ── -->
      <section class="card">
        <div class="card-header">
          <span class="section-label">✏️ 提示词</span>
          <div class="row-gap">
            <button class="ghost-btn" @click="showImportDialog('positive')" :disabled="locked">导入正向</button>
            <button class="ghost-btn" @click="showImportDialog('negative')" :disabled="locked">导入负向</button>
          </div>
        </div>
        <textarea v-model="prompt" placeholder="正向提示词，多个词用逗号分割…" :disabled="locked" class="prompt-ta"></textarea>
        <textarea v-model="negativePrompt" placeholder="负向提示词，多个词用逗号分割…" :disabled="locked" class="prompt-ta negative"></textarea>

        <div v-if="showSetWeights" class="weight-panel">
          <div v-if="promptList.length > 0">
            <p class="weight-title">正向权重</p>
            <div v-for="(item, i) in promptList" :key="'p'+i" class="weight-row">
              <span class="weight-name">{{ item.prompt }}</span>
              <input type="number" v-model.number="item.weight" step="0.1" class="weight-input">
            </div>
          </div>
          <div v-if="negativePromptList.length > 0">
            <p class="weight-title">负向权重</p>
            <div v-for="(item, i) in negativePromptList" :key="'n'+i" class="weight-row">
              <span class="weight-name">{{ item.prompt }}</span>
              <input type="number" v-model.number="item.weight" step="0.1" class="weight-input">
            </div>
          </div>
          <button class="ghost-btn" @click="saveWeights">保存权重</button>
        </div>
        <button class="ghost-btn" style="margin-top:4px"
                @click="toggleSetWeights"
                v-if="!showSetWeights && (promptList.length > 0 || negativePromptList.length > 0)"
        >⚖️ 设置权重</button>
      </section>

      <!-- ── 图生图 ── -->
      <section class="card">
        <div class="card-header">
          <span class="section-label">🖼️ 图生图</span>
          <button v-if="file" class="ghost-btn danger" @click="clearImage" :disabled="locked">清除图片</button>
        </div>
        <div class="drop-zone" @drop.prevent="onDrop" @dragover.prevent :class="{ 'has-image': !!imageSrc }">
          <input type="file" @change="onFileChange" class="file-input" :disabled="locked" />
          <div v-if="!imageSrc" class="drop-hint"><span>📂</span><span>拖拽或点击上传图片</span></div>
          <img v-else :src="imageSrc" class="preview-img" alt="预览图" />
        </div>
        <div v-show="file != null" class="sub-params">
          <div class="param-row">
            <label>重绘强度</label>
            <div class="slider-group">
              <input type="range" v-model.number="denoisingStrength" min="0" max="1" step="0.05" :disabled="locked" />
              <span class="param-val">{{ denoisingStrength.toFixed(2) }}</span>
            </div>
          </div>
          <div class="param-row">
            <label>大小重置模式</label>
            <select v-model="resizeMode" :disabled="locked" class="param-select">
              <option value="0">拉伸</option>
              <option value="1">裁剪</option>
              <option value="2">填充</option>
              <option value="3">直接缩放</option>
            </select>
          </div>
        </div>
      </section>

      <!-- ── 基础参数 ── -->
      <section class="card">
        <div class="card-header"><span class="section-label">🎛️ 基础参数</span></div>
        <div class="size-grid">
          <button v-for="size in imageSizes" :key="size" @click="selectImageSize(size)" :disabled="locked"
                  class="size-btn" :class="{ active: isSizeActive(size) }">{{ size }}</button>
        </div>
        <div class="inline-params">
          <div class="param-row half" :class="{ animate: animateWidth }">
            <label>宽 (px)</label>
            <input type="number" v-model.number="width" :disabled="locked" class="param-input">
          </div>
          <div class="param-row half" :class="{ animate: animateHeight }">
            <label>高 (px)</label>
            <input type="number" v-model.number="height" :disabled="locked" class="param-input">
          </div>
        </div>
        <div class="param-row">
          <label>采样步数</label>
          <div class="slider-group">
            <input type="range" v-model.number="steps" min="1" max="150" step="1" :disabled="locked" />
            <span class="param-val">{{ steps }}</span>
          </div>
        </div>
        <div class="param-row">
          <label>提示词引导系数 (CFG)</label>
          <div class="slider-group">
            <input type="range" v-model.number="cfgScale" min="1" max="30" step="0.5" :disabled="locked" />
            <span class="param-val">{{ cfgScale }}</span>
          </div>
        </div>
        <div class="param-row">
          <label>随机种子</label>
          <div class="seed-group">
            <input type="number" v-model.number="seed" :disabled="locked" class="param-input">
            <button class="ghost-btn" @click="randomSeed" :disabled="locked">🎲</button>
          </div>
        </div>
        <div class="param-row">
          <label>采样器</label>
          <select v-model="samplerIndex" :disabled="locked" class="param-select">
            <option v-for="(item, index) in samplers" :key="item" :value="index">{{ item }}</option>
          </select>
        </div>
      </section>

      <!-- ── 面部修复 ── -->
      <section class="card">
        <div class="card-header clickable" @click="toggleRestoreFaces">
          <span class="section-label">👤 面部修复</span>
          <div class="toggle-switch" :class="{ on: restoreFaces }">
            <div class="toggle-thumb"></div>
          </div>
        </div>
      </section>

      <!-- ── 高清修复 ── -->
      <section class="card hires-card">
        <div class="card-header clickable" @click="toggleHiresFix">
          <span class="section-label">🔍 高清修复 (Hires Fix)</span>
          <div class="toggle-switch" :class="{ on: hiresFixEnabled }">
            <div class="toggle-thumb"></div>
          </div>
        </div>
        <transition name="hires-expand">
          <div v-if="hiresFixEnabled" class="hires-params">
            <div class="param-row">
              <label>放大算法</label>
              <select v-model="hiresUpscaler" :disabled="locked" class="param-select">
                <option v-for="u in upscalers" :key="u" :value="u">{{ u }}</option>
              </select>
            </div>
            <div class="param-row">
              <label>放大倍数</label>
              <div class="slider-group">
                <input type="range" v-model.number="hiresScale" min="1" max="4" step="0.25" :disabled="locked" />
                <span class="param-val">× {{ hiresScale.toFixed(2) }}</span>
              </div>
            </div>
            <div class="hires-preview">
              <span class="hires-label">输出尺寸</span>
              <span class="hires-value">{{ Math.round(width * hiresScale) }} × {{ Math.round(height * hiresScale) }}</span>
            </div>
            <div class="param-row">
              <label>修复步数 <small>（0 = 同主步数）</small></label>
              <div class="slider-group">
                <input type="range" v-model.number="hiresSteps" min="0" max="150" step="1" :disabled="locked" />
                <span class="param-val">{{ hiresSteps === 0 ? 'Auto' : hiresSteps }}</span>
              </div>
            </div>
            <div class="param-row">
              <label>重绘强度</label>
              <div class="slider-group">
                <input type="range" v-model.number="hiresDenoising" min="0" max="1" step="0.05" :disabled="locked" />
                <span class="param-val">{{ hiresDenoising.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </transition>
      </section>



    </div><!-- /panel-scroll -->

    <!-- ── 导入弹窗 ── -->
    <transition name="fade">
      <div v-if="showDialog" class="dialog-overlay" @click.self="closeDialog">
        <div class="dialog-box">
          <p class="dialog-title">{{ dialogType === 'positive' ? '导入正向提示词' : '导入负向提示词' }}</p>
          <p class="dialog-hint">格式：<code>(一个女孩:2.0),(美丽的:1.5),18岁</code></p>
          <textarea v-model="dialogInput" placeholder="在此粘贴提示词…" class="dialog-ta"></textarea>
          <div class="dialog-actions">
            <button class="ghost-btn" @click="closeDialog">取消</button>
            <button class="primary-btn" @click="importPrompts">确定导入</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";
import url from "@/urlObj";
import urlObj from "@/urlObj";

export default {
  name: 'AIForm',
  data() {
    return {
      prompt: '',
      negativePrompt: '',
      promptList: [],
      negativePromptList: [],
      locked: false,
      checkpoints: [],
      checkpoint: '',
      loras: [],
      selectedLoras: [],
      vae: 'none',
      imageSizes: [
        '1:1 512', '1:1 1024',
        '2:3 512×768', '3:2 768×512',
        '4:3 1024×768', '3:4 768×1024',
        '16:9 1024×576', '9:16 576×1024',
      ],
      width: 512,
      height: 768,
      file: null,
      imageSrc: null,
      showSetWeights: false,
      steps: 20,
      cfgScale: 7,
      seed: -1,
      restoreFaces: false,
      samplers: [],
      samplerIndex: 0,
      animateWidth: false,
      animateHeight: false,
      denoisingStrength: 0.75,
      resizeMode: 0,
      showDialog: false,
      dialogInput: '',
      dialogType: '',
      admin: true,
      // 高清修复
      hiresFixEnabled: false,
      hiresUpscaler: 'Latent',
      hiresScale: 2,
      hiresSteps: 0,
      hiresDenoising: 0.7,
      upscalers: [
        'Latent', 'Latent (antialiased)', 'Latent (bicubic)',
        'Latent (bicubic antialiased)', 'Latent (nearest)', 'Latent (nearest-exact)',
        'None', 'Lanczos', 'Nearest', 'ESRGAN_4x', 'LDSR',
        'R-ESRGAN 4x+', 'R-ESRGAN 4x+ Anime6B', 'ScuNET GAN', 'ScuNET PSNR', 'SwinIR 4x'
      ],
    };
  },
  created() {
    this.getModels();
    this.getLoras();
    this.getCurrentModel();
    this.getSamplers();
  },
  mounted() {
    this.reset();
  },
  watch: {
    width()  { this.triggerAnimation('width'); },
    height() { this.triggerAnimation('height'); },
    prompt() { this.updatePromptList(); },
    negativePrompt() { this.updateNegativePromptList(); },
    $data: {
      handler(v) {
        localStorage.setItem("myAppData", JSON.stringify({
          prompt: v.prompt, negativePrompt: v.negativePrompt,
          width: v.width, height: v.height, steps: v.steps,
          cfgScale: v.cfgScale, seed: v.seed, samplerIndex: v.samplerIndex,
          denoisingStrength: v.denoisingStrength, restoreFaces: v.restoreFaces,
          hiresFixEnabled: v.hiresFixEnabled, hiresUpscaler: v.hiresUpscaler,
          hiresScale: v.hiresScale, hiresSteps: v.hiresSteps, hiresDenoising: v.hiresDenoising,
        }));
      },
      deep: true
    }
  },
  methods: {
    lockInfo() { this.locked = !this.locked; },
    toggleRestoreFaces() { if (!this.locked) this.restoreFaces = !this.restoreFaces; },
    toggleHiresFix() { if (!this.locked) this.hiresFixEnabled = !this.hiresFixEnabled; },
    randomSeed() { this.seed = Math.floor(Math.random() * 2147483647); },

    isSizeActive(size) {
      const m = size.match(/(\d+)[×x](\d+)/);
      if (m) return this.width === parseInt(m[1]) && this.height === parseInt(m[2]);
      const s = size.match(/1:1 (\d+)/);
      if (s) return this.width === parseInt(s[1]) && this.height === parseInt(s[1]);
      return false;
    },

    onDrop(e) {
      if (this.locked) return;
      const f = e.dataTransfer.files[0];
      if (f) { this.file = f; this.previewImage(f); }
    },
    onFileChange(e) {
      if (this.locked) return;
      const f = e.target.files[0];
      if (f) { this.file = f; this.previewImage(f); }
    },
    previewImage(file) {
      const reader = new FileReader();
      reader.onload = (e) => { this.imageSrc = e.target.result; };
      reader.readAsDataURL(file);
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => { this.width = img.width; this.height = img.height; };
    },

    selectImageSize(size) {
      if (this.locked) return;
      let m = size.match(/(\d+)[×x](\d+)/);
      if (m) { this.width = parseInt(m[1]); this.height = parseInt(m[2]); return; }
      m = size.match(/1:1 (\d+)/);
      if (m) { this.width = this.height = parseInt(m[1]); }
    },

    toggleSetWeights() { this.showSetWeights = !this.showSetWeights; },
    saveWeights() {
      this.promptList.forEach(i => { i.weight = parseFloat(i.weight); });
      this.negativePromptList.forEach(i => { i.weight = parseFloat(i.weight); });
      this.showSetWeights = false;
    },

    updatePromptList() {
      const parts = this.prompt.split(/[，,]/);
      parts.forEach(p => { if (!this.promptList.find(x => x.prompt === p)) this.promptList.push({ prompt: p, weight: 1.0 }); });
      for (let i = this.promptList.length - 1; i >= 0; i--) {
        if (!parts.includes(this.promptList[i].prompt)) this.promptList.splice(i, 1);
      }
      this.promptList.sort((a, b) => a.prompt > b.prompt ? 1 : -1);
    },
    updateNegativePromptList() {
      this.negativePromptList = this.negativePrompt.split(/[，,]/)
          .map(s => ({ prompt: s.trim(), weight: 0.5 })).filter(x => x.prompt);
    },

    triggerAnimation(prop) {
      if (prop === 'width')  { this.animateWidth  = true; setTimeout(() => { this.animateWidth  = false; }, 600); }
      else                   { this.animateHeight = true; setTimeout(() => { this.animateHeight = false; }, 600); }
    },

    loraChange(name) {
      const i = this.selectedLoras.indexOf(name);
      if (i > -1) this.selectedLoras.splice(i, 1); else this.selectedLoras.push(name);
    },

    generateImage() {
      this.$notify.info("等待请求提交");
      this.file ? this.imageToImage() : this.textToImage();
    },

    textToImage() {
      const loras = this.selectedLoras.map(name => ({ name, weight: 1.0 }));
      const data = {
        prompts: this.promptList, negativePrompts: this.negativePromptList,
        steps: this.steps, width: this.width, height: this.height,
        cfgScale: this.cfgScale, seed: this.seed, restoreFaces: this.restoreFaces,
        samplerIndex: this.samplers[this.samplerIndex], loras,
        enableHiresFix: this.hiresFixEnabled,
        ...(this.hiresFixEnabled && {
          hiresUpscaler: this.hiresUpscaler, hiresScale: this.hiresScale,
          hiresSteps: this.hiresSteps, hiresDenoising: this.hiresDenoising,
        }),
      };
      axios.post(url.aiImage.texttoimage, data)
          .then(resp => { this.$emit("submit", resp.data); })
          .catch(err => { console.error(err); this.$notify.error("提交失败"); });
      this.$notify.success("提交成功，积分已扣除 5");
    },

    imageToImage() {
      const data = {
        prompts: this.promptList, negativePrompts: this.negativePromptList,
        steps: this.steps, width: this.width, height: this.height,
        cfgScale: this.cfgScale, seed: this.seed, restoreFaces: this.restoreFaces,
        samplerIndex: this.samplers[this.samplerIndex],
        denoisingStrength: this.denoisingStrength, resizeMode: this.resizeMode,
      };
      const formData = new FormData();
      formData.append("image", this.file);
      formData.append("data", JSON.stringify(data));
      axios.post(url.aiImage.imagetoimage, formData)
          .then(resp => { this.$emit("submit", resp.data); })
          .catch(err => { console.error(err); this.$notify.error("提交失败"); });
      this.$notify.success("提交成功，积分已扣除 10");
    },

    getModels() {
      axios.get(url.setting.modelList).then(resp => {
        const data = Array.isArray(resp.data) ? resp.data : resp.data?.data || [];
        this.checkpoints = data.map(i => ({ title: i.title, imagePath: i.imagePath || null }));
      }).catch(err => { console.error('Failed to load models:', err); });
    },
    getLoras() {
      axios.get(url.setting.loraList).then(resp => {
        this.loras = Array.isArray(resp.data) ? resp.data : resp.data?.data || [];
      }).catch(err => { console.error('Failed to load loras:', err); });
    },
    getCurrentModel() {
      axios.get(url.setting.currentModel).then(resp => {
        this.checkpoint = resp.data;
      }).catch(err => { console.error('Failed to load current model:', err); });
    },
    getSamplers() {
      axios.get(url.setting.samplerList).then(resp => {
        const data = Array.isArray(resp.data) ? resp.data : resp.data?.data || [];
        this.samplers = data.map(i => i.name);
      }).catch(err => { console.error('Failed to load samplers:', err); });
    },
    selectCheckpoint(title) { this.checkpoint = title; this.changeModel(title); },
    changeModel(model) {
      axios.post(urlObj.setting.updateModel, { title: model })
          .then(() => { this.getCurrentModel(); }).catch(err => { console.error(err); });
    },
    clearImage() { this.file = null; this.imageSrc = null; this.width = 512; this.height = 768; },

    showImportDialog(type) { this.locked = true; this.dialogType = type; this.dialogInput = ''; this.showDialog = true; },
    importPrompts() {
      this.dialogInput.split(',').forEach(raw => {
        let p = raw.trim(), weight = 1.0;
        if (p.includes('(') && p.includes(')')) {
          const inner = p.slice(p.indexOf('(') + 1, p.indexOf(')'));
          const parts = inner.split(':');
          p = parts[0].trim();
          if (parts.length > 1) weight = parseFloat(parts[1]) || 1.0;
        }
        if (!p) return;
        if (this.dialogType === 'positive') {
          this.prompt += (this.prompt ? ',' : '') + p;
          this.promptList.push({ prompt: p, weight });
        } else {
          this.negativePrompt += (this.negativePrompt ? ',' : '') + p;
          this.negativePromptList.push({ prompt: p, weight });
        }
      });
      this.closeDialog();
    },
    closeDialog() { this.showDialog = false; this.dialogInput = ''; this.dialogType = ''; this.locked = false; },
    reset() {
      const saved = localStorage.getItem("myAppData");
      if (saved) Object.assign(this.$data, JSON.parse(saved));
    }
  }
};
</script>

<style scoped>
/* ══════════════════════════════════════════
   CSS 变量定义在 .ai-panel 上（不用 :root）
   scoped 样式中 :root 会被 Vue 加上 hash
   导致变量无法生效，必须放在组件根元素上
══════════════════════════════════════════ */
.ai-panel {
  /* 颜色 */
  --bg0:     #161618;
  --bg1:     #1e1e21;
  --bg2:     #28282d;
  --bg3:     #323238;
  --line:    rgba(255,255,255,0.07);
  --accent:  #7c6af7;
  --accent-d: rgba(124,106,247,0.15);
  --accent-g: rgba(124,106,247,0.35);
  --danger:  #e05c5c;
  --t1: #f0f0f2;
  --t2: #a0a0ae;
  --t3: #62626e;
  /* 尺寸 */
  --r-s: 6px;
  --r-m: 10px;
  --r-l: 14px;
  --font: 'Inter', 'PingFang SC', 'Segoe UI', system-ui, sans-serif;
  --mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* 布局 */
  width: 100%;      /* 由父级 .sidebar(320px) 控制 */
  height: 100%;     /* 撑满父级高度 */
  background: var(--bg0);
  color: var(--t1);
  font-family: var(--font);
  font-size: 13px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ── 滚动区 ── */
.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 14px 14px 60px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.panel-scroll::-webkit-scrollbar       { width: 4px; }
.panel-scroll::-webkit-scrollbar-thumb { background: var(--bg3); border-radius: 2px; }

/* ── 顶部栏 ── */
.panel-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 4px;
}
.panel-title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.icon-spark { color: var(--accent); font-style: normal; margin-right: 5px; }

.lock-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: var(--r-s);
  border: 1px solid var(--line);
  background: var(--bg2);
  color: var(--t2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.lock-btn.locked { border-color: var(--accent); color: var(--accent); background: var(--accent-d); }

/* ── 生成按钮 ── */
.generate-btn {
  width: 100%;
  padding: 13px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--r-m);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.15s, transform 0.1s;
}
.generate-btn:hover:not(:disabled) { opacity: 0.9; }
.generate-btn:active:not(:disabled) { transform: scale(0.98); }
.generate-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── 卡片 ── */
.card {
  background: var(--bg1);
  border: 1px solid var(--line);
  border-radius: var(--r-l);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.card-header.clickable { cursor: pointer; user-select: none; }
.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--t2);
}
.row-gap { display: flex; gap: 6px; }

/* ── 通用按钮 ── */
.ghost-btn {
  padding: 5px 10px;
  border-radius: var(--r-s);
  border: 1px solid var(--line);
  background: var(--bg2);
  color: var(--t2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.ghost-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
.ghost-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ghost-btn.danger:hover { border-color: var(--danger); color: var(--danger); }

.primary-btn {
  padding: 8px 16px;
  border-radius: var(--r-s);
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.primary-btn:hover { opacity: 0.88; }

/* ── 提示词 ── */
.prompt-ta {
  width: 100%;
  min-height: 72px;
  padding: 10px;
  background: var(--bg2);
  border: 1px solid var(--line);
  border-radius: var(--r-m);
  color: var(--t1);
  font-size: 12.5px;
  font-family: var(--font);
  resize: vertical;
  line-height: 1.6;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.prompt-ta:focus { outline: none; border-color: var(--accent); }
.prompt-ta.negative { min-height: 52px; }
.prompt-ta::placeholder { color: var(--t3); }
.prompt-ta:disabled { opacity: 0.5; }

/* 权重 */
.weight-panel {
  background: var(--bg2);
  border-radius: var(--r-m);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.weight-title { font-size: 11px; color: var(--accent); font-weight: 700; text-transform: uppercase; }
.weight-row   { display: flex; align-items: center; gap: 8px; }
.weight-name  { flex: 1; font-size: 12px; color: var(--t2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.weight-input { width: 64px; padding: 4px 6px; background: var(--bg3); border: 1px solid var(--line); border-radius: var(--r-s); color: var(--t1); font-size: 12px; text-align: right; }

/* ── 图生图 / 上传 ── */
.drop-zone {
  border: 1.5px dashed var(--bg3);
  border-radius: var(--r-m);
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
  cursor: pointer;
}
.drop-zone:hover { border-color: var(--accent); }
.drop-zone.has-image { border-style: solid; }
.file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
.drop-hint  { display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--t3); font-size: 12px; pointer-events: none; }
.preview-img { width: 100%; max-height: 160px; object-fit: contain; display: block; }
.sub-params { display: flex; flex-direction: column; gap: 10px; }

/* ── 参数行 ── */
.param-row { display: flex; flex-direction: column; gap: 6px; }
.param-row label { font-size: 11.5px; color: var(--t2); font-weight: 500; }
.param-row label small { color: var(--t3); font-weight: 400; }
.inline-params { display: flex; gap: 10px; }
.param-row.half { flex: 1; }

.slider-group { display: flex; align-items: center; gap: 10px; }
.slider-group input[type="range"] { flex: 1; accent-color: var(--accent); cursor: pointer; }
.param-val {
  font-size: 12px; font-weight: 700; color: var(--accent);
  min-width: 46px; text-align: right; font-family: var(--mono);
}

.param-input {
  width: 100%; padding: 7px 10px;
  background: var(--bg2); border: 1px solid var(--line);
  border-radius: var(--r-s); color: var(--t1); font-size: 13px;
  transition: border-color 0.15s; box-sizing: border-box;
}
.param-input:focus { outline: none; border-color: var(--accent); }
.param-input:disabled { opacity: 0.5; }

.param-select {
  width: 100%; padding: 7px 28px 7px 10px;
  background: var(--bg2); border: 1px solid var(--line);
  border-radius: var(--r-s); color: var(--t1); font-size: 13px;
  cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%2362626e' d='M5 6L0 0h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
  box-sizing: border-box;
}
.param-select:disabled { opacity: 0.5; }

.seed-group { display: flex; gap: 6px; }
.seed-group .param-input { flex: 1; }
.seed-group .ghost-btn { padding: 7px 10px; font-size: 14px; }

/* 尺寸快选 */
.size-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.size-btn {
  padding: 6px 4px; background: var(--bg2);
  border: 1px solid var(--line); border-radius: var(--r-s);
  color: var(--t2); font-size: 11px; cursor: pointer; text-align: center; transition: all 0.15s;
}
.size-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
.size-btn.active { background: var(--accent-d); border-color: var(--accent); color: var(--accent); font-weight: 700; }
.size-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.animate .param-input { animation: pulse-in 0.5s ease; }
@keyframes pulse-in {
  0%   { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-g); }
  100% { border-color: var(--line);   box-shadow: none; }
}

/* ── 高清修复 ── */
.hires-card { border-color: rgba(124,106,247,0.2); }
.toggle-switch {
  width: 36px; height: 20px; border-radius: 10px;
  background: var(--bg3); position: relative;
  transition: background 0.2s; border: 1px solid var(--line); flex-shrink: 0;
}
.toggle-switch.on { background: var(--accent); border-color: var(--accent); }
.toggle-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 14px; height: 14px; border-radius: 50%;
  background: #fff; transition: transform 0.2s;
}
.toggle-switch.on .toggle-thumb { transform: translateX(16px); }
.hires-params { display: flex; flex-direction: column; gap: 10px; padding-top: 4px; border-top: 1px solid var(--line); }
.hires-preview {
  display: flex; align-items: center; gap: 10px;
  background: var(--accent-d); border: 1px solid var(--accent-g);
  border-radius: var(--r-s); padding: 8px 12px;
}
.hires-label { font-size: 11px; color: var(--accent); font-weight: 700; text-transform: uppercase; }
.hires-value { font-family: var(--mono); font-size: 14px; font-weight: 700; color: var(--t1); }
.hires-expand-enter-active, .hires-expand-leave-active {
  transition: max-height 0.3s ease, opacity 0.25s ease; max-height: 600px; overflow: hidden;
}
.hires-expand-enter-from, .hires-expand-leave-to { max-height: 0; opacity: 0; }

/* ── 模型卡片 ── */
.current-tag {
  font-size: 11px; padding: 2px 8px;
  background: var(--accent-d); border: 1px solid var(--accent-g);
  border-radius: 99px; color: var(--accent);
  max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.model-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 440px; overflow-y: auto; }
.model-grid::-webkit-scrollbar { width: 3px; }
.model-grid::-webkit-scrollbar-thumb { background: var(--bg3); border-radius: 2px; }

@media (max-width: 360px) {
  .model-grid { grid-template-columns: 1fr; }
}

.model-card {
  border: 1.5px solid var(--line); border-radius: var(--r-m); overflow: hidden;
  cursor: pointer; display: flex; flex-direction: column; background: var(--bg2);
  transition: border-color 0.15s, transform 0.1s;
}
.model-card:hover { border-color: var(--accent); }
.model-card:active { transform: scale(0.97); }
.model-card.selected { border-color: var(--accent); background: var(--accent-d); }
.model-img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
.model-placeholder {
  width: 100%; aspect-ratio: 1; background: var(--bg3);
  display: flex; align-items: center; justify-content: center; font-size: 24px;
}
.model-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 8px; gap: 4px;
}
.model-name { flex: 1; font-size: 11px; color: var(--t2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.model-card.selected .model-name { color: var(--accent); }
.model-radio { width: 13px; height: 13px; flex-shrink: 0; accent-color: var(--accent); }

/* ── LoRA ── */
.badge {
  font-size: 11px; padding: 2px 8px;
  background: var(--bg2); border: 1px solid var(--line);
  border-radius: 99px; color: var(--t3);
}
.lora-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 440px; overflow-y: auto; }
.lora-grid::-webkit-scrollbar { width: 3px; }
.lora-grid::-webkit-scrollbar-thumb { background: var(--bg3); border-radius: 2px; }

@media (max-width: 360px) {
  .lora-grid { grid-template-columns: 1fr; }
}

.lora-card {
  min-height: 165px;
  border: 1.5px solid var(--line); border-radius: var(--r-m); overflow: hidden;
  cursor: pointer; display: flex; flex-direction: column; background: var(--bg2);
  transition: border-color 0.15s, transform 0.1s;
}
.lora-card:hover { border-color: var(--accent); }
.lora-card:active { transform: scale(0.97); }
.lora-card.selected { border-color: var(--accent); background: var(--accent-d); }
.lora-img-wrap {
  width: 100%; aspect-ratio: 1; overflow: hidden;
  background: var(--bg3); display: flex; align-items: center; justify-content: center;
}
.lora-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lora-placeholder {
  width: 100%; height: 90px; background: var(--bg3);
  display: flex; align-items: center; justify-content: center; font-size: 22px;
}
.lora-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 8px; gap: 4px;
}
.lora-name { flex: 1; font-size: 11px; color: var(--t2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lora-card.selected .lora-name { color: var(--accent); }
.lora-check { width: 13px; height: 13px; flex-shrink: 0; accent-color: var(--accent); }

/* ── 弹窗 ── */
.dialog-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; backdrop-filter: blur(2px);
}
.dialog-box {
  width: 88%; background: var(--bg1);
  border: 1px solid var(--line); border-radius: var(--r-l);
  padding: 20px; display: flex; flex-direction: column; gap: 12px;
  box-shadow: 0 24px 48px rgba(0,0,0,0.5);
}
.dialog-title { font-size: 14px; font-weight: 600; color: var(--t1); }
.dialog-hint  { font-size: 11.5px; color: var(--t3); line-height: 1.5; }
.dialog-hint code {
  font-family: var(--mono); font-size: 11px;
  background: var(--bg3); padding: 1px 5px; border-radius: 4px; color: var(--accent);
}
.dialog-ta {
  width: 100%; min-height: 100px; padding: 10px;
  background: var(--bg2); border: 1px solid var(--line);
  border-radius: var(--r-m); color: var(--t1);
  font-size: 12.5px; font-family: var(--font); resize: vertical; line-height: 1.6;
  box-sizing: border-box;
}
.dialog-ta:focus { outline: none; border-color: var(--accent); }
.dialog-ta::placeholder { color: var(--t3); }
.dialog-actions { display: flex; justify-content: flex-end; gap: 8px; }

/* ── 移动端触控适配 ── */
@media (hover: none) and (pointer: coarse) {
  .ghost-btn,
  .primary-btn,
  .lock-btn {
    min-height: 44px;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .size-btn {
    min-height: 44px;
    padding: 10px 4px;
  }
  .param-input,
  .param-select {
    min-height: 44px;
    font-size: 16px; /* 防止 iOS 自动缩放 */
  }
  .prompt-ta {
    font-size: 16px; /* 防止 iOS 自动缩放 */
  }
  .slider-group input[type="range"] {
    height: 28px;
  }
  .seed-group .ghost-btn {
    min-height: 44px;
    min-width: 44px;
  }
}
</style>