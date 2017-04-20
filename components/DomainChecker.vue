<template>
  <v-modal v-model="domainModal">
    <v-btn slot="activator" secondary>domaines supportés</v-btn>
    <v-card>
      <v-card-text>
        Entrez les noms de domaines susceptibles d'héberger des ressources.
      </v-card-text>
      <v-card-text>
        <form @submit.prevent="checkDomain(domainInput)">
          <v-container fluid>
            <v-row class="align-center text-xs-center">
              <v-col xs8>
                <v-text-field hide-details name="domain" label="Nom de domaine" v-model="domainInput" autocomplete="off"></v-text-field>
              </v-col>
              <v-col xs4>
                <v-btn type="submit" flat :loading="checking">Vérifier</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </form>
      </v-card-text>
      <v-card-text>
        <p v-if="checking">Vérification...</p>
        <p v-else-if="parser">Le domaine <strong>{{ domainName }}</strong> est déjà supporté par le parseur <a :href="parser.manifest.trello" target="_blank">{{ parser.manifest.longname }}</a></p>
        <p v-else-if="error">Une erreur est survenue : {{ error.message }}</p>
        <p v-else-if="domainName">Le domaine <strong>{{ domainName }}</strong> n'a pas encore de parseur associé</p>
      </v-card-text>
      </v-card-text>
      <v-card-row actions>
        <v-spacer></v-spacer>
        <v-btn flat v-on:click.native="domainModal = false" class="primary--text">Fermer</v-btn>
      </v-card-row>
    </v-card>
  </v-modal>
</template>

<script>
export default {
  data () {
    return {
      domainName: '',
      domainInput: '',
      checking: false,
      parser: null,
      error: null,
      domainModal: false
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
  a { color: inherit }
</style>