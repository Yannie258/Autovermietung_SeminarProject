<template>
  <div class="container">
    <h1>Auto buchen</h1>
    <hr>
    <h3>{{ auto.name }}</h3>
    <h3>{{ user.vorname }} {{ user.nachname }}</h3>
    <h3>{{ user.adresse }}</h3>
    <h3>{{ user.telefon }}</h3>
    <h3>{{ user.user }}</h3>
    <hr>
    <form>
      <div class="form-group">
        <label for="rent-start-date">Anfangsdatum</label>
        <datepicker-lite
            :value-attr="datepickerSetting.value"
            :placeholder-attr="datepickerSetting.placeholder"
            :year-minus="datepickerSetting.yearMinus"
            :from="datepickerSetting.fromDate"
            :to="datepickerSetting.toDate"
            :disabled-date="datepickerSetting.disabledDate"
            :locale="datepickerSetting.locale"
            @value-changed="datepickerSetting.changeEvent"
            id="rent-start-date"
            class-attr="form-control"
        />
      </div>
      <div class="form-group">
        <label for="rent-end-date">Endtermin</label>
        <datepicker-lite
            :value-attr="datepickerSetting2.value"
            :placeholder-attr="datepickerSetting2.placeholder"
            :year-minus="datepickerSetting2.yearMinus"
            :from="datepickerSetting2.fromDate"
            :to="datepickerSetting2.toDate"
            :disabled-date="datepickerSetting.disabledDate"
            :locale="datepickerSetting2.locale"
            @value-changed="datepickerSetting2.changeEvent"
            id="rent-end-date"
            class-attr="form-control"
        />
      </div>
      <div class="form-group text-right">
        <h3>Kosten: {{ kosten }} €</h3>
      </div>
      <div class="form-group actions">
        <button class="btn btn-secondary" type="cancel" @click="back">Zurueck zur Uebersicht</button>
        <button
            class="btn btn-primary"
            type="button"
            @click='bestellen()'
            :disabled="!verfuegbarkeit(auto.verfuegbar)"
        >
          Anfrage
        </button>
      </div>
    </form>
  </div>
</template>

<script>
// Hier kann Kunde Bestellung erstellen
import DatepickerLite from "./DatepickerLite.vue";
import UserService from "../services/user.service";
import Helper from "../services/helper.service";
import Auth from "../services/auth.service";
export default {
    data(){
        return{            
            name: '',
            adresse: '',
            telefon: '',
            email: '',
            start: '',
            ende:  '',
            user: '',
            auto: '',
            cost: '',
            datepickerSetting : {
                value: '',
                placeholder: "Startdatum",
                yearMinus: 0,
                fromDate: "2020/01/01",
                toDate: "2030/12/10",
                disabledDate: [],
                locale: {
                format: "YYYY/MM/DD",
                weekday: ["Son", "Mon", "Dien", "Mit", "Don", "Frei", "Sam"],
                todayBtn: "Heute",
                clearBtn: "Löschen",
                closeBtn: "Schliessen",
                },
                changeEvent: (value) => {
                    let date = new Date()
                    let date2 = new Date(value)
                    if(date2.getTime() <= date.getTime()){
                        this.start = ''
                        alert('Ungültiges Startdatum')
                    }
                    else{
                        this.start = value
                    }
                }
            },
            //enddatum
            datepickerSetting2 : {
                value:  '',
                placeholder: "Enddatum",
                yearMinus: 0,
                fromDate: "2020/01/01",
                toDate: "2030/12/10",
                disabledDate: [],
                locale: {
                format: "YYYY/MM/DD",
                weekday: ["Son", "Mon", "Dien", "Mit", "Don", "Frei", "Sam"],
                todayBtn: "Heute",
                clearBtn: "Löschen",
                closeBtn: "Schliessen",
                },
                changeEvent: (value) => {
                    let date = new Date()
                    let date2 = new Date(value)
                    if(date2.getTime() <= date.getTime()){
                        this.ende = ''
                        alert('Ungültiges Enddatum')
                    }
                    else{
                        this.ende = value
                    }
                }
            }
        }
    },
    components: {
        DatepickerLite
    },
    methods: {
        // kann keine bestellung fuer auto erstellen, welches derzeit nicht verfuegbar ist
         verfuegbarkeit(vorhanden) {
            if (vorhanden == 1) {
                return true;
            } else {
                return false;
            }
         },
         // kosten an backend geben
         setKosten(cost) {
           this.cost = cost
         },
        //Hier Methode zum Bestellen
        bestellen(){
            if(this.start == '' && this.ende == ''){
                alert('Start- und Enddatum dürfen nicht leer/ungültig sein')
                return
            }
            else if(this.start == ''){
                alert('Bitte aktualisieren Sie erst das Startdatum zu einem gültigen Datum')
                return
            }
            else if(this.ende == ''){
                alert('Bitte aktualisieren Sie erst das Enddatum zu einem gültigen Datum')
                return
            }
            else{
                let startdatum = new Date(this.start)
                let enddatum = new Date(this.ende)
                if(startdatum.getTime() > enddatum.getTime()){
                    alert('Enddatum darf nicht vor Startdatum liegen')
                    return
                }
                else{
                    let bestellung
                    for(bestellung of this.zeiten){ 
                        let von = new Date(bestellung.startdatum)
                        let bis = new Date(bestellung.enddatum)
                        let startdatum = new Date(this.start)
                        let enddatum = new Date(this.ende)
                        if(((startdatum.getTime() < von.getTime()) && (enddatum.getTime() > bis.getTime()))){
                            alert(this.$route.params.autoname + ' ist bereits innerhalb des Zeitraumes gemietet')
                            return
                        }


                    }    

                }
            }

            //Hier Bestellung in Backend erstellen mit Status '0'
            //Hier auch noch prüfen, dass Kunde nur eine Bestellung gleichzeitig in DB haben darf 
            //--> sonst könnte ein Kunde einfach alles auf einmal mieten
            Auth.createOrder(this.auto.name, this.start, this.ende, this.cost)
            .then(response => {
                if(response.data.success){
                     //Bestätigung, wenn Bestellung erfolgreich erstellt wurde in DB
                    alert('Die Mietanfrage für ' + this.$route.params.autoname + ' für den Zeitraum: ' + this.start + ' - ' + this.ende
                      + ' wird von einem Mitarbeiter bearbeitet. Den Stand Ihrer Anfrage können Sie in Ihrem Account nachverfolgen')
                     Helper.redirect('/login')     
                }
            })
            .catch((error) => {
              Helper.handle(error)
              Helper.redirect("/search")
              
            })
        },
        //Alle Tage zw. (inklusive) Start- und Enddatum deaktivieren
        erstelleDeaktivierteZeiten(){
            let bestellung = ''
            for(bestellung of this.zeiten){             
                let start = new Date(bestellung.startdatum)
                let stop = new Date(bestellung.enddatum)
                let current = start
                while (current.getTime() <= stop.getTime()) {
                    this.datepickerSetting.disabledDate.push(Helper.formatDate(current));
                    current.setDate(current.getDate() + 1)
                }
            }
        },
      back() {
        this.$router.push("/search")
      }
    },
    computed: {
        // kosten berechnen durch bestimmung zeitraumlaenge in tage
        kosten: function () {
            if(this.start != '' && this.ende != ''){
                let startdatum = new Date(this.start)
                let enddatum = new Date(this.ende)
                if(startdatum.getTime() > enddatum.getTime()){
                        return ''
                }
                else{
                    let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                    let diffDays = Math.floor((enddatum.getTime() - startdatum.getTime())/(oneDay))
                    let cost = this.auto.preis * (diffDays +1)
                    this.setKosten(cost)
                    return cost
                }
            }
            else{
                return ''
            }
        }
    },
    beforeMount(){
        let from = new Date();
        from.setDate(from.getDate() + 1) 
        let to = new Date();
        to.setDate(to.getDate() + 90) //max. 3 Monate in Zukunft buchen
        //Zeiträume für Start-und Endkalender festlegen
        if(sessionStorage.getItem('start') != null){
            this.datepickerSetting.value = sessionStorage.getItem('start')
            this.start = this.datepickerSetting.value
        }
        this.datepickerSetting.toDate = Helper.formatDate(to)
        this.datepickerSetting2.toDate = Helper.formatDate(to)
        this.datepickerSetting.fromDate = Helper.formatDate(from)
        this.datepickerSetting2.fromDate = Helper.formatDate(from)
        if(sessionStorage.getItem('ende') != null){
            this.datepickerSetting2.value = sessionStorage.getItem('ende')
            this.ende = this.datepickerSetting2.value
        }
        sessionStorage.removeItem('start');
        sessionStorage.removeItem('ende');
        UserService.getUser()
        .then((response) =>{
            this.user = response.data.user;     
            UserService.getCar(this.$route.params.autoname)
                .then((response) =>{
                    this.auto = response.data.car  
                    this.zeiten = response.data.carTimes
                    this.erstelleDeaktivierteZeiten()            
                })
                .catch((error) => {
                    Helper.handle(error)
                    Helper.redirect("/");
                })           
        })
        .catch((error) => {
            Helper.handle(error)
            Helper.redirect("/");
        })
    },
}
</script>

<style scoped>

</style>