<template>
  <span>
    <v-list-tile>
      <v-list-tile-avatar color="#F4B48B">
        <span class="white--text headline">H</span>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile>
          <v-menu open-on-hover offset-y>
            <v-btn small slot="activator" class="white--text" color="#F4B48B" depressed :disabled="!user">
              <span v-if="humanCertified">{{ humanCertification}}</span>
              <span v-else>{{ years[0] }}</span>
            </v-btn>
            <v-list v-if="user">
              <v-list-tile v-for="(item, index) in years" :key="index">
                <v-list-tile-title class="pointer" @click="certify(item, 'humanCertified')">{{ item }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <span v-if="humanCertified"> - <a href="https://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/" target="_blank">{{ $t('card.manuallyVerified') }}</a></span>
          <span v-else> - <a href="https://blog.ezpaarse.org/2020/01/tutoriels-procedure-de-certification-h-et-p-dans-analogist" target="_blank">{{ $t('certifications.notCertified') }}</a></span>
        </v-list-tile>
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile>
      <v-list-tile-avatar color="#5AB9C1">
        <span class="white--text headline">P</span>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile>
          <v-menu open-on-hover offset-y>
            <v-btn small slot="activator" class="white--text" color="#5AB9C1" depressed :disabled="!user || !humanCertified">
              <span v-if="publisherCertified">{{ publisherCertification}}</span>
              <span v-else>{{ years[0] }}</span>
            </v-btn>
            <v-list v-if="user && humanCertified">
              <v-list-tile v-for="(item, index) in years" :key="index">
                <v-list-tile-title class="pointer" @click="certify(item, 'publisherCertified')">{{ item }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <span v-if="publisherCertified"> - <a href="https://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/" target="_blank">{{ $t('card.publisherVerified') }}</a></span>
          <span v-else> - <a href="https://blog.ezpaarse.org/2020/01/tutoriels-procedure-de-certification-h-et-p-dans-analogist" target="_blank">{{ $t('certifications.notCertified') }}</a></span>
        </v-list-tile>
      </v-list-tile-content>
    </v-list-tile>
  </span>
</template>

<script>
export default {
  computed: {
    card () {
      return this.$store.state.card
    },
    user () {
      return this.$store.state.user
    },
    years () {
      const currentYear = new Date().getFullYear()
      return ['—', currentYear - 2, currentYear - 1, currentYear]
    },
    certified () {
      return this.card.platform && this.card.platform.certifications
    },
    humanCertified () {
      return this.certified ? this.card.platform.certifications.humanCertified : '—'
    },
    humanCertification () {
      return this.card.platform.certifications.humanCertified
    },
    publisherCertified () {
      return this.certified ? this.card.platform.certifications.publisherCertified : '—'
    },
    publisherCertification () {
      return this.card.platform.certifications.publisherCertified
    }
  },
  methods: {
    certify (year, certification) {
      if (year) {
        const certifications = this.certified || { humanCertified: null, publisherCertified: null }
        certifications[certification] = year === '—' ? null : year

        if (!certifications.humanCertified) {
          certifications.publisherCertified = null
        }

        if (certifications.publisherCertified && !certifications.humanCertified) {
          return this.$store.dispatch('snacks/error', 'certifications.publisherCertificationsError')
        }

        this.$store.dispatch('certifications/UPDATE', { cId: this.card.id, certifications }).then((res) => {
          this.$store.dispatch('FETCH_CARD', this.card.id).catch((err) => {
            if (err) {
              this.$store.dispatch('snacks/error', 'ezLoggerSettings.error_generic')
            }
          })
        }).catch((err) => {
          if (err) {
            this.$store.dispatch('snacks/error', 'ezLoggerSettings.error_generic')
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.pointer {
  text-align: center;
  cursor: pointer;
}
</style>
