<template>
  <button class="button">{{ text }}</button>
</template>

<script>
export default {
  props: ['text']
}
</script>

<style scoped>
.button {
  flex: 1;
  text-align: center;
  padding: 8px;
  background-color: #007bff;
  color: #ffffff;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  margin: 4px;
}

.button:hover {
  background-color: #0056b3;
}
</style>
