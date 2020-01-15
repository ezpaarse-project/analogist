<template>
  <v-app>
    <main>
      <v-container fluid fill-height>
        <v-layout row wrap align-center justify-center>
          <v-flex xs12 sm8 md4 class="text-center">
            <v-card text color="transparent" pa-5 flat>
              <v-card-text class="text-center">
                <v-icon size="128">mdi-emoticon-sad-outline</v-icon>
                <h1 class="display-3">
                  {{ error.statusCode }}
                </h1>
                <h2>{{ error.message }}</h2>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import AppHeader from '~/components/Header.vue'
import AppDrawer from '~/components/Drawer.vue'

export default {
  props: ['error'],
  components: {
    AppHeader,
    AppDrawer
  },
  computed: {
    dark () {
      return this.$store.state.dark
    }
  }
}
</script>
