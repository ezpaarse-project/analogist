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

      <v-card-text v-if="!certificationsEvents.length" v-text="$t('certifications.noCertifications')"></v-card-text>

      <v-expansion-panels accordion tile v-if="certificationsEvents.length">
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
                  {{ $t('certifications.openedOn', {
                    date: formatDate(item.createdAt),
                    user: item.user.fullName,
                    establishment: item.form.establishment })
                  }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-container>
              <v-layout row wrap>
                <v-flex xs12 sm4 md4 class="px-1">
                  <v-text-field
                    :label="$t('certifications.form.user')"
                    readonly
                    :value="item.user.fullName"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 sm4 md4 class="px-1">
                  <v-text-field
                    :label="$t('certifications.form.establishment')"
                    readonly
                    :value="item.form.establishment"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 sm4 md4 class="px-1">
                  <v-text-field
                    :label="$t('certifications.form.year')"
                    readonly
                    :value="item.form.year"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 sm12 md12 class="px-1">
                  <v-textarea
                    readonly
                    :label="$t('certifications.form.comment')"
                    :value="item.form.comment"
                  ></v-textarea>
                </v-flex>

                <v-flex xs12 sm4 md4 class="px-1" v-if="item.certification === 'P'">
                  <v-text-field
                    :label="$t('certifications.form.totalEzpaarse')"
                    readonly
                    :value="item.form.values.ezpaarse"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm4 md4 class="px-1" v-if="item.certification === 'P'">
                  <v-text-field
                    :label="$t('certifications.form.totalEditor')"
                    readonly
                    :value="item.form.values.editor"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm4 md4 class="px-1" v-if="item.certification === 'P'">
                  <v-text-field
                    :label="$t('certifications.form.difference')"
                    readonly
                    :value="difference(item.form.values)"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 sm6 md6 class="px-1">
                  <v-btn tile dark color="grey" v-if="item.form.attachement" link :to="`/api/certifications/download/${item.form.attachement}`" target="_blank">
                    <v-icon left>mdi-paperclip</v-icon> {{ $t('certifications.form.attachement') }}
                  </v-btn>
                </v-flex>

                <v-flex xs12 sm12 md12 offset-xs10>
                  <v-btn tile dark class="ml-auto" color="green lighten-2" @click="accept(item)">
                    <v-icon left>mdi-plus-circle</v-icon> {{ $t('certifications.form.validate') }}
                  </v-btn>
                  <v-dialog v-model="denialDialog" max-width="600">
                    <template v-slot:activator="{ on }">
                      <v-btn tile dark v-on="on" class="ml-auto" color="red lighten-2">
                        {{ $t('certifications.form.reject') }} <v-icon right>mdi-minus-circle</v-icon>
                      </v-btn>
                    </template>
                    <v-card>
                      <v-card-title class="text-center" v-text="$t('certifications.form.rejectExplanations')"></v-card-title>
                      <v-card-text class="text-center py-3">
                        <v-textarea
                          filled
                          v-model="refusalExplanations"
                          :label="$t('certifications.form.comment')"
                        ></v-textarea>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="green darken-1" dark @click="refuse(item)" v-text="$t('certifications.send')"></v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
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
  data () {
    return {
      refusalExplanations: '',
      denialDialog: false,
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
    formatDate (date) {
      if (!date) return '-'
      return moment(date).locale(this.$i18n.locale).format('LL')
    },
    eventPlatformName (cardId) {
      return this.cards.find(card => card.id === cardId).name || 'Name not found'
    },
    difference ({ editor, ezpaarse }) {
      return Number.parseFloat((((editor - ezpaarse) / editor) * 100), 10).toFixed(2)
    },
    accept (item) {
      this.$store.dispatch('certifications/ACCEPT', {
        id: item._id,
        cardName: this.eventPlatformName(item.cardId)
      }).then(async (res) => {
        this.$store.dispatch('certifications/GET_CERTIFICATIONS_EVENTS')
          .catch(() => this.$store.dispatch('snacks/error', 'errorGeneric'))
      }).catch(() => this.$store.dispatch('snacks/error', 'errorGeneric'))
    },
    refuse (item) {
      this.$store.dispatch('certifications/REFUSE', {
        id: item._id,
        cardName: this.eventPlatformName(item.cardId),
        comment: this.refusalExplanations
      }).then(async (res) => {
        this.$store.dispatch('certifications/GET_CERTIFICATIONS_EVENTS')
          .catch(() => this.$store.dispatch('snacks/error', 'errorGeneric'))
      }).catch(() => this.$store.dispatch('snacks/error', 'errorGeneric'))
      this.denialDialog = false
      this.refusalExplanations = ''
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