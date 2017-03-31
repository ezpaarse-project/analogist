<template>
  <v-footer class="red accent-3">
    AnalogIST v{{appVersion}} - <a href="https://github.com/ezpaarse-project/analogist#readme" target="_blank">GitHub</a>
  </v-footer>
</template>

<script>
export default {
  computed: {
    appVersion () {
      return this.$store.state.app.version
    }
  }
}
</script>

<style scoped>
  a { color: inherit }
</style>