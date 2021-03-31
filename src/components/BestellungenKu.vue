<template>
  <div class="container">
    <div v-if="!ausgewaehlt">
      <h1>{{ msg }}</h1>
      <hr>
      <select v-model="auswahl" class="form-control mx-sm-3">
        <option value="offen">Offene Bestellungen</option>
        <option value="geschlossen">Bestellungshistorie</option>
      </select>
      <br><br/>
      <button class="btn btn-primary" @click="aktualisieren()">Aktualisieren</button>
      <div class="table-responsive">
        <table class="table">
          <thead>
          <tr>
            <th>BNR</th>
            <th>Startdatum</th>
            <th>Enddatum</th>
            <th>Auto</th>
            <th>Erstelldatum</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(bestellung, index) in bestellungen" :key="index">
            <td>{{ bestellung.bnr }}</td>
            <td>{{ bestellung.startdatum }}</td>
            <td>{{ bestellung.enddatum }}</td>
            <td>{{ bestellung.auto_fk }}</td>
            <td>{{ bestellung.zeitstempel }}</td>
            <td>{{ status(bestellung.status) }}</td>
            <td>
              <button class="btn btn-primary" @click="showOrder(bestellung.bnr)">Weiter</button>
            </td>
          </tr>
          </tbody>
        </table>
        <button class="btn btn-secondary" type="cancel" @click="zurueck">Zurück</button>
      </div>
    </div>
    <div v-else>
      <h1>{{ msg }}</h1>
      <hr>
      <h3 class="form-group">Auto: {{ gewaehlteBestellung.auto_fk }}</h3>
      <h3 class="form-group">Mietzeitraum: {{ gewaehlteBestellung.startdatum }} -
        {{ gewaehlteBestellung.enddatum }}</h3>
      <div class="table-responsive form-group">
        <table class="table">
          <thead>
          <tr>
            <th>Kosten</th>
            <th>Beschreibung</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(kosten, index) in bestellkosten" :key="index">
            <td>{{ kosten.menge }}€</td>
            <td>{{ kosten.beschreibung }}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <form>
        <div class="form-group text-right">
          <h3>Gesamtkosten: {{ gesamtkosten }}€</h3>
        </div>
        <div class="form-group actions">
          <button class="btn btn-secondary" type="cancel" @click="back">Zurueck zur Uebersicht</button>
          <button class="btn btn-primary" @click="abbrechen" :disabled=isDisabled>Abbrechen</button>
        </div>
      </form>
    </div>
  </div>
</template>


<script>
// Hier wird fuer Mitarbeiter/Admin alles bzgl. Bestellungen angezeigt/definiert
import UserService from "../services/user.service";
import Helper from "../services/helper.service";
import Auth from "../services/auth.service";
export default {
    data(){
        return{
            ausgewaehlt: false,
            msg: '',
            bestellungen: [],
            gewaehlteBestellung: '',
            bestellkosten: [],
            auswahl: ''
        }
    },
    methods: {
        // zurueck zur allgemeinen Bestellueubersicht
        back() {
            this.ausgewaehlt = false;
            this.msg = "Alle Bestellungen"
            this.holeBestellungen();
            this.$router.push("/dashboard/bestellungen")
        },
        // zur allgemeinen userübersicht gehen
        zurueck(){
            this.$router.push("/dashboard")
        },
        // bestellung abbrechen
        abbrechen() {
            let heute = new Date(new Date().setHours(0,0,0,0));
            let start = new Date(this.gewaehlteBestellung.startdatum)
            let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
            let diffDays = Math.floor((start.getTime() - heute.getTime())/(oneDay))
            if(confirm("Meochten Sie die Bestellung wirklich abbrechen?")){
                // nur moegliche strafkosten bei bereits von mitarbeiter bestaetigten bestellungen
                if(diffDays < 8 && this.gewaehlteBestellung.status == 1){
                    let zeit = new Date(this.gewaehlteBestellung.zeitstempel)
                    diffDays = Math.floor((heute.getTime() - zeit.getTime())/(oneDay))
                    if(diffDays < 4){
                        this.gewaehlteBestellung.status = 3
                        Auth.updateStatusOrder(this.$route.params.bnr, 3)
                            .then((response) =>{
                        if(response.data.success){
                            alert("Bestellung wurde erfolgreich abgebrochen.")
                            this.ausgewaehlt = false;
                            this.msg = "Alle Bestellungen"
                            Helper.redirect("/dashboard/bestellungen");
                        }
                        })
                        .catch((error) => {
                            Helper.handle(error)
                            this.ausgewaehlt = false;
                            this.msg = "Alle Bestellungen"
                            Helper.redirect("/dashboard/bestellungen");
                        })
                    }
                    else{
                         //Strafe in Form von 10% der Bestellkosten des zu mietenden Autos 
                        let kosten = 0
                        for(let i =0; i< this.bestellkosten.length; i++){
                            if(this.bestellkosten[i].typ == 0){
                                kosten = this.bestellkosten[i].menge
                            }
                        }
                         if(confirm("Sind Sie sicher? Es wird wegen der kurzfristign Absage eine Strafzahlung in Hoehe von " + ((kosten/100)*10) + "€ faellig")){
                            this.gewaehlteBestellung.status = 2
                            Auth.updateStatusOrder(this.$route.params.bnr, 2)
                                .then((response) =>{
                                    if(response.data.success){
                                          Auth.addCost(this.$route.params.bnr, 5, ((kosten/100)*10), 'Strafkosten fuer kurzfristiges Abbrechen')
                                            .then((response) =>{
                                                if(response.data.success){
                                                    // daten aktualisieren, indem in array eingefuegt
                                                    this.bestellkosten.push(response.data.cost)
                                                    // Standarkosten loeschen, da Kunde nie auto ausgeliehen hat
                                                    Auth.deleteCost(this.$route.params.bnr, 0, null)
                                                    .then((response) =>{
                                                        if(response.data.success){
                                                            // daten aktualisieren, indem aus array geloescht 
                                                            for(let i=0; i<this.bestellkosten.length;i++){
                                                                if(this.bestellkosten[i].typ == 0){
                                                                    this.bestellkosten.splice(i,1)
                                                                    break
                                                                }
                                                            }
                                                            alert("Bestellung wurde abgebrochen. Jedoch muessen Sie eine Strafe zahlen")
                                                            this.ausgewaehlt = false;
                                                            this.msg = "Alle Bestellungen"
                                                            Helper.redirect("/dashboard/bestellungen");
                                                        }
                                                    })
                                                    .catch((error) => {
                                                        Helper.handle(error)
                                                        this.ausgewaehlt = false;
                                                        this.msg = "Alle Bestellungen"
                                                        Helper.redirect("/dashboard/bestellungen");
                                                    })
                                                }
                                            })
                                            .catch((error) => {
                                                Helper.handle(error)
                                                this.ausgewaehlt = false;
                                                this.msg = "Alle Bestellungen"
                                                Helper.redirect("/dashboard/bestellungen");
                                             })
                                    }
                                 })
                                 .catch((error) => {
                                    Helper.handle(error)
                                    this.ausgewaehlt = false;
                                    this.msg = "Alle Bestellungen"
                                    Helper.redirect("/dashboard/bestellungen");
                            })
                         }
                    }
                }
                else{
                    this.gewaehlteBestellung.status = 3
                    Auth.updateStatusOrder(this.$route.params.bnr, 3)
                    .then((response) =>{
                        if(response.data.success){
                            alert("Bestellung wurde erfolgreich abgebrochen.")
                            this.ausgewaehlt = false;
                            this.msg = "Alle Bestellungen"
                            Helper.redirect("/dashboard/bestellungen");
                        }
                    })
                    .catch((error) => {
                        Helper.handle(error)
                        this.ausgewaehlt = false;
                        this.msg = "Alle Bestellungen"
                        Helper.redirect("/dashboard/bestellungen");
                    })
                }
            }
        },
        // zur detaillierten Bestellübersicht wechseln
        showOrder(bnr){
            this.ausgewaehlt = true;
            this.msg = "Bestellung: " + bnr
            this.gewaehlteBestellung = this.bestellungen.find(
            (element) => element.bnr == bnr)
            this.bestellkosten = []
            UserService.getOrderCost(bnr)
            .then((response) => {
                response.data.costs.forEach((cost) => {
                    this.bestellkosten.push(cost)
                })
                this.$router.push("/dashboard/bestellungen/" + bnr)
            })
            .catch((error) => {
                Helper.handle(error)
                this.ausgewaehlt = false;
                this.msg = "Alle Bestellungen"
                Helper.redirect("/dashboard/bestellungen/");
            })
        },
        // alle bestellungen von backend holen
        holeBestellungen(){
            if (this.bestellungen.length < 1) {
                UserService.getOrder(this.auswahl)
                .then((response) => {
                    response.data.orders.forEach((order) => {
                        this.bestellungen.push(order)
                    })
                })
                .catch((error) => Helper.handle(error));
            }
        },
        // bestellungen aktualisiere, nachdem neuer bestellungstyp ausgewählt
        aktualisieren(){
            this.bestellungen = []
            this.holeBestellungen()
        },
         // status in text umwandeln
          status(status) {
           if(status == 0){
              return 'Wartet auf Bestaetigung'
           }
           else if(status == 1){
               return 'Laufende Bestellung'
           }
           else if(status == 2){
               return 'Bezahlung ausstehend'
           }
           else if(status == 3){
               return 'Abgebrochene Bestellung'
           }
           else if(status == 4){
               return 'Erfolgreich abgeschlossene Bestellung'
           }
        }   
    },
    computed: {
        isDisabled() {
            let heute = new Date(new Date().setHours(0,0,0,0));
            let start = new Date(this.gewaehlteBestellung.startdatum)
            if (start.getTime() <= heute.getTime() || (this.gewaehlteBestellung.status != 0 && this.gewaehlteBestellung.status != 1)){
                return true
            }
            else{
                return false
            }
        },
        gesamtkosten(){
            if(this.bestellkosten.length > 0){
                let gesamt = 0
                for(let i=0; i<this.bestellkosten.length;i++){
                    gesamt += this.bestellkosten[i].menge
                }
                return gesamt
            }
            else{
                return ''
            }
        }
    },
    beforeMount(){
        if (this.$route.params.bnr != "") {
            this.ausgewaehlt = true
            this.msg = "Bestellung: " + this.$route.params.bnr
            UserService.getOrder(this.$route.params.bnr)
                .then((response) => {
                    response.data.order.doppelt = false
                    this.gewaehlteBestellung = response.data.order
                    this.bestellkosten = []
                    UserService.getOrderCost(this.$route.params.bnr)
                        .then((response) => {
                            response.data.costs.forEach((cost) => {
                                this.bestellkosten.push(cost)
                            })
                            this.$router.push("/dashboard/bestellungen/" + this.$route.params.bnr)
                        })
                        .catch((error) => {
                            Helper.handle(error)
                            this.ausgewaehlt = false;
                            this.msg = "Alle Bestellungen"
                            Helper.redirect("/dashboard/bestellungen/");
                        })
                })
                .catch((error) => {
                    Helper.handle(error);
                    this.ausgewaehlt = false;
                    this.msg = "Alle Bestellungen"
                    Helper.redirect("/admin/bestellungen")
                })
        }
        else{
            this.auswahl = "offen"
            this.ausgewaehlt = false
            this.msg = "Alle Bestellungen"
            this.holeBestellungen()
        }
    }
}
 
</script>

<style scoped>
</style>
