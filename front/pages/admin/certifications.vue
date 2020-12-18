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
          Certifications
        </v-toolbar-title>

        <v-spacer />

        <v-select
          v-model="searchStatusOrder"
          label="Status"
          :items="statusOrder"
          item-text="text"
          item-value="order"
          hide-details
          single-line
          clearable
          class="mx-1 filterFields"
        />

        <v-select
          v-model="searchDateOrder"
          label="Date"
          :items="dateOrder"
          item-text="text"
          item-value="order"
          hide-details
          single-line
          clearable
          class="mx-1 filterFields"
        />

        <v-select
          v-model="searchYears"
          :label="$t('certifications.form.year')"
          :items="yearsOrder"
          item-text="text"
          item-value="order"
          hide-details
          single-line
          clearable
          class="mx-1 filterFields"
        />

        <v-select
          v-model="searchCertifications"
          :label="$t('cards.certifications')"
          :items="certificationsType"
          item-text="name"
          item-value="id"
          hide-details
          single-line
          clearable
          multiple
          class="mx-1 filterFields"
        >
          <template v-slot:item="{ item }">
            {{ item.name }}
            <v-list-item-avatar
              v-if="item.id === 'humanCertified'"
              style="margin-left: 10px"
              size="24"
              color="#F4B48B"
            >
              <span class="white--text">H</span>
            </v-list-item-avatar>
            <v-list-item-avatar
              v-if="item.id === 'publisherCertified'"
              style="margin-left: 10px"
              size="24"
              color="#5AB9C1"
            >
              <span class="white--text">P</span>
            </v-list-item-avatar>
          </template>
        </v-select>

        <v-tooltip
          v-if="certificationsEvents.length"
          bottom
        >
          <template v-slot:activator="{ on }">
            <v-btn
              class="mx-1"
              fab
              bottom
              right
              x-small
              color="success"
              v-on="on"
              @click="generateCertificationsFiles"
            >
              <v-icon>mdi-printer</v-icon>
            </v-btn>
          </template>
          <span v-text="$t('certifications.downloadCertifiedList')" />
        </v-tooltip>
      </v-toolbar>

      <v-card-text
        v-if="!certificationsEvents.length"
        v-text="$t('certifications.noCertifications')"
      />

      <v-expansion-panels
        v-if="certificationsEvents.length"
        accordion
        tile
      >
        <v-expansion-panel
          v-for="(item, i) in certificationsEvents"
          :key="i"
        >
          <v-expansion-panel-header>
            <v-list-item class="pa-0">
              <v-list-item-avatar
                v-if="item.certifications && item.certifications.humanCertified"
                size="24"
                color="#F4B48B"
              >
                <span class="white--text">H</span>
              </v-list-item-avatar>
              <v-list-item-avatar
                v-if="item.certifications && item.certifications.publisherCertified"
                size="24"
                color="#5AB9C1"
              >
                <span class="white--text">P</span>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  <router-link
                    :to="`/platforms/${item.cardID}`"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <a>{{ eventPlatformName(item.cardID) }}</a>
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
              <v-layout
                row
                wrap
              >
                <v-flex
                  xs12
                  sm4
                  md4
                  class="px-1"
                >
                  <v-text-field
                    :label="$t('certifications.form.user')"
                    readonly
                    :value="item.user.fullName"
                  />
                </v-flex>

                <v-flex
                  xs12
                  sm4
                  md4
                  class="px-1"
                >
                  <v-text-field
                    :label="$t('certifications.form.establishment')"
                    readonly
                    :value="item.form.establishment"
                  />
                </v-flex>

                <v-flex
                  xs12
                  sm4
                  md4
                  class="px-1"
                >
                  <v-text-field
                    :label="$t('certifications.form.year')"
                    readonly
                    :value="item.form.year"
                  />
                </v-flex>

                <v-flex
                  xs12
                  sm12
                  md12
                  class="px-1"
                >
                  <v-textarea
                    readonly
                    :label="$t('certifications.form.comment')"
                    :value="item.form.comment"
                  />
                </v-flex>

                <v-flex
                  v-if="item.certifications && item.certifications.publisherCertified"
                  xs12
                  sm4
                  md4
                  class="px-1"
                >
                  <v-text-field
                    :label="$t('certifications.form.totalEzpaarse')"
                    readonly
                    :value="item.form.values.ezpaarse"
                  />
                </v-flex>
                <v-flex
                  v-if="item.certifications && item.certifications.publisherCertified"
                  xs12
                  sm4
                  md4
                  class="px-1"
                >
                  <v-text-field
                    :label="$t('certifications.form.totalEditor')"
                    readonly
                    :value="item.form.values.editor"
                  />
                </v-flex>
                <v-flex
                  v-if="item.certifications && item.certifications.publisherCertified"
                  xs12
                  sm4
                  md4
                  class="px-1"
                >
                  <v-text-field
                    :label="$t('certifications.form.difference')"
                    readonly
                    :value="difference(item.form.values)"
                  />
                </v-flex>

                <v-flex
                  xs12
                  sm6
                  md6
                  class="px-1"
                >
                  <v-btn
                    v-if="item.form.attachment"
                    tile
                    dark
                    color="grey"
                    link
                    :to="`/api/certifications/download/${item.form.attachment}`"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <v-icon left>
                      mdi-paperclip
                    </v-icon> {{ $t('certifications.form.attachment') }}
                  </v-btn>
                </v-flex>

                <v-flex
                  v-if="item.status === 'waiting'"
                  xs12
                  sm12
                  md12
                  offset-xs10
                >
                  <v-btn
                    tile
                    dark
                    class="ml-auto"
                    color="green lighten-2"
                    @click="accept(item)"
                  >
                    <v-icon left>
                      mdi-plus-circle
                    </v-icon> {{ $t('certifications.form.validate') }}
                  </v-btn>
                  <v-dialog
                    v-model="denialDialog"
                    max-width="600"
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn
                        tile
                        dark
                        class="ml-auto"
                        color="red lighten-2"
                        v-on="on"
                      >
                        {{ $t('certifications.form.reject') }} <v-icon right>
                          mdi-minus-circle
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-card>
                      <v-card-title
                        class="text-center"
                        v-text="$t('certifications.form.rejectExplanations')"
                      />
                      <v-card-text class="text-center py-3">
                        <v-textarea
                          v-model="refusalExplanations"
                          filled
                          :label="$t('certifications.form.comment')"
                        />
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn
                          color="green darken-1"
                          dark
                          @click="refuse(item)"
                          v-text="$t('certifications.send')"
                        />
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
import { saveAs } from 'file-saver';

function escapeCSVstring(str) {
  if (/[";]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str || '';
}

export default {
  data() {
    return {
      refusalExplanations: '',
      denialDialog: false,
      expanded: [],
      singleExpand: true,
      headers: [
        {
          text: 'Plateformes',
          align: 'left',
          value: 'name',
        },
        { text: 'Certifications', value: 'platform.certifications', align: 'center' },
        { text: '', value: 'data-table-expand' },
      ],
      rowsPerPageItems: [30, 60, 100],
      options: {
        itemsPerPage: 30,
      },
      currentItemData: [],
      headersEvents: [
        { text: 'Certification', align: 'left', value: 'certification' },
        { text: 'Year', align: 'left', value: 'form.year' },
        { text: 'Subject', align: 'left', value: 'form.object' },
        { text: 'Establishment', align: 'left', value: 'form.establishment' },
        { text: 'User', align: 'left', value: 'user.fullName' },
        {
          text: 'Actions', align: 'center', value: 'action', sortable: false,
        },
      ],
      subjectLabel: {
        addOrModify: {
          text: 'Ajout / Modification',
          color: 'green',
          icon: 'mdi-plus-circle',
        },
        delete: {
          text: 'Suppression',
          color: 'red',
          icon: 'mdi-minus-circle',
        },
        approved: {
          text: 'Approbation',
          color: 'blue',
          icon: 'mdi-check-circle',
        },
      },
    };
  },
  async fetch({ store, redirect }) {
    try {
      await store.dispatch('FETCH_PROFILE');
    } catch (e) {
      return redirect('/');
    }

    try {
      await store.dispatch('FETCH_CARDS');
    } catch (e) {
      await store.dispatch('snacks/error', 'errorGeneric');
    }

    try {
      await store.dispatch('certifications/GET_CERTIFICATIONS_EVENTS');
    } catch (e) {
      await store.dispatch('snacks/error', 'errorGeneric');
    }
  },
  computed: {
    cards() {
      return this.$store.state.cards;
    },
    certificationsEvents() {
      const certifications = this.searchCertifications;

      return this.$store.state.certifications.certificationsEvents
        .filter((event) => {
          if (!event.status || (event.status && event.status !== this.searchStatusOrder)) {
            return false;
          }

          if (certifications.length) {
            return certifications.some((certification) => event
              && event.certifications[certification]
              && event.status === this.searchStatusOrder);
          }

          if (this.searchYears && event.form.year !== this.searchYears) {
            return false;
          }

          return true;
        })
        .sort((a, b) => {
          if (this.searchDateOrder === 'asc') {
            return new Date(a.createdAt) - new Date(b.createdAt);
          }
          if (this.searchDateOrder === 'desc') {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return a.cardID.toLowerCase() < b.cardID.toLowerCase() ? -1 : 1;
        });
    },
    searchCertifications: {
      get() {
        return this.$store.state.searchCertifications;
      },
      set(newValue) {
        this.$store.dispatch('UPDATE_SEARCH_CERTIFICATIONS', newValue || []);
      },
    },
    searchDateOrder: {
      get() {
        return this.$store.state.searchDateOrder;
      },
      set(newValue) {
        this.$store.dispatch('UPDATE_SEARCH_DATE_ORDER', newValue || 'desc');
      },
    },
    searchStatusOrder: {
      get() {
        return this.$store.state.searchStatusOrder;
      },
      set(newValue) {
        this.$store.dispatch('UPDATE_SEARCH_STATUS_ORDER', newValue || 'waiting');
      },
    },
    searchYears: {
      get() {
        return this.$store.state.searchYearsOrder;
      },
      set(newValue) {
        this.$store.dispatch('UPDATE_SEARCH_YEARS_ORDER', newValue || null);
      },
    },
    dateOrder() {
      return [
        {
          order: 'desc',
          text: this.$t('certifications.desc'),
        },
        {
          order: 'asc',
          text: this.$t('certifications.asc'),
        },
      ];
    },
    yearsOrder() {
      const currentYear = new Date().getFullYear();
      return [currentYear - 2, currentYear - 1, currentYear];
    },
    statusOrder() {
      return [
        {
          order: 'waiting',
          text: this.$t('certifications.waiting'),
        },
        {
          order: 'accepted',
          text: this.$t('certifications.accepted'),
        },
        {
          order: 'refused',
          text: this.$t('certifications.refused'),
        },
        {
          order: 'revoked',
          text: this.$t('certifications.revoked'),
        },
      ];
    },
    certificationsType() {
      return [
        {
          id: 'humanCertified',
          name: this.$t('certifications.human'),
        },
        {
          id: 'publisherCertified',
          name: this.$t('certifications.publisher'),
        },
      ];
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return '-';
      return this.$dateFns.format(date, 'PPPP');
    },
    eventPlatformName(cardID) {
      if (cardID) return this.cards.find((card) => card.id === cardID).name || 'Name not found';
      return 'Name not found';
    },
    difference({ editor, ezpaarse }) {
      return Number.parseFloat((((editor - ezpaarse) / editor) * 100), 10).toFixed(2);
    },
    accept(item) {
      this.$store.dispatch('certifications/ACCEPT', {
        id: item._id,
        cardName: this.eventPlatformName(item.cardID),
      }).then(async () => {
        this.$store.dispatch('certifications/GET_CERTIFICATIONS_EVENTS')
          .catch(() => this.$store.dispatch('snacks/error', 'errorGeneric'));
      }).catch(() => this.$store.dispatch('snacks/error', 'errorGeneric'));
    },
    refuse(item) {
      this.$store.dispatch('certifications/REFUSE', {
        id: item._id,
        cardName: this.eventPlatformName(item.cardID),
        comment: this.refusalExplanations,
      }).then(async () => {
        this.$store.dispatch('certifications/GET_CERTIFICATIONS_EVENTS')
          .catch(() => this.$store.dispatch('snacks/error', 'errorGeneric'));
      }).catch(() => this.$store.dispatch('snacks/error', 'errorGeneric'));
      this.denialDialog = false;
      this.refusalExplanations = '';
    },
    generateCertificationsFiles() {
      if (!this.certificationsEvents) { return; }

      const columns = [
        { title: 'Date de demande', getter: (a) => this.$dateFns.format(a.createdAt, 'PPPP') },
        { title: 'Date d\'administration', getter: (a) => this.$dateFns.format(a.lastModified, 'PPPP') },
        { title: 'Plateforme', getter: (a) => this.eventPlatformName(a.cardID) },
        { title: 'Etablissement', getter: (a) => a.form.establishment },
        { title: 'H', getter: (a) => (a.certifications.humanCertified ? a.form.year : '-') },
        { title: 'P', getter: (a) => (a.certifications.publisherCertified ? a.form.year : '-') },
        { title: 'ezPAARSE', getter: (a) => (a.form.values && a.form.values.ezpaarse ? a.form.values.ezpaarse : '-') },
        { title: 'Editeur', getter: (a) => (a.form.values && a.form.values.editor ? a.form.values.editor : '-') },
        { title: 'Difference', getter: (a) => (a.form.values ? `${this.difference(a.form.values)}%` : '-') },
        { title: 'Commentaire', getter: (a) => escapeCSVstring(a.form.comment.replace(/(\r\n|\n|\r)/gm, ' ').trim()) },
      ];

      const header = columns.map((col) => escapeCSVstring(col.title)).join(';');

      const lines = this.certificationsEvents.map((event) => columns.map((col) => escapeCSVstring(col.getter(event))).join(';')).join('\n');

      const fileName = `[${this.searchStatusOrder}] - Certifications de plateformes.csv`;

      // eslint-disable-next-line consistent-return
      return saveAs(new Blob([`${header}\n${lines}`], { type: 'text/csv;charset=utf-8' }), fileName);
    },
  },
};
</script>

<style scoped>
.filterFields {
  max-width: 180px !important;
  text-align: center;
  display: block;
}
</style>
