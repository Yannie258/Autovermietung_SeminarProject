//Hilfsfunktionen
import router from '../router'
class Helper {
  //Pfad wechseln
  redirect (route) {
    router.push(route)
  }
  //Error handling vom backend
  handle (error) {
    if (error.response.data) {
      if (typeof error.response.data == 'string') {
        return alert(error.response.data)
      }
    }
    return alert('We could not handle your request')
  }
  
  formatDate(d){
    let month = '' + (d.getMonth() + 1)
    let day = '' + d.getDate()
    if (month.length < 2) 
    month = '0' + month;
    if (day.length < 2) 
    day = '0' + day;
    return d.getFullYear() + "/" + month + "/" + day
  }
}

export default new Helper()
