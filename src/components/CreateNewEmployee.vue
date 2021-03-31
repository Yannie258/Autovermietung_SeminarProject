<template>
  <div class="container">
    <h1>Neuen Mitarbeiter anlegen</h1>
    <hr>
    <form>
      <div class="form-group">
        <label for="vorname">Vorname</label>
        <input class="form-control" id="vorname" type="text" v-model="vorname" required autofocus>
      </div>
      <div class="form-group">
        <label for="name">Name</label>
        <input class="form-control" id="name" type="text" v-model="name" required autofocus>
      </div>
      <div class="form-group">
        <label for="username">Benutzername</label>
        <input class="form-control" id="username" type="text" v-model="username" required autofocus>
      </div>
      <div class="form-group">
        <label for="password">Passwort</label>
        <input class="form-control" id="password" type="password" v-model="password" required autofocus>
      </div>
      <div class="form-group">
        <label for="password-confirm">Passwort wiederholen</label>
        <input class="form-control" id="password-confirm" type="password" v-model="password_confirmation" required autofocus>
      </div>
      <div class="form-group actions">
        <button class="btn btn-secondary" type="button" @click="back">
          Zurück
        </button>
        <button type="submit" @click="handleSubmit" class="btn btn-primary">
          Neuen Mitarbeiter hinzufügen
        </button>
      </div>
    </form>
    <div>
      <h3 class="text-center">{{ created }}</h3>
    </div>
  </div>
</template>

<script>
import Helper from '../services/helper.service'
import Auth from '../services/auth.service'

export default {
  data () {
    return {
      vorname: '',
      name: '',
      username: '',
      password: '',
      password_confirmation: '',
      created: '',
    }
  },
  methods: {
    back () {
      this.$router.push('/admin/employees')
    },
     //Registrieren neuer Mitarbeiter
    handleSubmit (e) {
      e.preventDefault()
      var vornameTest = new RegExp('([a-zA-Z]{3,100}\\s*)+')
      var nameTest = new RegExp('[a-zA-Z]{3,100}')
      /* Regex: Strong Password
      Special Characters - Not Allowed
      Spaces - Not Allowed
      Minimum and Maximum Length of field - 6 to 12 Characters
      Met by [a-zA-Z0-9@]{6,12}
      Numeric Character - At least one character
      Met by positive lookahead (?=.*\d)
      At least one Capital Letter
      Met by positive lookahead (?=.*[A-Z])
      Repetitive Characters - Allowed only two repetitive characters */
      var userTest = new RegExp('^(?=.*[A-Z])(?=.*\\d)(?!.*(.)\\1\\1)[a-zA-Z0-9@]{6,12}$')
      /*
      At least one upper case English letter, (?=.?[A-Z])
      At least one lower case English letter, (?=.?[a-z])
      At least one digit, (?=.?[0-9])
      At least one special character, (?=.?[#?!@$%^&*-])
      Minimum eight in length .{8,} (with the anchors)
      */
      var passTest = new RegExp('^(?=.?[A-Z])(?=.?[a-z])(?=.?[0-9])(?=.?[#?!@$%^&*-]).{8,}$')
        if (this.name.length > 2 && this.name.length < 100 && nameTest.test(this.name) && this.vorname.length > 2 && this.vorname.length < 100 && vornameTest.test(this.vorname)) {
         if (this.username.length > 5 && this.username.length < 100 && userTest.test(this.username)) {
          if (this.password == this.password_confirmation && this.password.length > 0 && this.password.length < 100) {
            if (passTest.test(this.password)) {
              Auth.registerEmployee(this.name, this.vorname, this.username, this.password)
                .then(response => {
                  alert(response.data)
                  this.created = 'Neuer Mitarbeiter erfolgreich angelegt!'
                  this.vorname = ''
                  this.name = ''
                  this.username = ''
                  this.password = ''
                  this.password_confirmation = ''
                })
                .catch((error) => Helper.handle(error))
            } else {
              this.password = ''
              this.password_confirmation = ''

              return alert('Das eingegebene Passwort ist nicht sicher genug')
            }
          } else {
            this.password = ''
            this.password_confirmation = ''

            return alert('Passwörter stimmen nicht überein')
          }
        } else {
          this.username = ''
          return alert('Benutzername ist nicht sicher genug (mindestens 6-12 Zeichen + 1x Großbuchstabe + 1x Zahl)')
        }
      } else {
        this.name = ''
        this.vorname = ''
        return alert('Benutzername ist zu lang/kurz oder enthält nicht erlaubte Sonderzeichen')
      }
    }
  }

}
</script>
<style  scoped>

</style>
