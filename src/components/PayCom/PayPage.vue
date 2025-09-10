<template>
  <div class="alipay-container">
    <div class="alipay-header">
      <img src="@/assets/alipay-logo.png" alt="Alipay Logo" class="alipay-logo"/>
    </div>
    <div class="alipay-content">
      <div class="amount-label">充值金额</div>
      <div class="amount-input">¥ {{ selectedAmount.value }}</div>
      <div class="amount-input"> {{ selectedAmount.integral }} 积分</div>
      <div class="amount-options">
        <button v-for="amount in amounts" :key="amount.value" @click="selectAmount(amount)"
                :class="{ selected: selectedAmount.level === amount.level }">
          {{ amount.value }}
        </button>
      </div>
      <button class="submit-button" @click="submitAmount">充值</button>
    </div>
    <div>
      <form method="post" :action="'https://gateway.xddpay.com'" enctype="application/x-www-form-urlencoded">
        <!--    order_no subject pay_type money app_id extra sign    -->
        <input type="hidden" name="order_no" v-model="payReq.order_no">
        <input type="hidden" name="subject" v-model="payReq.subject">
        <input type="hidden" name="pay_type" v-model="payReq.pay_type">
        <input type="hidden" name="money" v-model="selectedAmount.value">
        <input type="hidden" name="app_id" v-model="payReq.app_id">
        <input type="hidden" name="extra" v-model="payReq.extra">
        <input type="hidden" name="sign" v-model="payReq.sign">
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import urlObj from "@/urlObj";

export default {
  data() {
    return {
      selectedAmount: {value: 0, level: 0,integral:0},
      amounts: [
      ],
      payReq: {
        order_no: '',
        subject: '',
        pay_type: '',
        money: '',
        app_id: '',
        extra: '',
        sign: ''
      }
    };
  },
  methods: {
    selectAmount(amount) {
      this.selectedAmount = amount;
    },
    submitAmount() {
      axios.get(urlObj.pay.pay, {
        params: {
          level: this.selectedAmount.level
        }
      }).then((res) => {
        if (res.data.code === 200) {
          this.$set(this.payReq, "order_no", res.data.data.order_no)
          this.$set(this.payReq, "subject", res.data.data.subject)
          this.$set(this.payReq, "pay_type", res.data.data.pay_type)
          this.$set(this.payReq, "money", res.data.data.money)
          this.$set(this.payReq, "app_id", res.data.data.app_id)
          this.$set(this.payReq, "extra", res.data.data.extra)
          this.$set(this.payReq, "sign", res.data.data.sign)
          console.log(this.payReq)
          const form = document.forms[0];
          form.order_no.value = this.payReq.order_no;
          form.subject.value = this.payReq.subject;
          form.pay_type.value = this.payReq.pay_type;
          form.money.value = this.payReq.money;
          form.app_id.value = this.payReq.app_id;
          form.extra.value = this.payReq.extra;
          form.sign.value = this.payReq.sign;
          console.log(this.payReq)
          form.submit();
        } else {
          this.$notify.error("充值失败，请稍后重试");
        }

      })
    },
    getPayLevels(){
      axios.get(urlObj.pay.payLevels).then((res)=>{
        if (res.data.code === 200){
          this.amounts = res.data.data
          this.selectAmount(this.amounts[0])
        }else {
          this.$notify.error("获取充值金额失败，请稍后重试");
        }
      })
    },
  },
  mounted() {
    this.getPayLevels()
  }
};
</script>

<style scoped>
.alipay-container {
  text-align: center;
  max-width: 400px;
  margin: auto;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.alipay-header {
  margin-bottom: 20px;
}

.alipay-logo {
  width: 100px;
}

.amount-label {
  font-size: 18px;
  margin-bottom: 10px;
}

.amount-input {
  font-size: 24px;
  margin-bottom: 20px;
}

.amount-options {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.amount-options button {
  width: 60px;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
}

.amount-options button.selected {
  border: 2px solid #007bff;
  background-color: #007bff;
  color: white;
}

.submit-button {
  width: 100%;
  padding: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  font-size: 18px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
