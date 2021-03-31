<template>
  <div class="container">
    <h1>Mitarbeiterdaten bearbeiten</h1>
    <hr>

    <div class="form-group">
      <form>
        <div class="form-group">
          <label for="name"><b>Aktueller Vorname: </b> {{ vorname }}</label>
        </div>
        <div  class="form-inline">
          <div class="form-group">
            <input class="form-control" id="name" type="text" v-model="new_vorname" required autofocus>
          </div>
          <div class="form-group mx-sm-3">
            <button class="btn btn-primary" type="button" @click="updateName(1)">
              Vorname ändern
            </button>
          </div>
        </div>
      </form>
    </div>

    <div class="form-group">
      <form>
        <div class="form-group">
          <label for="name"><b>Aktueller Name: </b> {{ name }}</label>
        </div>
        <div  class="form-inline">
        <div class="form-group">
          <input class="form-control" id="name" type="text" v-model="new_name" required autofocus>
        </div>
        <div class="form-group mx-sm-3">
          <button class="btn btn-primary" type="button" @click="updateName(2)">
            Name ändern
          </button>
        </div>
        </div>
      </form>
    </div>

    <div class="form-group">
      <form >
        <div class="form-group">
          <label for="username">Aktueller Benutzername: {{ username }} </label>
        </div>
        <div class="form-inline">
        <div class="form-group">
          <input class="form-control" id="username" type="email" v-model="new_username" required autofocus>
        </div>
        <div class="form-group mx-sm-3">
          <button type="button" @click="updateUsername" class="btn btn-primary">
            Benutzername ändern
          </button>
        </div>
        </div>
      </form>
    </div>
    <div class="form-group">
      <form>
        <div class="form-group">
          <label for="password">Neues Passwort</label>
          <input class="form-control" id="password" type="password" v-model="password" required>
        </div>
        <div class="form-group">
          <label for="password">Passwort bestätigen</label>
          <input class="form-control" id="new_password" type="password" v-model="new_password" required>
        </div>
        <div class="form-group">
          <button class="btn btn-primary" type="button" @click="changePassword">
            Passwort ändern
          </button>
        </div>
      </form>
    </div>
    <div class="actions">
      <button class="btn btn-secondary" type="cancel" @click="back">
        Zurück
      </button>
      <button class="btn btn-danger" type="button" @click="deleteEmployee">
        Mitarbeiter entfernen
      </button>
    </div>
    <h2 class="text-center">{{ meldung }}</h2>
  </div>
</template>

<script>
//Komponente zum Bearbeiten von Mitarbeiter-Konto durch Admin
import UserService from '../services/user.service'
import Auth from '../services/auth.service'
import Helper from '../services/helper.service'
export default {
  data () {
    return {
      meldung: '',
      name: '',
      vorname: '',
      username: '',
      password: '',
      id: -1,
      new_name: '',
      new_vorname: '',
      new_username: '',
      new_password: ''
    }
  },
  methods: {
    back () {
      this.$router.push('/admin/employees');
    },
    //Methoden zum Ändern der jeweiligen Attribute von Mitarbeiter
    updateName (typ) {
      var nameTest = new RegExp("^[a-zA-Z]+(([', ][a-zA-Z ])?[a-zA-Z]*)*$")
      let name = ''
      let vergleich = ''
      if(typ == 2){
        name = this.new_name
        vergleich = this.name
      }
      else{
        name = this.new_vorname
        vergleich = this.vorname
      }
      if (name.length > 2 && name.length < 100 && name != vergleich && nameTest.test(name)) {
        name = name + ":" + typ
        Auth.updateEmployee(this.id, name, null, null)
          .then(response => {
            if(typ == 2){
              this.name = response.data.name
              this.new_name = response.data.name
              this.meldung = 'Mitarbeiternachname erfolgreich geändert'
            }
            else{
              this.vorname = response.data.name
              this.new_vorname = response.data.name
              this.meldung = 'Mitarbeitervorname erfolgreich geändert'
            }
          })
          .catch((error) => {
            Helper.handle(error)
            Helper.redirect('/admin/customers')
          })
      } else {
        return alert('Namensfeld ist leer oder enthält nicht erlaubte Sonderzeichen')
      }
    },
    updateUsername () {
      var userTest = new RegExp('^(?=.*[A-Z])(?=.*\\d)(?!.*(.)\\1\\1)[a-zA-Z0-9@]{6,12}$')
      if (this.new_username.length > 5 && this.new_username.length < 100 && this.new_username != this.username && userTest.test(this.new_username)) {
        Auth.updateEmployee(this.id, null, this.new_username, null)
          .then(response => {
            this.meldung = 'Mitarbeiter Benutzername erfolgreich geändert'
            this.username = response.data.username
            this.new_username = ''
          })
          .catch((error) => {
            Helper.handle(error)
            Helper.redirect('/admin/employees')
          })
      } else {
        this.new_username = ''
        return alert('Benutzername ist leer oder enthält nicht erlaubte Sonderzeiche')
      }
    },
    changePassword () {
       /*
      At least one upper case English letter, (?=.?[A-Z])
      At least one lower case English letter, (?=.?[a-z])
      At least one digit, (?=.?[0-9])
      At least one special character, (?=.?[#?!@$%^&*-])
      Minimum eight in length .{8,} (with the anchors)
      */
      var passTest = new RegExp('^(?=.?[A-Z])(?=.?[a-z])(?=.?[0-9])(?=.?[#?!@$%^&*-]).{8,}$')
      if (this.password == this.new_password) {
        if (passTest.test(this.new_password) && this.new_password.length > 0 && this.new_password.length < 100) {
          Auth.updateEmployee(this.id, null, null, this.new_password)
            .then(response => {
              if(response)

              this.meldung = 'Mitarbeiter Passwort erfolgreich geändert'
              this.password = ''
              this.new_password = ''
            })
            .catch((error) => {
              Helper.handle(error)
              Helper.redirect('/admin/employees')
            })
        } else {
          this.password = ''
          this.new_password = ''
          return alert('Das eingegebene Passwort ist nicht sicher genug')
        }
      } else {
        this.password = ''
        this.new_password = ''

        return alert('Passwörter stimmen nicht überein')
      }
    },
    //Methode zum Löschen von Mitarbeiter-Account
    deleteEmployee () {
      if (confirm('Do you really want to delete the Employee account?')) {
        Auth.deleteEmployee(this.id)
          .then(response => {
            if(response)
            
            alert('Employee account successfully deleted')
            Helper.redirect('/admin/employees')
          })
          .catch((error) => {
            Helper.handle(error)
            Helper.redirect('/admin/employees')
          })
      } else {
        this.meldung = ''
      }
    }
  },
  beforeMount () {
    if (this.$route.params.id != null) {
      UserService.getEmployee(this.$route.params.id)
        .then(response => {
          this.id = response.data.employee.id
          this.vorname = response.data.employee.vorname
          this.name = response.data.employee.name
          this.username = response.data.employee.email

          this.new_vorname = response.data.employee.vorname
          this.new_name =  response.data.employee.name
          this.new_username =  response.data.employee.email
        })
        .catch((error) => {
          Helper.handle(error)
          Helper.redirect('/admin/employees')
        })
    } else {
      Helper.redirect('/admin/employees')
    }
  }
}
</script>
<style  scoped>

</style>
