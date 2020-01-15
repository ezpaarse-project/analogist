<template>
  <section>
    <v-card>
      <v-toolbar class="secondary" dense dark flat>
        <v-toolbar-title>{{ $t('cards.home') }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-container fluid grid-list-md style="font-size: 1.2em;">
          <div class="text-center">
            <p>
              <img src="@/static/logo-analogist.png">
            </p>
            <v-chip pill>
              <v-avatar left color="primary white--text">
                <span v-text="infos.platforms || '—'"></span>
              </v-avatar>
              <span>{{ $t('home.identifiedPlatforms') }}</span>
            </v-chip>

            <v-chip pill>
              <v-avatar left color="primary white--text">
                <span v-text="infos.analyses || '—'"></span>
              </v-avatar>
              <span>{{ $t('home.analyses') }}</span>
            </v-chip>

            <v-chip pill>
              <v-avatar left color="primary white--text">
                <span v-text="parsers || '—'"></span>
              </v-avatar>
              <span>{{ $t('home.parsers') }}</span>
            </v-chip>

            <v-chip pill>
              <v-avatar left color="primary white--text">
                <span v-text="trelloBoardMembers || '—'"></span>
              </v-avatar>
              <span>{{ $t('home.contributors') }}</span>
            </v-chip>

            <v-chip pill>
              <v-avatar left color="primary white--text">
                <span v-text="badges || '—'"></span>
              </v-avatar>
              <span>{{ $t('home.badges') }}</span>
            </v-chip>
          </div>

          <v-layout row wrap mt-4>
            <v-flex xs12 sm12>
              <p class="text-xs-justify">
                <a href="https://www.ezpaarse.org/" target="_blank">ezPAARSE</a> est aujourd’hui livré avec une liste de <a href="https://github.com/ezpaarse-project/ezpaarse-platforms" target="_blank"><span class="font-weight-bold">{{ parsers }} parseurs</span></a>, qui sont le résultat d’un travail d’analyse fourni par la communauté, et qui assurent aux établissements utilisateurs une bonne couverture de leurs abonnements aux ressources électroniques.
              </p>
              <p class="text-xs-justify">
                La plateforme communautaire, appelée <span class="font-weight-bold">AnalogIST</span>, est l’endroit où les différents types d'URLs sont collectés, analysés semi-automatiquement et commentés pour que le parseur correspondant puisse être précis et complet. Pour les éditeurs ou fournisseurs qui ne sont pas encore reconnus par <a href="https://www.ezpaarse.org/" target="_blank">ezPAARSE</a> ou qui ont simplement besoin d'une mise à jour, il est facile de venir contribuer à une analyse de plateforme : pour cela, il suffit d’ouvrir un compte Trello et de suivre le guide !
              </p>
              <p class="text-xs-justify">
                Une fois l’analyse jugée suffisante, ou complète, un informaticien (généralement de l’équipe <a href="https://www.ezpaarse.org/" target="_blank">ezPAARSE</a>/<a href="https://ezmesure.couperin.org/" target="_blank">ezMESURE</a> prend le relais pour implémenter le parseur correspondant. Ce parseur viendra s’ajouter aux parseurs existants dans le dépôt <a href="https://github.com/ezpaarse-project/ezpaarse-platforms" target="_blank">github</a> dédié et pourra être récupéré par toutes les instances d’<a href="https://www.ezpaarse.org/" target="_blank">ezPAARSE</a>, par un mécanisme simple de mise à jour embarqué dans la zone d’administration du logiciel. Ce mode de fonctionnement garantit que chaque nouveau parseur, ainsi que chacune des mises à jour du logiciel et de ses ressources, profitent à toutes les installations existantes d’<a href="https://www.ezpaarse.org/" target="_blank">ezPAARSE</a> : le travail n’est nécessaire qu’à un endroit et une seule fois.
              </p>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  name: 'analogist',
  transition: 'slide-x-transition',
  head () {
    return {
      title: 'Analogist'
    }
  },
  async asyncData () {
    const { data } = await axios.get('http://ezpaarse-preprod.couperin.org/info/platforms')
    if (!Array.isArray(data)) { throw new Error('invalid response') }
    return {
      parsers: data.length
    }
  },
  async fetch ({ store }) {
    await store.dispatch('FETCH_CARDS')
    await store.dispatch('FETCH_TRELLO_BOARD_MEMBERS')
    await store.dispatch('badges/getMetrics')
  },
  computed: {
    infos () {
      return {
        platforms: this.$store.state.cards.length,
        analyses: this.$store.state.cards.reduce((a, b) => (a + ((b.platform && b.platform.analyses) ? b.platform.analyses.length : 0)), 0)
      }
    },
    trelloBoardMembers () {
      return this.$store.state.trelloBoardMembers.length
    },
    badges () {
      return this.$store.state.badges.metrics.reduce((a, b) => (a + b.issues.app), 0)
    }
  }
}
</script>
