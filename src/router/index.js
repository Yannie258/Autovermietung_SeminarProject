/*Ist verantwortlich für das Wechseln zw. den Pfaden
und das Laden der spezifischen Komponente
-----------------------------------------------------------------------------------
Meta Tags müssen zu jeder neuen Komponente hinzugefügt werden,
in der die Zugriffsrechte spezifiziert werden

guest: wenn person auf loginseite geht, wird damit geschaut, ob Person
       bereits angemeldet ist (Cookie vorhanden) --> wenn vorhanden, dann zu Account weitergeleitet
requiresAuth: nur Zugriff nach vorheriger Authentifizierung gegenüber Backend
is_user: Seiten, auf die nur Kunde Zugriff hat
is_employye: Seiten, auf die nur Mitarbeiter/Admin Zugriff hat
is_admin: Seiten, auf die nur Admin Zugriff hat
------------------------------------------------------------------------------------
Pfadspezifische Dinge:
':' --> Paramter, die Route übergeben werden können
'?' --> Optionale Parameter
*/

import { createWebHistory, createRouter } from "vue-router"
import Home from '../components/Home.vue'
import About from '../components/About.vue'
import Login_Register from '../components/Login_Register.vue'
import Reset from '../components/Reset.vue'
import Search from '../components/Search.vue'
import UserBoard from '@/components/UserBoard.vue'
import Admin from '@/components/Admin.vue'
import EmployeeEdit from '@/components/EmployeeEdit.vue'
import CreateNewEmployee from '@/components/CreateNewEmployee.vue'
import UserService from '../services/user.service'
import Rent from '../components/Rent.vue'
import BestellungenMa from '../components/BestellungenMa.vue'
import BestellungenKu from '../components/BestellungenKu.vue'
import CarDamage from '../components/CarDamage.vue'
import CreateNewCar from "@/components/CreateNewCar";
import CarEdit from "@/components/CarEdit";
import CustomerEdit from "@/components/CustomerEdit";

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    //component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    component: About
  },
  {
    path: '/search/:autoname?',
    name: 'Search',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    //component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    component: Search
  },
  {
    path: '/rent/:autoname',
    name: 'Rent',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    //component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    component: Rent,
    meta: {
      requiresAuth: true,
      is_user: true
    }
  },
  {
    path: '/reset/:id?/:token?',
    name: 'Reset',
    component: Reset
  },
  {
    path: '/login/:redirect?',
      name: 'login',
      component: Login_Register,
      meta: {
        guest: true //
      }
  },
  {
    path: '/dashboard',
    name: 'userboard',
    component: UserBoard,
    meta: {
      requiresAuth: true,
      is_user: true
    }
  },
  {
    //Ohne Parameter bnr --> Alle Bestellungen angezeigt
    //Mit Parameter --> Nur Bestellung mit spezifischer bnr
    path: '/dashboard/bestellungen/:bnr?',
    name: 'bestellungenKunde',
    component: BestellungenKu,
    meta: {
      requiresAuth: true,
      is_user: true
    }
  },
  {
    path: '/admin',
    name: 'admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      is_employee: true
    }
  },
  {
    path: '/admin/newEmployee',
    name: 'newEmployee',
    component: CreateNewEmployee,
    meta: {
      requiresAuth: true,
      is_admin: true
    }
  },
  {
    path: '/admin/editEmployee/:id',
    name: 'editEmployee',
    component: EmployeeEdit,
    meta: {
      requiresAuth: true,
      is_admin: true
    }
  },
  {
    path: '/admin/editCustomer/:id',
    name: 'editCustomer',
    component: CustomerEdit,
    meta: {
      requiresAuth: true,
      is_employee: true
    }
  },
  {
    path: '/admin/newCar',
    name: 'newCar',
    component: CreateNewCar,
    meta: {
      requiresAuth: true,
      is_admin: true
    }
  },
  {
    path: '/admin/editCar/:name',
    name: 'editCar',
    component: CarEdit,
    meta: {
      requiresAuth: true,
      is_admin: true
    }
  },
  {

    // uebersicht schaeden auto
    path: '/admin/:autoname/schaden/:bnr?',
    name: 'carDamage',
    component: CarDamage,
    meta: {
      requiresAuth: true,
      is_employee: true
    }
  },
  {
    //Ohne Parameter bnr --> Alle Bestellungen angezeigt
    //Mit Parameter --> Nur Bestellung mit spezifischer bnr
    path: '/admin/bestellungen/:bnr?',
    name: 'bestellungenMitarbeiter',
    component: BestellungenMa,
    meta: {
      requiresAuth: true,
      is_employee: true
    }
  },

  {
    //Ohne Parameter bnr --> Alle Bestellungen angezeigt
    //Mit Parameter --> Nur Bestellung mit spezifischer bnr
    path: '/admin/:tab',
    name: 'adminTab',
    component: Admin,
    meta: {
      requiresAuth: true,
      is_employee: true
    }
  },

   {
      path: "/:catchAll(.*)", //alle ungülitgen Routen führen zu Homepage
      component: Home
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

//wird vor jedem Routenwechsel ausgeführt
//Test der Meta-Tags, um Authentifizerungsstufe der angefrageten Ressource zu ermitteln
//Danach, wenn nötig, Authentifizierung gegenüber Backend und Weiterleiten je nach Ergebnis
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    UserService.getAuthentication().then(
      response => {
        sessionStorage.setItem('role', JSON.stringify(response.data.role))
        sessionStorage.setItem('auth', response.data.auth)

        if (JSON.stringify(response.data.auth) !== 'true') {
          let val = to.fullPath.replace(/\//g, "_").substring(1)
          next({
            path: '/login/' + val
          })
        } else {
          let role = response.data.role
          if (to.matched.some(record => record.meta.is_employee)) {
            if (role >= 1) {
              next()
            } else if (role == 0) {
              next({name: 'userboard'})
            } else {
              next({name: 'login'})
            }
          } else if (to.matched.some(record => record.meta.is_admin)) {
            if (role == 2) {
              next()
            } else if (role == 1) {
              next({name: 'admin'})
            } else if (role == 0) {
              next({name: 'userboard'})
            } else {
              next({name: 'login'})
            }
          } else if (to.matched.some(record => record.meta.is_user)) {
            if (role == 0) {
              next()
            } else if (role >= 1) {
              next({name: 'admin'})
            } else {
              next({name: 'login'})
            }
          }
        }
      },
      error => {
        let content =
            (error.response && error.response.data) ||
            error.message ||
            error.toString()
        alert(content)
        sessionStorage.removeItem('role')
        sessionStorage.removeItem('auth')
        let val = to.fullPath.replace(/\//g, "_").substring(1)
        next({
          path: '/login/' + val
        })
      }
    )
  } else if (to.matched.some(record => record.meta.guest)) {
    UserService.getAuthentication().then(
      response => {
        if (response.data.role != null && response.data.auth != null) {
          sessionStorage.setItem('role', JSON.stringify(response.data.role))
          sessionStorage.setItem('auth', response.data.auth)

          if (JSON.stringify(response.data.auth) !== 'true') {
            next()
          } else {
            let role = response.data.role

            if (role == 0) {
              next({name: 'userboard'})
            } else if (role >= 1) {
              next({name: 'admin'})
            } else {
              next()
            }
          }
        } else {
          next()
        }
      },
       error => {
        if(error) 
        sessionStorage.removeItem('role')
        sessionStorage.removeItem('auth')
        next()
      })
  } else {
    next()
  }
})

export default router


