<template>
  <div class="history-search-form-div">
    <div class="form-title">搜索历史</div>
    <form>
      <div class="form-group">
        <label for="startTime">开始时间</label>
        <input type="date" id="startTime" v-model="form.startTime">
      </div>
      <div class="form-group">
        <label for="endTime">结束时间</label>
        <input type="date" id="endTime" v-model="form.endTime">
      </div>
      <div class="form-group">
        <label for="keywords">关键词</label>
        <input type="text" id="keywords" v-model="form.keywords" placeholder="输入关键词">
      </div>
      <div class="form-group">
        <label for="minWidth">宽度</label>
        <input type="number" id="minWidth" v-model.number="form.minWidth" placeholder="最小宽度">
        <input type="number" id="maxWidth" v-model.number="form.maxWidth" placeholder="最大宽度">
      </div>
      <div class="form-group">
        <label for="minHeight">高度</label>
        <input type="number" id="minHeight" v-model.number="form.minHeight" placeholder="最小高度">
        <input type="number" id="maxHeight" v-model.number="form.maxHeight" placeholder="最大高度">
      </div>
      <div class="form-group">
        <button type="button" @click="sub">提交</button>
        <button type="button" @click="resetForm">重置</button>
        <button type="button" @click="$router.push('/ai')">返回</button>
      </div>
    </form>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      form: {
        startTime: null,
        endTime: null,
        keywords: '',
        minWidth: null,
        maxWidth: null,
        minHeight: null,
        maxHeight: null,
      },
    };
  },
  methods: {
    sub() {
      this.$emit('sub', this.form);
    },
    resetForm() {
      this.form = {
        startTime: null,
        endTime: null,
        keywords: '',
        minWidth: null,
        maxWidth: null,
        minHeight: null,
        maxHeight: null,
      };
    },
  },
});
</script>

<style scoped>
.history-search-form-div {
  padding: 20px;
  background-color: #2c2c2c;
  color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  height: 100vh;
}

.form-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #fff;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #fff;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="date"] {
  width: calc(50% - 5px);
  padding: 8px;
  border: 1px solid #555;
  border-radius: 5px;
  background-color: #333;
  color: #fff;
}

.form-group input[type="text"]:focus,
.form-group input[type="number"]:focus,
.form-group input[type="date"]:focus {
  outline: none;
  border-color: #000;
}

.form-group input[type="number"] {
  width: calc(25% - 5px);
}

.form-group button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  background-color: #000;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
}

.form-group button:hover {
  background-color: #777a7e;
}
.form-group button{
  margin-right: 10px;
}
.btn-primary {
  margin-right: 10px;
}
</style>
