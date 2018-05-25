<template>
  <section>
    <v-card>
      <v-toolbar class="secondary" dense dark card>
        <v-toolbar-title>
          {{ $t('badges.title') }}
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-container fluid grid-list-md>
          <v-layout row wrap justify-center>
            <v-flex v-if="badges" v-for="badge in badges" :key="badge.id" xs12 sm2>
              <img @click.stop="modal = true; currentBadge = badge" class="mx-auto badgeImage" :src="badge.image" width="60%">
              <h4 class="badgeName">{{ badge.name }}</h4>
            </v-flex>

            <v-flex v-else>
              <v-card color="blue white--text">
                <v-card-text>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi necessitatibus error aliquam! Praesentium obcaecati dolore perferendis, culpa deserunt recusandae neque aspernatur suscipit doloribus, facere cum doloremque delectus, reiciendis temporibus vel.
                </v-card-text>
              </v-card>
            </v-flex>

            <v-dialog v-if="modal" v-model="currentBadge" persistent max-width="600px">
              <v-card>
                <v-container fluid grid-list-lg>
                  <v-layout row>
                    <v-flex xs5>
                      <v-card-media :src="currentBadge.image" height="100%" contain></v-card-media>
                    </v-flex>
                    <v-flex xs7>
                      <div>
                        <p class="headline">{{ currentBadge.name }}</p>
                        
                        <p>{{ currentBadge.description }}</p>
                        <p>{{ $t('badges.issuedOn') }} : {{ currentBadge.issued_on }}</p>
                      </div>
                    </v-flex>
                  </v-layout>
                </v-container>
                <v-card-actions>
                  <v-btn color="red" flat @click.stop="modal = false">{{ $t('ezLogger.close') }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
import CardTile from '~/components/CardTile'

export default {
  name: 'badges',
  transition: 'slide-x-transition',
  components: {
    CardTile
  },
  head () {
    return {
      title: 'Badges',
    }
  },
  data() {
    return {
      modal: false,
      currentBadge: null
    }
  },
  async fetch({ store, redirect }) {
    try {
      await store.dispatch('FETCH_PROFILE')
    } catch (e) {
      return redirect('/')
    }

    await store.dispatch('badges/getBadges', store.state.user.email)
  },
  computed: {
    badges() {
      return this.$store.state.badges.badges
    },
    user () {
      return this.$store.state.user
    }
  }
}
</script>

<style scoped>
.badgeImage {
  display: block; 
  margin: auto;
}
.badgeName {
  text-align: center
}
</style>
