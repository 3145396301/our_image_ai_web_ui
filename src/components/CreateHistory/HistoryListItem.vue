<template>
  <div class="effect-preview">
    <div class="image-preview">
      <div class="image-container" @mouseover="showButtons = true" @mouseleave="showButtons = false">
        <img v-show="!queueWait" :src="imageSrc" alt="Image preview">
        <div v-if="queueWait" class="">
          <div class="queue-wait-info-text">
            <div>
              <i class="el-icon-loading"></i>
            </div>
            <div>
              排队中 <span v-if="numberOfQueues !== 0">({{ numberOfQueues }})</span>
            </div>
          </div>
        </div>
        <div v-show="createWait" class="create-wait-info">
          <div class="create-wait-info-text">
            生成中 <span v-if="eta != null">({{ eta }}秒)</span>
          </div>
        </div>
        <div v-show="success && showButtons" class="button-container">
          <button class="funBut" @click="viewImage"><img src="@/assets/查看.png" alt="查看" title="查看"></button>
          <!--          <button class="funBut" @click="viewDetails"><img src="@/assets/x.png" alt="详情"></button>-->
          <button class="funBut" @click="copyParams"><img src="@/assets/复制.png" title="复制参数" alt="复制参数"></button>
          <button class="funBut" @click="saveImage"><img src="@/assets/保存.png" title="保存" alt="保存"></button>
          <button class="funBut"><img src="@/assets/立即分享.png" title="分享" alt="分享"></button>
          <button class="funBut" @click="deleteImage"><img src="@/assets/删除.png" title="删除" alt="删除"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import urlObj from "@/urlObj";

export default {
  props: ['taskId', 'isHistory'],
  data() {
    return {
      imageSrc: null,
      success: false,
      queueWait: true,
      createWait: false,
      eta: null,
      numberOfQueues: 0,
      progress: {},
      showButtons: false,
      info: null
    };
  },
  created() {
    if (this.isHistory) {
      this.getFromHistory();
    } else {
      this.getProgress();
    }
  },
  methods: {
    getProgress() {
      axios.get(`${urlObj.aiImage.progress}${this.taskId}`).then((res) => {
        if (res.data.active) {
          this.createWait = true;
          this.queueWait = false;
          this.success = false;
          this.imageSrc = res.data.live_preview;
          this.eta = Math.round(res.data.eta);
        } else if (res.data.queued) {
          this.queueWait = true;
          this.createWait = false;
          this.success = false;
          this.numberOfQueues = parseInt(res.data.textinfo.match(/\d+/)[0], 10);
          console.log("当前排队数" + this.numberOfQueues);
        } else {
          this.getFromHistory();
          return;
        }
        setTimeout(() => {
          this.getProgress();
        }, 1000);
      }).catch((err) => {
        console.error(err);
      });
    },
    getFromHistory() {
      axios.get(`${urlObj.userImage.imageUrl}${this.taskId}`).then((res) => {
        if (res.data.code === 200) {
          this.imageSrc = res.data.data;
          this.success = true;
          this.queueWait = false;
          this.createWait = false;
        } else {
          this.getProgress();
        }
      }).catch((err) => {
        console.error(err);
      });
    },
    getImageInfo() {
      axios.get(`${urlObj.userImage.imageInfo}${this.taskId}`).then((res) => {
        if (res.data.code === 200) {
          this.info = res.data.data;
        }
      }).catch((err) => {
        console.error(err);
      });
    },
    viewImage() {
      this.$emit('view', this.imageSrc);
    },
    viewDetails() {
      if (this.info == null) {
        this.getImageInfo();
      }
      console.log(this.info);
    },
    copyParams() {
      if (this.info == null) {
        this.getImageInfo();
      }
      // 复制参数的逻辑
      console.log("复制参数");
    },
    saveImage() {
      // 保存图片的逻辑
      let a = document.createElement("a");
      a.href = `${this.imageSrc}?filename=${Math.random()}.png`;
      a.click();
      a.style.display = "none";
      setTimeout(() => {
        a.remove();
      }, 1000);
    },
    deleteImage() {
      axios.delete(`${urlObj.userImage.deleteImage}${this.taskId}`).then((res) => {
        if (res.data.code === 200) {
          this.$emit('delete', this.taskId);
        }
      }).catch((err) => {
        console.error(err);
      });
    }
  }
};
</script>

<style scoped>
.effect-preview {
  flex: 0 0 calc(100% / 3); /* 调整以同时显示最多3个预览 */
  box-sizing: border-box;
  padding: 10px;
  background-color: #2d2d2d;
  color: #fff;
  margin-bottom: 20px; /* 调整预览之间的间距 */
  border: 1px solid #444;
  border-radius: 5px;
  font-size: 1rem; /* 基本字体大小 */
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* 确保图片不溢出 */
  position: relative;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  border: 1px solid #444;
  border-radius: 5px;
  object-fit: contain; /* 保持纵横比 */
}

.queue-wait-info {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5); /* 添加背景以提高可读性 */
  border-radius: 5px;
}

.create-wait-info {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 添加背景以提高可读性 */
  border-radius: 5px;
}

.queue-wait-info-text, .create-wait-info-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}

.queue-wait-info-text div, .create-wait-info-text div {
  margin: 5px 0;
}

/* HTML: <div class="el-icon-loading"></div> */
.el-icon-loading {
  width: 90px;
  height: 14px;
  box-shadow: 0 3px 0 #fff;
  position: relative;
  display: grid;
  clip-path: inset(-60px 0 -5px)
}

.el-icon-loading:after {
  content: "";
  position: relative;
  background: repeating-linear-gradient(90deg, #0000 0 calc(50% - 8px), #ccc 0 calc(50% + 8px), #0000 0 100%) 0 0/calc(100% / 3) 100%;
  animation: l6-1 1s infinite;
}

.el-icon-loading:before {
  content: "";
  position: absolute;
  width: 14px;
  aspect-ratio: 1;
  left: calc(50% - 7px);
  bottom: 0;
  border-radius: 50%;
  background: lightblue;
  animation: l6-2 1s infinite;
}

@keyframes l6-1 {
  50%, 100% {
    background-position: calc(100% / 2) 0
  }
}

@keyframes l6-2 {
  0%, 50% {
    transform: translateY(-80px)
  }
}

/* 新添加的样式 */
.button-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 0.1em; /* 使用em单位 */
}

.button-container button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.3s;
}

.button-container button img {
  width: 1.2em; /* 使用em单位来设置图片大小 */
  height: 1.2em; /* 使用em单位来设置图片大小 */
  background-color: white;
}

.button-container button:hover img {
  transform: scale(1.1); /* 放大按钮图片 */
}

/* 媒体查询，根据屏幕大小调整按钮图片大小 */
@media (max-width: 1200px) {
  .button-container button img {
    width: 1.8em;
    height: 1.8em;
  }
}

@media (max-width: 900px) {
  .button-container button img {
    width: 1.6em;
    height: 1.6em;
  }
}

@media (max-width: 600px) {
  .button-container button img {
    width: 1.4em;
    height: 1.4em;
  }
}

@media (max-width: 400px) {
  .button-container button img {
    width: 1.2em;
    height: 1.2em;
  }
}
</style>
