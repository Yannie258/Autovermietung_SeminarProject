<template>
  <div class="container">
    <h1>Verfügbares Auto</h1>
    <hr>
    <main class="search" v-if="!ausgewaehlt">
      <h1>Suchergebnisse für: {{ msg }}</h1>
      <form>
        <div class="form-row">
          <div class="col">
            <input
                type="text"
                placeholder="Autoname"
                v-model="autoname"
                autofocus
                class="form-control"
            />
          </div>
          <div class="col">
            <div class="form-group">
              <datepicker-lite
                  :value-attr="datepickerSetting.value"
                  :year-minus="datepickerSetting.yearMinus"
                  :from="datepickerSetting.from"
                  :to="datepickerSetting.to"
                  :disabled-date="datepickerSetting.disabledDate"
                  :locale="datepickerSetting.locale"
                  @value-changed="datepickerSetting.changeEvent"
                  classAttr="form-control"
                  placeholderAttr="Datum auswählen"
              />
            </div>
          </div>
          <div class="col">
            <datepicker-lite
                :value-attr="datepickerSetting2.value"
                :year-minus="datepickerSetting2.yearMinus"
                :from="datepickerSetting2.from"
                :to="datepickerSetting2.to"
                :disabled-date="datepickerSetting2.disabledDate"
                :locale="datepickerSetting2.locale"
                @value-changed="datepickerSetting2.changeEvent"
                classAttr="form-control"
                placeholderAttr="Datum auswählen"
            />
          </div>
          <div class="col">
            <button class="btn btn-primary" type="submit" @click="searchCar">Autosuche</button>
          </div>
        </div>
      </form>

      <div v-on:click="seen = !seen">
        <button class="btn btn-secondary">Erweiterte Suche</button>
        <br/>
        <div>
          <h2></h2>
        </div>
      </div>
      <div v-if="seen">
        <form>
          <div class="form-row  form-group">
            <div class="col">
              <input
                  type="text"
                  placeholder="Höchstpreis (€)"
                  v-model="preis_max"
                  class="form-control"
              />
            </div>
            <div class="col">
              <input
                  type="text"
                  placeholder="Anzahl Sitze"
                  v-model="platz"
                  class="form-control"
              />
            </div>
            <div class="col">
              <input
                  type="text"
                  placeholder="Leistung (PS)"
                  v-model="leistung"
                  class="form-control"
              />
            </div>
          </div>
          <div class="form-row  form-group">
            <div class="col">
              <select v-model="typ" class="form-control">
                <option value="" disabled selected>Autotyp (z.B. Kleinwagen)</option>
                <option value="">Alle</option>
                <option v-for="(typ, index) in autotypen" :key="index" :value="typ">
                  {{ typ }}
                </option>
              </select>
            </div>
            <div class="col">
              <select v-model="kraftstoff" class="form-control">
                <option value="" disabled selected>Kraftstoff</option>
                <option value="">Alle</option>
                <option
                    v-for="(kraftstoff, index) in kraftstofftypen"
                    :key="index"
                    :value="kraftstoff"
                >
                  {{ kraftstoff }}
                </option>
              </select>
            </div>
            <div class="col">
              <select v-model="getriebe" class="form-control">
                <option value="" disabled selected>Getriebeart</option>
                <option value="">Alle</option>
                <option
                    v-for="(getriebe, index) in getriebetypen"
                    :key="index"
                    :value="getriebe"
                >
                  {{ getriebe }}
                </option>
              </select>
            </div>
            <div class="col">
              <select v-model="tuer" class="form-control">
                <option value="" disabled selected>Anzahl Türen</option>
                <option value="">Alle</option>
                <option
                    v-for="(value, index) in doorsNumber"
                    :key="index"
                    :value="value"
                >
                  {{ value }}
                </option>
              </select>
            </div>
          </div>
        </form>
      </div>
      <h2>Suchergebnisse</h2>
      <hr>

      <div v-for="auto in gesuchteAutos" :key="auto.name" class="auto form-group table-responsive">
        <h3>{{ auto.name }}</h3>
        <table class="table">
          <tr>
            <!-- <td>{{auto.name}}</td> -->

            <td>Typ:</td>
            <td>{{ auto.typ }}</td>
            <td>Verbrauch:</td>
            <td>{{ auto.verbrauch }} <span class="verbrauch">L/100 km</span></td>
            <td class="text-center">
              <button
                  type="submit"
                  @click="mieten(auto.name)"
                  :disabled="!verfuegbarkeit(auto.verfuegbar)"
                  class="btn btn-secondary"
              >
                Mieten
              </button>
            </td>
          </tr>
          <tr>
            <td>Sitzplätze:</td>
            <td>{{ auto.sitzplaetze }}</td>
            <td>Türen:</td>
            <td>{{ auto.tueren }}</td>
            <td rowspan="2" class="va-middle">
              <div class="img-preview" v-if="auto.image">
                <img v-bind:src="`${getImageUrl(auto.image)}`" v-bind:alt="`${auto.image.originalname}`">
              </div>
            </td>
          </tr>

          <tr>
            <td>Kraftstoff:</td>
            <td>{{ auto.kraftstoff }}</td>

            <td>Leistung:</td>
            <td>{{ auto.leistung }} PS</td>
          </tr>

          <tr>
            <td>Getriebe:</td>
            <td>{{ auto.getriebe }}</td>
            <td>Preis:</td>
            <td>{{ auto.preis }} &euro;</td>
            <td>Modell:</td>
            <td>{{ auto.modelbezeichnung }}</td>
          </tr>
        </table>
      </div>
    </main>
    <div v-else class="search-result">

      <div class="description">
        <h2 class="text-center">Auto: {{ gewaehltesauto.name }}</h2>
        <div class="row">
          <div class="col text-center">
            <div class="img-preview" v-if="gewaehltesauto.image">
              <img v-bind:src="`${getImageUrl(gewaehltesauto.image)}`"
                   v-bind:alt="`${gewaehltesauto.image.originalname}`">
            </div>
          </div>
          <div class="col">
            <p>Preis/Tag: {{ gewaehltesauto.preis }}  &euro;</p>
            <p v-if="gewaehltesauto.verbrauch">Verbrauch: {{ gewaehltesauto.verbrauch }} <span class="verbrauch">L/100 km</span></p>
            <p v-if="gewaehltesauto.sitzplaetze">Sitzplätze: {{ gewaehltesauto.sitzplaetze }}</p>
            <p v-if="gewaehltesauto.kraftstoff">Kraftstoff: {{ gewaehltesauto.kraftstoff }}</p>
            <p v-if="gewaehltesauto.getriebe">Getriebe: {{ gewaehltesauto.getriebe }}</p>
          </div>
        </div>
      </div>
      <div class="actions">
      <button type="cancel" class="btn btn-secondary" @click="back">Zur Fahrzeugsuche</button>
      <button
          class="btn btn-primary"
          type="submit"
          @click="buchen()"
          :disabled="!verfuegbarkeit(gewaehltesauto.verfuegbar)"
      >
        Jetzt {{ gewaehltesauto.name }} verbindlich mieten
      </button>
      </div>
    </div>
  </div>
</template>

<script>
import DatepickerLite from "./DatepickerLite.vue";
import UserService from "../services/user.service";
import Helper from "../services/helper.service";
import fileService from "@/services/file.service";
import carService from "@/services/car.service";

export default ({
  name: "App",
  components: {
    DatepickerLite
  },
  data() {
    return {
      doorsNumber: [],
      //startdatum
       datepickerSetting : {
        value:"",
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
          if (date2.getTime() <= date.getTime()) {
            this.start = ''
            alert('Ungültiges Startdatum')
          } else {
            this.start = value
          }
        }
      },
      //enddatum
      datepickerSetting2 : {
        value:"",
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
          if (date2.getTime() <= date.getTime()) {
            this.ende = ''
            alert('Ungültiges Datum. Es wird bei der Suche ignoriert')
          } else {
            this.ende = value
          }
        }
      },
      msg: "Alle Autos",
      start: '',
      ende: '',
      preis_min: "",
      preis_max: "",
      autoname: "",
      platz: "",
      tuer: "",
      typ: "",
      c02: "",
      verbrauch: "",
      kraftstoff: "",
      tankvolumen: "",
      leistung: "",
      getriebe: "",
      gewaehltesauto: "",
      autos: [],
      zeiten: [],
      gesuchteAutos: [],
      kratstofftypen: [],
      autotypen: [],
      getriebetypen: [],
      seen: false,
      ausgewaehlt: false,
    };
  },
  methods: {
    getImageUrl(image) {
      return fileService.getImageUrl(image)
    },
    ladeAutos() {
      if (this.autos.length < 1) {
        UserService.getCar("alle")
            .then((response) => {
              this.autos.push.apply(this.autos, response.data.cars)
              this.zeiten.push.apply(this.zeiten, response.data.times)
              this.gesuchteAutos = this.autos;
            })
            .catch((error) => Helper.handle(error));
      }
    },
    searchCar(e) {
      e.preventDefault();
      this.ladeAutos();
      let startdatum = new Date(this.start)
      let enddatum = new Date(this.ende)
      if (startdatum.getTime() > enddatum.getTime()) {
        alert('Enddatum darf nicht hinter Startdatum liegen.\nDer Zeitraum wird bei der Suche ignoriert')
        return;
      }
      this.gesuchteAutos = this.autos.filter((auto) => {
        let max = false;
        let tuer = false;
        let platz = false;
        let verbrauch = false;
        if (this.preis_max == "") {
          max = true;
        } else max = auto.preis <= this.preis_max;
        if (this.tuer == "") {
          tuer = true;
        } else tuer = auto.tueren == this.tuer;
        if (this.platz == "") {
          platz = true;
        } else platz = auto.sitzplaetze == this.platz;
        if (this.verbrauch == "") {
          verbrauch = true;
        } else {
          verbrauch = auto.verbrauch <= this.verbrauch;
        }
        let zeit = this.zeitFilter(auto)
        return (
            this.autoname
                .toLowerCase()
                .split(" ")
                .every((v) => auto.name.toLowerCase().includes(v)) &&
            tuer &&
            platz &&
            auto.typ.toLowerCase().match(this.typ.toLowerCase()) &&
            verbrauch &&
            auto.kraftstoff.toLowerCase().match(this.kraftstoff.toLowerCase()) &&
            auto.leistung >= this.leistung &&
            auto.preis >= this.preis_min &&
            max &&
            auto.getriebe.toLowerCase().match(this.getriebe.toLowerCase())
            && zeit
        );
      });
      if (this.autoname == "") {
        this.msg = "Alle Autos";
      } else {
        this.msg = this.autoname;
      }
    },

    //Filter, um Autos zu finden, deren Buchungsdaten sich mit dem gesuchten Zeitraum überschneiden
    zeitFilter(auto) {
      let index = 0
      let gefunden = false
      let i = 0
      let buchung = ''
      let startdatum = new Date(this.start)
      let enddatum = new Date(this.ende)
      if ((this.start == '' && this.ende == '') || (startdatum.getTime() > enddatum.getTime())) {
        return true
      }
      for (; i < this.zeiten.length; i++) {
        if (this.zeiten[i].auto == auto.name) {
          index = i
          gefunden = true
          break
        }
      }
      if (!gefunden) {

        return true
      }
      for (buchung of this.zeiten[index].times) {
        let von = new Date(buchung.from)
        let bis = new Date(buchung.to)
        if (this.start == '') {
          if ((enddatum.getTime() >= von.getTime()) || (enddatum.getTime() >= bis.getTime())) {
            return false
          }
        } else if (this.ende == '') {
          if ((startdatum.getTime() <= von.getTime()) || (startdatum.getTime() <= bis.getTime())) {
            return false
          }
        } else {
          if (((startdatum.getTime() <= von.getTime()) && (enddatum.getTime() >= von.getTime())
              || ((startdatum.getTime() <= bis.getTime()) && (enddatum.getTime() >= bis.getTime()))
              || ((startdatum.getTime() >= von.getTime()) && (enddatum.getTime() <= bis.getTime())))) {
            return false
          }
        }
      }
      return true
    },
    mieten(autoname) {
      this.ausgewaehlt = true;
      this.gewaehltesauto = this.autos.find(
          (element) => element.name == autoname
      );
      this.$router.push("/search/" + autoname);
    },
    verfuegbarkeit(vorhanden) {
      if (vorhanden == 1) {
        return true;
      } else {
        return false;
      }
    },


    buchen() {
      sessionStorage.setItem('start', this.start)
      sessionStorage.setItem('ende', this.ende)
      this.$router.push("/rent/" + this.gewaehltesauto.name);
      //request an backend, um buchung abzuschließen
      //dazu in db eine bestellung erstellt werden
      //employee kann es dann abrufen in account

    },
    back() {
      this.ausgewaehlt = false;
      this.ladeAutos();
      this.$router.push("/search");
    },
    setDoorsNumberList(){
      carService.getDoorNumbers().then(r => this.doorsNumber = r.data);
    },
    setTypeList(){
      carService.getTypes().then(r => this.autotypen = r.data);
    }
  },

  beforeMount() {
    let to = new Date();
    let from = new Date();
    from.setDate(from.getDate() + 1) // kann nicht am selben Tag buchen
    to.setDate(to.getDate() + 90) //max. 3 Monate in Zukunft buchen
    //Zeiträume für Start-und Endkalender festlegen
    this.datepickerSetting.value = Helper.formatDate(from)
    this.datepickerSetting.from = Helper.formatDate(from)
    this.datepickerSetting.to = Helper.formatDate(to)
    this.datepickerSetting2.from = Helper.formatDate(from)
    this.datepickerSetting2.to = Helper.formatDate(to)
    this.start = this.datepickerSetting.value
    this.kraftstofftypen = ["Benzin", "Diesel"];
    this.autotypen = ["SUV", "Kleinwagen", "Van", "Coupe"];
    this.getriebetypen = ["Automatik", "Schalter"];
    if (this.$route.params.autoname != "") {
      this.ausgewaehlt = true;
      UserService.getCar(this.$route.params.autoname)
          .then((response) => {
            this.gewaehltesauto = response.data.car;
          })
          .catch((error) => {
            Helper.handle(error);
            this.ausgewaehlt = false;
            this.msg = "";
            Helper.redirect("/search");
          });
    } else {
      this.ausgewaehlt = false;
      this.ladeAutos();
    }
  },
  mounted() {
    this.setDoorsNumberList();
    this.setTypeList();
  }
})
</script>


<style lang="scss" scoped>
.search {
  width: 100%;
  .auto{
    padding: 15px;
    border-radius: 15px;
  }
  .auto:nth-child(even){
    background: #eee;
  }

  .auto:hover{
    background: #ccc;
  }
}
.search-result{
  .description{
    p {
      font-size: 1.3em;
    }
    .verbrauch{
      font-size: 0.7em;
    }
    h2 {
      font-size: 2em;
    }
  }
  .actions{
    display: flex;
    justify-content: space-between;
  }
}
.verbrauch{
  font-size: 0.8em;
}

</style>