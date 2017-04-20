<template>
  <v-card>
    <v-card-row class="cyan white--text">
      <v-card-title>
        Nouvelle plateforme
      </v-card-title>
    </v-card-row>

    <v-stepper v-model="step" vertical>
      <v-stepper-step step="1" :complete="step > 1">
        Vérifiez que la plateforme n'existe pas déjà
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-container class="mb-5">
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
                        <v-btn type="submit" flat :loading="domain.checking">Vérifier</v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </form>
              </v-card-text>
              <v-card-text>
                <p v-if="domain.checking">
                  Vérification...
                </p>
                <p v-else-if="domain.parser">
                  Le domaine <strong>{{ domain.name }}</strong> est déjà supporté par le parseur <a :href="domain.parser.manifest.trello" target="_blank">{{ domain.parser.manifest.longname }}</a>
                </p>
                <p v-else-if="domain.error">
                  Une erreur est survenue : {{ domain.error.message }}
                </p>
                <p v-else-if="domain.name">
                  Le domaine <strong>{{ domain.name }}</strong> n'a pas encore de parseur associé
                </p>
              </v-card-text>
              </v-card-text>
              <v-card-row actions>
                <v-spacer></v-spacer>
                <v-btn flat v-on:click.native="domainModal = false" class="primary--text">Fermer</v-btn>
              </v-card-row>
            </v-card>
          </v-modal>
        </v-container>

        <v-btn primary @click.native="step++">Suivant</v-btn>
      </v-stepper-content>

      <v-stepper-step step="2" :complete="step > 2">
        Informations sur la plateforme
      </v-stepper-step>
      <v-stepper-content step="2">
        <v-container fluid class="mb-5">
          <v-row>
            <v-col xs12 sm8>
              <v-text-field name="longName" label="Nom" v-model="form.longName" required></v-text-field>
            </v-col>
            <v-col xs12 sm4>
              <v-text-field name="shortName" label="Abréviation" v-model="form.shortName" required></v-text-field>
            </v-col>
            <v-col xs12>
              <v-text-field name="homeUrl" label="Page d'accueil" v-model="form.homeUrl"></v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <v-btn primary :disabled="!form.longName || !form.shortName" @click.native="step++">Suivant</v-btn>
        <v-btn flat @click.native="step--">Précédent</v-btn>
      </v-stepper-content>

      <v-stepper-step step="3" :complete="step > 3">
        Statut de la plateforme
      </v-stepper-step>
      <v-stepper-content step="3">
        <v-container fluid class="mb-5">
          <v-radio
            v-for="list in lists"
            :key="list.id"
            v-model="form.idList"
            :label="list.name"
            :value="list.id"
            hide-details
          />
        </v-container>

        <v-btn primary :disabled="!form.idList" :loading="creating" @click.native="createCard()">Créer</v-btn>
        <v-btn flat @click.native="step--">Précédent</v-btn>
      </v-stepper-content>
    </v-stepper>
  </v-card>
</template>

<script>
export default {
  name: 'new',
  data () {
    return {
      step: 1,
      form: {
        longName: '',
        shortName: '',
        idList: null
      },
      domain: {
        name: '',
        checking: false,
        parser: null,
        error: null
      },
      domainInput: '',
      domainModal: false,
      creating: false,
      error: null
    }
  },
  head () {
    return {
      title: 'Nouvelle plateforme'
    }
  },
  async fetch ({ store }) {
    await store.dispatch('FETCH_TRELLO_LISTS')
  },
  computed: {
    lists () {
      return this.$store.state.lists.trelloLists
    },
    canEdit () {
      return this.$store.state.user && this.$store.state.user.isAuthorized
    }
  },
  methods: {
    async checkDomain (domain) {
      if (!domain) { return }

      this.domain.checking = true
      this.domain.name = domain
      this.domain.parser = null
      this.domain.error = null

      try {
        const res = await this.$store.dispatch('CHECK_DOMAIN', this.domain.name)
        this.domain.parser = res
      } catch (e) {
        this.domain.error = e
      }

      this.domain.checking = false
    },
    async createCard () {
      this.creating = true

      let desc

      if (this.form.homeUrl) {
        desc = `Url de la page d'accueil de la plateforme :\n${this.form.homeUrl}`
      }

      try {
        const card = await this.$store.dispatch('CREATE_CARD', {
          name: `${this.form.longName} [${this.form.shortName}]`,
          idList: this.form.idList,
          desc
        })

        this.$router.push(`/platforms/${card.id}`)
      } catch (e) {
        this.error = e
      }

      this.creating = false
    }
  }
}
</script>

<style scoped>
.align-center {
  align-items: center
}
</style>
