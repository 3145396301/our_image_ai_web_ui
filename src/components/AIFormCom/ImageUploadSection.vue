<template>
  <div class="section">
    <div class="header">
      <span>{{ title }}</span>
      <button class="upload-button">
        <img aria-hidden="true" alt="upload-icon" src="https://openui.fly.dev/openui/24x24.svg?text=⬆️" />
      </button>
    </div>
    <div class="upload-area">拖拽图片到此处上传</div>
  </div>
</template>

<script>
export default {
  props: ['title']
}
</script>

<style scoped>
.section {
  margin-bottom: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.upload-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #aaaaaa;
}

.upload-area {
  background-color: #555555;
  color: #aaaaaa;
  padding: 16px;
  border-radius: 4px;
  text-align: center;
}
</style>
