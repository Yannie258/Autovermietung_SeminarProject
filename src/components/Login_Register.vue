<template>
  <article>
    <div class="container" :class="{'sign-up-active' : signUp}">
      <hr>
      <div class="row">
        <div class="col-sm">
          <form class="sign-in" :class="{'hidden-for-animation' : signUp, 'slide-down' : !signUp}" @submit.prevent="login">
            <br><br/>
            <h3 class="text-center">Anmeldung mit Ihren Kundendaten</h3>
            <br><br/>
            <hr>
            <br><br/>
            <p class="form-group text-center">Melden Sie sich an und genießen Sie unseren Service</p>
            <div class="form-group">
              <label for="login-email">Email</label>
              <input id="login-email" class="form-control" type="text" v-model="email" required autofocus/>
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input id="login-password" class="form-control" type="password" v-model="password" required/>
            </div>
            <div class="form-group">
              <a href="/reset">Passwort vergessen?</a>
            </div>
            <div class="form-group actions">
              <button class="btn btn-secondary" type="button" @click="back" :disabled="disabled">
                Zurück
              </button>
              <button class="btn btn-info" id="signUp" type="button" @click="signUp = true">Registrieren</button>
              <button class="btn btn-primary" type="submit" :disabled="disabled">
                Einloggen
              </button>
            </div>
          </form>
          <form class="sign-up" :class="{'hidden-for-animation' : !signUp, 'slide-down' : signUp}" @submit.prevent="register">
          <br><br/>
            <h3 class="text-center">Neues Konto anlegen</h3>
            <br><br/>
            <hr>
            <br><br/>
            <div class="text-center form-group">Nutzen Sie Ihre Email zum Registrieren</div>
            <div class="form-group">
              <label for="reg-vorname">Vorname*</label>
              <input id="reg-vorname" class="form-control" type="text" v-model="vorname" required autofocus/>
            </div>
            <div class="form-group">
              <label for="reg-name">Name*</label>
              <input id="reg-name" class="form-control" type="text" v-model="name" required autofocus/>
            </div>

            <div class="form-group">
              <label for="reg-email">Email*</label>
              <input id="reg-email" class="form-control" type="email" v-model="email" required autofocus/>
            </div>
            <div class="form-group">
              <label for="reg-address">Adresse*</label>
              <input id="reg-address" class="form-control" type="text" v-model="adresse" required autofocus/>
            </div>
            <div class="form-group">
              <label for="reg-phone">Telefonnummer</label>

              <input id="reg-phone" class="form-control" type="tel" placeholder="Telefonnummer" v-model="telefon"/>
            </div>
            <div class="form-group">
              <label for="reg-password">Password*</label>
              <input id="reg-password" class="form-control" type="password" v-model="password" required/>
            </div>
            <div class="form-group">
              <label for="reg-password-re">Password erneut eingeben*</label>
              <input id="reg-password-re" class="form-control" type="password" v-model="password_confirmation"
                     required/>
            </div>
            <div class="form-group actions">
              <button class="btn btn-secondary" type="button" @click="back">
                Zurück
              </button>
              <button class="btn btn-info" id="signIn" type="button"  @click="signUp = false">Anmelden</button>
              <button class="btn btn-primary" type="submit">
                Kundenkonto Erstellen
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </article>
</template>


<script>
import Helper from '../services/helper.service'
import Auth from '../services/auth.service'

export default {
  data() {
    return {
      name: '',
      vorname: '',
      email: '',
      password: '',
      password_confirmation: '',
      adresse: '',
      telefon: '',
      is_admin: null,
      signUp: false,
      disabled: false
    }
  },
  methods: {

    back() {
      Helper.redirect('/')
    },
    //Registrierungsdaten prüfen, auswerten und Kunde in DB anlegen
    register(e) {
      e.preventDefault()
      var vornameTest = new RegExp('([a-zA-Z]{3,100}\\s*)+')
      var nameTest = new RegExp('[a-zA-Z]{3,100}')
      var passTest = new RegExp('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})')
      var mail = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
      var address = new RegExp("[A-Za-z0-9'\\.\\-\\s\\,]")
      var telTester = new RegExp('^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$')
      if (this.name.length > 2 && this.name.length < 100 && nameTest.test(this.name) && this.vorname.length > 2 && this.vorname.length < 100 && vornameTest.test(this.vorname)) {
        if (mail.test(this.email) && this.email.length < 100) {
          if (address.test(this.adresse) && this.adresse.length < 100 && this.adresse.length > 0) {
            if ((this.telefon.length > 0 && telTester.test(this.telefon)) || this.telefon.length == 0) {
              if (this.password == this.password_confirmation) {
                if (passTest.test(this.password) && this.password.length > 5 && this.password.length < 100) {
                  Auth.register(this.name, this.vorname, this.email, this.password, this.adresse, this.telefon)
                      .then(response => {
                        alert(response.data)
                        this.$router.push('/')
                      })
                      .catch((error) => Helper.handle(error))
                } else {
                  this.password = ''
                  this.password_confirmation = ''

                  return alert('Das Password ist nicht sicher')
                }
              } else {
                this.password = ''
                this.password_confirmation = ''

                return alert('Die eingegebenen Passwörter stimmen nicht überein')
              }
            } else {
              this.telefon = ''
              return alert('Telefonnummer Zeile darf nicht leer bleiben')
            }
          } else {
            this.address = ''
            return alert('Adresszeile darf nicht leer bleiben')
          }
        } else {
          this.email = ''
          return alert('Falsches E-Mail Format')
        }
      } else {
        this.name = ''
        this.vorname = ''
        return alert('Bitte prüfen Sie Ihren Vor- und Nachnamen')
      }
    },
    //Anmelden des Kunden --> Verifizierung Anmeldedaten gegenüber Backend
    //Identifizierung und Speicherung der Zugriffsrechte der Person
    login(e) {
      e.preventDefault()
      this.disabled = true
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
      // Regex Mail: Only email allowed something@something.something
      var mail = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
      // Regex Medium Password
      var passTest = new RegExp('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})')
      if (this.email.length > 6 && this.email.length < 100 && (userTest.test(this.email) || mail.test(this.email)) &&
          passTest.test(this.password) && this.password.length > 0 && this.password.length < 100) {
        if (this.password.length > 0) {
          Auth.login(this.email, this.password)
            .then(response => {
              // eslint-disable-next-line camelcase
              let is_admin = response.data.role
              sessionStorage.setItem('role', JSON.stringify(response.data.role))
              sessionStorage.setItem('auth', response.data.auth)
              if (sessionStorage.getItem('auth') == 'true') {
                this.disabled = false
                if (this.$route.params.redirect != '') {
                  this.$router.push("/" + this.$route.params.redirect.replace(/_/g, "/"))
                } else {
                  // eslint-disable-next-line camelcase
                  if (is_admin >= 1) {
                    this.$router.push('admin')
                  } else {
                    // eslint-disable-next-line camelcase
                    if (is_admin >= 1) {
                      this.$router.push('admin')
                    } else {
                      this.$router.push('dashboard')
                    }
                  }
                }
            }})
              .catch((error) => {
                this.password = ''
                Helper.handle(error)
                this.disabled = false
              })
        }
      } else {
        this.password = ''
        alert('Credentials invalid')
        this.disabled = false
      }
    }

  }
}
</script>

<style lang="scss" scoped>

</style>
  