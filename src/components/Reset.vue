<template>
  <div v-if="!resetPW" class="container">
    <h1>Geben Sie die Email ein, die mit dem Account verknüpft ist, dessen Passwort Sie zurücksetzen möchten</h1>
    <hr>
    <form>
      <div class="form-group">
        <label for="reset-email">Email*</label>
        <input class="form-control" id="reset-email" type="email" v-model="email" required autofocus/>
      </div>
      <div class="form-group actions">
        <button class="btn btn-secondary" type="cancel" @click="back">Zurück</button>
        <button class="btn btn-primary" type="button" @click="reset">
          Reset
        </button>
      </div>
    </form>
    <h2>{{ msg }}</h2>
  </div>
  <div v-else class="container">
    <h1> Geben Sie hier Ihr neues Passwort ein </h1>
    <hr>
    <form>
      <div class="form-group">
        <label for="reset-password">Ihr Neues Passwort</label>
        <input class="form-control" id="reset-password" type="password" v-model="password" required autofocus/>
      </div>
      <div class="form-group">
        <label for="reset-password">Bestätigen Sie Passwort</label>
        <input class="form-control" type="password" v-model="password_confirmation" required autofocus/>
      </div>
      <div class="form-group actions">
        <button class="btn btn-secondary" type="cancel" @click="back">
          Abbrechen
        </button>
        <button class="btn btn-primary" type="button" @click="confirmNewPW">
          Passwort ändern
        </button>
      </div>
    </form>
  </div>
</template>

<script>
//Komponente zum Zurücksetzen Passwort Kunde
import Helper from '../services/helper.service'
import Auth from '../services/auth.service'
export default {
  data () {
    return {
      msg: '',
      email: '',
      resetPW: false,
      password: '',
      password_confirmation: ''

    }
  },
  methods: {
    back () {
      Helper.redirect('/')
    },
    //Rücksetz-Anfrage von Kundenpasswort an Backend gesendet
    reset () {
      this.resetPW = false

      let mail = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
      if (mail.test(this.email) && this.email.length < 100) {
        Auth.resetUserPW(this.email)
          .then(response => {
            if(response.data.success){
              this.msg = 'Wenn ein Account mit dieser Email vorhanden ist, erhalten Sie darüber eine Nachricht mit Anweisungen zum Zurücksetzen Ihres Passwortes'
              this.email = ''
            }
          })
          .catch((error) => {
            Helper.handle(error)
            Helper.redirect('/')
          })
      } else {
        this.email = ''
        this.msg = 'Invalid Email format'
      }
    },
    //Verifizierung neues Passwort von Kunden durch Backend
    confirmNewPW () {
      let passTest = new RegExp('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})')
      if (this.password == this.password_confirmation) {
        if (passTest.test(this.password) && this.password.length > 5 && this.password.length < 100) {
          Auth.resetUserPWConfirmation(this.$route.params.id, this.$route.params.token, this.password)
            .then(response => {
              if(response.data.success){
              alert('Das Passwort wurde erfolgreich zurückgesetzt')
              Helper.redirect('/login')
              }
            })
            .catch((error) => {
              Helper.handle(error)
              Helper.redirect('/')
            })
        } else {
          this.password = ''
          this.password_confirmation = ''

          return alert('Password is not safe enough')
        }
      } else {
        this.password = ''
        this.password_confirmation = ''

        return alert('Passwords do not match')
      }
    }
  },
  beforeMount () {
    if (this.$route.params.id != '' && this.$route.params.token != '') {
      this.resetPW = true
    } else {
      this.resetPW = false
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
