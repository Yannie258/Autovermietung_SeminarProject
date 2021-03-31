<template>
  <div class="container">
    <div v-if="!ausgewaehlt">
      <form class="form-group">
        <div class="form-inline form-group">
          <div class="form-group">
            <select v-model="bestellungsauswahl" class="form-control">
              <option value="" disabled selected>Filter Bestellungen</option>
              <option
                  v-for="(bestellung, index) in bestellungstypen"
                  :key="index"
                  :value="bestellung"
              >
                {{ bestellung }}
              </option>
            </select>
            <div class="form-group mx-sm-3">
              <button @click="update()" type="button" class="btn btn-primary">Bestellungen Aktualisieren</button>
            </div>
          </div>
        </div>
        <div class="form-inline form-group">
          <div class="form-group">
            <datepicker-lite
                :value-attr="datepickerSetting.value"
                :year-minus="datepickerSetting.yearMinus"
                :from="datepickerSetting.from"
                :to="datepickerSetting.to"
                :disabled-date="datepickerSetting.disabledDate"
                :locale="datepickerSetting.locale"
                @value-changed="datepickerSetting.changeEvent"
                class-attr="form-control"
            />
            <datepicker-lite
                :value-attr="datepickerSetting2.value"
                :year-minus="datepickerSetting2.yearMinus"
                :from="datepickerSetting2.from"
                :to="datepickerSetting2.to"
                :disabled-date="datepickerSetting2.disabledDate"
                :locale="datepickerSetting2.locale"
                @value-changed="datepickerSetting2.changeEvent"
                class-attr="form-control mx-sm-3"
            />
          </div>
        </div>
        <div class="form-inline form-group">
          <div class="form-group">
            <input class="form-control" type="text" placeholder="Nach BNR suchen" v-model="bnr">
            <input class="form-control mx-sm-3" type="text" placeholder="Nach Vorname suchen" v-model="vorname">
            <input class="form-control" type="text" placeholder="Nach Nachname suchen" v-model="nachname">
            <button class="btn btn-primary mx-sm-3" @click="suchen()" type="button">Suchen</button>
          </div>
        </div>
      </form>
      <div class="table-responsive form-group">
        <table class="table">
          <thead>
          <tr>
            <th>BNR</th>
            <th>Startdatum</th>
            <th>Enddatum</th>
            <th>Auto</th>
            <th>Vorname</th>
            <th>Nachname</th>
            <th>Erstelldatum</th>
            <th>Status</th>
            <th>Bearbeiten</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(bestellung, index) in gesuchteBestellungen" :key="index" :class="getClass(bestellung)">
            <td>{{ bestellung.bnr }}</td>
            <td>{{ bestellung.startdatum }}</td>
            <td>{{ bestellung.enddatum }}</td>
            <td>{{ bestellung.auto_fk }}</td>
            <td>{{ bestellung.vorname }}</td>
            <td>{{ bestellung.nachname }}</td>
            <td>{{ bestellung.zeitstempel }}</td>
            <td>{{ status(bestellung.status) }}</td>
            <td>
              <button class="btn btn-primary" @click="editingOrder(bestellung.bnr)">Weiter</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <h1>{{ msg }}</h1>
      <hr>
      <div class="form-group">
        <h3>Auto: {{ gewaehlteBestellung.auto_fk }}</h3>
        <h3>Kunde: {{ gewaehlteBestellung.vorname }} {{ gewaehlteBestellung.nachname }}</h3>
        <h3>Email: {{ gewaehlteBestellung.user }}</h3>
        <h3>Adresse: {{ gewaehlteBestellung.adresse }}</h3>
        <h3>Telefon: {{ gewaehlteBestellung.telefon }}</h3>
        <h3>Mietzeitraum: {{ gewaehlteBestellung.startdatum }} - {{ gewaehlteBestellung.enddatum }}</h3>
      </div>
      <div class="table-responsive">
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
      <br/>
      <h3>Gesamtkosten: {{ gesamtkosten }}€</h3>
      <div class="actions form-group">
        <button class="btn btn-secondary" type="cancel" @click="back">Zurück zur Suche</button>
        <div v-if="(gewaehlteBestellung.status==0 || gewaehlteBestellung.status==1)">
          <button class="btn btn-danger" @click="abbrechen(gewaehlteBestellung.bnr, 0)"
                  :disabled="gewaehlteBestellung.status!=0 && gewaehlteBestellung.status!=1 && auto.ausgeliehen !=0">
            Abbrechen
          </button>
        </div>
        <div v-if="gewaehlteBestellung.status==0">
          <button class="btn btn-success" @click="acceptOrder(gewaehlteBestellung.bnr)"
                  :disabled="gewaehlteBestellung.status!=0">Bestaetigen
          </button>
        </div>
        <div v-if="auto.ausgeliehen == 0 && gewaehlteBestellung.status==1">
          <button @click="ausleihen(auto.name, gewaehlteBestellung.bnr)">Auto ausleihen</button>
        </div>
        <div v-if="(gewaehlteBestellung.status==5 || gewaehlteBestellung.status == 6) && auto.ausgeliehen == 1">
          <button class="btn btn-warning" @click="rueckgabe(gewaehlteBestellung.bnr)">Auto zurückgeben</button>
        </div>
        <div
            v-if="gewaehlteBestellung.status==2">
          <button class="btn btn-primary" @click="finishOrder(gewaehlteBestellung.bnr)">Abschließen</button>
        </div>
        <div v-if="gewaehlteBestellung.status!=3 && gewaehlteBestellung.status!=4">
          <button class="btn btn-info" @click="showDamage(gewaehlteBestellung)">Anzeigen Offener Autoprobleme</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
// Hier wird fuer Mitarbeiter/Admin alles bzgl. Bestellungen angezeigt/definiert
import UserService from "../services/user.service";
import Auth from "../services/auth.service";
import Helper from "../services/helper.service";
import DatepickerLite from "./DatepickerLite.vue";
export default {
    data(){
        return{
            ausgewaehlt: false,
            msg: '',
            bestellungen: [],
            gesuchteBestellungen: [],
            gewaehlteBestellung: '',
            schaeden: [],
            bestellkosten: [],
            class: '',
            bestellungsauswahl: '',
            bestellungstypen: [],
            auto: '',
            bnr: '',
            vorname: '',
            nachname: '',
            erstelldatum: '',
            start: '',
            ende: '',
            datepickerSetting : {
                value:"",
                yearMinus: 0,
                from: "",
                to: "1999/01/01",
                disabledDate: [],
                locale: {
                format: "YYYY/MM/DD",
                weekday: ["Son", "Mon", "Dien", "Mit", "Don", "Frei", "Sam"],
                todayBtn: "Heute",
                clearBtn: "Löschen",
                closeBtn: "Schliessen",
                },
                changeEvent: (value) => {
                    this.start = value
                }
            },
            //enddatum
            datepickerSetting2 : {
                value: "",
                yearMinus: 0,
                from: "",
                to: "1999/01/01",
                disabledDate: [],
                locale: {
                format: "YYYY/MM/DD",
                weekday: ["Son", "Mon", "Dien", "Mit", "Don", "Frei", "Sam"],
                todayBtn: "Heute",
                clearBtn: "Löschen",
                closeBtn: "Schliessen",
                },
                changeEvent: (value) => {
                    this.ende = value
                }
            }
        }
    },
    components: {
        DatepickerLite
    },
    methods: {
        // daten neu laden bzw. bestimmte bestellungstypen anzeigen
        update(){
            if(this.bestellungsauswahl == ''){
                alert("Bitte wählen Sie einen Filter aus")
                return
            }
            this.bestellungen = []
            this.gesuchteBestellungen = []
            let typ = -1
            if (this.bestellungsauswahl == "Offene Bestellanfragen") typ = 0
            else if(this.bestellungsauswahl == "Bestellungshistorie") typ = 7 //3 u. 4
            else if(this.bestellungsauswahl == "Offene Bezahlung") typ = 2
            else if(this.bestellungsauswahl == "Ueberzogene Bestellungen") typ = 5
            else if(this.bestellungsauswahl == "Bestaetigte Bestellungen") typ = 1
            else if(this.bestellungsauswahl == "Laufende Bestellungen") typ = 6
            else if(this.bestellungsauswahl == "Doppelte Bestellungen") typ = 10
            else if(this.bestellungsauswahl == "Alle Bestellungen") typ = 8
            this.holeBestellungen(typ)
        },
        // bestimmte bestellungen suchen
        suchen(){
            this.gesuchteBestellungen = this.bestellungen.filter((bestellung) => {
                let bnr = false;
                let name = false
                let datum = false
                let startdatum = new Date(this.start)
                let enddatum = new Date(this.ende)
                let zeitstempel = new Date(bestellung.zeitstempel)
                if (this.bnr == "") {
                    bnr = true;
                } else {
                    bnr = bestellung.bnr == this.bnr;
                }

                if (this.vorname == "" || this.nachname == "") {
                    name = true
                } else name = (
                    this.vorname.toLowerCase().split(" ").every((v) => bestellung.vorname.toLowerCase().includes(v)) &&
                    this.nachname.toLowerCase().split(" ").every((v) => bestellung.nachname.toLowerCase().includes(v))
                )
                if((this.start == '' && this.ende == '') || (startdatum.getTime() > enddatum.getTime())){
                    datum = true
                }
                else if(this.ende == ''){
                    if(startdatum.getTime() == zeitstempel.getTime()){
                        datum = true
                    }
                    else{
                        datum = false
                    }
                }
                else if(this.start == ''){
                    if(enddatum.getTime() == zeitstempel.getTime()){
                        datum = true
                    }
                    else{
                        datum = false
                    }
                }
                else{
                    if((startdatum.getTime() <= zeitstempel.getTime()) && (enddatum.getTime() >= zeitstempel.getTime())){
                        datum = true
                    }
                    else{
                        datum = false
                    }
                }
                return (bnr && name && datum)
            })
        },
        // zurueck zur allgemeinen Bestellueubersicht
        back() {
            this.ausgewaehlt = false;
            this.msg = "Alle Bestellungen"
            this.$router.push("/admin/orders")
        },
        home() {
            this.$router.push("/admin")
        },
        showDamage(bestellung){
            // allgemeine autoschäden behandlen, wenn auto im ausleihprozess ist
            if(bestellung.status == 0 || bestellung.status == 1 || bestellung.status == 6 || bestellung.status == 5){
                Helper.redirect("/admin/"+bestellung.auto_fk+"/schaden");
            }
            // erst wenn auto erfolgreich durch kunden zurückgegeben, dann können auch zur bestellung schäden hinzugefügt werden
            else if(bestellung.status == 2){
                 Helper.redirect("/admin/"+bestellung.auto_fk+"/schaden" + "/" + bestellung.bnr);
            }
        },
          abbrechen(bnr, skip, auto, bestellkosten) {
            let bestaetigen = false 
            if(!skip){
                bestaetigen = confirm("Moechten Sie die Bestellung BNR: " + bnr + " wirklich abbrechen?")
            } 
            else{
                bestaetigen = true  
            }
            if(bestaetigen){
                let bestellung = 0
                 if(this.$route.params.bnr != ''){
                    bestellung = this.gewaehlteBestellung
                    bestellkosten = this.bestellkosten
                    auto = this.auto
                }
                else{
                    bestellung = this.bestellungen.find((element) => element.bnr == bnr)
                }             
                // wenn vor ausleihe des autos vor ort probleme mit kunden (z.b. kann nicht bezahlen), dann abbruch mit strafzahlung
                if(auto != null && auto.ausgeliehen == 0 && bestellung.status == 1){
                    //Strafe in Form von 30% der Bestellkosten des zu mietenden Autos 
                    let kosten = 0
                    for(let i =0; i< bestellkosten.length; i++){
                        if(bestellkosten[i].typ == 0){
                            kosten = bestellkosten[i].menge
                            break
                        }
                    }
                    if(!skip) alert("Es wird wegen der kurzfristign Absage eine Strafzahlung in Hoehe von " + ((kosten/100)*30) + "€ faellig")
                    bestellung.status = 2
                    Auth.updateStatusOrder(bnr, 2)
                        .then((response) =>{
                            if(response.data.success){
                                    Auth.addCost(bnr, 2, ((kosten/100)*30), 'Strafkosten fuer Problem bei Abholung des Autos')
                                    .then((response) =>{
                                        if(response.data.success){
                                            if(this.$route.params.bnr != ''){
                                                // daten aktualisieren, indem in array eingefuegt
                                                this.bestellkosten.push(response.data.cost)
                                            }
                                            // Standarkosten loeschen, da Kunde nie auto ausgeliehen hat
                                            Auth.deleteCost(bnr, 0, null)
                                            .then((response) =>{
                                                if(response.data.success){
                                                     if(this.$route.params.bnr != ''){
                                                        // daten aktualisieren, indem aus array geloescht 
                                                        for(let i=0; i<this.bestellkosten.length;i++){
                                                            if(this.bestellkosten[i].typ == 0){
                                                                this.bestellkosten.splice(i,1)
                                                                break
                                                            }
                                                        }
                                                     }
                                                }
                                            })
                                            .catch((error) => {
                                                Helper.handle(error)
                                                this.ausgewaehlt = false;
                                                this.msg = "Alle Bestellungen"
                                                Helper.redirect("/admin/orders");
                                            })
                                        }
                                    })
                                    .catch((error) => {
                                        Helper.handle(error)
                                        this.ausgewaehlt = false;
                                        this.msg = "Alle Bestellungen"
                                        Helper.redirect("/admin/orders");
                                        })
                            }
                            })
                            .catch((error) => {
                            Helper.handle(error)
                            this.ausgewaehlt = false;
                            this.msg = "Alle Bestellungen"
                            Helper.redirect("/admin/orders");
                    })
                }
                else{
                    Auth.updateStatusOrder(bnr, 3)
                    .then(response =>{
                        if(response.data.success){
                            if(this.$route.params.bnr != ""){
                                this.gewaehlteBestellung.status = 3
                            }
                            this.bestellungen.find(
                            (element) => element.bnr == bnr).status = 3
                            if(!skip) alert("Bestellung wurde erfolgreich abgebrochen.")
                            this.ausgewaehlt = false
                            this.msg = "Alle Bestellungen"
                            Helper.redirect("/admin/orders");
                            return
                        }
                    })
                    .catch((error) => {
                        Helper.handle(error)
                        this.ausgewaehlt = false
                        this.msg = "Alle Bestellungen"
                        Helper.redirect("/admin/orders");
                        return
                    })
                }
            }
        },
        //Bestellung akzeptieren --> 0 zu 1
        acceptOrder(bnr){
            let bestellung = this.bestellungen.find(
            (element) => element.bnr == bnr)
            let date = bestellung
            //ueberpruefung, ob doppelte bestellungen
            if(bestellung.doppelt){
                let doppelt = [bestellung]
                for(let i=0;i<this.bestellungen.length;i++){
                    if(bestellung.bnr == this.bestellungen[i].bnr){
                        continue
                    }
                    else if(bestellung.auto_fk == this.bestellungen[i].auto_fk && this.bestellungen[i].doppelt){
                        doppelt.push(this.bestellungen[i])
                    }
                }
                for(let i=1;i<doppelt.length;i++){
                    alert("Die Bestellung BNR: " + doppelt[i].bnr + " ueberschneidet sich mit dieser Bestellung")
                }
                for(let i=1;i<doppelt.length-1;i++){
                    let d1 = new Date(doppelt[i].zeitstempel) 
                    let d2 = new Date(doppelt[i+1].zeitstempel) 
                    if(d1.getTime() < d2.getTime()){
                        date = doppelt[i]
                    }
                    else{
                        date = doppelt[i+1]
                    }
                }
                if(confirm("Soll die frueheste Bestellung BNR: " +  date.bnr +" akzeptiert und automatisch die anderen Anfragen abgebrochen werden?")){
                    doppelt.forEach(async (item) => {
                        if(item.bnr == date.bnr){
                            return
                        }
                        await this.abbrechen(item.bnr, 1, null, 0)
                    })
                }
                else{
                    return
                }   
            }
            UserService.getSchaeden(date.auto_fk)
                .then((response) => {
                    // wenn kein schaden, dann kann bestellung bestaetigt werden
                    if(response.data.success){
                        Auth.updateStatusOrder(date.bnr, 1)
                        .then((response) =>{
                            if(response.data.success){
                                this.bestellungen.find(
                                (element) => element.bnr == date.bnr).status = 1
                                alert("Bestellung wurde erfolgreich bestaetigt.")
                                this.ausgewaehlt = false
                                this.msg = "Alle Bestellungen"
                                Helper.redirect("/admin/orders");
                                return
                            }
                        })
                            .catch((error) => {
                            Helper.handle(error)
                            this.ausgewaehlt = false
                            this.msg = "Alle Bestellungen"
                            Helper.redirect("/admin/orders");
                            return
                        })
                    }
                    // offene schaeden sind vorhanden
                    else{
                        let val = false
                        this.schaeden.push.apply(this.schaeden, response.data.cardamage)
                        for(let i=0;i<this.schaeden.length;i++){
                                if(this.schaeden[i].prioritaet == 0){
                                if(confirm("Das Auto kann nicht ausgeliehen werden wegen offener fataler Probleme.\nMoechten Sie diese jetzt bearbeiten?")){
                                    val = true
                                    Helper.redirect("/admin/" + date.auto_fk + "/schaden");
                                    return
                                }
                                val = true
                                return
                            }
                        }
                        if(!val){
                            if(confirm("Es bestehen noch offene Probleme, die aber nicht fatal sind. Moechten Sie die Bestellung bestaetigen")){    
                                Auth.updateStatusOrder(date.bnr, 1)
                                    .then((response) =>{
                                        if(response.data.success){
                                            this.bestellungen.find(
                                            (element) => element.bnr == date.bnr).status = 1
                                            alert("Bestellung wurde erfolgreich bestaetigt.")
                                            Helper.redirect("/admin/orders");
                                            this.ausgewaehlt = false
                                            this.msg = "Alle Bestellungen"
                                            return
                                        }
                                    })
                                    .catch((error) => {
                                        Helper.handle(error)
                                        this.ausgewaehlt = false
                                        this.msg = "Alle Bestellungen"
                                        Helper.redirect("/admin/orders");
                                        return
                                    })
                            }
                        }
                    }
                })
                .catch((error) => {
                    Helper.handle(error)
                    this.ausgewaehlt = false
                    this.msg = "Alle Bestellungen"
                    Helper.redirect("/admin/orders");
                })
        },

        finishOrder(bnr){
            if(confirm("Moechten Sie die Bestellung wirklich abschliessen? Haben Sie auch das Auto auf neue Schaeden begutachtet?")){
                let zusatz = 0
                let bestaetigen = false
                for(let i=0; i<this.bestellkosten.length;i++){
                    if(this.bestellkosten[i].typ != 0){
                        zusatz += this.bestellkosten[i].menge
                    }
                }
                if(zusatz > 0){
                    if(confirm("Es sind noch offene Zusatzkosten in Hoehe von " + zusatz + "€ zu zahlen.\nWurden diese bezahlt?")){
                        bestaetigen = true
                    }
                    else{
                        bestaetigen = false
                    }
                }
                else{
                    bestaetigen = true
                }
                if(bestaetigen){
                    Auth.updateStatusOrder(bnr, 4)
                    .then((response) =>{
                        if(response.data.success){
                            Auth.updateAusleiheAuto(this.auto.name, 0)
                            .then((response) =>{
                                if(response.data.success){
                                    this.gewaehlteBestellung.status = 4
                                    this.auto.ausgeliehen = 0
                                    alert("Auto wurde erfolgreich zurückgegeben")
                                    return
                                }
                            })
                            .catch((error) => {
                                Helper.handle(error)
                                this.ausgewaehlt = false
                                this.msg = "Alle Bestellungen"
                                Helper.redirect("/admin/orders");
                                return
                            })  
                        }
                    })
                    .catch((error) => {
                        Helper.handle(error)
                        this.ausgewaehlt = false
                        this.msg = "Alle Bestellungen"
                        Helper.redirect("/admin/orders");
                        return
                    })  
                }
            }
        },
        // 5 zu 2 bzw. 6-->2 (rueckgabe auto)
        rueckgabe(bnr){
          if(confirm("Wurde das Auto wirklick vom Kunden zurückgegeben?")){                
            Auth.updateStatusOrder(bnr, 2)
            .then((response) =>{
                if(response.data.success){
                    Auth.updateAusleiheAuto(this.auto.name, 0)
                    .then((response) =>{
                        if(response.data.success){
                            this.gewaehlteBestellung.status = 2
                            this.auto.ausgeliehen = 0
                            alert("Auto wurde erfolgreich zurückgegeben")
                            return
                        }
                    })
                    .catch((error) => {
                        Helper.handle(error)
                        this.ausgewaehlt = false
                        this.msg = "Alle Bestellungen"
                        Helper.redirect("/admin/orders");
                        return
                    })  
                }
            })
            .catch((error) => {
                Helper.handle(error)
                this.ausgewaehlt = false
                this.msg = "Alle Bestellungen"
                Helper.redirect("/admin/orders");
                return
            })  
          }
        },
        // mitarbeiter bestaetigt dies, wenn auto ausgeliehen u. kunde standarkosten vor ort bezahlt hat
        ausleihen(auto, bnr){
            let gesamt = 0
            for(let i=0; i<this.bestellkosten.length;i++){
                gesamt += this.bestellkosten[i].menge
            }
            if(confirm("Wurden die Kosten in Hoehe von " + gesamt + "€ bezahlt und ist das Auto bereit fuer die Ausleihe?")){
                Auth.updateAusleiheAuto(auto, 1)
                .then((response) =>{
                    if(response.data.success){
                        Auth.updateStatusOrder(this.gewaehlteBestellung.bnr, 6)
                        .then((response) =>{
                            if(response.data.success){
                                this.bestellungen.find(
                                (element) => element.bnr == bnr).status = 6
                                 alert("Das Auto kann nun ausgeliehen werden")
                                this.auto.ausgeliehen = 1
                                return
                            }
                        })
                        .catch((error) => {
                            Helper.handle(error)
                            this.ausgewaehlt = false
                            this.msg = "Alle Bestellungen"
                            Helper.redirect("/admin/orders");
                            return
                        })  
                    }
                })
                .catch((error) => {
                    Helper.handle(error)
                    this.ausgewaehlt = false
                    this.msg = "Alle Bestellungen"
                    Helper.redirect("/admin/orders");
                    return
                })  
            }
        },
        // test, ob bestellungen mehrfach vorhanden sind
        testdoppelt(){
             let verglichen = []
             for(let i=0; i < this.bestellungen.length-1; i++){
                let value = false
                if (this.bestellungen[i].status != 0){
                    continue
                }
                for(let j=0; j < verglichen.length; j++){
                    if(verglichen[j].auto_fk == this.bestellungen[i].auto_fk){
                        value = true
                        break
                    }
                }
                if(value){
                    continue
                }
                verglichen.push(this.bestellungen[i]) 
                if(this.bestellungen[i].status == 0){
                        for(let h=i+1; h < this.bestellungen.length; h++){
                            if((this.bestellungen[i].auto_fk == this.bestellungen[h].auto_fk) && (this.bestellungen[h].status == 0)){
                                verglichen.push(this.bestellungen[h])
                                let startdatum = new Date(this.bestellungen[i].startdatum)
                                let enddatum = new Date(this.bestellungen[i].enddatum)
                                let von = new Date(this.bestellungen[h].startdatum)
                                let bis = new Date(this.bestellungen[h].enddatum)
                                if(((startdatum.getTime() <= von.getTime()) && (enddatum.getTime() >= von.getTime())
                                    ||((startdatum.getTime() <= bis.getTime()) && (enddatum.getTime() >= bis.getTime()))
                                    ||((startdatum.getTime() >= von.getTime()) && (enddatum.getTime() <= bis.getTime())))){
                                    this.bestellungen[i].doppelt = true
                                    this.bestellungen[h].doppelt = true
                                }
                            }
                        }
                }else{
                    continue
                }
            }
        },
        // geladene Bestellungen werden geprueft, ob sie offen, aber schon abgelaufen sind --> automatisch abgebrochen
        async testAbgelaufen(){
            this.bestellungen.forEach(async (item) => {
                let heute = new Date(new Date().setHours(0,0,0,0));
                let start = new Date(item.startdatum)
                if(start.getTime() <= heute.getTime() && item.status == '0'){
                    await this.abbrechen(item.bnr, 1, null, 0)
                }
            })
            return
        },
        // geladene Bestellungen werden geprueft, ob sie laufend sind, aber auto noch nicht abgeholt wurde sind --> automatisch abgebrochen mit strafe
        async testNichtAngetreten(){
            this.bestellungen.forEach(async (item) => {
                let heute = new Date(new Date().setHours(0,0,0,0));
                let start = new Date(item.startdatum)
                start.setDate(start.getDate() + 1);
                UserService.getCar(item.auto_fk)
                .then(response =>{
                    let auto = response.data.car 
                    // wenn datum 1 tag nach startdatum autobestellung
                    if(start.getTime() <= heute.getTime() && item.status == '1'){
                         let bestellkosten = []
                         UserService.getOrderCost(item.bnr)
                        .then((response) => {
                            response.data.costs.forEach((cost) => {
                                bestellkosten.push(cost)
                            })
                            this.abbrechen(item.bnr, 1, auto, bestellkosten)
                        })
                        .catch((error) => {
                            Helper.handle(error)
                            this.ausgewaehlt = false
                            this.msg = "Alle Bestellungen"
                            Helper.redirect("/admin/orders/");
                        })
                    }
                })
                .catch((error) => {
                    Helper.handle(error)
                    this.ausgewaehlt = false
                    this.msg = "Alle Bestellungen"
                    Helper.redirect("/admin/orders/");
                })
                
            })
            return
        },
        // geladene Bestellungen werden geprueft, ob sie laufend sind (auto ausgeliehen wurde), aber es zu Verspätung bei Autoabgabe durch Kunden kam
        async testVerspeatung(){
            this.bestellungen.forEach(async (item) => {
                let heute = new Date(new Date().setHours(0,0,0,0));
                let enddatum = new Date(item.enddatum) 
                // nur bestellungen, wo auto noch nicht abgegeben wurde
                if(enddatum.getTime() < heute.getTime() && (item.status == '6' || item.status == '5')){
                    let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                    let diffDays = Math.floor((heute.getTime() - enddatum.getTime())/(oneDay))
                    await this.setzeVerspaetung(item.bnr, diffDays, item.auto_fk)
                }
            })
            .catch((error) => {
                Helper.handle(error);
                this.ausgewaehlt = false
                this.msg = "Alle Bestellungen"
                Helper.redirect("/admin/orders");
            });
            return
        },
        // Preis anpassen je nach ueberzogener Tage
        async setzeVerspaetung(bnr, tage, autoname){
            UserService.getCar(autoname)
                .then(response =>{
                   let auto = response.data.car
                   let ueberzugsgebuehren = auto.preis * tage
                   if(auto.ausgeliehen){       
                        Auth.addCost(bnr, 3, ueberzugsgebuehren, tage + ' Tage Verspaetete Abgabe Auto')
                        .then(response =>{
                            if(response.data.success){
                                if(response.data.changed){
                                    if(this.bestellkosten.length > 0){
                                        let kosten = this.bestellkosten.find(
                                                (element) => element.bnr == bnr && element.pos == response.data.pos)
                                        kosten.menge = ueberzugsgebuehren
                                        kosten.beschreibung = tage + ' Tage Verspaetete Abgabe Auto'
                                    }
                                }
                                else{
                                    this.bestellkosten.push(response.data.cost)
                                }
                                Auth.updateStatusOrder(bnr, 5)
                                .then((response) =>{
                                    if(response.data.success){
                                        this.bestellungen.find(
                                        (element) => element.bnr == bnr).status = 5
                                        return
                                    }
                                })
                                .catch((error) => {
                                    Helper.handle(error)
                                    this.ausgewaehlt = false
                                    this.msg = "Alle Bestellungen"
                                    Helper.redirect("/admin/orders");
                                    return
                                })  
                            }
                        })
                        .catch((error) => {
                            Helper.handle(error)
                            this.ausgewaehlt = false
                            this.msg = "Alle Bestellungen"
                            Helper.redirect("/admin/orders");
                            return
                        })
                   }
                })
                .catch((error) => {
                    Helper.handle(error)
                    this.ausgewaehlt = false
                    this.msg = "Alle Bestellungen"
                    Helper.redirect("/admin/orders");
                    return
                })
        },
        
        async holeAuto(autoname){
            UserService.getCar(autoname)
            .then(response =>{
                this.auto = response.data.car 
            })
            .catch((error) => {
                Helper.handle(error)
                this.ausgewaehlt = false
                this.msg = "Alle Bestellungen"
                Helper.redirect("/admin/orders/");
            })
        },
        holeKosten(bnr){
            this.bestellkosten = []
            UserService.getOrderCost(bnr)
                .then((response) => {
                    response.data.costs.forEach((cost) => {
                        this.bestellkosten.push(cost)
                    })
                })
                .catch((error) => {
                    Helper.handle(error)
                    this.ausgewaehlt = false
                    this.msg = "Alle Bestellungen"
                    Helper.redirect("/admin/orders/");
                })
        },
        // faerbe tabelle, wenn doppelte bestellung
        getClass(bestellung) {
              if (bestellung.doppelt) {
                this.class="doppelt"
                return this.class
              }
              else if (bestellung.status == 0){
                this.class = "offen"
                return this.class
              }
              else if (bestellung.status == 2) {
                this.class = "bezahlen"
                return this.class
              }
              else if (bestellung.status == 6) {
                this.class = "gestartet"
                return this.class
              }
              else if (bestellung.status == 3 || bestellung.status == 4){
                this.class = "beendet"
                return this.class
              }
              else{
                this.class = "normal"
                return this.class
              }
        },
        // zur detaillierten Bestellübersicht wechseln
        editingOrder(bnr){
            this.ausgewaehlt = true;
            this.msg = "Bestellung Nr.: " + bnr
            this.gewaehlteBestellung = this.bestellungen.find(
            (element) => element.bnr == bnr)
            this.holeKosten(bnr)
            this.holeAuto(this.gewaehlteBestellung.auto_fk).then(
                this.$router.push("/admin/bestellungen/" + bnr)
            )
        },
        // alle bestellungen von backend holen
        holeBestellungen(typ){
            if (this.bestellungen.length < 1) {
                let bestelltyp = ''
                if(typ == 7){
                    bestelltyp = "geschlossen"
                }
                else if(typ == 10){
                    bestelltyp = "offen " + 0
                }
                else if(typ == 8 || typ == 9){
                    bestelltyp = "alle"
                }
                else{
                    bestelltyp = "offen " + typ
                }
                UserService.getOrder(bestelltyp)
                .then((response) => {
                    response.data.orders.forEach((order) => {
                        order.doppelt = false
                        this.bestellungen.push(order)
                    })
                    if(typ == 0 || typ == 10 || typ == 8){
                        this.testdoppelt()
                    } 
                    //nur doppelte anzeigen
                    if(typ == 10){
                        let bestellungen = []
                        for(let i=0;i<this.bestellungen.length;i++){
                             if(this.bestellungen[i].doppelt){
                                 bestellungen.push(this.bestellungen[i])
                             }
                        }
                        this.bestellungen = bestellungen
                    }
                    // wenn einzelne bestellung angesehen wird, muessen alle bestellungen geladen werden
                    //um moegliche konflikte zu sehen u. auch spezifische bestellung zu finden
                    if(typ == 9){
                        this.gewaehlteBestellung = this.bestellungen.find(
                        (element) => element.bnr == this.$route.params.bnr)
                        this.holeKosten(this.$route.params.bnr)
                        this.holeAuto(this.gewaehlteBestellung.auto_fk)
                    }
                    this.gesuchteBestellungen = this.bestellungen
                     this.testVerspeatung().then(
                        this.testAbgelaufen().then(
                            this.testNichtAngetreten().then()(
                                this.gesuchteBestellungen = this.bestellungen,
                                // filter automatisch auf geladene datensaetze angewandt
                                this.suchen()
                            )
                        )
                    ) 
                })
                .catch((error) => {
                    Helper.handle(error)
                    Helper.redirect("/admin")
                })
               
            }
        },
         // status in text umwandeln
          status(status) {
           if(status == 0){
              return 'Wartet auf Bestaetigung'
           }
           else if(status == 1){
               return 'Bestätigte Bestellung'
           }
           else if(status == 2){
               return 'Wartet auf Beendigung'
           }
           else if(status == 3){
               return 'Abgebrochene Bestellung'
           }
           else if(status == 4){
               return 'Erfolgreich abgeschlossene Bestellung'
           }
           else if(status == 5){
               return 'Überfällige Bestellung'
           }
           else if(status == 6){
               return 'Auto ausgeliehen'
           }
        }   
    },

    computed: {
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
        let heute = new Date(new Date().setHours(0,0,0,0));
        this.datepickerSetting.value = Helper.formatDate(heute)
                                                           //0                       3,4                   2                           5                   doppelt = true              6                            1
        this.bestellungstypen = ["Alle Bestellungen", "Offene Bestellanfragen", "Bestellungshistorie", "Zu beendende Bestellungen", "Ueberzogene Bestellungen","Doppelte Bestellungen", "Laufende Bestellungen", "Bestaetigte Bestellungen"];
        if (this.$route.params.bnr != undefined && this.$route.params.bnr != "") {
            this.ausgewaehlt = true
            this.msg = "Bestellung: " + this.$route.params.bnr
            this.holeBestellungen(9)
        }
        else{
            this.ausgewaehlt = false
            this.msg = "Alle Bestellungen"
            this.holeBestellungen(0)
        }
    }
}
 
</script>

<style scoped>

.doppelt{
    background-color: red
}
.offen{
    background-color: yellow
}
.bezahlen {
    background-color: orange
}
.gestartet {
    background-color: rgb(6, 197, 6)
}
.beendet {
    background-color: rgb(161, 158, 158)
}
.normal {
    background-color: rgb(193, 197, 233)
}

</style>
