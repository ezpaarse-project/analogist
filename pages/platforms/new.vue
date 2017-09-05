<template>
  <section>
    <v-btn flat router exact :to="{ path: '/' }"><v-icon left>mdi-arrow-left</v-icon>{{ $t('ui.back') }}</v-btn>

    <v-card>
      <v-toolbar class="secondary" dense dark card>
        <v-toolbar-title>
          {{ $t('creation.newPlatform') }}
        </v-toolbar-title>
      </v-toolbar>

      <v-stepper v-model="step" vertical>
        <v-stepper-step step="1" :complete="step > 1">
          {{ $t('creation.domainCheck') }}
        </v-stepper-step>
        <v-stepper-content step="1">
          <v-container class="mb-5">
            <DomainChecker></DomainChecker>
          </v-container>

          <v-btn primary @click.native="step++">{{ $t('creation.next') }}</v-btn>
        </v-stepper-content>

        <v-stepper-step step="2" :complete="step > 2">
          {{ $t('creation.platformInfo') }}
        </v-stepper-step>
        <v-stepper-content step="2">
          <v-container fluid grid-list-md>
            <v-layout row wrap>
              <v-flex xs12 sm8>
                <v-text-field name="longName" :label="$t('creation.name')" v-model="form.longName" required></v-text-field>
              </v-flex>
              <v-flex xs12 sm4>
                <v-text-field name="shortName" :label="$t('creation.abv')" v-model="form.shortName" required></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field name="homeUrl" :label="$t('creation.homepage')" v-model="form.homeUrl"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>

          <v-btn primary :disabled="!form.longName || !form.shortName" @click.native="step++">{{ $t('creation.next') }}</v-btn>
          <v-btn flat @click.native="step--">{{ $t('creation.previous') }}</v-btn>
        </v-stepper-content>

        <v-stepper-step step="3" :complete="step > 3">
          {{ $t('creation.platformStatus') }}
        </v-stepper-step>
        <v-stepper-content step="3">
          <v-radio-group v-model="form.idList">
            <v-radio
              v-for="list in lists"
              :key="list.id"
              :label="list.name"
              :value="list.id"
            />
          </v-radio-group>

          <v-btn primary :disabled="!form.idList" :loading="creating" @click.native="createCard()">{{ $t('creation.create') }}</v-btn>
          <v-btn flat @click.native="step--">{{ $t('creation.previous') }}</v-btn>
        </v-stepper-content>
      </v-stepper>
    </v-card>
  </section>
</template>

<script>
import DomainChecker from '~/components/DomainChecker'

export default {
  name: 'new',
  transition: 'slide-x-transition',
  components: {
    DomainChecker
  },
  data () {
    return {
      step: 1,
      creating: false,
      error: null,
      form: {
        longName: '',
        shortName: '',
        idList: null
      }
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
      return this.$store.state.trelloLists
    },
    canEdit () {
      return this.$store.state.user && this.$store.state.user.isAuthorized
    }
  },
  methods: {
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
</style>
