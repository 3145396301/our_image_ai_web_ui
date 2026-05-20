<template>
  <div class="other-operations-div">
    <!-- 个人中心 -->
    <div class="other-operations-div-item" >
      <div class="other-operations-div-item-icon" @click="goToUserCenter">
        <img src="@/assets/个人中心.png" alt="个人中心" title="个人中心">
      </div>
    </div>
    <!-- 刷新 -->
    <div class="other-operations-div-item" @click="refresh">
      <div class="other-operations-div-item-icon">
        <img src="@/assets/刷新.png" title="刷新" alt="刷新">
      </div>
    </div>
    <!-- 历史 -->
    <div class="other-operations-div-item" @click="showHistory">
      <div class="other-operations-div-item-icon">
        <img src="@/assets/历史.png" alt="历史记录" title="历史记录">
      </div>
    </div>
    <!-- 分享 -->
    <div class="other-operations-div-item" @click="share">
      <div class="other-operations-div-item-icon">
        <img src="@/assets/分享.png" alt="分享" title="分享">
      </div>
    </div>
    <!-- 充值 -->
    <div class="other-operations-div-item" @click="recharge">
      <div class="other-operations-div-item-icon">
        <img src="@/assets/充值.png" alt="充值" title="充值">
      </div>
    </div>
    <!-- 社区 -->
    <div class="other-operations-div-item">
      <div class="other-operations-div-item-icon">
        <img src="@/assets/社区.png" alt="社区" title="社区">
      </div>
    </div>
    <!-- 帮助 -->
    <div class="other-operations-div-item">
      <div class="other-operations-div-item-icon">
        <img src="@/assets/帮助.png" alt="帮助" title="帮助">
      </div>
    </div>
    <!-- 活动 -->
    <div class="other-operations-div-item">
      <div class="other-operations-div-item-icon">
        <img src="@/assets/活动.png" alt="活动" title="活动">
      </div>
    </div>
    <!-- 签到 -->
    <div class="other-operations-div-item" @click="signIn">
      <div class="other-operations-div-item-icon">
        <img src="@/assets/签到.png" alt="签到" title="签到">
      </div>
    </div>
    <!-- 通知 -->
    <div class="other-operations-div-item">
      <div class="other-operations-div-item-icon">
        <img src="@/assets/通知.png" alt="通知" title="通知">
      </div>
    </div>
    <!-- 作者 -->
    <div class="other-operations-div-item">
      <div class="other-operations-div-item-icon">
        <img src="@/assets/作者.png" alt="作者" title="作者">
      </div>
    </div>
    <!-- 退出 -->
    <div class="other-operations-div-item" @click="logout">
      <div class="other-operations-div-item-icon">
        <img src="@/assets/退出.png" alt="退出" title="退出">
      </div>
    </div>
  </div>
</template>

<script>
import urlObj from "@/urlObj";
import axios from "axios";
export default {
  methods: {
    refresh() {
      this.$emit('refresh');
    },
    showHistory() {
      this.$emit('show-history');
    },
    share() {
      this.$emit('share');
    },
    recharge() {
      this.$router.push('/pay')
    },
    logout() {
      this.$emit('logout');
    },
    goToUserCenter() {
      this.$router.push('/user');
    },
    signIn() {
      axios.get(urlObj.user.signIn).then((res)=>{
        if (res.data.code === 200) {
          this.$notify.success("签到成功");
        }else if (res.data.code === 400){
          this.$notify.warning("已经签到过啦");
        }else {
          this.$notify.error("操作失败，请稍后重试");
        }
      })
    }

  }
}
</script>

<style scoped>

.other-operations-div {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  background-color: #2d2d2d;
  padding: 6px 10px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.other-operations-div-item {
  flex: 1 0 16%;
  max-width: 16%;
  min-height: 44px;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.other-operations-div-item:hover {
  transform: scale(1.1);
}

.other-operations-div-item:active {
  transform: scale(0.9);
}

.other-operations-div-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
}

.other-operations-div-item-icon img {
  width: 30px;
  height: 30px;
}

@media (max-width: 767px) {
  .other-operations-div {
    padding: 4px 6px;
    border-radius: 6px;
  }
  .other-operations-div-item {
    flex: 1 0 14%;
    max-width: 14%;
    min-height: 48px;
  }
  .other-operations-div-item-icon img {
    width: 26px;
    height: 26px;
  }
}

@media (max-width: 400px) {
  .other-operations-div-item {
    flex: 1 0 16%;
    max-width: 16%;
  }
  .other-operations-div-item-icon img {
    width: 22px;
    height: 22px;
  }
}
</style>
