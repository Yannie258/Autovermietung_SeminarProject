<template>
  <div class="main-wrapper">
    <header>
      <div class="container">
        <div class="logo">
          <a href="/">
            <img alt="logo" src="./assets/logo.png">
          </a>
        </div>
        <div class="mobile-menu d-sm-block d-md-block d-xl-none d-lg-none">
          <input type="checkbox" id="myInput" v-model="isShowMobileMenu" @click="menuButtonClick">
          <label for="myInput">
            <span class="bar top"></span>
            <span class="bar middle"></span>
            <span class="bar bottom"></span>
          </label>
          <aside>
            <div class="aside-section aside-left">
              <ul class="aside-list">
                <li>
                  <router-link @click="clickMenu" class="aside-anchor" to="/">Home</router-link>
                </li>
                <li>
                  <router-link @click="clickMenu" class="aside-anchor" to="/about">Über uns</router-link>
                </li>
                <li>
                  <router-link @click="clickMenu" class="aside-anchor" to="/search">Auto mieten</router-link>
                </li>
                <li>
                  <router-link @click="clickMenu" class="aside-anchor" to="/login">{{ login }}</router-link>
                </li>
                <li v-if="loggedIn">
                  <div>
                    <router-link class="aside-anchor" @click="logout" to="/logout">Ausloggen
                    </router-link>
                  </div>
                </li>
              </ul>
            </div>
            <div class="aside-section aside-right">
              <div class="aside-list">
                <li>
                  <router-link @click="clickMenu" class="aside-anchor" to="/">Home</router-link>
                </li>
                <li>
                  <router-link @click="clickMenu" class="aside-anchor" to="/about">Über uns</router-link>
                </li>
                <li>
                  <router-link @click="clickMenu" class="aside-anchor" to="/search">Auto mieten</router-link>
                </li>
                <li>
                  <router-link @click="clickMenu" class="aside-anchor" to="/login">{{ login }}</router-link>
                </li>
                <li v-if="loggedIn">
                  <div>
                    <router-link class="aside-anchor" @click="logout" to="/logout">Ausloggen</router-link>
                  </div>
                </li>
              </div>
            </div>
          </aside>
        </div>
        <div class="desktop-menu d-none d-xl-block d-lg-block">
          <ul class="nav aside-list">
            <router-link @click="clickMenu" class="aside-anchor" to="/">Home</router-link>
            <router-link @click="clickMenu" class="aside-anchor" to="/about">Über uns</router-link>
            <router-link @click="clickMenu" class="aside-anchor" to="/search">Auto mieten</router-link>
            <router-link @click="clickMenu" class="aside-anchor" to="/login">{{ login }}</router-link>
            <div v-if="loggedIn">
              <router-link class="aside-anchor" @click="logout" to="/logout">Ausloggen</router-link>
            </div>
          </ul>
        </div>
      </div>
    </header>
    <div class="content">
      <router-view/>
    </div>
  </div>
  <Footer/>
</template>


<script>
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
//oberhalb hmtl-code

//Main-Komponente Vue
//Sie wird überall auf jeder Seite angezeigt
import Auth from './services/auth.service'
import Footer from "@/components/Footer";
//Der Aufbau einer Vue-Komponente ist prinzipiell immer gleich bei allen
//Daher hier kurz anhand dieser Komponente eine kurze Erklärung
export default {
  name: 'App',
  components: {Footer},
  //Name Komponente
  data() { //Alle Variablen, die Komponente haben soll --> Quasi Konstruktor
    return {
      loggedIn: false,  //ermitteln, ob Person angemeldet
      login: 'Registrieren / Anmelden', //Textanzeige
      isShowMobileMenu: false
    }
  },

  methods: {  //Alle Methoden, die von der Komponente (wie bei einem Objekt) aufgerufen
    //werden können
    //können dann z.B. innerhalb der Komponente in <template></template> genutzt werden
    logout() { //ausloggen
      this.isShowMobileMenu = false;
      Auth.logout()
    },
    clickMenu() { //ausloggen
      this.isShowMobileMenu = false;
    },
    menuButtonClick() {
      this.isShowMobileMenu = !this.isShowMobileMenu;
    },
    changeValue() { //test, ob angemeldet durch Auslesen von Browser-Speicher
      // eslint-disable-next-line eqeqeq
      if (sessionStorage.getItem('auth') == 'true') {
        this.login = 'Mein Konto'
        this.loggedIn = true
      } else {
        this.login = 'Registrieren / Anmelden'
        this.loggedIn = false
      }
    }
  },

//spezielle Methode --> Wenn Pfad/URL geändert, wird Fkt. aufgerufen
  watch: {
    //dient zum Ermitteln des Einloggstatus und ändert je nachdem
    //die Komponente (Anmelden --> Ihr Konto/ Es wird Ausloggen angezeigt)
    $route() {
      this.changeValue()
    }
  },
}
//unterhalb css code
</script>

<style lang="scss">
header .container {
  display: flex;
  justify-content: space-between;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  align-items: center;

  #nav {
    padding: 20px;
    text-align: center;

    a {
      font-weight: bold;
      color: #2c3e50;

      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }

  .logo {
    height: 110px;
    padding: 0 10px;

    img {
      max-height: 100%;
      max-width: 100%;
    }
  }

  .desktop-menu {
    width: 100%;
  }
}

.main-wrapper {
  min-height: calc(100% - 150px);
}

@media (max-width: 991px) {
  header .container {
    flex-direction: row-reverse;
  }
}


@import "./styles/main.scss";
@import "./styles/Menu.scss";
</style>

