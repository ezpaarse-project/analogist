<template>
  <section>
    <v-toolbar class="secondary" dense dark flat>
      <v-toolbar-title>Page de tests</v-toolbar-title>
    </v-toolbar>

    <v-timeline :reverse="!user">
      <v-timeline-item right>
        <v-card class="elevation-2">
          <v-card-text>
            <v-textarea
              v-model="comment"
              ref="comment"
              filled
              label="Commentaire"
              @input="tagging"
            ></v-textarea>

            <v-list v-if="potentialUsersList" dense ref="usersList">
              <v-list-item-group v-model="taggedUser" color="primary">
                <v-list-item
                  v-for="(user, i) in potentialUsersList"
                  :key="i"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ user.member.fullName }} ({{ user.member.username }})
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>

            <v-btn color="success" @click="sendComment">Envoyer</v-btn>
          </v-card-text>
        </v-card>
      </v-timeline-item>

      <v-timeline-item right>
        <span slot="opposite">26/02/2020 - {{ user.fullName }}</span>
        <v-card class="elevation-2">
          <v-card-text>
            Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae.
          </v-card-text>
        </v-card>
      </v-timeline-item>

      <v-timeline-item left>
        <span slot="opposite">18/02/2020 - John Doe</span>
        <v-card class="elevation-2">
          <v-card-text>
            <p>Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae.</p>
            <p>Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae.</p>
          </v-card-text>
        </v-card>
      </v-timeline-item>
    </v-timeline>
  </section>
</template>

<script>
export default {
  data () {
    return {
      comment: '',
      potentialUsersList: [],
      tags: [],
      taggedUser: null,
      lastTag: {}
    }
  },
  async fetch ({ store, redirect, app }) {
    await store.dispatch('FETCH_PROFILE')

    try {
      await store.dispatch('FETCH_TRELLO_BOARD_MEMBERS')
    } catch (e) {
      await store.dispatch('snacks/error', 'errorGeneric')
    }
  },
  computed: {
    users () {
      return this.$store.state.trelloBoardMembers
    },
    user () {
      return this.$store.state.user
    }
  },
  watch: {
    taggedUser: {
      immediate: true,
      handler (value) {
        const user = this.potentialUsersList[value]
        if (user) {
          this.tags.push(this.potentialUsersList[value].idMember)

          const tmpComment = this.comment.split(' ')
          if (tmpComment && tmpComment.length > 0) {
            tmpComment[this.lastTag.pos] = `@${this.potentialUsersList[value].member.username.toLowerCase()}`
            this.lastTag = {}

            this.comment = `${tmpComment.join(' ')} `
            this.potentialUsersList = []
            this.taggedUser = null

            this.$refs.comment.focus()
          }
        }
      }
    }
  },
  methods: {
    tagging (value) {
      if (value.length === 0) {
        this.lastTag = {}
        this.potentialUsersList = []
        this.tags = []
      }

      if (value) {
        const words = value.split(' ')
        if (words) {
          words.forEach((word, index) => {
            const currentWord = word.toLowerCase()
            if (currentWord.startsWith('@') && currentWord.length > 1) {
              this.lastTag.pos = index
              this.lastTag.text = currentWord

              if (currentWord === '@all') {
                this.tags = this.users.map(user => user.idMember)
              }

              if (currentWord !== '@all') {
                this.potentialUsersList = this.users.filter(({ member }) => {
                  const name = currentWord.substr(1, currentWord.length)
                  if (!member.fullName.toLowerCase().startsWith(name) && !member.username.toLowerCase().startsWith(name)) {
                    return false
                  }

                  return true
                })
              }
            } else {
              this.potentialUsersList = []
            }
          })
        }
      }
    },
    sendComment () {

    }
  }
}
</script>