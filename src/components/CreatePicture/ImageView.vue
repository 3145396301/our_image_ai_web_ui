<template>
  <div class="image-view-overlay" @click="handleOverlayClick">
    <div class="image-view">
      <div class="close-button" @click.stop="handleCloseButtonClick">
        <i class="fas fa-times"></i>
      </div>
      <img :src="src" alt="">
    </div>
  </div>
</template>

<script>
export default {
  props: ['src'],
  methods: {
    handleOverlayClick() {
      // 点击空白区域时触发关闭事件
      this.$emit('close');
    },
    handleCloseButtonClick(event) {
      // 点击关闭按钮时触发关闭事件，停止事件冒泡
      event.stopPropagation();
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.image-view-overlay {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.image-view {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.close-button {
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 100;
  width: 10px;
  height: 10px;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.8);
}

.fas {
  font-size: 20px;
  color: white;
  transform: translate(-50%, -50%);
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
}

img {
  max-width: 100%;
  max-height: 100%;
}
</style>
