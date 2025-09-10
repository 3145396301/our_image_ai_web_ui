<template>
  <div>
    <div v-if="loading" class="profile-container">
      <div class="loader"></div>
    </div>
    <div v-show="!loading" class="profile-container">
      <div class="profile-left">
        <img :src="profileImage" alt="avatar" class="avatar" @dblclick="editAvatar"/>
        <div class="nickname" @dblclick="editNickname">{{ nickname }}</div>
      </div>
      <div class="profile-right">
        <h3 class="section-title">个人中心信息管理</h3>
        <div class="info-item">
          <span class="info-label">用户名</span>
          <span class="info-value">{{ username }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">手机</span>
          <span class="info-value">{{ phone }}</span>
          <button class="edit-button" @click="editPhone">修改</button>
        </div>
        <div class="info-item">
          <span class="info-label">邮箱</span>
          <span class="info-value">{{ email }}</span>
          <button class="edit-button" @click="editEmail"
                  v-text="email!=null && email.length>0? '修改' : '绑定'"></button>
        </div>
        <div class="info-item">
          <span class="info-label">注册时间</span>
          <span class="info-value">{{ registrationTime | formatDate }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">图像个数</span>
          <span class="info-value">{{ imageCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">分享个数</span>
          <span class="info-value">{{ shareCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">获赞总数</span>
          <span class="info-value">{{ likeCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">剩余积分</span>
          <span class="info-value">{{ integral }}</span>
        </div>
        <button class="action-button" @click="suggestion">我要建议</button>
        <button class="action-button" @click="resetPassword">重置密码</button>
        <button class="return-button" @click="returnHome">返回主页</button>
      </div>

      <!-- 修改昵称的对话框 -->
      <div v-if="isEditingNickname" class="dialog">
        <div class="dialog-content">
          <label for="nickname">修改昵称:</label>
          <input type="text" v-model="newNickname" id="nickname"/>
          <button @click="saveNickname">保存</button>
          <button @click="cancelEdit">取消</button>
        </div>
      </div>

      <!-- 修改头像的对话框 -->
      <div v-if="isEditingAvatar" class="dialog">
        <div class="dialog-content">
          <label for="avatar">修改头像 URL:</label>
          <input type="text" v-model="newAvatar" id="avatar"/>
          <button @click="saveAvatar">保存</button>
          <button @click="cancelEdit">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import urlObj from "@/urlObj";
import axios from "axios";

export default {
  data() {
    return {
      loading: true,
      profileImage: 'https://via.placeholder.com/150', // 替换为实际头像路径
      nickname: '张三李四',
      username: '0001',
      phone: '0001-213-998761',
      email: 'alex@gmail.com',
      registrationTime: '2023-07-12',
      imageCount: 10,
      shareCount: 5,
      likeCount: 50,
      integral: 100,
      isEditingNickname: false,
      isEditingAvatar: false,
      newNickname: '',
      newAvatar: ''
    };
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    editPhone() {
      // 修改手机号码的逻辑
    },
    editEmail() {
      // 修改邮箱的逻辑
    },
    suggestion() {
      // 提交建议的逻辑
    },
    resetPassword() {
      // 重置密码的逻辑
    },
    returnHome() {
      // 返回主页的逻辑，例如使用路由跳转
      this.$router.push('/ai');
    },
    editNickname() {
      this.newNickname = this.nickname;
      this.isEditingNickname = true;
    },
    saveNickname() {
      this.nickname = this.newNickname;
      this.isEditingNickname = false;
    },
    editAvatar() {
      this.newAvatar = this.profileImage;
      this.isEditingAvatar = true;
    },
    saveAvatar() {
      this.profileImage = this.newAvatar;
      this.isEditingAvatar = false;
    },
    cancelEdit() {
      this.isEditingNickname = false;
      this.isEditingAvatar = false;
    },
    getUserInfo() {
      axios.get(urlObj.user.getUserInfo).then(res => {
        if (res.data.code === 200) {
          this.nickname = res.data.data.nickname;
          this.profileImage = res.data.data.avatar;
          this.username = res.data.data.username;
          this.phone = res.data.data.phone;
          this.email = res.data.data.mail;
          this.registrationTime = res.data.data.registerDate;
          this.imageCount = res.data.data.imageNumber;
          this.shareCount = res.data.data.shareNumber;
          this.likeCount = res.data.data.likeNumber;
          this.integral = res.data.data.interval;
          this.loading = false;
        }
      }).catch((err) => {
        console.log(err)
        this.$notify.error("获取用户信息失败,请重试")
      })
    }
  },
  filters: {
    formatDate(value) {  //yyyy-MM-dd HH:mm:ss
      const date = new Date(value);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #121212; /* 夜晚风格背景 */
  color: #ffffff; /* 白色文本 */
}

.profile-left, .profile-right {
  background-color: #1e1e1e; /* 深色背景 */
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  margin: 10px 0;
}

.profile-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 20vh;
  overflow: auto;
}

.profile-right {
  height: 60vh;
  overflow: auto;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  cursor: pointer;
}

.nickname {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #3a3a3a; /* 深色边框 */
}

.info-label {
  font-weight: bold;
  color: #bbbbbb; /* 浅灰色文本 */
}

.info-value {
  margin-left: 10px;
  color: #dddddd; /* 浅灰色文本 */
}

.edit-button {
  background-color: #3a3a3a; /* 深色按钮 */
  color: #ffffff; /* 白色文本 */
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
}

.edit-button:hover {
  background-color: #575757; /* 按钮悬停效果 */
}

.action-button, .return-button {
  display: block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff; /* 蓝色按钮 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
}

.action-button:hover, .return-button:hover {
  background-color: #0056b3; /* 按钮悬停效果 */
}

.return-button {
  background-color: #6c757d; /* 灰色按钮 */
}

.return-button:hover {
  background-color: #5a6268; /* 灰色按钮悬停效果 */
}

.dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: #ffffff;
}

.dialog-content label {
  display: block;
  margin-bottom: 10px;
}

.dialog-content input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  background-color: #2e2e2e;
  color: #ffffff;
  box-sizing: border-box;
}

.dialog-content button {
  background-color: #007bff;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-content button:hover {
  background-color: #0056b3;
}

.dialog-content button:last-child {
  margin-left: 10px;
  background-color: #6c757d;
}

.dialog-content button:last-child:hover {
  background-color: #5a6268;
}
/* HTML: <div class="loader"></div> */
.loader {
  width: 120px;
  height: 22px;
  border-radius: 40px;
  color: #514b82;
  border: 2px solid;
  position: relative;
  overflow: hidden;
}
.loader::before {
  content: "";
  position: absolute;
  margin: 2px;
  width: 14px;
  top: 0;
  bottom: 0;
  left: -20px;
  border-radius: inherit;
  background: currentColor;
  box-shadow: -10px 0 12px 3px currentColor;
  clip-path: polygon(0 5%, 100% 0,100% 100%,0 95%,-30px 50%);
  animation: l14 1s infinite linear;
}
@keyframes l14 {
  100% {left: calc(100% + 20px)}
}
</style>
