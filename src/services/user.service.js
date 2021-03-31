//Hier sind alle Fkt., die irgendwelche Daten vom Backend holen
//siehe Endpunkte Backend für spezifische Funktionalitäten

import axios from 'axios'

const API_URL = process.env.VUE_APP_API_SERVER_URL || 'http://localhost:3000/'

class UserService {
  getAuthentication () {
    return axios.get(API_URL + 'authenticate')
  }

  testToken () {
    return axios.get(API_URL + 'testToken')
  }

  getEmployee (id) {
    return axios.get(API_URL + 'employee/' + id)
  }
    getCustomers () {
        return axios.get(API_URL + 'customers')
    }

  getCar (autoname) {
    return axios.get(API_URL + 'car/' + autoname)
  }

  getUser () {
    return axios.get(API_URL + 'rent/')
  }

  // bestellungen holen
  getOrder (bnr) {
    return axios.get(API_URL + 'order/' + bnr)
  }

   // testen, ob bestellung mit bnr u. auto existiert
   getDamageCost (bnr, auto) {
    return axios.get(API_URL + 'order/' + bnr + "/car/" + auto)
  }

   // bestellungen holen
   getOrderCost (bnr) {
    return axios.get(API_URL + 'order/' + bnr + '/cost')
  }

   // schaeden von auto holen
   getSchaeden (autoname) {
    return axios.get(API_URL + 'car/' + autoname + '/schaeden')
  }
  
}

export default new UserService()
