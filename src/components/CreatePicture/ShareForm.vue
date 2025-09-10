<template>
  <div class="share-form-overlay" @click.self="close">
    <div class="share-view-div">
      <div class="share-image-view">
        <canvas ref="canvas" class="thumbnail-canvas"></canvas>
      </div>
      <div class="share-form">
        <form @submit.prevent="submit">
          <div class="share-form-title">
            <input type="text" placeholder="标题" v-model="form.title">
            <span v-if="errors.title" class="error">{{ errors.title }}</span>
          </div>
          <div class="share-form-content">
            <textarea placeholder="内容" v-model="form.content"></textarea>
            <span v-if="errors.content" class="error">{{ errors.content }}</span>
          </div>
          <div class="form-actions">
            <button type="button" @click="close">取消</button>
            <button type="submit">提交</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import urlObj from "@/urlObj";
import axios from "axios";

export default {
  props: ['src', 'taskId'],
  data() {
    return {
      form: {
        title: '',
        content: ''
      },
      errors: {},
      canvas: null
    }
  },
  mounted() {
    this.generateThumbnail();
  },
  methods: {
    close() {
      this.$emit('close');
    },
    submit() {
      this.errors = this.validateForm();
      if (Object.keys(this.errors).length === 0) {
        const data = {
          title: this.form.title,
          content: this.form.content,
          imageTaskId: this.taskId
        };
        axios.post(urlObj.share.shareImage,data)
          .then((res) => {
            if (res.data.code==200){
              this.$notify.success("分享成功")
              this.$emit('close');
            }else {
              this.$notify.error("分享失败")
            }
          });
      }
    },
    validateForm() {
      const errors = {};
      if (!this.form.title) {
        errors.title = '标题不能为空';
      }
      if (!this.form.content) {
        errors.content = '内容不能为空';
      }
      return errors;
    },
    generateThumbnail() {
      const img = new Image();
      img.src = this.src;
      img.onload = () => {
        const canvas = this.$refs.canvas;
        const ctx = canvas.getContext('2d');
        const maxWidth = 300;
        const maxHeight = 300;
        let width = img.width;
        let height = img.height;

        // 计算等比例缩放
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
      };
    }
  }
}
</script>

<style scoped>
.share-form-overlay {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.share-view-div {
  background: #2c2c2c;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  color: #fff;
}

.share-image-view {
  max-width: 100%;
  max-height: 300px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.thumbnail-canvas {
  border-radius: 8px;
}

.share-form-title input,
.share-form-content textarea {
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  min-height: 40px;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #555;
  border-radius: 4px;
  background: #1e1e1e;
  color: #fff;
  font-family: 华文楷体,serif;
  font-size: 16px;
}
.share-form-content textarea {
  height: 20vh;
  min-height: 20vh;
}

.share-form-content textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.form-actions button {
  margin-left: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="button"] {
  background: #666;
  color: #fff;
}

.form-actions button[type="submit"] {
  background: #007BFF;
  color: #fff;
}
.share-form-title input::placeholder,
.share-form-content textarea::placeholder {
  color: #969191; /* 设置占位符文字颜色 */
}
.error {
  color: red;
  font-size: 0.8em;
}
</style>
