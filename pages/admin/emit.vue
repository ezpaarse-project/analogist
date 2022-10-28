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
          {{ $t('badges.emitBadge') }}
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-layout
          v-if="ping"
          wrap
        >
          <v-flex
            v-if="trelloBoardMembers && trelloBoardMembers.length"
            xs12
            sm6
          >
            <v-autocomplete
              v-model="currentBoardMember"
              :items="trelloBoardMembers"
              :label="$t('badges.users')"
              persistent-hint
              :no-data-text="$t('badges.userNotFound')"
              single-line
              return-object
              item-text="member.fullName"
              append-icon="mdi-chevron-down"
              hide-details
              class="mx-1"
            >
              <template
                slot="item"
                slot-scope="{ item }"
              >
                <v-list-item-avatar>
                  <img
                    v-if="item.member.avatarUrl"
                    :src="`${item.member.avatarUrl}/50.png`"
                    alt="avatar"
                  >
                  <span v-else>
                    <v-avatar color="blue-grey lighten-4">
                      <span class="white--text headline"><small>{{ item.member.initials }}</small></span>
                    </v-avatar>
                  </span>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ item.member.fullName }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.member.username }}</v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-autocomplete>
          </v-flex>

          <v-spacer />

          <v-flex
            v-if="badges && badges.length"
            xs12
            sm6
          >
            <v-autocomplete
              v-model="currentBadge"
              :items="badges"
              label="Badge(s)"
              persistent-hint
              :no-data-text="$t('badges.badgeNotFound')"
              single-line
              return-object
              item-text="name"
              append-icon="mdi-chevron-down"
              hide-details
              class="mx-1"
            >
              <template
                slot="item"
                slot-scope="{ item }"
              >
                <v-list-item-avatar :class="{ 'isOwn': item.issued_on }">
                  <img
                    :src="item.image"
                    alt="badge"
                  >
                </v-list-item-avatar>
                <v-list-item-content :class="{ 'isOwn': item.issued_on }">
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle v-if="item.issued_on">
                    {{ issuedOn(item.issued_on) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-autocomplete>
          </v-flex>

          <v-flex
            xs12
            sm12
          >
            <v-text-field
              v-model="email"
              label="Email"
              append-icon="mdi-email"
              type="email"
              class="mx-1"
            />
          </v-flex>

          <v-flex
            xs12
            sm12
          >
            <v-btn
              large
              block
              color="success"
              :disabled="!email || !currentBadge || !currentBoardMember"
              :loading="loading"
              @click="emit"
            >
              {{ $t('badges.emitBadge') }}
            </v-btn>
          </v-flex>
        </v-layout>

        <v-layout v-else>
          <v-flex
            xs12
            sm12
          >
            <v-card class="red white--text">
              <v-card-text>
                {{ $t('badges.pingError') }}
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>

        <v-layout>
          <v-flex
            xs12
            sm12
            mt-3
          >
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
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
export default {
  data () {
    return {
      currentBoardMember: null,
      currentBadge: null,
      email: null,
      loading: false
    }
  },
  async fetch ({ store, redirect, app, $auth, $config, error }) {
    if (!$config.badgesEnabled) {
      return error({ statusCode: 404, message: 'Page not found' })
    }

    if (!$auth.state.user) {
      return redirect('/')
    }

    try {
      await store.dispatch('badges/getPing')
    } catch (e) {
      await store.dispatch('snacks/error', 'badges.pingError')
    }

    try {
      await store.dispatch('FETCH_TRELLO_BOARD_MEMBERS')
    } catch (e) {
      await store.dispatch('snacks/error', 'errorGeneric')
    }

    if (store.state.badges && store.state.badges.ping) {
      try {
        await store.dispatch('badges/getBadges', { locale: app.i18n.locale })
      } catch (e) {
        await store.dispatch('snacks/error', 'badges.noMetrics')
      }
    }
  },
  computed: {
    ping () {
      return this.$store.state.badges.ping
    },
    badges () {
      return this.$store.state.badges.badges
    },
    user () {
      return this.$auth.$state.user
    },
    trelloBoardMembers () {
      return this.$store.state.trelloBoardMembers
    }
  },
  watch: {
    user: function () {
      if (!this.user) {
        return this.$router.push('/badges/list')
      }
    },
    currentBoardMember: async function () {
      if (this.currentBoardMember) {
        await this.$store.dispatch('badges/getBadges', { id: this.currentBoardMember.idMember, locale: this.$i18n.locale })
      }
    }
  },
  methods: {
    emit () {
      this.loading = true
      this.$socket.emit('ADD_TO_ROOM', { userId: this.currentBoardMember.idMember })

      this.$store.dispatch('badges/emit', {
        event: {
          badgeId: this.currentBadge.id,
          name: this.currentBadge.name
        },
        profile: {
          id: this.currentBoardMember.idMember,
          fullName: this.currentBoardMember.member.fullName,
          email: this.email
        }
      })

      this.$socket.on('BADGE_EMITTED', (data) => {
        if (data.emitted) {
          this.$store.dispatch('snacks/success', 'badges.emitted')
          this.loading = false
        }
      })
      this.$socket.on('BADGE_EMITTED_MANUALLY', (data) => {
        if (data.emitted) {
          this.$store.dispatch('snacks/success', 'badges.issued')
          this.loading = false
        }
      })
      this.$socket.on('BADGE_ALREADY_OWNED', () => {
        this.$store.dispatch('snacks/info', 'badges.owned')
        this.loading = false
      })

      this.email = null
      this.currentBadge = null
      this.currentBoardMember = null
    },
    issuedOn (date) {
      return date ? this.$dateFns.format(date, 'PPPP') : null
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
.isOwn {
  filter: grayscale(100%);
  opacity: 0.6;
}
</style>
