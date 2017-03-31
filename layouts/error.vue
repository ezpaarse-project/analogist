<template>
  <section class="text-xs-center">
    <h1>{{ error.statusCode }}</h1>
    <h2>{{ error.message }}</h2>
  </section>
</template>
<script>
export default {
  props: ['error']
}
</script>
