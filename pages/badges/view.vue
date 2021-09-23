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
          {{ $t('badges.title') }} <v-chip
            v-if="badges && badges.badges"
            color="grey lighten-2"
          >
            <strong>{{ badgesOwned }}</strong> / {{ badges.badges.length }}
          </v-chip>
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-layout
          v-if="badges && badges.badges"
          wrap
          justify-center
        >
          <v-flex
            xs12
            sm12
          >
            <v-switch
              v-model="visibility"
              style="float: right"
              :label="visibility ? $t('badges.public') : $t('badges.private')"
            />
          </v-flex>
        </v-layout>

        <v-layout
          v-if="badges && badges.badges && ping"
          wrap
          justify-center
        >
          <v-flex
            v-for="badge in badges.badges"
            :key="badge.id"
            xs12
            sm2
            :class="{ 'notPossessed' : !badge.issued_on }"
            @click="currentBadge = badge; linkedInModal = false"
          >
            <img
              class="mx-auto badgeImage"
              :src="badge.image"
              alt="badge"
            >
            <h4
              v-if="$i18n.locale === 'fr'"
              class="badgeName"
            >
              {{ badge.name }}
            </h4>
            <h4
              v-else
              class="badgeName"
            >
              {{ badge.alt_language[$i18n.locale].name }}
            </h4>
          </v-flex>

          <v-flex
            v-if="!ping"
            xs12
            sm12
          >
            <v-card class="red white--text">
              <v-card-text>
                {{ $t('badges.error') }}
              </v-card-text>
            </v-card>
          </v-flex>

          <v-dialog
            v-if="currentBadge && !linkedInModal"
            v-model="currentBadge"
            max-width="600px"
          >
            <badge-card
              :badge="currentBadge"
              :user-id="user.id"
              @closeCard="closeCard"
              @linkedIn="linkedIn"
            />
          </v-dialog>

          <v-dialog
            v-if="linkedInModal && currentBadge"
            v-model="currentBadge"
            max-width="600px"
          >
            <linked-in-card
              :badge="currentBadge"
              :user-id="user.id"
              @closeLinkedInCard="closeLinkedInCard"
            />
          </v-dialog>
        </v-layout>

        <v-layout v-else>
          <v-flex
            xs12
            sm12
            mb-2
          >
            <v-card class="red white--text">
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
          <template v-slot:activator="{ on }">
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
  name: 'Badges',
  transition: 'slide-x-transition',
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
      await store.dispatch('badges/getBadges', { id: $auth.$state.user.id, locale: app.i18n.locale })
    } catch (e) {
      await store.dispatch('snacks/error', 'badges.noMetrics')
    }
  },
  data () {
    return {
      modal: false,
      currentBadge: null,
      linkedInModal: false,
      visible: false
    }
  },
  computed: {
    badges () {
      return this.$store.state.badges
    },
    badgesOwned () {
      let badgesOwend = 0
      if (this.$store.state.badges.badges) {
        this.$store.state.badges.badges.forEach(badge => {
          if (badge.issued_on) badgesOwend += 1
        })
      }
      return badgesOwend
    },
    visibility: {
      get () { return this.$store.state.badges.visibility },
      set (newVal) { this.$store.dispatch('badges/setVisiblity', newVal) }
    },
    ping () {
      return this.$store.state.badges.ping
    },
    user () {
      return this.$auth.$state.user
    }
  },
  watch: {
    user: function () {
      if (!this.user) return this.$router.push('/badges/list')
    }
  },
  methods: {
    closeCard () {
      this.currentBadge = null
      this.linkedInModal = false
    },
    linkedIn () {
      this.linkedInModal = true
    },
    closeLinkedInCard () {
      this.linkedInModal = false
      this.currentBadge = null
    }
  },
  head () {
    return {
      title: 'Badges'
    }
  }
}
</script>

<style scoped>
.vTitle {
  text-transform: none;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: .02em;
}
img.obfactory {
  width: 220px;
}
img.error {
  filter: grayscale(100%);
  opacity: 0.6;
}
.badgeImage {
  display: block;
  margin: auto;
  cursor: pointer;
}
.badgeName {
  text-align: center;
  cursor: pointer;
}
.notPossessed {
  filter: grayscale(100%);
  opacity: 0.6;
  transition: all 0.5s ease-in-out;
}
.notPossessed:hover {
  filter: grayscale(0%);
  opacity: 1;
}
</style>
