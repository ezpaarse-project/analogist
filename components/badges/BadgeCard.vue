<template>
  <v-card>
    <v-container fluid grid-list-lg>
      <v-layout row>
        <v-flex xs5>
          <v-card-media :src="badge.image" height="75%" contain></v-card-media>
        </v-flex>
        <v-flex xs7>
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
    </v-container>

    <v-card-actions>
      <v-menu offset-y v-if="badge.issued_on">
        <v-btn slot="activator" flat>
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>
        <v-list class="sharing-list">
          <v-list-tile>
            <v-list-tile-content>
              <a :href="`https://www.facebook.com/sharer/sharer.php?u=${viewUrl}`" target="_blank">
                <v-icon>mdi-facebook-box</v-icon> Facebook
              </a>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <a :href="`https://twitter.com/intent/tweet?size=medium&count=none&text=${$i18n.locale === 'fr' ? badge.name : badge.alt_language[$i18n.locale].name}%20${viewUrl}&hashtags=AnalogIST,ezMESURE,ezTEAM,openbadge&via=ezpaarse`" target="_blank">
                <v-icon>mdi-twitter-box</v-icon> Twitter
              </a>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <a :href="`https://plus.google.com/share?url=${viewUrl}`" target="_blank">
                <v-icon>mdi-google-plus-box</v-icon> Google+
              </a>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <a @click="linkedIn">
                <v-icon>mdi-linkedin-box</v-icon> Linkedin
              </a>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <v-tooltip bottom>
                <a slot="activator" @click="copyEmbedObject">
                  <v-icon>mdi-code-tags</v-icon> {{ $t('badges.embed') }}
                </a>
                <span>{{ $t('ezLogger.copyToClipboard') }}</span>
              </v-tooltip>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>
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
      return `http://${location.host}/api/badges/view/${this.userId}/${this.badge.id}/${this.$i18n.locale}&title=${this.$i18n.locale === 'fr' ? this.badge.name : this.badge.alt_language[this.$i18n.locale].name}`
    },
    embedObject () {
      return `<object data="http://${location.host}/api/badges/embed/${this.userId}/${this.badge.id}/${this.$i18n.locale}&title=${this.$i18n.locale === 'fr' ? this.badge.name : this.badge.alt_language[this.$i18n.locale].name}" width="200px" height="300px"></object>`
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
</style>
