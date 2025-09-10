<template>
  <div class="section">
    <div class="header">
      <span>{{ title }}</span>
      <button class="info-button">
        <img aria-hidden="true" alt="info-icon" src="https://openui.fly.dev/openui/24x24.svg?text=ℹ️" />
      </button>
    </div>
    <select>
      <option>None</option>
    </select>
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

.info-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #aaaaaa;
}

select {
  width: 100%;
  background-color: #333333;
  color: #ffffff;
  padding: 8px;
  border-radius: 4px;
  border: none;
}
</style>
