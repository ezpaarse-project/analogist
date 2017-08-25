<template>
  <v-footer>
    <v-spacer></v-spacer>
    <div>
      AnalogIST v{{appVersion}} - <a href="https://github.com/ezpaarse-project/analogist#readme" target="_blank">GitHub</a>
    </div>
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