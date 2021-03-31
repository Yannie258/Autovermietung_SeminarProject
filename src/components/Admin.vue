<template>
  <div class="administrator container">
  <br><br/>
    <h1>{{adminmessage}}</h1>
    <hr>

    <!-- Wenn Admin, dann werden hier zusätzliche Adminelemente geladen  -->


    <!-- Anzeigen der Adminfunktionen -->
    <div class="form-group">
      <p class="text-center">{{message3}}</p>
      <br><br/>
      <div class="actions form-group">
        <button class="btn-primary btn" v-on:click="showOrders()" v-if="admin || employee">
          Bestellungen verwalten
        </button>

        <button class="btn btn-primary" type="submit" @click="showEmployees" v-if="admin">
          Mitarbeiterübersicht
        </button>

        <button class="btn btn-primary" type="submit" @click="showCustomers" v-if="admin || employee">
          Kundenübersicht
        </button>
        <button class="btn btn-primary" type="submit" @click="showCars" v-if="admin || employee">
          Autoübersicht
        </button>
      </div>
      <div>
        <!-- Anzeigen aller Mitarbeiter + Auswählen zum Bearbeiten -->
        <div v-if="editOrders">
        <br><br/>
        <br><br/>
          <div class="row">
            <BestellungenMa/>
          </div>
        </div>
        <div v-if="editEmployee" class="table-responsive">
        <br><br/>
        <br><br/>
          <div class="form-group">
            <button class="btn btn-success" @click="createEmployee()">Neuen Mitarbeiter anlegen</button>
          </div>
          <table class="table">
            <thead>
            <tr>
              <th>Vorname</th>
              <th>Name</th>
              <th>Benutzername</th>
              <th>Daten bearbeiten</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(employee, index) in employees" :key="index">
              <td>{{ employee.vorname }}</td>
              <td>{{ employee.nachname }}</td>
              <td>{{ employee.user }}</td>
              <td>
                <button class="btn btn-primary" @click="editingEmployee(employee.id)">Daten bearbeiten</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-if="editUser" class="table-responsive">
        <br><br/>
        <br><br/>
          <table class="table">
            <thead>
            <tr>
              <th>Vorname</th>
              <th>Name</th>
              <th>Benutzername</th>
              <th>Daten bearbeiten</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(customer, index) in customers" :key="index">
              <td>{{ customer.vorname }}</td>
              <td>{{ customer.nachname }}</td>
              <td>{{ customer.user }}</td>
              <td>
                <button class="btn btn-primary" @click="editingCustomer(customer.id)">Daten bearbeiten</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="table-responsive" v-if="editCar">
        <br><br/>
        <br><br/>
          <div class="form-group">
            <button class="btn btn-success" @click="createCar()" v-if="admin">Neues Auto erstellen</button>
          </div>
          <table class="table">
            <thead>
            <tr>
              <th>Name</th>
              <th>Photo</th>
              <th>Bearbeiten</th>
              <th>Schäden</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(car, index) in cars" :key="index">
              <td>{{ car.name }}</td>
              <td>
                <div class="img-preview" v-if="car.image">
                  <img v-bind:src="`${getImageUrl(car.image)}`" v-bind:alt="`${car.image.originalname}`">
                </div>
              </td>
              <td>
                <button class="btn btn-primary" @click="editingCar(car.name)" v-if="admin">Bearbeiten</button>
              </td>
              <td>
                <button class="btn btn-primary" @click="showDamage(car.name)">Schäden</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//Komponente für Mitarbeiter/Admin
import UserService from '../services/user.service'
import Helper from '../services/helper.service'
import fileService from "@/services/file.service";
import BestellungenMa from '../components/BestellungenMa.vue'

export default {
  components:{BestellungenMa},
  data() {
    return {
      vorname: '',
      name: '',
      username: '',
      password: '',
      password_confirmation: '',
      msg: 'HEYRJP GmbH',
      created: '',
      content: '',
      admin: false, //speichern, ob Mitarbeiter Admin ist
      employee: false,
      seen: true,
      editEmployee: false,
      editCar: false,
      employees: [], //Alle Mitarbeiter
      cars: [],
      customers: [],
      getriebe: '',
      editUser: false,
      adminmessage: '',
      message: '',
      message2: '',
      message3: '',
      editOrders: false,
    }
  },
  methods: {
    getImageUrl(image) {
      return fileService.getImageUrl(image)
    },
    // zu schadenansicht des autos wechseln
    showDamage(auto){
      this.$router.push('/admin/' + auto + "/schaden")
    },
    //laden aller Mitarbeiter aus Backend

    showEmployees() {
      this.editEmployee = !this.editEmployee
      this.editCar = false;
      this.editUser = false;
      this.editOrders = false;
      if (this.editEmployee) {
        UserService.getEmployee(-200)
            .then(response => {
              this.employees = []
              this.employees.push.apply(this.employees, response.data.employees)
            })
            .catch((error) => Helper.handle(error))
      } else {
        this.employees = []
      }
    },
    showCustomers() {
      this.editUser = !this.editUser
      this.editCar = false;
      this.editEmployee = false;
      this.editOrders = false;
      if (this.editUser) {
        UserService.getCustomers()
            .then(response => {
              this.customers = []
              this.customers.push.apply(this.customers, response.data.customers)
            })
            .catch((error) => Helper.handle(error))
      } else {
        this.customers = []
      }
    },
    showCars() {
      this.editCar = !this.editCar
      this.editEmployee = false;
      this.editUser = false;
      this.editOrders = false;
      if (this.editCar) {
        UserService.getCar('alle')
            .then(response => {
              this.cars = []
              this.cars.push.apply(this.cars, response.data.cars)
            })
            .catch((error) => Helper.handle(error))
      } else {
        this.cars = []
      }
    },
    showOrders(){
      this.editOrders = !this.editOrders;
      this.editCar = false;
      this.editEmployee = false;
      this.editUser = false;
    },
    //Pfad auf detaillierte Mitarbeiteranzeige erneuern
    createEmployee() {
      this.$router.push('/admin/newEmployee')
    },
    //Pfad auf detaillierte Mitarbeiteranzeige ändern
    editingEmployee(id) {
      this.$router.push('/admin/editEmployee/' + id)
    },
    editingCustomer(id) {
      this.$router.push('/admin/editCustomer/' + id)
    },
    createCar() {
      this.$router.push('/admin/newCar')
    },
    editingCar(name) {
      this.$router.push('/admin/editCar/' + name)
    },
    redirect(route) {
      Helper.redirect(route)
    }
  },
  beforeMount() {
    let role = sessionStorage.getItem('role')
    if (role == 1) {
      this.adminmessage = "Sie sind als Mitarbeiter angemeldet"
      this.message = "Mitarbeiter-Funktionen"
      this.message2 = "In diesem Bereich können Sie auf erweiterte Mitarbeiter Funktionen zugreifen"
      this.message3 = "In diesem Bereich können Bestellungen, Kundendaten sowie Autoschäden verwaltet und bearbeitet werden."
      this.admin = false
      this.employee = true;
    } else if (role == 2) {
      this.admin = true;
      this.employee = false;
      this.adminmessage = "Sie sind als Administrator angemeldet"
      this.message = "Admin-Funktionen"
      this.message2 = "In diesem Bereich können Sie auf erweiterte Administrator Funktionen zugreifen"
      this.message3 = "In diesem Bereich können Mitarbeiter- Kunden- sowie Autodaten verwaltet und bearbeitet werden."
    }

  },
  mounted() {
    const tab = this.$route.params.tab;
    if(tab){
      switch (tab){
        case 'cars': {
          this.seen = true;
          this.showCars();
          break;
        }
        case 'employees': {
          this.seen = true;
          this.showEmployees();
          break;
        }
        case 'customers': {
          this.seen = true;
          this.showCustomers();
          break;
        }
        case 'orders': {
          this.seen = true;
          this.showOrders();
          break;
        }
      }
    }
  }
}
</script>
<style scoped>

</style>
