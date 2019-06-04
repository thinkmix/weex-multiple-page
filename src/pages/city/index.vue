<template>
  <div class="wrapper">
    <image :src="logo" class="logo" />
    <text class="greeting">The environment is ready!</text>
    <text class="greeting">city page index!</text>
    <div @click="toBack" style="font-size: 50px;margin-top: 50px">Click back to home index</div>
  </div>
</template>

<script>
let navigator =  weex.requireModule('navigator');
export default {
  name: 'cityIndex',
  data () {
    return {
      logo: 'https://gw.alicdn.com/tfs/TB1yopEdgoQMeJjy1XaXXcSsFXa-640-302.png'
    }
  },
  mounted(){
    
  },
  methods:{
    toBack(){
        navigator.pop({animated: "true"})
    }
  }
}
</script>

<style scoped>
  .wrapper {
    justify-content: center;
    align-items: center;
  }
  .logo {
    width: 424px;
    height: 200px;
  }
  .greeting {
    text-align: center;
    margin-top: 70px;
    font-size: 50px;
    color: #41B883;
  }
  .message {
    margin: 30px;
    font-size: 32px;
    color: #727272;
  }
</style>
