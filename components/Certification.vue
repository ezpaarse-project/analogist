<template>
  <span>
    <v-list-item>
      <v-list-item-avatar color="#F4B48B">
        <span class="white--text headline">H</span>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>
          <v-menu open-on-hover offset-y>
            <template v-slot:activator="{ on }">
              <v-btn small v-on="on" class="white--text" color="#F4B48B" depressed :disabled="!user">
                <span v-if="humanCertified">{{ humanCertification}}</span>
                <span v-else>{{ years[0] }}</span>
              </v-btn>
            </template>
            <v-list v-if="user">
              <v-list-item v-for="(item, index) in years" :key="index">
                <v-list-item-title class="pointer" @click="dialog = !dialog; certification = 'humanCertified'" v-if="user.role !== 'admin'">{{ item }}</v-list-item-title>
                <v-list-item-title class="pointer" @click="certify(item, 'humanCertified')" v-else>{{ item }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <span v-if="humanCertified"> - <a href="https://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/" target="_blank">{{ $t('card.manuallyVerified') }}</a></span>
          <span v-else> - <a href="https://blog.ezpaarse.org/2020/01/tutoriels-procedure-de-certification-h-et-p-dans-analogist" target="_blank">{{ $t('certifications.notCertified') }}</a></span>
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item>
      <v-list-item-avatar color="#5AB9C1">
        <span class="white--text headline">P</span>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>
          <v-menu open-on-hover offset-y>
            <template v-slot:activator="{ on }">
              <v-btn small v-on="on" class="white--text" color="#5AB9C1" depressed :disabled="!user || !humanCertified">
                <span v-if="publisherCertified">{{ publisherCertification}}</span>
                <span v-else>{{ years[0] }}</span>
              </v-btn>
            </template>
            <v-list v-if="user && humanCertified">
              <v-list-item v-for="(item, index) in years" :key="index">
                <v-list-item-title class="pointer" @click="dialog = !dialog; certification = 'publisherCertified'" v-if="user.role !== 'admin'">{{ item }}</v-list-item-title>
                <v-list-item-title class="pointer" @click="certify(item, 'publisherCertified')" v-else>{{ item }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <span v-if="publisherCertified"> - <a href="https://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/" target="_blank">{{ $t('card.publisherVerified') }}</a></span>
          <span v-else> - <a href="https://blog.ezpaarse.org/2020/01/tutoriels-procedure-de-certification-h-et-p-dans-analogist" target="_blank">{{ $t('certifications.notCertified') }}</a></span>
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-dialog
      v-model="dialog"
      width="500"
    >
       <v-card>
        <v-card-title
          dark
          class="headline"
          primary-title
        >
          Certification
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <v-layout  wrap>
            <v-flex xs12 sm12>
              <v-textarea
                name="input-7-1"
                label="Commentaire"
                v-model="comment"
              ></v-textarea>
            </v-flex>

            <v-flex xs12 sm6 pr-1 v-if="certification === 'publisherCertified'">
              <v-text-field
                v-model="ezpaarse"
                type="number"
                placeholder="ex: 9092"
                label="Total rapport JR1 ezPAARSE"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 pl-1 v-if="certification === 'publisherCertified'">
              <v-text-field
                v-model="editor"
                type="number"
                placeholder="ex: 9571"
                label="Total rapport JR1 Éditeur"
              ></v-text-field>
            </v-flex>
            
            <v-flex xs12 sm12>
              <v-text-field
                type="file"
                label="Justificatif (falcultatif)"
              ></v-text-field>
            </v-flex>
          </v-layout>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            flat
            @click="dialog = false"
          >
            Valider
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
export default {
  data () {
    return {
      dialog: false,
      comment: '',
      certification: null,
      ezpaarse: null,
      editor: null
    }
  },
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
      return this.certified ? this.card.platform.certifications.humanCertified : null
    },
    humanCertification () {
      return this.card.platform.certifications.humanCertified
    },
    publisherCertified () {
      return this.certified ? this.card.platform.certifications.publisherCertified : null
    },
    publisherCertification () {
      return this.card.platform.certifications.publisherCertified
    }
  },
  methods: {
    certify (year, certification) {
      if (this.user.role !== 'admin') { return }

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
