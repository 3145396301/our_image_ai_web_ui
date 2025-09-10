<template>
  <div class="history-list-div">
    <div class="history-list-title">
      <div class="history-list-title-text">历史记录</div>
    </div>
    <div class="history-item-container">
      <HostoryListItem
          class="hostory-list-item"
          v-for="item in records"
          :task-id="item.taskId"
          :is-history="true"
          :key="item.taskId"
          @delete="deleteTask" @view="viewImage"
      />
    </div>
    <div class="history-list-page">
      <div class="history-list-page-text">
        <div
            class="history-list-page-text-left"
            :class="{ disabled: page === 1 }"
            @click="getPreviousPage"
        >
          上一页
        </div>
        <div
            class="page-number"
            v-for="pageNum in pageNumbersToShow"
            :key="pageNum"
            @click="getCurrentPage(pageNum)"
            :class="{ active: pageNum === page }"
        >
          {{ pageNum }}
        </div>
        <div
            class="history-list-page-text-right"
            :class="{ disabled: page === pages }"
            @click="getNextPage"
        >
          下一页
        </div>
        <div class="page-input-container">
          <input
              type="number"
              v-model.number="inputPage"
              @keydown.enter="goToPage"
              @blur="goToPage"
              class="page-input"
          /> / {{ pages }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HostoryListItem from "@/components/CreateHistory/HistoryListItem.vue";
import axios from "axios";
import ImageView from "@/components/CreatePicture/ImageView.vue";
import urlObj from "@/urlObj";

export default {
  components:{
    HostoryListItem
  },
  props:['form'],
  data(){
    return {
      records: [],
      page: 1,
      pageSize: 10,
      total: 0,
      pages: 1,
      inputPage: 1
    }
  },
  created() {
    this.getCurrentPage(1);
  },
  methods: {
    getCurrentPage(page){
      let data ={
        page: page,
        ...this.form
      }
      //通过，或,分割form.keywords
      if (data.keywords!=null){
        data.keywords = data.keywords.split(/[,，]/);
      }
      axios.post(urlObj.userImage.imageHistory, data)
          .then(res => {
            if (res.data.code === 200){
              this.records = res.data.data.records;
              this.total = res.data.data.total;
              this.pages = res.data.data.pages;
              this.page = res.data.data.current;
              this.pageSize = res.data.data.size;
              this.inputPage = this.page;
              this.$forceUpdate()
            }
          });
    },
    getNextPage() {
      if (this.page < this.pages) {
        this.getCurrentPage(this.page + 1);
      }
    },
    getPreviousPage() {
      if (this.page > 1) {
        this.getCurrentPage(this.page - 1);
      }
    },
    goToPage() {
      if (this.inputPage >= 1 && this.inputPage <= this.pages) {
        this.getCurrentPage(this.inputPage);
      } else {
        this.$notify.warning('输入的页码超出范围');
      }
    },
    deleteTask(taskId) {
      console.log('删除任务了：' + taskId);
      //重新获取当前页码内容，如果当前页只有一个且当前页码不为1，当前页码减一然后获取当前页码内容
      if (this.records.length === 1 && this.page > 1) {
        this.getCurrentPage(this.page - 1);
      } else {
        this.getCurrentPage(this.page);
      }
    },
    viewImage(url) {
      this.$emit('view', url);
    }
  },
  watch:{
    'form':{
      handler() {
        this.getCurrentPage(1);
      },
      deep: true

    }
  },
  computed: {
    pageNumbersToShow() {
      const pagesToShow = [];
      const startPage = Math.max(1, this.page - 3);
      const endPage = Math.min(this.pages, this.page + 3);

      for (let i = startPage; i <= endPage; i++) {
        pagesToShow.push(i);
      }

      return pagesToShow;
    }
  }
}
</script>

<style scoped>
.history-list-div {
  height: 100vh;
  width: 75%;
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  color: #fff;
}

.history-list-title {
  text-align: center;
  margin-bottom: 20px;
}

.history-list-title-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
}

.history-item-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

.hostory-list-item {
  height: 18vh;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 5px;
  overflow: hidden;
  transition: transform 0.2s;
}

.hostory-list-item:hover {
  transform: translateY(-5px);
}

.history-list-page {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.history-list-page-text {
  display: flex;
  gap: 10px;
}

.history-list-page-text-left,
.history-list-page-text-right,
.page-number {
  cursor: pointer;
  padding: 5px 10px;
  border: 1px solid #444;
  border-radius: 5px;
  background-color: #333;
  transition: background-color 0.2s;
  color: #fff;
}

.history-list-page-text-left:hover,
.history-list-page-text-right:hover,
.page-number:hover {
  background-color: #555;
}

.page-number.active {
  background-color: #000;
  color: #fff;
}

.page-input-container {
  display: flex;
  align-items: center;
}

.page-input {
  width: 50px;
  padding: 5px;
  margin-left: 10px;
  border: 1px solid #444;
  border-radius: 5px;
  background-color: #333;
  color: #fff;
  text-align: center;
  appearance: textfield; /* 隐藏数字输入框的增减按钮 */
}

.page-input::-webkit-outer-spin-button,
.page-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.page-input:focus {
  outline: none;
  border-color: #000;
}

.disabled {
  pointer-events: none;
  color: #777;
}
</style>
