<template>
  <v-app
    id="analogist"
    :dark="dark"
  >
    <Drawer />
    <Header />

    <v-main>
      <v-container fluid>
        <nuxt class="px-3" />
        <Snackbar />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  head() {
    return {
      htmlAttrs: {
        lang: this.$i18n.locale,
      },
    };
  },
  computed: {
    dark() {
      return this.$store.state.dark;
    },
  },
};
</script>
