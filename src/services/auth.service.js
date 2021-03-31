//Hier sind alle Fkt., die irgendwelche Daten vom Backend modifizieren 
//bzw. die etwas mit Authentifizierung zu tun haben oder auch benötigen
//siehe Endpunkte Backend für spezifische Funktionalitäten
import axios from 'axios'
import Helper from "@/services/helper.service";
// import router from '../router'

const API_URL = process.env.VUE_APP_API_SERVER_URL || 'http://localhost:3000/'

class Auth {
  //hier wird Person abgemeldet, wobei Authentifizierungs-Paramter aus Browser 
  //entfernt werden --> Wenn Cookie vorhanden, ist Anmelden aber direkt wieder möglich
  logout () {
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('auth');
    axios.post(API_URL + 'logout').then(() => Helper.redirect('/'));
  }

  login (mail, pass) {
    return axios.post(API_URL + 'login', {
      email: mail,
      password: pass
    })
  }

  register (nam, vornam, mail, pass, addr, tel) {
    return axios.post(API_URL + 'register', {
      name: nam,
      vorname: vornam,
      email: mail,
      password: pass,
      address: addr,
      telephone: tel
    })
  }

  registerEmployee (nam, vornam, mail, pass) {
    return axios.post(API_URL + 'register-employee', {
      name: nam,
      vorname: vornam,
      username: mail,
      password: pass
    })
  }

  // eslint-disable-next-line camelcase
  updateEmployee (id, nam, mail, pass, adresse, telefon) {
    return axios.put(API_URL + 'employee/' + id, {
      name: nam,
      username: mail,
      password: pass,
      adresse,
      telefon
    })
  }

  deleteEmployee (id) {
    return axios.delete(API_URL + 'employee/' + id)
  }

  // Kundenkonto löschen
  deleteCustomer (id) {
    return axios.delete(API_URL + 'customer/' + id)
  }

  resetUserPW (mail) {
    return axios.post(API_URL + 'reset-userpw', {
      email: mail
    })
  }

  resetUserPWConfirmation (id, token, password) {
    return axios.post(API_URL + 'confirm-pwreset', {
      id: id,
      token: token,
      password: password
    })
  }

  // bestellung durch kunden erstellt
  createOrder (auto, start, ende, kosten) {
    return axios.post(API_URL + 'rent/', {
      auto: auto,
      start: start,
      ende: ende,
      kosten: kosten
    })
  }

  //bestellung abbrechen kunde
  updateStatusOrder (bnr, status) {
    return axios.put(API_URL + 'order/' + bnr + '/updateStatus', {
      status: status
    })
  }

  // auto ausleihstatus anpassen
  updateAusleiheAuto(auto, status){
    return axios.put(API_URL + 'car/' + auto + '/updateAusleihe', {
      status: status
    })
  }

  //bestellung kosten hinzufuegen
  addCost (bnr, typ, kosten, beschreibung) {
    return axios.post(API_URL + 'order/' + bnr + '/cost', {
      typ: typ,
      kosten: kosten,
      beschreibung: beschreibung
    })
  }

  deleteCost (bnr, typ, pos) {
    return axios.delete(API_URL + 'order/' + bnr + '/cost/' + pos + '/' + typ)
  }

  //auto schaden hinzufuegen
  addSchaden (autoname, beschreibung, prio, typ, kosten) {
    return axios.post(API_URL + 'car/' + autoname + '/schaeden', {
      beschreibung: beschreibung,
      prio: prio,
      typ: typ,
      kosten: kosten
    })
  }

  deleteSchaden (autoname, pos) {
    return axios.delete(API_URL + 'car/' + autoname + '/schaeden/' + pos) 
  }

  //bestellung kosten hinzufuegen
  addBnrToSchaden (autoname, beschreibung, prio, typ, kosten, bnr, pos) {
    return axios.post(API_URL + 'car/' + autoname + '/schaeden', {
      beschreibung: beschreibung,
      prio: prio,
      typ: typ,
      kosten: kosten,
      bnr: bnr,
      pos: pos
    })
  }

   //schaden auto prioritaet updaten
   updatePriority (auto, pos, status, bnr) {
    return axios.put(API_URL + 'car/' + auto + '/schaeden/updateStatus', {
      pos: pos,
      status: status,
      bnr: bnr
    })
  }
}

export default new Auth()
