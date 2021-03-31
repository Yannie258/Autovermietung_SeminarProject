<template>

    <div class="container">
        <h1>Wilkommen in ihrem Kundenkonto</h1>
        <br><br/>
        <hr>
        <h2>{{msg}}</h2>
        <div v-on:click="zeigeBestellungen()" class="text-center">
                <button class="btn btn-primary">
                    Meine Bestellungen
                </button>
        </div>


    </div>
</template>

<script>
//Komponente für Kunde
// import UserService from '../services/user.service'
import Helper from '../services/helper.service'
export default {
  data () {
    return {
      name: '',
      vorname: '',
      adresse: '',
      telefon: '',
    }
  },

  methods: {
    redirect (route) {
      Helper.redirect(route)
    },

     zeigeBestellungen(){
       this.$router.push('/dashboard/bestellungen')

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
