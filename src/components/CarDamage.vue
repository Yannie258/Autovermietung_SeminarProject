<template>
  <div class="container">
    <div>
      <h1> {{ msg }} </h1>
      <hr>
      <div class="form-group">
        <textarea class="form-control" v-model="beschreibung" placeholder="Beschreibung des Schadens" name="text"
                  cols="35" rows="4">Schaden hier beschreiben</textarea>
      </div>
      <form class="form-inline">

        <div class="form-group">
          <input
              type="text"
              placeholder="Kosten"
              v-model="kosten"
              required
              autofocus
              class="form-control"
          />
          <div class="form-group">
            <select v-model="auswahl" class="form-control mx-sm-3">
              <option value="" disabled selected>Schadenstyp</option>
              <option
                  v-for="(schaden, index) in schadenstypen"
                  :key="index"
                  :value="schaden"
              >
                {{ schaden }}
              </option>
            </select>
          </div>
          <div class="form-group" v-if="!testTank()">
            <select v-model="auswahlPrio" class="form-control mx-sm-3">
              <option value="" disabled selected>Schadensausmaß</option>
              <option
                  v-for="(typ, index) in prioTypen"
                  :key="index"
                  :value="typ"
              >
                {{ typ }}
              </option>
            </select>
          </div>
          <div class="form-group" v-else>
            <select v-model="auswahlPrio" class="form-control">
              <option value="" disabled selected>Schadensausmaß</option>
              <option value="Fatal">Fatal</option>
            </select>
          </div>
        </div>

      </form>
      <div class="form-group text-right">
        <button class="btn btn-primary" type="submit" @click="erstelleSchaden()">Erstellen</button>
      </div>
      <div v-if="allgemein" class="table-responsive">
        <table class="table">
          <thead>
          <tr>
            <th>Beschreibung</th>
            <th>Typ</th>
            <th>Prioritaet</th>
            <th>Kosten in €</th>
            <th>Bestellung</th>
            <th>Abgearbeitet?</th>
            <th>Loeschen</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(schaden, index) in schaeden" :key="index">
            <td>{{ schaden.beschreibung }}</td>
            <td>{{ reverseTyp(schaden.typ) }}</td>
            <td>{{ reversePrio(schaden.prioritaet) }}</td>
            <td>{{ schaden.hoehe }}</td>
            <td>{{ schaden.bnr_fk }}</td>
            <td>
              <button class="btn btn-success" @click="updateCheck(schaden)">Problem beheben</button>
            </td>
            <td>
              <button class="btn btn-warning" @click="loescheSchaden(schaden)">Loeschen</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="table-responsive">
        <table class="table">
          <thead>
          <tr>
            <th>Beschreibung</th>
            <th>Typ</th>
            <th>Prioritaet</th>
            <th>Kosten in €</th>
            <th>Loeschen</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(schaden, index) in schaeden" :key="index">
            <td>{{ schaden.beschreibung }}</td>
            <td>{{ reverseTyp(schaden.typ) }}</td>
            <td>{{ reversePrio(schaden.prioritaet) }}</td>
            <td>{{ schaden.hoehe }}</td>
            <td>
              <button class="btn btn-warning" @click="loescheSchaden(schaden)">Loeschen</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <button class="btn btn-secondary" type="cancel" @click="back">Zurück zum Start</button>
  </div>
</template>


<script>
import UserService from "../services/user.service";
import Auth from "../services/auth.service";
import Helper from "../services/helper.service";
export default {
    data(){
        return{
            msg: '',
            auswahl: '',
            auswahlPrio: '',
            beschreibung: '',
            kosten: '',
            allgemein: '',
            schaeden: [],
            schadenstypen: [],
            prioTypen: []
        }
    },
    methods: {
        back() {
            this.$router.push("/admin")
        },
        // nur schaden wird allgemein geloescht
        loescheSchaden(schaden){
            let wert = ''
            if(this.allgemein){
                wert = "Moechten Sie den Schaden wirklich loeschen?"
            }
            else{
                wert = "Moechten Sie den Schaden wirklich loeschen? Es werden auch die dazugehoergien Kosten aus der Bestellung geloescht"
            }
            if(confirm(wert)){
                Auth.deleteSchaden(schaden.auto_fk, schaden.pos)
                    .then((response) =>{
                        if(response.data.success){
                            // schaden lokal aus array entfernen --> "aktualisieren"
                            let index = this.schaeden.indexOf(schaden)
                            this.schaeden.splice(index, 1);
                            alert("Schaden wurde erfolgreich behoben")
                            if(response.data.cost){
                                alert("Die dazugehoerigen Kosten wurden aus der Bestellung geloescht")
                            }
                            if(response.data.verfuegbar){
                                alert("Das Auto ist fuer die Vermietung verfuegbar")
                            }
                        }
                    })
                    .catch((error) => {
                        Helper.handle(error)
                        Helper.redirect("/admin");
                    })
            }
        },
        testTank(){
            if(this.auswahl == 'Tank'){
                this.auswahlPrio = 'Fatal'
                return true
            }
            else{
                return false
            }
        },
        updateCheck(schaden){
            if(confirm("Ist der Schaden wirklich behoben?")){
                 Auth.updatePriority(schaden.auto_fk, schaden.pos, -1, schaden.bnr_fk)
                    .then((response) =>{
                        if(response.data.success){
                            // schaden lokal aus array entfernen --> "aktualisieren"
                            let index = this.schaeden.indexOf(schaden)
                            this.schaeden.splice(index, 1);
                            alert("Schaden wurde erfolgreich behoben")
                            if(response.data.verfuegbar){
                                alert("Das Auto ist wieder fuer die Vermietung verfuegbar")
                            }
                        }
                    })
                    .catch((error) => {
                        Helper.handle(error)
                        Helper.redirect("/admin");
                    })
                }
        },
        status(status) {
            if(status == 'Tank'){
                return 1
            }
            else if(status == 'Sauberkeit'){
                return 2
            }
            else if(status == 'Beschaedigung'){
                return 4
            }
        }, 
        reverseTyp(typ){
           if(typ == 1){
              return 'Tank'
           }
           else if(typ == 2){
               return 'Sauberkeit'
           }
           else if(typ == 4){
               return 'Beschaedigung'
           }
        },
        prio(typ) {
            if(typ == 'Gering'){
                return 3
            }
            else if(typ == 'Mittel'){
                return 2
            }
            else if(typ == 'Groß'){
                return 1
            }
            else if(typ == "Fatal"){
                return 0
            }
        }, 
        reversePrio(prio){
           if(prio == 0){
              return 'Fatal'
           }
           else if(prio == 1){
               return 'Groß'
           }
           else if(prio == 2){
               return 'Mittel'
           }
           else if(prio == 3){
               return 'Gering'
           }
        },
        erstelleSchaden(){
            if(this.auswahl != '' && this.beschreibung != '' && this.auswahlPrio != '' && this.kosten != ''){
                var zahlentester = new RegExp("^[0-9 ]*$")
                let val = this.prio(this.auswahlPrio)
                if(zahlentester.test(this.kosten) && this.kosten >= 0){
                    // wenn fataler schaden
                    let antwort = true
                    if(val == 0){
                        antwort = confirm("Das Auto wird für weitere Bestellungen gesperrt, bis dieser Schaden behoben wird.\nAchtung: Alle bereits bestätigten zukünftigen Bestellungen für dieses Auto müssen erneut bestätigt werden")
                    }
                    if(antwort){
                        // wenn bnr vorhanden, dann werden kosten hinzugefuegt + schaden mit bestellung verknuepft
                        if(!this.allgemein){
                            UserService.getCar(this.$route.params.autoname)
                            .then(response =>{
                                let auto = response.data.car 
                                if(auto.ausgeliehen == 0){
                                    Auth.addCost(this.$route.params.bnr, this.status(this.auswahl), this.kosten, this.beschreibung)
                                    .then((response) =>{
                                        if(response.data.success){
                                            let pos_fk = response.data.cost.pos
                                            Auth.addBnrToSchaden(this.$route.params.autoname, this.beschreibung, val, this.status(this.auswahl), this.kosten, this.$route.params.bnr, pos_fk)
                                            .then((response) =>{
                                                if(response.data.success){
                                                    if(response.data.verfuegbar == false){
                                                        alert("Das Auto ist erst wieder vefuegbar fuer die Vermietung, wenn dieser Schaden behoben wurde")
                                                        if(response.data.orders.length > 0){
                                                            let bnrs = []
                                                            for(let i=0;i<response.data.orders.length;i++){
                                                                bnrs.push(response.data.orders[i].bnr)
                                                            }
                                                            alert("Folgende Bestellungen muessen erneut ueberprueft werden BNR: " + bnrs.join('; '))
                                                        }
                                                    }
                                                    this.schaeden.push({auto_fk: this.$route.params.autoname, pos: response.data.pos, beschreibung: this.beschreibung, prioritaet: this.prio(this.auswahlPrio), typ:this.status(this.auswahl), hoehe: this.kosten, bnr_fk: this.$route.params.bnr, pos_fk: pos_fk})
                                                    this.auswahlPrio = ''
                                                    this.kosten = ''
                                                    this.beschreibung = ''
                                                    this.auswahl = ''
                                                    alert("Schaden erfolgreich hinzugefuegt")
                                                }
                                            })
                                            .catch((error) => {
                                                Helper.handle(error)
                                                Helper.redirect("/admin");
                                            })
                                        }
                                    })
                                    .catch((error) => {
                                        Helper.handle(error)
                                        Helper.redirect("/admin");
                                    })
                                }
                                else{
                                    alert("Cant add damage when car is rented")
                                    Helper.redirect("/admin");
                                }
                            })
                            .catch((error) => {
                                Helper.handle(error)
                                Helper.redirect("/admin");
                            })
                        }
                        // nur schaden hinzufuegen
                        else{
                            Auth.addSchaden(this.$route.params.autoname, this.beschreibung, val, this.status(this.auswahl), this.kosten)
                            .then((response) =>{
                                if(response.data.success){
                                    if(response.data.verfuegbar == false){
                                        alert("Das Auto ist erst wieder vefuegbar fuer die Vermietung, wenn dieser Schaden behoben wurde")
                                        if(response.data.orders.length > 0){
                                            let bnrs = []
                                            for(let i=0;i<response.data.orders.length;i++){
                                                bnrs.push(response.data.orders[i].bnr)
                                            }
                                            alert("Folgende Bestellungen muessen erneut ueberprueft werden BNR: " + bnrs.join('; '))
                                        }
                                    }
                                    this.schaeden.push({auto_fk: this.$route.params.autoname, pos: response.data.pos, beschreibung: this.beschreibung, prioritaet: this.prio(this.auswahlPrio), typ:this.status(this.auswahl), hoehe: this.kosten})
                                    this.auswahlPrio = ''
                                    this.kosten = ''
                                    this.beschreibung = ''
                                    this.auswahl = ''
                                    alert("Schaden erfolgreich hinzugefuegt")
                                }
                            })
                            .catch((error) => {
                                Helper.handle(error)
                                Helper.redirect("/admin");
                            })
                        }
                    }
                }
                else{
                    this.kosten = ''
                    alert("Kosten muss positive Zahl sein")
                }
            }
            else{
                alert("Alle Felder muessen ausgefuellt sein")
            }
        }

    },
    beforeMount(){
        // kann ohne oder mit bestellungsreferenz aufrufen --> mit referenz kann schaden hinzugefuegt werden
        this.prioTypen = ["Gering", "Mittel", "Groß", "Fatal"]
        this.schadenstypen = ["Beschaedigung", "Tank", "Sauberkeit"]
        if(!this.$route.params.bnr){
            this.allgemein = true
            this.msg = "Uebersicht Schaeden Auto: " + this.$route.params.autoname
            //hier schaeden holen fuer auto
            UserService.getSchaeden(this.$route.params.autoname)
            .then((response) =>{
                this.schaeden.push.apply(this.schaeden, response.data.cardamage)    
            })
            .catch((error) => {
                Helper.handle(error)
                Helper.redirect("/admin");
            })
        }
        else{
            this.allgemein = false
            this.msg = "Uebersicht Schaeden Auto: " + this.$route.params.autoname + " BNR: " + this.$route.params.bnr
            //hier noch testen, ob es zu bnr auch noch bestellung mit passender auto_fk gibt
            //--> nur schaden holen, die auch dazugehoerige kosten in kosten-tabelle haben
            UserService.getDamageCost(this.$route.params.bnr, this.$route.params.autoname)
            .then((response) => {
                if(response.data.success){
                    this.schaeden.push.apply(this.schaeden, response.data.schaeden)    
                }
                else{
                    alert("Die Bestellung BNR: " + this.$route.params.bnr + " ist ungueltig/nicht mehr vorhanden/bereits abgeschlossen/laufend")
                    Helper.redirect("/admin");
                }
            })
            .catch((error) => {
                Helper.handle(error);
                this.ausgewaehlt = false;
                this.msg = ""
                Helper.redirect("/admin/bestellungen")
            })  
        }
    }
}
 
</script>

<style scoped>

</style>
