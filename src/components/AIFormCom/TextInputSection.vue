<template>
  <div class="section">
    <div class="header">
      <span>{{ title }}</span>
      <button class="edit-button">
        <img :src="iconSrc" alt="edit-icon" />
      </button>
    </div>
    <textarea :placeholder="placeholder"></textarea>
  </div>
</template>

<script>
export default {
  props: ['title', 'placeholder', 'iconSrc']
}
</script>

<style scoped>
.section {
  margin-bottom: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.edit-button {
  background: none;
  border: none;
  cursor: pointer;
}
</style>
