<template>
  <v-menu bottom left>
    <v-btn icon slot="activator">
      <v-icon>language</v-icon>
    </v-btn>
    <v-list>
      <v-list-item v-for="lang in locales" :key="lang.value">
        <v-list-tile v-on:click.native="$i18n.locale = lang.value">
          <v-list-tile-title>{{ lang.name }}</v-list-tile-title>
        </v-list-tile>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data () {
    return {
      locales: [
        { name: 'Français', value: 'fr' },
        { name: 'English', value: 'en' }
      ]
    }
  }
}
</script>
