<template>
  <div class="info-section">
    <div class="header">
      <span>{{ title }}</span>
      <button class="info-button">
        <img aria-hidden="true" alt="info-icon" src="https://openui.fly.dev/openui/24x24.svg?text=ℹ️" />
      </button>
    </div>
    <div class="content">
      <img :src="imgSrc" v-if="imgSrc" />
      <span>{{ content }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: ['title', 'content', 'imgSrc']
}
</script>

<style scoped>
.info-section {
  margin-bottom: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #aaaaaa;
}

.content {
  display: flex;
  align-items: center;
  background-color: #333333;
  color: #ffffff;
  padding: 8px;
  border-radius: 4px;
}

img {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  margin-right: 8px;
}
</style>
