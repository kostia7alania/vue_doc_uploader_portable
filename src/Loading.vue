<template>
  <div class="preloader">
    <img :src="iconsPath+'preloader.svg'">
  </div>
</template>
<style>
  .preloader {
    text-align: center;
  }
</style>
<script>
export default {
  props:['iconsPath']
}
</script>
