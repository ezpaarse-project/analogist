<template>
  <v-app>
    <main>
      <v-container
        fluid
        fill-height
      >
        <v-layout
          row
          wrap
          align-center
          justify-center
        >
          <v-flex
            xs12
            sm8
            md4
            class="text-center"
          >
            <v-card
              text
              color="transparent"
              pa-5
              flat
            >
              <v-card-text class="text-center">
                <v-icon size="128">
                  mdi-emoticon-sad-outline
                </v-icon>
                <h1
                  v-if="error"
                  class="display-3"
                >
                  {{ error.statusCode }}
                </h1>
                <h2 v-if="error">
                  {{ error.message }}
                </h2>
                <h1
                  v-if="!error"
                  class="display-3"
                >
                  {{ $t('errorGeneric') }}
                </h1>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </main>
  </v-app>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default: () => ({})
    }
  },
  head () {
    return {
      htmlAttrs: {
        lang: this.$i18n.locale
      }
    }
  },
  computed: {
    dark () {
      return this.$store.state.dark
    }
  }
}
</script>
