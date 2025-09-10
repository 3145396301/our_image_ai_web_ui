<template>
  <div class="container">
    <div class="scroll-container">
      <div class="header">
        <button class="lock-button" @click="lockInfo">{{ locked ? '🔒 信息已锁定' : '🔓 信息未锁定' }}</button>
      </div>
      <div class="form-group">
        <button @click="showImportDialog('positive')">导入正向提示词</button>
        <button @click="showImportDialog('negative')">导入负向提示词</button>
      </div>
      <div class="form-group">
        <label for="prompt">提示词 (Prompt)</label>
        <textarea id="prompt" v-model="prompt" placeholder="请输入提示词，多个词用逗号分割"
                  :disabled="locked"></textarea>
      </div>
      <div class="form-group">
        <label for="negative-prompt">否定词 (negative prompt)</label>
        <textarea id="negative-prompt" v-model="negativePrompt" placeholder="请输入否定词，多个词用逗号分割"
                  :disabled="locked"></textarea>
      </div>
      <div class="form-group">
        <label for="image2image">图生图 (image2image)</label>
        <div class="upload-box" @drop.prevent="onDrop" @dragover.prevent>
          拖拽图片到此处上传
          <input type="file" @change="onFileChange" class="file-input" :disabled="locked"/>
        </div>
        <div v-if="imageSrc" class="image-preview">
          <img :src="imageSrc" alt="Image preview"/>
        </div>
      </div>
      <!--   如果有图片则显示表单项 重绘强度、大小重置模式   -->
      <div v-show="file!=null" class="form-group">
        <label for="denoisingStrength">重绘强度 (Denoising Strength)</label>
        <input type="number" v-model.number="denoisingStrength" :disabled="locked" min="0" max="1" step="0.05">
      </div>
      <div v-show="file!=null" class="form-group">
        <label for="resizeMode">大小重置模式 (Resize Mode)</label>
        <!-- 0-拉伸  1-裁剪  2-填充  3-直接缩放-->
        <select id="resizeMode" v-model="resizeMode" :disabled="locked">
          <option value="0">拉伸</option>
          <option value="1">裁剪</option>
          <option value="2">填充</option>
          <option value="3">直接缩放</option>
        </select>
      </div>
      <div v-if="file!=null" class="form-group">
        <button @click="clearImage">清除图片</button>
      </div>
      <div class="settings">
        <div class="form-group" v-if="admin">
          <label for="checkpoint">生成模型 (Checkpoint等)</label>
          <select id="checkpoint" v-model="checkpoint" @change="changeModel(checkpoint)" :disabled="locked">
            <option v-for="item in checkpoints" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="lor">风格插件 (Lora等)</label>
          <div class="loras-container">
            <div v-for="item in loras" class="loras" :key="item.name">
              <div class="lora-item">{{ item.name }}</div>
              <input type="checkbox" :value="item.metadata.ss_output_name" :disabled="locked" @change="loraChange(item.metadata.ss_output_name)"
                     class="lora-item-chackbox"/>
            </div>
          </div>
        </div>
<!--        <div class="form-group">-->
<!--          <label for="vae">解码器 (VAE)</label>-->
<!--          <select id="vae" v-model="vae" :disabled="locked">-->
<!--            <option value="none">None</option>-->
<!--          </select>-->
<!--        </div>-->
        <div class="form-group">
          <label>图片尺寸</label>
          <div class="image-sizes">
            <button v-for="size in imageSizes" :key="size" @click="selectImageSize(size)" :disabled="locked">{{ size }}
            </button>
          </div>
        </div>
        <div class="form-group inline-group">
          <div class="inline-item" :class="{'animate': animateWidth}">
            <label>宽</label>
            <input type="number" v-model.number="width" :disabled="locked">
          </div>
          <div class="inline-item" :class="{'animate': animateHeight}">
            <label>高</label>
            <input type="number" v-model.number="height" :disabled="locked">
          </div>
        </div>
        <div class="form-group">
          <label for="steps">采样步数 (Steps)</label>
          <input type="number" v-model.number="steps" :disabled="locked">
        </div>
        <div class="form-group">
          <label for="cfgScale">提示词引导系数 (CFG Scale)</label>
          <input type="number" v-model.number="cfgScale" :disabled="locked" min="1">
        </div>
        <div class="form-group">
          <label for="seed">随机种子 (Seed)</label>
          <input type="number" v-model.number="seed" :disabled="locked">
        </div>
<!--        <div class="form-group">-->
<!--          <label>是否还原人脸 (Restore Faces)</label>-->
<!--          <input type="radio" v-model="restoreFaces" :value="true" :disabled="locked"> 是-->
<!--          <input type="radio" v-model="restoreFaces" :value="false" :disabled="locked"> 否-->
<!--        </div>-->
        <div class="form-group">
          <label for="samplerIndex">采样器 (Sampler Index)</label>
          <select id="samplerIndex" v-model="samplerIndex" :disabled="locked">
            <option v-for="(item, index) in samplers" :key="item.name" :value="index">{{ item }}</option>
          </select>
        </div>
        <div class="form-group">
          <div v-if="showSetWeights">
            <h3>设置权重</h3>
            <h4 v-if="promptList.length>0">正向</h4>
            <div v-for="(item, index) in promptList" :key="index" class="weight-item">
              <label>{{ item.prompt }}</label>
              <input type="number" v-model.number="item.weight">
            </div>
            <h4 v-if="negativePromptList.length>0">负向</h4>
            <div v-for="(item, index) in negativePromptList" :key="index" class="weight-item">
              <label>{{ item.prompt }}</label>
              <input type="number" v-model.number="item.weight">
            </div>
            <button @click="saveWeights">保存</button>
          </div>
          <button @click="toggleSetWeights"
                  v-if="!showSetWeights && (promptList.length > 0 || negativePromptList.length > 0)">设置权重
          </button>
        </div>
      </div>
      <div class="footer">
        <button @click="generateImage" class="subBut">生成</button>
      </div>
      <!-- Dialog for importing prompts -->
      <div v-if="showDialog" class="dialog-overlay">
        <div class="dialog">
          <h3>{{ dialogType === 'positive' ? '导入正向提示词' : '导入负向提示词' }}</h3>
          <textarea v-model="dialogInput" placeholder="请输入提示词，多个词用逗号分割"></textarea>
          <div class="dialog-buttons">
            <button @click="importPrompts">确定</button>
            <button @click="closeDialog">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from "axios";
import url from "@/urlObj";

export default {
  name: 'AIImageGenerator',
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
      lor: '',
      vae: 'none',
      imageSizes: ['1:1 512x512', '1:1 1024x1024', '2:3 512x768', '3:2 768x512', '4:3 1024x768', '3:4 768x1024', '16:9 1024x576', '9:16 576x1024', '1:2 512x1024', '2:1 1024x512'],
      width: 512,
      height: 768,
      selectedTab: 0,
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
      admin:true
    };
  },
  created() {
    this.getModels()
    this.getLoras()
    this.getCurrentModel()
    this.getSamplers()
  },
  watch: {
    width(newVal, oldVal) {
      this.triggerAnimation('width');
    },
    height(newVal, oldVal) {
      this.triggerAnimation('height');
    },
    prompt: {
      handler() {
        this.updatePromptList();
      },
    },
    negativePrompt: {
      handler() {
        this.updateNegativePromptList();
      },
    },
  },
  methods: {
    // 锁定/解锁
    lockInfo() {
      this.locked = !this.locked;
    },
    // 拖拽
    onDrop(event) {
      if (this.locked) return;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.file = files[0];
        this.previewImage(this.file);
      }

    },
    // 选择文件
    onFileChange(event) {
      if (this.locked) return;
      const files = event.target.files;
      if (files.length > 0) {
        this.file = files[0];
        this.previewImage(this.file);
      }
    },
    // 预览图片
    previewImage(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageSrc = e.target.result;
      };
      reader.readAsDataURL(file);
      //设置宽高为图片的宽高
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        this.width = img.width;
        this.height = img.height;
      };
    },
    // 切换选项卡
    selectTab(index) {
      if (this.locked) return;
      this.selectedTab = index;
    },
    // 选择图片尺寸
    selectImageSize(size) {
      if (this.locked) return;
      const dimensions = size.match(/(\d+)x(\d+)/);
      if (dimensions) {
        this.width = parseInt(dimensions[1], 10);
        this.height = parseInt(dimensions[2], 10);
      }
    },
    // 设置权重
    toggleSetWeights() {
      this.showSetWeights = !this.showSetWeights;
    },
    // 保存权重
    saveWeights() {
      this.promptList.forEach(item => {
        item.weight = parseFloat(item.weight);
      });
      this.negativePromptList.forEach(item => {
        item.weight = parseFloat(item.weight);
      });
      this.showSetWeights = false;
    },
    // 更新提示词列表
    updatePromptList() {
      const prompts = this.prompt.split(/[，,]/);

      // 遍历每个分割后的提示词
      prompts.forEach(newPrompt => {
        // 检查新的提示词是否已经存在于 promptList 中
        const existingPromptIndex = this.promptList.findIndex(item => item.prompt === newPrompt);

        if (existingPromptIndex === -1) {
          // 如果新的提示词在 promptList 中不存在，则添加，设置默认权重为 1.0
          this.promptList.push({ prompt: newPrompt, weight: 1.0 });
        } else {
          // 如果新的提示词已经存在，可以选择更新权重或者跳过
          // 可以根据需要更新权重：this.promptList[existingPromptIndex].weight = 1.0;
        }
      });

      // 删除 promptList 中不存在于 prompts 数组中的提示词
      for (let i = this.promptList.length - 1; i >= 0; i--) {
        const promptInList = this.promptList[i].prompt;
        if (!prompts.includes(promptInList)) {
          this.promptList.splice(i, 1);
        }
      }

      // 可选步骤：根据提示词或权重对 promptList 进行排序
      // 例如，按照提示词的字母顺序排序
      this.promptList.sort((a, b) => (a.prompt > b.prompt) ? 1 : -1);
    },
    // 更新负向提示词列表
    updateNegativePromptList() {
      const negativePrompts = this.negativePrompt.split(/[，,]/).map(str => ({prompt: str.trim(), weight: 0.5}));
      this.negativePromptList = negativePrompts.filter(item => item.prompt !== '');
    },
    // 触发动画效果
    triggerAnimation(property) {
      if (property === 'width') {
        this.animateWidth = true;
        setTimeout(() => {
          this.animateWidth = false;
        }, 1000);
      } else if (property === 'height') {
        this.animateHeight = true;
        setTimeout(() => {
          this.animateHeight = false;
        }, 1000);
      }
    },
    // LORA选择
    loraChange(item) {
      console.log(this.selectedLoras.indexOf(item))
      if (this.selectedLoras.indexOf(item) > -1) {
        this.selectedLoras = this.selectedLoras.filter(lora => lora !== item);
      } else {
        this.selectedLoras.push(item);
      }
    },
    // 发送请求
    generateImage() {
      //如果存在图片则发送图生图请求，否则发送文生图请求
      this.$notify.info("等待请求提交")
      if (this.file != null) {
        this.imageToImage()
      } else {
        this.textToImage()
      }
    },
    // 发送文生图请求
    textToImage() {
      // {
      //   "prompts": [
      //   {
      //     "prompt": "string",
      //     "weight": 0
      //   }
      // ],
      //     "negativePrompts": [
      //   {
      //     "prompt": "string",
      //     "weight": 0
      //   }
      // ],
      //     "steps": 0,
      //     "width": 0,
      //     "height": 0,
      //     "cfgScale": 0,
      //     "seed": 0,
      //     "restoreFaces": true,
      //     "samplerIndex": "string"
      // }
      let loras = []
      if (this.selectedLoras.length > 0) {
        this.selectedLoras.forEach(item => {
          loras.push({
            name: item,
            weight: 1.0
          })
        })
      }
      const data = {
        prompts: this.promptList,
        negativePrompts: this.negativePromptList,
        steps: this.steps,
        width: this.width,
        height: this.height,
        cfgScale: this.cfgScale,
        seed: this.seed,
        restoreFaces: this.restoreFaces,
        samplerIndex: this.samplers[this.samplerIndex],
        loras: loras
      };
      axios.post(url.aiImage.texttoimage, data).then(
          (resp) => {
            this.$emit("submit", resp.data);
          }
      ).catch((err)=>{
        console.log(err)
        this.$notify.error("提交失败")
      })
      this.$notify.success("提交成功, 积分已扣除5")
    },
    // 发送图生图请求
    imageToImage() {
      // {
      //   private List<Prompt> prompts;           // 正向提示词
      //   private List<Prompt> negativePrompts;   // 负向提示词
      //   private Integer steps;                  // 采样步数
      //   private Integer width;                  // 宽度
      //   private Integer height;                 // 高度
      //   private Integer cfgScale;               // 提示词引导系数
      //   private Long seed;                   // 随机种子
      //   private Boolean restoreFaces;           // 是否还原人脸
      //   private String samplerIndex;            // 采样器
      //   private Double denoisingStrength;
      //   private Integer resizeMode;
      // }
      const data = {
        prompts: this.promptList,
        negativePrompts: this.negativePromptList,
        steps: this.steps,
        width: this.width,
        height: this.height,
        cfgScale: this.cfgScale,
        seed: this.seed,
        restoreFaces: this.restoreFaces,
        samplerIndex: this.samplers[this.samplerIndex],
        denoisingStrength: this.denoisingStrength,
        resizeMode: this.resizeMode,
      }
      const formData = new FormData();
      formData.append("image", this.file);
      formData.append("data", JSON.stringify(data));
      axios.post(url.aiImage.imagetoimage, formData).then(
          (resp) => {
            this.$emit("submit", resp.data);
          }
      ).catch((err)=>{
        console.log(err)
        this.$notify.error("提交失败")
      })
      this.$notify.success("提交成功, 积分已扣除10")
    },
    //获取模型列表
    getModels() {
      axios.get(url.setting.modelList).then(
          (resp) => {
            let r = []
            for (let i = 0; i < resp.data.length; i++) {
              r.push(resp.data[i].title)
            }
            this.checkpoints = r
          }
      )
    },
    //获取LORA列表
    getLoras() {
      axios.get(url.setting.loraList).then(
          (resp) => {
            this.loras = resp.data
          }
      )
    },
    // 获取当前模型
    getCurrentModel() {
      axios.get(url.setting.currentModel).then(
          (resp) => {
            this.checkpoint = resp.data
          }
      )
    },
    // 获取采样器列表
    getSamplers() {
      axios.get(url.setting.samplerList).then(
          (resp) => {
            let r = []
            for (let i = 0; i < resp.data.length; i++) {
              r.push(resp.data[i].name)
            }
            this.samplers = r
          }
      )
    },
    changeModel(model) {
      console.log(model)
      axios.post("http://localhost:8080/aiSetting/updateModel", {
        title: model
      }).then(() => {
        this.getCurrentModel()
      }).catch(
          (error) => {
            console.log(error)
          }
      )
    },
    //清理图片
    clearImage() {
      this.file = null;
      this.imageSrc = null;
      this.width = 512;
      this.height = 768;
    },
    showImportDialog(type) {
      this.locked=true;
      this.dialogType = type;
      this.dialogInput = '';
      this.showDialog = true;
    },
    importPrompts() {
      // demo: "(一个女孩:2.0),(美丽的:1.5),18岁"  --》 prompts [{prompt: "一个女孩", weight: 2.0}, {prompt: "美丽的", weight: 1.5}, {prompt: "18岁", weight: 1.0}]
      let prompts = this.dialogInput.split(',');
      for (let i = 0; i < prompts.length; i++) {
        let prompt = prompts[i].trim();
        let weight = 1.0;
        //如果包含括号
        if (prompt.indexOf('(') > -1 && prompt.indexOf(')') > -1) {
          let str = prompt.substring(prompt.indexOf('(') + 1, prompt.indexOf(')'));
          //通过冒号分割出 提示词和权重
          let words = str.split(':');
          if (words.length > 1) {
            prompt = words[0].trim();
            weight = Number(words[1].trim());
          } else {
            prompt = words[0].trim();
          }
        }
        //prompt添加到文本域中
        this.prompt+=prompt+","
        this.promptList.push({prompt: prompt, weight: weight});
        console.log(this.promptList)
      }
      this.closeDialog();
    },
    closeDialog() {
      this.showDialog = false;
      this.dialogInput = '';
      this.dialogType = '';
      this.locked=false;
    }
  },
};
</script>

<style scoped>
/* Custom scrollbar styles */
.scroll-container {
  position: relative;
  height: 100%;
  overflow-y: auto; /* Enable vertical scrolling */
  padding-right: 20px; /* Add padding to prevent scrollbar from overlapping content */
}

.AIForm ::-webkit-scrollbar {
  width: 10px;
  background-color: #f1f1f1;
  border-radius: 8px;
}
.AIForm ::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 8px;
}

.AIForm ::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 8px;
}


.container {
  width: 25%;
  margin: 0 auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: #2d2d2d;
  color: #fff;
  height: 100vh; /* Set the height to the viewport height */
  overflow: hidden; /* Prevent overflow from the container */
  box-sizing: border-box;
}

.scroll-container {
  height: 100%;
  overflow-y: auto; /* Enable vertical scrolling */
  padding-right: 20px; /* Add padding to prevent scrollbar from overlapping content */
}

.subBut {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

.subBut:active  {
  background-color: #fff;
  color: #2d2d2d;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lock-button {
  background: none;
  border: none;
  color: #fff;
  cursor: url("@/assets/鼠标指针 (1).svg") ,auto !important;
  transition: transform 0.1s ease-in-out;
}

.lock-button:active {
  transform: scale(0.95);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
}

textarea, input, select, button {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #444;
  background-color: #3d3d3d;
  color: #fff;
  box-sizing: border-box;
}

textarea {
  max-width: 100%;
  min-width: 100%;
  min-height: 40px;
}

.upload-box {
  width: 100%;
  height: 100px;
  border: 2px dashed #444;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  position: relative;
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: url("@/assets/鼠标指针 (1).svg") ,auto !important;
}

.image-preview {
  margin-top: 10px;
  width: 100%;
  height: 100px;
  max-height: 100px;
  overflow: hidden;
}

.image-preview img {
  display: block;
  margin: auto;
  height: 100%;
  max-width: 100%;
  object-fit: contain;
  border: 1px solid #444;
}

.tabs {
  display: flex;
  justify-content: space-between;
}

.tab {
  flex: 1;
  background-color: #444;
  color: #fff;
  border: none;
  padding: 10px;
  cursor: url("@/assets/鼠标指针 (1).svg") ,auto !important;
  transition: transform 0.1s ease-in-out;
}

.tab:active {
  transform: scale(0.95);
}

.settings {
  margin-top: 20px;
}

.image-sizes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-sizes button {
  flex: 1;
  background-color: #444;
  color: #fff;
  border: none;
  padding: 10px;
  cursor: url("@/assets/鼠标指针 (1).svg") ,auto !important;
  transition: transform 0.1s ease-in-out;
}

.image-sizes button:active {
  transform: scale(0.95);
}

.inline-group {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.inline-item {
  flex: 1;
  position: relative;
}

.animate input {
  animation: size-change 1s forwards;
}

@keyframes size-change {
  from {
    transform: scale(1.2);
  }
  to {
    transform: scale(1);
  }
}

.weight-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.weight-item label {
  width: 80px;
}

.weight-item input {
  width: 80px;
  margin-left: 10px;
}

.loras {
  width: 50%;
  display: inline-block;
}

.lora-item {
  display: inline-block;
  width: 90%;
  white-space: nowrap;
  overflow: hidden;
}

.lora-item-chackbox {
  display: inline;
  margin: 0;
  width: 10%;
}

.dialog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog {
  background: #2d2d2d;
  padding: 20px;
  border-radius: 5px;
  width: 400px;
  margin: auto;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-buttons button {
  padding: 5px 10px;
}
button{
  cursor: url("@/assets/鼠标指针 (1).svg") ,auto !important;
}
select{
  cursor: url("@/assets/鼠标指针 (1).svg") ,auto !important;
}
option{
  cursor: url("@/assets/鼠标指针 (1).svg") ,auto !important;
}
input{
  cursor: url("@/assets/鼠标指针 (1).svg") ,auto !important;
}
.dialog-buttons button:active{
  transform: scale(0.95);
}

</style>
