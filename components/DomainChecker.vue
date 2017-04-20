<template>
  <form @submit.prevent="checkDomain(domainInput)">
    <v-container fluid>
      <v-row class="align-center">
        <v-text-field hide-details name="domain" label="Nom de domaine" v-model="domainInput" autocomplete="off"></v-text-field>
        <v-btn type="submit" flat :loading="checking">Vérifier</v-btn>
      </v-row>
      <v-row>
        <p v-if="checking">Vérification...</p>
        <p v-else-if="parser">Le domaine <strong>{{ domainName }}</strong> est déjà supporté par le parseur <a :href="parser.manifest.trello" target="_blank">{{ parser.manifest.longname }}</a>.</p>
        <p v-else-if="error">Une erreur est survenue : {{ error.message }}</p>
        <p v-else-if="domainName">Le domaine <strong>{{ domainName }}</strong> n'a pas encore de parseur associé.</p>
        <p v-else>Entrez un nom de domaine susceptible d'héberger des ressources.</p>
      </v-row>
    </v-container>
  </form>
</template>

<script>
export default {
  data () {
    return {
      domainName: '',
      domainInput: '',
      checking: false,
      parser: null,
      error: null
    }
  },
  methods: {
    async checkDomain (domain) {
      if (!domain) { return }

      this.checking = true
      this.domainName = domain
      this.parser = null
      this.error = null

      try {
        const res = await this.$store.dispatch('CHECK_DOMAIN', this.domainName)
        this.parser = res
      } catch (e) {
        this.error = e
      }

      this.checking = false
    }
  }
}
</script>

<style scoped>
  .align-center {
    align-items: center
  }
</style>