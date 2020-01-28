<template>
  <section>
    <v-card>
      <v-toolbar class="secondary" dense dark flat>
        <v-toolbar-title>
          Certifications
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-select
          label="Date"
          :items="dateOrder"
          v-model="searchDateOrder"
          item-text="text"
          item-value="order"
          append-icon="mdi-clock-outline"
          hide-details
          single-line
          clearable
          class="mx-1 filterFields"
        >
        </v-select>
        
        <v-select
          :label="$t('cards.certifications')"
          :items="certificationsType"
          v-model="searchCertifications"
          item-text="name"
          item-value="id"
          append-icon="mdi-certificate"
          hide-details
          single-line
          clearable
          multiple
          class="mx-1 filterFields"
        >
        </v-select>
      </v-toolbar>
      <v-expansion-panels accordion tile>
        <v-expansion-panel
          v-for="(item, i) in certificationsEvents"
          :key="i"
        >
          <v-expansion-panel-header>
            <v-list-item class="pa-0">
              <v-list-item-avatar size="24" :color="certifications[item.certification].color">
                <span class="white--text">{{ item.certification }}</span>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  <router-link :to="`/platforms/${item.cardId}`" target="_blank">
                    <a>{{ eventPlatformName(item.cardId) }}</a>
                  </router-link>
                  <v-chip
                    dark
                    label
                    small
                    :color="subjectLabel[item.form.object].color"
                  >
                    {{ subjectLabel[item.form.object].text }}
                  </v-chip>
                </v-list-item-title>
                <v-list-item-subtitle>
                  Opened on {{ item.createdAt | formatDate($i18n.locale) }} by {{ item.user.fullName }} - {{ item.form.establishment }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-container>
              <v-layout row wrap>
                <v-flex xs12 sm6 md6 class="px-1">
                  <v-text-field
                    label="User"
                    disabled
                    :value="item.user.fullName"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 sm6 md6 class="px-1">
                  <v-text-field
                    label="Establishment"
                    disabled
                    :value="item.form.establishment"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 sm12 md12 class="px-1">
                  <v-textarea
                    disabled
                    label="Comment"
                    :value="item.form.comment"
                  ></v-textarea>
                </v-flex>

                <v-flex xs12 sm6 md6 class="px-1" v-if="item.certification === 'P'">
                  <v-text-field
                    :label="$t('certifications.form.totalEzpaarse')"
                    disabled
                    :value="item.form.values.ezpaarse"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md6 class="px-1" v-if="item.certification === 'P'">
                  <v-text-field
                    :label="$t('certifications.form.totalEditor')"
                    disabled
                    :value="item.form.values.editor"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 sm6 md6 class="px-1">
                  <v-btn tile dark color="grey" v-if="item.form.attachement" link :to="`/api/certifications/download/${item.form.attachement}`" target="_blank">
                    <v-icon left>mdi-paperclip</v-icon> Pièce-jointe
                  </v-btn>
                </v-flex>

                <v-flex xs12 sm12 md12 offset-xs10>
                  <v-btn tile dark class="ml-auto" color="green lighten-2" @click="accept(item)">
                    <v-icon left>mdi-plus-circle</v-icon> Valider
                  </v-btn>
                  <v-btn tile dark class="ml-auto" color="red lighten-2" @click="refuse(item)">
                    Refuser <v-icon right>mdi-minus-circle</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>
  </section>
</template>

<script>
import moment from 'moment'

export default {
  filters: {
    formatDate (date, locale) {
      if (!date) return '-'
      return moment(date).locale(locale).format('LL')
    }
  },
  data () {
    return {
      expanded: [],
      singleExpand: true,
      headers: [
        {
          text: 'Plateformes',
          align: 'left',
          value: 'name'
        },
        { text: 'Certifications', value: 'platform.certifications', align: 'center' },
        { text: '', value: 'data-table-expand' }
      ],
      rowsPerPageItems: [30, 60, 100],
      options: {
        itemsPerPage: 30
      },
      currentItemData: [],
      headersEvents: [
        { text: 'Certification', align: 'left', value: 'certification' },
        { text: 'Year', align: 'left', value: 'form.year' },
        { text: 'Subject', align: 'left', value: 'form.object' },
        { text: 'Establishment', align: 'left', value: 'form.establishment' },
        { text: 'User', align: 'left', value: 'user.fullName' },
        { text: 'Actions', align: 'center', value: 'action', sortable: false }
      ],
      subjectLabel: {
        addOrModify: {
          text: 'Ajout / Modification',
          color: 'green',
          icon: 'mdi-plus-circle'
        },
        delete: {
          text: 'Suppression',
          color: 'red',
          icon: 'mdi-minus-circle'
        },
        approved: {
          text: 'Approbation',
          color: 'blue',
          icon: 'mdi-check-circle'
        }
      }
    }
  },
  async fetch ({ store, redirect, app }) {
    try {
      await store.dispatch('FETCH_PROFILE')
    } catch (e) {
      return redirect('/')
    }

    try {
      await store.dispatch('FETCH_CARDS')
    } catch (e) {
      await store.dispatch('snacks/error', 'errorGeneric')
    }

    try {
      await store.dispatch('certifications/GET_CERTIFICATIONS_EVENTS')
    } catch (e) {
      await store.dispatch('snacks/error', 'errorGeneric')
    }
  },
  computed: {
    cards () {
      return this.$store.state.cards
    },
    certificationsEvents () {
      const certifications = this.searchCertifications

      return this.$store.state.certifications.certificationsEvents
        .filter(event => {
          if (certifications.length) {
            return certifications.some(certification => {
              return event.certification && event.certification === certification
            })
          }

          return true
        })
        .sort((a, b) => {
          if (this.searchDateOrder === 'asc') {
            return new Date(a.createdAt) - new Date(b.createdAt)
          }
          if (this.searchDateOrder === 'desc') {
            return new Date(b.createdAt) - new Date(a.createdAt)
          }
          return a.cardId.toLowerCase() < b.cardId.toLowerCase() ? -1 : 1
        })
    },
    searchCertifications: {
      get () {
        return this.$store.state.searchCertifications
      },
      set (newValue) {
        this.$store.dispatch('UPDATE_SEARCH_CERTIFICATIONS', newValue || [])
      }
    },
    searchDateOrder: {
      get () {
        return this.$store.state.searchDateOrder
      },
      set (newValue) {
        this.$store.dispatch('UPDATE_SEARCH_DATE_ORDER', newValue || 'desc')
      }
    },
    dateOrder () {
      return [
        {
          order: 'desc',
          text: this.$t('certifications.desc')
        },
        {
          order: 'asc',
          text: this.$t('certifications.asc')
        }
      ]
    },
    certificationsType () {
      return [
        {
          id: 'H',
          name: this.$t('certifications.human')
        },
        {
          id: 'P',
          name: this.$t('certifications.publisher')
        }
      ]
    },
    certifications () {
      return {
        H: {
          name: this.$t('certifications.human'),
          color: '#F4B48B'
        },
        P: {
          name: this.$t('certifications.publisher'),
          color: '#5AB9C1'
        }
      }
    }
  },
  methods: {
    eventPlatformName (cardId) {
      return this.cards.find(card => card.id === cardId).name || 'Name not found'
    },
    accept (item) {
      this.$store.dispatch('certifications/ACCEPT', item._id).then((res) => {
        console.log(res)
      }).catch((err) => {
        console.log(err)
      })
    },
    refuse (item) {
      this.$store.dispatch('certifications/REFUSE', item._id).then((res) => {
        console.log('Then', res)
      }).catch((err) => {
        console.log('Catch', err)
      })
    }
  }
}
</script>

<style scoped>
.filterFields {
  max-width: 180px !important;
  text-align: center;
  display: block;
}
</style>