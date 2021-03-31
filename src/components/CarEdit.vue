<template>
  <div class="container">
    <h1>Fahrzeugdaten bearbeiten</h1>
    <hr>
    <form @submit.prevent="handleSubmit" v-if="car">
      <div class="form-group">
        <h2>{{car.name}}</h2>
      </div>
      <div class="form-group" v-if="car.image">
        <div class="image-preview">
          <img v-bind:src="`${getImageUrl()}`" v-bind:alt="`${car.image.originalname}`">
        </div>
      </div>
      <div class="form-group actions">
        <button v-if="car.image" class="btn btn-danger" @click="imageRemove">Bild entfernen</button>
        <vue-core-image-upload
            :class="['btn', 'btn-primary']"
            :crop="false"
            @imageuploaded="imageuploaded"
            :data="data"
            :max-file-size="5242880"
            v-bind:url="`${apiUrl}/upload-image`"
            text="Bild hochladen">
        </vue-core-image-upload>
      </div>

      <div class="form-group">
        <label for="price">Preis*:</label>
        <input @keypress="this.created = '';" class="form-control" id="price" type="number" v-model="car.preis"
               required/>
      </div>

      <div class="form-group">
        <label for="sitzplaetze">Sitzplaetze*:</label>
        <input @keypress="this.created = '';" class="form-control" id="sitzplaetze" type="number"
               v-model="car.sitzplaetze"/>
      </div>
      <div class="form-group">
        <label for="tueren">Tueren*:</label>
        <input @keypress="this.created = '';" class="form-control" id="tueren" type="number" v-model="car.tueren" max="10"/>
      </div>
      <div class="form-group">
        <label for="typ">Typ*:</label>
        <input @keypress="this.created = '';" class="form-control" id="typ" type="text" v-model="car.typ"/>
      </div>

      <div class="form-group">
        <label for="verbrauch">Verbrauch*:</label>
        <input @keypress="this.created = '';" class="form-control" id="verbrauch" type="number"
               v-model="car.verbrauch" step="0.1"/>
      </div>
      <div class="form-group">
        <label for="kraftstoff">Kraftstoff*:</label>
        <input @keypress="this.created = '';" class="form-control" id="kraftstoff" type="text"
               v-model="car.kraftstoff"/>
      </div>

      <div class="form-group">
        <label for="leistung">Leistung*:</label>
        <input @keypress="this.created = '';" class="form-control" id="leistung" type="number" v-model="car.leistung"/>
      </div>
      <div class="form-group form-check">
        <input @keypress="this.created = '';" class="form-check-input" id="verfuegbar" type="checkbox"
               v-model="car.verfuegbar" value="1"/>
        <label for="verfuegbar" class="form-check-label">Verfuegbar</label>
      </div>
      <div class="form-group">
        <label for="getriebe">Getriebe*:</label>
        <input @keypress="this.created = '';" class="form-control" id="getriebe" type="text" v-model="car.getriebe"/>
      </div>

      <div class="form-group actions">
        <button class="btn btn-secondary" type="button" @click="back">
          Zurück
        </button>
        <button class="btn btn-danger" type="button" @click="remove">
          Auto löschen
        </button>
        <button type="submit" class="btn btn-primary">
          Daten Speichern
        </button>
      </div>
    </form>
    <div v-if="created">
      <h3 class="text-center">{{ created }}</h3>
      <div v-if="!car" class="form-group actions">
        <button class="btn btn-secondary" type="button" @click="back">
          Zurück
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import carService from "../services/car.service";
import Helper from "@/services/helper.service";
import VueCoreImageUpload from 'vue-core-image-upload';
import fileService from '../services/file.service';
import UserService from "@/services/user.service";

export default {
  components: {
    'vue-core-image-upload': VueCoreImageUpload
  },
  data() {
    return {
      apiUrl: process.env.VUE_APP_API_SERVER_URL || 'http://localhost:3000',
      car: {
        name: '',
        image: null,
        sitzplaetze: null,
        tueren: null,
        typ: null,
        verbrauch: null,
        kraftstoff: null,
        leistung: null,
        preis: null,
        verfuegbar: true,
        getriebe: null,
      },
      created: '',
    }
  },
  methods: {
    getImageUrl() {
      return fileService.getImageUrl(this.car.image)
    },
    imageuploaded(res) {
      this.created = '';
      this.car.image = res;
    },
    imageRemove() {
      if (this.car.image && this.car.image.path) {
        fileService.removeFile(this.car.image.path);
      }
      this.car.image = null;
    },
    back() {
      this.$router.push('/admin/cars')
    },
    handleSubmit(e) {
      e.preventDefault()
      if (this.car.name.length < 2 && this.car.name.length > 100) {
        return alert('Name too long or short');
      }
      carService.saveCar(this.car)
          .then(() => {
            this.created = 'Car successfully saved';
          })
          .catch((error) => Helper.handle(error))
    },
    remove(e) {
      e.preventDefault()
      if (confirm('Are you sure?')) {
        carService.removeCar(this.car)
            .then(() => {
              this.created = 'Car successfully deleted';
              this.car = null;
            })
            .catch((error) => Helper.handle(error))
      }
    }
  },
  beforeMount() {
    if (this.$route.params.name == null) {
      Helper.redirect('/admin');
    }
  },
  mounted() {
    console.error('123');
    UserService.getCar(this.$route.params.name)
        .then(response => {
          if(!response.data.car){
            Helper.redirect('/admin');
          }
          this.car = {...response.data.car, verfuegbar: response.data.car.verfuegbar == 1};
        })
        .catch((error) => {
          Helper.handle(error)
          Helper.redirect('/admin')
        })
  }
}
</script>

<style lang="scss">
.image-preview {
  width: 200px;

  img {
    max-width: 100%;
  }
}
</style>