<template>
  <v-card>
    <v-container fluid grid-list-lg>
      <v-layout row>
        <v-flex xs5>
          <v-card-media :src="badge.image" height="100%" contain></v-card-media>
        </v-flex>
        <v-flex xs7>
          <div class="badge">
            <p class="headline" v-if="$i18n.locale === 'fr'">{{ badge.name }}</p>
            <p class="headline" v-else>{{ badge.alt_language[$i18n.locale].name }}</p>
            
            <p v-if="$i18n.locale === 'fr'"><strong>Description</strong> : {{ badge.description }}</p>
            <p v-else><strong>Description</strong> : {{ badge.alt_language[$i18n.locale].description }}</p>
            
            <p v-if="$i18n.locale === 'fr'"><strong>{{ $t('badges.criteria') }}</strong> : {{ badge.criteria }}</p>
            <p v-else><strong>{{ $t('badges.criteria') }}</strong> : {{ badge.alt_language[$i18n.locale].criteria }}</p>

            <p v-if="badge.issued_on"><strong>{{ $t('badges.issuedOn') }}</strong> : {{ issued_on }}</p>
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
              <a :href="`https://www.facebook.com/sharer/sharer.php?u=https://openbadgefactory.com/v1/badge/_/${badge.id}.png`" target="_blank">
                <v-icon>mdi-facebook-box</v-icon> Facebook
              </a>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <a :href="`https://twitter.com/intent/tweet?size=medium&count=none&text=${badge.name}&url=https://openbadgefactory.com/v1/badge/_/${badge.id}.png&hashtags=ezPAARSE,AnalogIST`" target="_blank">
                <v-icon>mdi-twitter-box</v-icon> Twitter
              </a>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <a :href="`https://plus.google.com/share?url=https://openbadgefactory.com/v1/badge/_/${badge.id}.png`" target="_blank">
                <v-icon>mdi-google-plus-box</v-icon> Google+
              </a>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <a :href="`https://www.linkedin.com/shareArticle?mini=true&url=https://openbadgefactory.com/v1/badge/_/${badge.id}.png&title=${badge.name}&summary=AnalogIST%
               ${badge.name}&source=AnalogIST
`" target="_blank">
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
.badge p {
  text-align: justify
}
</style>
