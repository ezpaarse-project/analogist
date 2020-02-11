<template>
  <v-card>
    <div class="d-flex flex-no-wrap justify-left">
      <v-avatar
        class="ma-3"
        size="100"
        tile
      >
        <img class="mx-auto badgeImage" :src="badge.image">
      </v-avatar>

      <v-card-title class="headline">
        <span v-if="$i18n.locale === 'fr'">{{ badge.name }}</span>
        <span v-else>{{ badge.alt_language[$i18n.locale].name }}</span>
      </v-card-title>
    </div>

    <v-card-text class="black--text">
      <p>
        <strong>Description</strong> : <span v-if="$i18n.locale === 'fr'">{{ badge.description }}</span>
        <span v-else>{{ badge.alt_language[$i18n.locale].description }}</span>
      </p>

      <p>
        <strong>{{ $t('badges.criteria') }}</strong> : <span v-if="$i18n.locale === 'fr'">{{ badge.criteria }}</span>
        <span v-else>{{ badge.alt_language[$i18n.locale].criteria }}</span>
      </p>

      <p v-if="badge.issued_on"><strong>{{ $t('badges.issuedOn') }}</strong> : {{ issued_on }}</p>
    </v-card-text>

    <v-card-actions>
      <v-menu offset-y v-if="badge.issued_on">
        <template v-slot:activator="{ on: menu }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on: tooltip }">
              <v-btn class="black--text" icon v-on="{ ...tooltip, ...menu }">
                <v-icon>mdi-share-variant</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('badges.share') }}</span>
          </v-tooltip>
        </template>
        <v-list class="sharing-list">
          <v-list-item router :href="`https://www.facebook.com/sharer/sharer.php?u=${viewUrl}`" target="_blank">
            <v-icon>mdi-facebook-box</v-icon> Facebook
          </v-list-item>
          <v-list-item :href="`https://twitter.com/intent/tweet?size=medium&count=none&text=${$i18n.locale === 'fr' ? badge.name : badge.alt_language[$i18n.locale].name}%20${viewUrl}&hashtags=AnalogIST,ezMESURE,ezTEAM,openbadge&via=ezpaarse`" target="_blank">
            <v-icon>mdi-twitter-box</v-icon> Twitter
          </v-list-item>
          <v-list-item @click="linkedIn">
            <v-icon>mdi-linkedin-box</v-icon> Linkedin
          </v-list-item>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click="copyEmbedObject">
                <v-icon>mdi-code-tags</v-icon> {{ $t('badges.embed') }}
              </v-list-item>
            </template>
            <span>{{ $t('ezLogger.copyToClipboard') }}</span>
          </v-tooltip>
        </v-list>
      </v-menu>

      <v-text-field id="embed-input" class="embedInput" text readonly solo single-line full-width hide-details :value="embedObject"></v-text-field>

      <v-spacer></v-spacer>
      
      <v-btn color="red" text @click="closeCard">{{ $t('ezLogger.close') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import moment from 'moment'

export default {
  props: ['badge', 'userId'],
  computed: {
    issued_on () {
      return this.badge.issued_on ? moment.unix(this.badge.issued_on).locale(this.$i18n.locale).format('LL') : null
    },
    viewUrl () {
      return `http://${location.host}/api/badges/view/${this.badge.uuid}/${this.$i18n.locale}`
    },
    embedObject () {
      return `<object data="http://${location.host}/api/badges/embed/${this.badge.uuid}/${this.$i18n.locale}" width="200px" height="300px"></object>`
    }
  },
  methods: {
    closeCard () {
      this.$emit('closeCard')
    },
    copyEmbedObject () {
      try {
        document.getElementById('embed-input').select()
        document.execCommand('copy')
      } catch (e) {
        return this.$store.dispatch('snacks/error', 'ezLogger.urlCopyFailed')
      }
      this.$store.dispatch('snacks/success', 'badges.embedCopySuccess')
    },
    linkedIn () {
      this.$emit('linkedIn')
    }
  }
}
</script>

<style scoped>
.sharing-list a {
  text-decoration: none;
  color: #000;
  transition: opacity 0.2s ease-in;
}
.sharing-list a:hover {
  opacity: 0.8;
}
.badge p {
  text-align: justify
}
.embedInput {
  opacity: 0; 
  user-select: none; 
  cursor: default; 
  pointer-events: none;
}
.badgeImage {
  display: block; 
  margin: auto;
}
</style>
