<template>
  <section>

    <v-container>
      <v-btn class="blue-grey mx-0" router href="/">Retour</v-btn>

      <v-card>
        <v-card-row class="blue-grey white--text">
          <v-card-title>
            {{ card.name }}
          </v-card-title>
        </v-card-row>

        <v-card-text>
          <v-card-row class="ma-2">
            <div>
              <div>Dernière activité</div>
              <strong>{{ card.dateLastActivity }}</strong>
            </div>
          </v-card-row>
          <v-card-row class="ma-2">
            <div>
              <div>Statut</div>
              <strong>{{ list.name }}</strong>
            </div>
          </v-card-row>
        </v-card-text>

        <v-divider/>
        <v-subheader>Contributeurs</v-subheader>
        <v-list>
          <v-list-item v-for="member in card.members" v-bind:key="member.id">
            <v-list-tile avatar :href="'https://trello.com/' + member.username">
              <v-list-tile-avatar>
                <img v-if="member.avatarHash" :src="'https://trello-avatars.s3.amazonaws.com/' + member.avatarHash + '/50.png'" alt="avatar">
                <span v-else>{{ member.initials }}</span>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title v-text="member.fullName" />
              </v-list-tile-content>
            </v-list-tile>
          </v-list-item>
        </v-list>

        <v-card-row actions>
          <v-btn tag="a" flat class="blue-grey--text" target="_blank" v-if="card.githubUrl" :href="card.githubUrl">Github</v-btn>
          <v-btn tag="a" flat class="blue-grey--text" target="_blank" v-if="card.homeUrl" :href="card.homeUrl">Page d'accueil</v-btn>
          <v-btn tag="a" flat class="blue-grey--text" target="_blank" v-if="card.url" :href="card.url">Carte Trello</v-btn>
        </v-card-row>
      </v-card>
    </v-container>
  </section>
</template>

<script>
import axios from '~plugins/axios'

export default {
  name: 'id',
  async fetch ({ params, store, error }) {
    await store.dispatch('FETCH_TRELLO_LISTS')

    try {
      await store.dispatch('FETCH_CARD', params.id)
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
      return this.$store.state.current.card
    },
    analyses () {
      return this.$store.state.analyses
    },
    list () {
      return this.$store.state.lists.trelloLists.find(l => this.card.idList === l.id)
    }
  }
}
</script>
