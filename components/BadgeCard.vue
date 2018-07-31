<template>
  <v-card>
    <v-container fluid grid-list-lg>
      <v-layout row>
        <v-flex xs5>
          <v-card-media :src="badge.image" height="100%" contain></v-card-media>
        </v-flex>
        <v-flex xs7>
          <div>
            <p class="headline" v-if="$i18n.locale === 'fr'">{{ badge.name }}</p>
            <p class="headline" v-else>{{ badge.alt_language.en.name }}</p>
            
            <p v-if="$i18n.locale === 'fr'">{{ badge.description }}</p>
            <p v-else>{{ badge.alt_language.en.description }}</p>
            <p v-if="badge.issued_on">{{ $t('badges.issuedOn') }} : {{ issued_on }}</p>
          </div>
        </v-flex>
      </v-layout>
    </v-container>

    <v-card-actions>

      <v-menu offset-y>
        <v-btn slot="activator" flat>
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>
        <v-list class="sharing-list">
          <v-list-tile>
            <v-list-tile-content>
              <a href="#/" target="_blank">
                <v-icon>mdi-facebook-box</v-icon> Facebook
              </a>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <a href="#/" target="_blank">
                <v-icon>mdi-twitter-box</v-icon> Twitter
              </a>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <a href="#/" target="_blank">
                <v-icon>mdi-google-plus-box</v-icon> Google+
              </a>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <a href="#/" target="_blank">
                <v-icon>mdi-linkedin-box</v-icon> Linkedin
              </a>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>

      <v-spacer></v-spacer>
      
      <v-btn color="red" flat @click.stop="closeCard">{{ $t('ezLogger.close') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import moment from 'moment'

export default {
  props: ['badge'],
  computed: {
    issued_on () {
      return this.badge.issued_on ? moment.unix(this.badge.issued_on).locale(this.$i18n.locale).format('LL') : null
    }
  },
  methods: {
    closeCard () {
      this.$emit('closeCard')
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
</style>
