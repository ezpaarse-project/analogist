<template>
  <section>
    <v-card>
      <v-toolbar
        class="secondary"
        dense
        dark
        flat
      >
        <v-toolbar-title>
          Badges
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-layout wrap>
          <v-flex
            v-if="metrics && metrics.length"
            xs12
            sm12
          >
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              :label="$t('ui.search')"
              single-line
            />
          </v-flex>

          <v-flex
            xs12
            sm12
            mb-3
          >
            <v-data-table
              v-if="metrics && metrics.length"
              :headers="headers"
              :items="metrics"
              item-key="badge.id"
              hide-default-footer
              header-props.sort-icon="mdi-menu-down"
              :search="search"
              disable-pagination
              :expanded.sync="expanded"
              show-expand
              class="elevation-1"
            >
              <template #[`item.badge.image`]="{ item }">
                <img
                  :src="item.badge.image"
                  class="badgeImage"
                  alt="badge"
                >
              </template>
              <template #[`item.badge.name`]="{ item }">
                <span v-if="$i18n.locale === 'fr'">{{ item.badge.name }}</span>
                <span v-else>{{ item.badge.alt_language[$i18n.locale].name }}</span>
              </template>
              <template #expanded-item="{ headers: tableHeaders, item }">
                <td :colspan="tableHeaders.length">
                  <v-layout
                    v-if="user"
                    row
                    wrap
                    justify-center
                  >
                    <template v-for="u in item.users">
                      <v-flex :key="u.userId">
                        <v-list-item>
                          <v-list-item-avatar>
                            <img
                              v-if="u.avatarUrl"
                              :src="`${u.avatarUrl}/50.png`"
                              alt="avatar"
                            >
                            <span v-else>
                              <v-avatar color="blue-grey lighten-4">
                                <span class="white--text headline"><small>{{ u.initials }}</small></span>
                              </v-avatar>
                            </span>
                          </v-list-item-avatar>

                          <v-list-item-content>
                            <v-list-item-title>{{ u.fullName }}</v-list-item-title>
                            <v-list-item-subtitle>{{ $dateFns.format(new Date(u.issuedOn) * 1000, 'PPPP') }}</v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                      </v-flex>
                    </template>
                  </v-layout>

                  <v-layout
                    v-else
                    row
                    wrap
                    justify-center
                  >
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <p v-html="$t('mustBeConnected')" />
                  </v-layout>
                </td>
              </template>
              <template #no-results>
                <v-alert
                  :value="true"
                  color="info"
                  icon="mdi-alert-circle"
                >
                  {{ $t('badges.searchNotFound', { search }) }}
                </v-alert>
              </template>
            </v-data-table>

            <v-card
              v-else
              class="red white--text"
            >
              <v-card-text>
                {{ $t('badges.noMetrics') }}
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>

        <a
          href="https://openbadgefactory.com/"
          target="blank"
        >
          <img
            src="@/static/obf_logo.png"
            alt="OpenBadgeFactory"
            :class="{ 'error': !ping }"
            class="obfactory"
            align="right"
          >
        </a>

        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              text
              icon
              aria-label="Informations"
              href="https://blog.ezpaarse.org/2018/06/communication-les-badges-ezpaarse/"
              target="_blank"
              rel="noreferrer"
              v-on="on"
            >
              <v-icon>mdi-help-circle</v-icon>
            </v-btn>
          </template>
          <span>Informations</span>
        </v-tooltip>
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
export default {
  data () {
    return {
      search: '',
      currentBadge: null,
      headers: [
        {
          text: '',
          value: 'badge.image',
          width: 32
        },
        {
          text: 'Badges',
          align: 'left',
          sortable: false,
          value: 'badge.name'
        },
        {
          text: 'AnalogIST',
          align: 'left',
          value: 'issues.app'
        },
        {
          text: '',
          value: 'data-table-expand'
        }
      ],
      expanded: []
    }
  },
  async fetch ({ store, $auth, $config, error }) {
    if (!$config.badgesEnabled) {
      return error({ statusCode: 404, message: 'Page not found' })
    }

    try {
      await store.dispatch('badges/getPing')
    } catch (e) {
      await store.dispatch('snacks/error', 'badges.pingError')
    }

    const { user } = $auth.$state

    try {
      await store.dispatch('badges/getMembers', user)
    } catch (e) { }

    try {
      await store.dispatch('badges/getMetrics', (user && user.role === 'admin'))
    } catch (e) {
      await store.dispatch('snacks/error', 'badges.noMetrics')
    }
  },
  computed: {
    metrics () {
      return this.$store.state.badges.metrics
    },
    ping () {
      return this.$store.state.badges.ping
    },
    user () {
      return this.$auth.$state.user
    }
  }
}
</script>

<style scoped>
img.obfactory {
  width: 220px;
}
img.error {
  filter: grayscale(100%);
  opacity: 0.6;
}
.badgeImage {
  width: 32px;
  vertical-align: middle;
}
</style>
