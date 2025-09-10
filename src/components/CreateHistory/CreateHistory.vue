<template>
  <div class="create-history-div">
    <HistorySearchForm class="history-search-form" @sub="formSub"></HistorySearchForm>
    <HistoryList @view="viewImage" :form="form" class="history-list"></HistoryList>
    <XyzTransition xyz="fade flip-left perspective-1">
      <div class="square" v-if="showImageView">
        <ImageView @close="showImageView=false" :src="showImageViewSrc" v-show="showImageView"></ImageView>
      </div>
    </XyzTransition>
  </div>
</template>

<script>

import {defineComponent} from "vue";
import HistoryList from "@/components/CreateHistory/HistoryList.vue";
import HistorySearchForm from "@/components/CreateHistory/HistorySearchForm.vue";
import ImageView from "@/components/CreatePicture/ImageView.vue";


export default defineComponent({
  components: {ImageView, HistoryList,HistorySearchForm},
  data(){
    return{
      showImageView: false,
      showImageViewSrc: '',
      form:{},
    }
  },
  methods:{
    viewImage(url){
      this.showImageViewSrc = url;
      this.showImageView = true;
    },
    formSub(form){
      this.form = form;
    }
  },
})
</script>

<style scoped>
.create-history-div{
  background-color: #2d2d2d;
  width: 100vw;
  height: 100vh;
}
.history-search-form{
  float: left;
  width: 20%;
  box-sizing: border-box;
}
.history-list{
  width: 80%;
  float: right;
  box-sizing: border-box;
}


</style>