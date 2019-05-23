<template>
  <v-card>
    <v-card-text>
      <v-layout row>
        <v-flex xs5 sm5>
          <img class="mx-auto badgeImage" :src="badge.image">
        </v-flex>
        <v-flex xs7 sm12>
          <div class="badge">
            <p class="headline">
              <span v-if="$i18n.locale === 'fr'">{{ badge.name }}</span>
              <span v-else>{{ badge.alt_language[$i18n.locale].name }}</span>
            </p>
            
            <p>
              <strong>Description</strong> : <span v-if="$i18n.locale === 'fr'">{{ badge.description }}</span>
              <span v-else>{{ badge.alt_language[$i18n.locale].description }}</span>
            </p>

            <p>
              <strong>{{ $t('badges.criteria') }}</strong> : <span v-if="$i18n.locale === 'fr'">{{ badge.criteria }}</span>
              <span v-else>{{ badge.alt_language[$i18n.locale].criteria }}</span>
            </p>

            <p v-if="badge.issued_on"><strong>{{ $t('badges.issuedOn') }}</strong> : {{ issued_on }}</p>
          </div>
        </v-flex>        
      </v-layout>
    </v-card-text>

    <v-card-actions>
      <v-tooltip bottom>
        <v-menu offset-y slot="activator" v-if="badge.issued_on">
          <v-btn icon slot="activator" flat>
            <v-icon>mdi-share-variant</v-icon>
          </v-btn>
          <v-list class="sharing-list">
            <v-list-tile router :href="`https://www.facebook.com/sharer/sharer.php?u=${viewUrl}`" target="_blank">
              <v-icon>mdi-facebook-box</v-icon> Facebook
            </v-list-tile>
            <v-list-tile :href="`https://twitter.com/intent/tweet?size=medium&count=none&text=${$i18n.locale === 'fr' ? badge.name : badge.alt_language[$i18n.locale].name}%20${viewUrl}&hashtags=AnalogIST,ezMESURE,ezTEAM,openbadge&via=ezpaarse`" target="_blank">
              <v-icon>mdi-twitter-box</v-icon> Twitter
            </v-list-tile>
            <v-list-tile @click="linkedIn">
              <v-icon>mdi-linkedin-box</v-icon> Linkedin
            </v-list-tile>
            <v-tooltip bottom>
              <v-list-tile slot="activator" @click="copyEmbedObject">
                <v-icon>mdi-code-tags</v-icon> {{ $t('badges.embed') }}
              </v-list-tile>
              <span>{{ $t('ezLogger.copyToClipboard') }}</span>
            </v-tooltip>
          </v-list>
        </v-menu>
        <span>{{ $t('badges.share') }}</span>
      </v-tooltip>

      <v-text-field id="embed-input" class="embedInput" flat readonly solo single-line full-width hide-details :value="embedObject"></v-text-field>

      <v-spacer></v-spacer>
      
      <v-btn color="red" flat @click="closeCard">{{ $t('ezLogger.close') }}</v-btn>
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
