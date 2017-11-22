<template>
  <section>
    <v-layout row justify-space-between>
      <v-btn flat router exact :to="{ path: '/' }"><v-icon left>mdi-arrow-left</v-icon>{{ $t('ui.back') }}</v-btn>
      <v-btn flat router exact :to="{ name: 'platforms-cid-analyses', params: { cid: $route.params.cid } }">Analyses ({{ analyses.length }}) <v-icon right>mdi-arrow-right</v-icon></v-btn>
    </v-layout>

    <v-card>
      <v-toolbar class="secondary" dense dark card>
        <v-toolbar-title>
          {{ card.name }}
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-tooltip left>
          <v-btn slot="activator" icon tag="a" flat target="_blank" v-if="card.githubUrl" :href="card.githubUrl"><v-icon>mdi-github-box</v-icon></v-btn>
          <span>{{ $t('card.github') }}</span>
        </v-tooltip>
        <v-tooltip left>
          <v-btn slot="activator" icon tag="a" flat target="_blank" v-if="card.homeUrl" :href="card.homeUrl"><v-icon>mdi-home</v-icon></v-btn>
          <span>{{ $t('card.homepage') }}</span>
        </v-tooltip>
        <v-tooltip left>
          <v-btn slot="activator" icon tag="a" flat target="_blank" v-if="card.url" :href="card.url"><v-icon>mdi-trello</v-icon></v-btn>
          <span>{{ $t('card.trello') }}</span>
        </v-tooltip>
      </v-toolbar>

      <v-card-text>
        <v-layout row>
          <v-flex>
            <div>{{ $t('card.lastActivity') }}</div>
            <strong>{{ lastActivity }}</strong>
          </v-flex>
          <v-flex>
            <div>{{ $t('card.status') }}</div>
            <strong v-if="list">{{ list.name }}</strong>
            <strong v-else>{{ $t('card.unknown') }}</strong>
          </v-flex>
        </v-layout>
      </v-card-text>

      <v-divider/>

      <template v-if="card.humanCertified || card.publisherCertified">
        <v-subheader>Certifications</v-subheader>

        <v-list>
          <v-list-tile v-if="card.humanCertified" avatar href="http://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/" target="_blank">
            <v-list-tile-avatar>
              <img src="~/assets/img/certif_h.png">
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ $t('card.manuallyVerified') }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile v-if="card.publisherCertified" avatar href="http://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/" target="_blank">
            <v-list-tile-avatar>
              <img src="~/assets/img/certif_p.png">
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ $t('card.publisherVerified') }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-divider/>
      </template>


      <v-subheader>{{ $t('card.contributors') }}</v-subheader>
      <v-list>
        <v-list-tile v-for="member in card.members" v-bind:key="member.id" avatar :href="'https://trello.com/' + member.username">
          <v-list-tile-avatar>
            <img v-if="member.avatarHash" :src="'https://trello-avatars.s3.amazonaws.com/' + member.avatarHash + '/50.png'" alt="avatar">
            <span v-else class="icon blue-grey lighten-4">{{ member.initials }}</span>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title v-text="member.fullName" />
          </v-list-tile-content>
        </v-list-tile>
      </v-list>

    </v-card>
  </section>
</template>

<script>
import moment from 'moment'

export default {
  name: 'platform',
  transition: 'slide-x-transition',
  async fetch ({ params, store, error }) {
    await store.dispatch('FETCH_TRELLO_LISTS')

    try {
      await store.dispatch('FETCH_CARD', params.cid)
    } catch (e) {
      const statusCode = e.response && e.response.status
      const message    = e.response && e.response.statusText

      return error({ statusCode, message: statusCode === 404 ? 'Carte introuvable' : message })
    }
  },
  head () {
    return {
      title: `Platform: ${this.card.name}`
    }
  },
  computed: {
    card () {
      return this.$store.state.card
    },
    analyses () {
      return this.$store.state.analyses
    },
    list () {
      return this.$store.state.trelloLists.find(l => this.card.idList === l.id)
    },
    lastActivity () {
      return moment(this.card.lastActivity).locale(this.$i18n.locale).fromNow()
    }
  }
}
</script>
