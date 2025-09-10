<template>
  <div class="createPicture">
    <AIForm @submit="addTask" class="AIForm"></AIForm>
    <div class="previewDiv" v-show="tasks.length > 0">
      <EffectPreview v-for="(task) in tasks" @delete="deleteTask" @view="viewImage" @share="showShareFormView" :key="task" :taskId="task"
                     :isHistory="true"></EffectPreview>
    </div>
    <div class="no-preview" v-show="tasks.length == 0">
      <div class="no-preview-text">
        <div>
          <img src="@/assets/找不到结果.png" style="width: 20%" alt="">
        </div>
        <div>
          <div>
            <span class="no-preview-text-title">暂无预览</span>
          </div>
        </div>
      </div>
    </div>
    <XyzTransition xyz="fade flip-left perspective-1">
      <div class="square" v-if="showImageView">
        <ImageView @close="showImageView=false" :src="showImageViewSrc" v-show="showImageView"></ImageView>
      </div>
    </XyzTransition>
    <XyzTransition xyz="fade flip-left perspective-1">
      <div class="square" v-if="showShareForm">
        <ShareForm @close="showShareForm=false" :src="shareInfo.src" v-show="showShareForm" :task-id="shareInfo.taskId"></ShareForm>
      </div>
    </XyzTransition>
    <OtherOperations class="other-operations" @refresh="getRecentlyGenerated" @show-history="showHistory" @share="share" @recharge="rechargeAccount" @logout="logout"></OtherOperations>
  </div>
</template>

<script>
import AIForm from "@/components/CreatePicture/AIForm.vue";
import EffectPreview from '@/components/CreatePicture/EffectPreview.vue';
import axios from "axios";
import ImageView from "@/components/CreatePicture/ImageView.vue";
import OtherOperations from "@/components/CreatePicture/OtherOperations.vue";
import urlObj from "@/urlObj";
import ShareForm from "@/components/CreatePicture/ShareForm.vue";
export default {

  components: {
    ShareForm,
    ImageView,
    AIForm,
    EffectPreview,
    OtherOperations
  },
  created() {
    this.getRecentlyGenerated();
  },
  data() {
    return {
      tasks: [],
      showImageView: false,
      showImageViewSrc: '',
      showShareForm: false,
      shareInfo:{}
    };
  },
  methods: {
    addTask(taskId) {
      console.log('添加任务了：' + taskId);
      //如果任务列表长度超过10个，则删除最后一个
      if (this.tasks.length >= 10) {
        this.tasks.pop()
      }
      this.tasks.unshift(taskId)
    },
    getRecentlyGenerated() {
      axios.get(urlObj.aiImage.recentlyGenerated).then((res) => {
        if (res.data.code === 200) {
          this.tasks = res.data.data.records;
        }
      });
    },
    deleteTask(taskId) {
      console.log('删除任务了：' + taskId);
      this.tasks.splice(this.tasks.indexOf(taskId), 1);
    },
    viewImage(url) {
      this.showImageView = true;
      this.showImageViewSrc = url;
    },
    showHistory() {
      this.$router.push({
        path: '/history'
      })
    },
    share() {
      this.$router.push({
        path: '/share'
      })
    },
    rechargeAccount() {
      this.$router.push({
        path: '/recharge'
      })
    },
    logout() {
      axios.get(urlObj.user.logout).then((res) => {
        if (res.data.code === 200) {
          localStorage.removeItem("satoken");
          this.$router.push({
            path: '/login'
          })
        }
      });
    },
    showShareFormView(data) {
      this.showShareForm = true;
      this.shareInfo.src = data.src;
      this.shareInfo.taskId = data.taskId;
    }
  }
};
</script>

<style scoped>
.createPicture {
  background-color: #3d3d3d;
  width: 100%;
  height: 100vh;
}

.AIForm {
  float: left;
}
.other-operations{
  float: right;
  width: 75%;
  box-sizing: border-box;
  height: 40vh;
}

.externalPreviewDiv {

}

.previewDiv {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  width: 75%;
  height: 60vh;
  box-sizing: border-box;
  float: left;
}

.previewDiv::-webkit-scrollbar {
  height: 10px;
}

.previewDiv::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 5px;
}

.previewDiv::-webkit-scrollbar-track {

}


.no-preview {
  width: 75%;
  height: 60vh;
  float: left;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2d2d2d;
  border-radius: 10px;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  transform: scale(1);
  opacity: 1;
  transition: all 0.3s ease;
  transform: scale(1);
  transition: all 0.3s ease;
}

.no-preview-text-title {
  font-size: 40%;
}
</style>
