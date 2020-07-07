<template>
  <section>
    <v-btn
      text
      router
      exact
      :to="{ path: '/platforms' }"
      class="mb-2 body-2"
    >
      <v-icon left>
        mdi-arrow-left
      </v-icon>{{ $t('ui.back') }}
    </v-btn>

    <v-card>
      <v-toolbar
        class="secondary"
        dense
        dark
        flat
      >
        <v-toolbar-title>{{ $t('creation.newPlatform') }}</v-toolbar-title>
      </v-toolbar>

      <v-stepper
        v-model="step"
        vertical
      >
        <v-stepper-items>
          <v-stepper-step
            step="1"
            :complete="step > 1"
            complete-icon="mdi-check"
          >
            {{ $t('creation.domainCheck') }}
          </v-stepper-step>
          <v-stepper-content step="1">
            <v-container class="mb-5">
              <DomainChecker />
            </v-container>

            <v-btn
              color="primary"
              @click.native="step++"
            >
              {{ $t('creation.next') }}
            </v-btn>
          </v-stepper-content>

          <v-stepper-step
            step="2"
            :complete="step > 2"
            complete-icon="mdi-check"
          >
            {{ $t('creation.platformInfo') }}
          </v-stepper-step>
          <v-stepper-content step="2">
            <v-container
              fluid
              grid-list-md
            >
              <v-layout
                row
                wrap
              >
                <v-flex
                  xs12
                  sm8
                >
                  <v-text-field
                    v-model="form.longName"
                    name="longName"
                    :label="$t('creation.name')"
                    required
                  />
                </v-flex>
                <v-flex
                  xs12
                  sm4
                >
                  <v-text-field
                    v-model="form.shortName"
                    name="shortName"
                    :label="$t('creation.abv')"
                    required
                  />
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    v-model="form.homeUrl"
                    name="homeUrl"
                    :label="$t('creation.homepage')"
                  />
                </v-flex>
              </v-layout>
            </v-container>

            <v-btn
              color="primary"
              :disabled="!form.longName || !form.shortName"
              @click.native="step++"
            >
              {{ $t('creation.next') }}
            </v-btn>
            <v-btn
              text
              @click.native="step--"
            >
              {{ $t('creation.previous') }}
            </v-btn>
          </v-stepper-content>

          <v-stepper-step
            step="3"
            :complete="step > 3"
            complete-icon="mdi-check"
          >
            {{ $t('creation.platformStatus') }}
          </v-stepper-step>
          <v-stepper-content step="3">
            <v-select
              v-model="form.idList"
              :items="lists"
              :label="$t('creation.platformStatus')"
              append-icon="mdi-menu-down"
              item-text="name"
              item-value="id"
              single-line
              bottom
            />

            <v-btn
              color="primary"
              :disabled="!form.idList"
              :loading="creating"
              @click.native="createCard()"
            >
              {{ $t('creation.create') }}
            </v-btn>
            <v-btn
              text
              @click.native="step--"
            >
              {{ $t('creation.previous') }}
            </v-btn>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card>
  </section>
</template>

<script>
import DomainChecker from '~/components/DomainChecker'

export default {
  name: 'New',
  transition: 'slide-x-transition',
  components: {
    DomainChecker
  },
  async fetch ({ store, redirect }) {
    await store.dispatch('FETCH_TRELLO_LISTS')

    if (!store.state.user || !store.state.user.isAuthorized) {
      redirect('/')
    }
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

        this.$router.push({
          name: 'platforms-cid',
          params: { cid: card.id }
        })
      } catch (e) {
        this.error = e
      }

      this.creating = false
    }
  },
  head () {
    return {
      title: 'Nouvelle plateforme'
    }
  }
}
</script>

<style scoped>
</style>
