//Hier erfolgt Bearbeitung DB mit SQL-Anfragen
//und genereller Zugriff auf diese
'use strict'
const sqlite3 = require('sqlite3').verbose()

class Db {
  constructor (file) {
    this.db = new sqlite3.Database(file)
  }

  //Neuen Datensatz in User-Tabelle einfügen
  insert (user, callback) {
    return this.db.run(
      'INSERT INTO user (nachname, vorname, user, pass, adresse, telefon, rolle, aktiviert) VALUES (?,?,?,?,?,?,?,?)',
      user, (err) => {
        callback(err)
      })
  }

  
  //Token + Ablaufzeit zum Zurücksetzen PW für Kunden setzen
  updateReset (reset, callback) {
    return this.db.run(
      'UPDATE user SET resetToken = ?, ablaufdatum = ? WHERE id = ?',
      reset, (err) => {
        callback(err)
      })
  }

   //Kundenaccount verifizieren
   verifyUser (id, callback) {
    return this.db.run(
      'UPDATE user SET aktiviert = 1 WHERE id = ?',
      [id], (err) => {
        callback(err)
      })
  }

  //Person-Datensatz mit spezischem Username/Email aus DB holen
  selectByEmail (email, callback) {
    return this.db.get(
      `SELECT * FROM user WHERE user = ?`,
      [email], function (err, row) {
        callback(err, row)
      })
  }

  //Person-Datensatz mit spezischer ID aus DB holen
  selectById (id, callback) {
    return this.db.get(
      `SELECT * FROM user WHERE id = ?`,
      [id], function (err, row) {
        callback(err, row)
      })
  }

  
  //alle Mitarbeiter holen
  getAllEmployees (callback) {
    let users = []
    return this.db.all(
      `SELECT id, vorname, nachname, user FROM user WHERE rolle = ?`,
      ['1'], function (err, rows) {
        rows.forEach(function (row) {
          users.push(row)
        })
        callback(err, users)
      })
  }
    getAllCustomers (callback) {
        let users = []
        return this.db.all(
            `SELECT id, vorname, nachname, user FROM user WHERE rolle = ?`,
            ['0'], function (err, rows) {
                rows.forEach(function (row) {
                    users.push(row)
                })
                callback(err, users)
            })
    }

  //Auto-Datensatz mit spezischem Namen aus DB holen
  getCar (name, callback) {
    return this.db.get(
      `SELECT * FROM auto WHERE name = ?`,
      [name], function (err, row) {
          if(row && row.image){
              row.image = JSON.parse(row.image);
          }
        callback(err, row)
      })
  }

    removeCar (car, callback) {
        return this.db.get(
            `DELETE
             FROM auto
             WHERE name = ?`,
            [car.name], function (err, row) {
                callback(err, row)
            });
    }

    saveCar(car, callback) {
        return this.db.get(
            `UPDATE auto
             set name = ?,
                 sitzplaetze = ?,
                 tueren = ?,
                 typ = ?,
                 co2 = 100,
                 verbrauch = ?,
                 kraftstoff = ?,
                 tankvolumen = 50,
                 leistung = ?,
                 preis = ?,
                 verfuegbar = ?,
                 getriebe = ?,
                 image = ?
             where name = ?`,
            [
                car.name, car.sitzplaetze, car.tueren, car.typ, car.verbrauch, car.kraftstoff, car.leistung, car.preis, car.verfuegbar, car.getriebe, JSON.stringify(car.image), car.name,
            ], function (err, row) {
                callback(err, row)
            });
    }

    createCar(car, callback) {
        return this.db.get(
            `INSERT into auto(name, sitzplaetze, tueren, typ, co2, verbrauch, kraftstoff, tankvolumen, leistung, preis,
                              verfuegbar, getriebe, image)
             values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                car.name, car.sitzplaetze, car.tueren, car.typ, 100, car.verbrauch, car.kraftstoff, 50, car.leistung, car.preis, car.verfuegbar, car.getriebe, JSON.stringify(car.image)
            ], function (err, row) {
                callback(err, row)
            })
    }

  //Alle Datensätze aus Auto-Tabelle zurückgeben
  getAllCars (callback) {
    let cars = []
    return this.db.all(
      `SELECT * FROM auto`,
      function (err, rows) {
        rows.forEach(function (row) {
            if(row && row.image){
                row.image = JSON.parse(row.image);
            }
          cars.push(row)
        })
        callback(err, cars)
      })
  }


  //Alle Bestellzeitraeume von einem spezifischen Auto
  getCarTimeframes (autoname, callback) {
    let timeframes = []
    return this.db.all(
      `SELECT startdatum, enddatum FROM bestellung WHERE auto_fk = ? AND status NOT IN (2,3,4)`,
      [autoname], function (err, rows) {
        rows.forEach(function (row) {
          timeframes.push(row)
        })
        callback(err, timeframes)
      })
  }

  //Alle Bestellzeitraeume von allen Autos
  getAllTimeframes (callback) {
    let timeframes = []
    return this.db.all(
      `SELECT auto_fk, startdatum, enddatum FROM bestellung WHERE status NOT IN (2,3,4)`,
      function (err, rows) {
        rows.forEach(function (row) {
          timeframes.push(row)
        })
        callback(err, timeframes)
      })
  }

  //Verfuegbarkeit Auto anpassen
  updateVerfuegbarkeit (auto, status, callback) {
    return this.db.get(
      `UPDATE auto SET verfuegbar = ? WHERE name = ?`,
      [status, auto], function (err, row) {
        callback(err, row)
      })
  }

  updateName (name, id, callback) {
    return this.db.get(
      `UPDATE user SET nachname = ? WHERE id = ?`,
      [name, id], function (err, row) {
        callback(err, row)
      })
  }
  updateVorname (name, id, callback) {
    return this.db.get(
      `UPDATE user SET vorname = ? WHERE id = ?`,
      [name, id], function (err, row) {
        callback(err, row)
      })
  }

    updateAdresse (adresse, id, callback) {
        return this.db.get(
            `UPDATE user SET adresse = ? WHERE id = ?`,
            [adresse, id], function (err, row) {
                callback(err, row)
            })
    }
    updateTelefon(telefon, id, callback) {
        return this.db.get(
            `UPDATE user SET telefon = ? WHERE id = ?`,
            [telefon, id], function (err, row) {
                callback(err, row)
            })
    }

  //Person-Mail/Username ändern
  updateMail (email, id, callback) {
    return this.db.get(
      `UPDATE user SET user = ? WHERE id = ?`,
      [email, id], function (err, row) {
        callback(err, row)
      })
  }

  //Person-Passwort ändern
  updatePass (pass, id, callback) {
    return this.db.get(
      `UPDATE user SET pass = ? WHERE id = ?`,
      [pass, id], function (err, row) {
        callback(err, row)
      })
  }

  //Person-Datensatz komplett aus DB löschen
  deleteAccount (id, callback) {
    return this.db.get(
      `DELETE FROM user WHERE id = ?`,
      [id], function (err, row) {
        callback(err, row)
      })
  }

  //Bestellungen Status
  //0 --> vom Kunden erstellte Bestellung
  //1 --> vom Mitarbeiter akzeptierte (damit aktive) Bestellung
 //2 --> bestellung vom kunden aus abgebrochen --> zahlung ausstehend, d.h. auto wird freigegeben, aber bestellung ist noch nicht abgeschlossen --> wenn auto zurueckgegeben, aber zahlung noch offen
  //3 --> abgebrochene abgeschlossene bestellung kunde z.B. wenn mitarbeiter bestellung abbricht oder kunde
  // falls keine offenen probleme vorhanden sind  (2 wird zu 3, wenn mitarbeiter bestellung begutachtet hat)
  //4 --> erfolgreich abgeschlossene Bestellung (nachdem Kunde Auto zurückgegeben hat)
  //5 --> verspaetete bestellung, wo auto bereits ausgeliehen ist --> wenn auto noch nicht zurueckgegeben, aber zahlung noch offen
  //6 --> auto ausgeliehen u. kunde hat bestellung angetreten 

  //Bestellung Kunde erstellen
  createOrder (order, callback) {
    return this.db.run(
      'INSERT INTO bestellung (user_fk, auto_fk, startdatum, enddatum, status, zeitstempel) VALUES (?,?,?,?,?,?)',
      order, function (err) {
        callback(err, this.lastID)
      })
  }

  //Bestellung Kunde erhalten mit BNR
  getCustomerOrderbyBnr (id, bnr, callback) {
     return this.db.get(
      `SELECT * FROM bestellung WHERE user_fk = ? AND bnr = ?`,
      [id, bnr], function (err, row) {
        callback(err, row)
      })
  }

  //Alle Bestellungen Kunde erhalten, die offen sind
  getOpenCustomerOrders (id, callback) {
    let orders = []
    return this.db.all(
      `SELECT * FROM bestellung WHERE user_fk = ? AND status <> 3 AND status <> 4`,
      [id], function (err, rows) {
        rows.forEach(function (row) {
          orders.push(row)
        })
        callback(err, orders)
      })
  }

  //Alle Bestellungen Kunde erhalten, die geschlossen sind
  getCustomerOrdersHistory (id, callback) {
    let orders = []
    return this.db.all(
      `SELECT * FROM bestellung WHERE user_fk = ? AND (status = 3 OR status = 4)`,
      [id], function (err, rows) {
        rows.forEach(function (row) {
          orders.push(row)
        })
        callback(err, orders)
      })
  }

  //Bestellung erhalten mit Bnr
  getOrderbyBnr (bnr, callback) {
     return this.db.get(
      `SELECT bnr, auto_fk, startdatum, enddatum, status, zeitstempel, vorname, nachname, user, adresse, telefon FROM bestellung JOIN user ON bestellung.user_fk=user.id WHERE bnr = ?`,
      bnr, function (err, row) {
        callback(err, row)
      })
  }

   //Schaeden holen, die zu Bestellung gehoeren
   getDamagebyBnrAndCar (bnr, autoname, callback) {
    let schaeden = []
    return this.db.all(
      `SELECT * FROM schaden WHERE bnr_fk = ? AND auto_fk = ?`,
      [bnr,autoname], function (err, rows) {
        rows.forEach(function (row) {
          schaeden.push(row)
        })
        callback(err, schaeden)
      })
  }

  //Schaeden holen, die zu Bestellung gehoeren
  getDamagebyCar (auto, pos, callback) {
    return this.db.get(
      `SELECT * FROM schaden WHERE auto_fk = ? AND pos = ?`,
      [auto,pos], function (err, row) {
        callback(err, row)
      })
  }

  //Mitarbeiter: Alle  Bestellungen holen
  getAllOrders (callback) {
    let orders = []
    return this.db.all(
      `SELECT bnr, auto_fk, startdatum, enddatum, status, zeitstempel, vorname, nachname, user, adresse, telefon FROM bestellung JOIN user ON bestellung.user_fk=user.id`,
        function (err, rows) {
        rows.forEach(function (row) {
          orders.push(row)
        })
        callback(err, orders)
      })
  }

  //Mitarbeiter: Alle offenen Bestellungen eines bestimmten Typ (0,1,2,5)
  getAllOpenOrders (typ, callback) {
    let orders = []
    return this.db.all(
      `SELECT bnr, auto_fk, startdatum, enddatum, status, zeitstempel, vorname, nachname, user, adresse, telefon FROM bestellung JOIN user ON bestellung.user_fk=user.id WHERE status = ?`,
      [typ],function (err, rows) {
        rows.forEach(function (row) {
          orders.push(row)
        })
        callback(err, orders)
      })
  }

  //Mitarbeiter: Alle abgeschlossenen Bestellungen erhalten (status 3,4)
  getOrderHistory (callback) {
    let orders = []
    return this.db.all(
      `SELECT bnr, auto_fk, startdatum, enddatum, status, zeitstempel, vorname, nachname, user, adresse, telefon FROM bestellung JOIN user ON bestellung.user_fk=user.id WHERE status = 3 OR status = 4`,
      function (err, rows) {
        rows.forEach(function (row) {
          orders.push(row)
        })
        callback(err, orders)
      })
  }

  getAllCarDamage (auto, callback) {
    let damage = []
    return this.db.all(
      `SELECT * FROM schaden WHERE auto_fk = ?`,
      [auto], function (err, rows) {
        rows.forEach(function (row) {
          damage.push(row)
        })
        callback(err, damage)
      })
  }

  updateAutoAusleihe(status,auto, callback){
    return this.db.get(
      `UPDATE auto SET ausgeliehen = ? WHERE name = ?`,
      [status, auto], function (err) {
        callback(err)
      })
  }

  //Bestellungsstatus aendern
  updateStatusOrder(bnr,status,callback){
    return this.db.get(
      `UPDATE bestellung SET status = ? WHERE bnr = ?`,
      [status, bnr], function (err, row) {
        callback(err, row)
      })
  }

  //Bestellungsstatus aendern (z.B. nachdem fataler Schaden, muessen alle zukuenftigen Bestellungen erneut ueberpreuft u. bestaetigt werden)
  updateOrdersByCarAndStatus(auto,status1,status2,callback){
    return this.db.get(
      `UPDATE bestellung SET status = ? WHERE auto_fk = ? AND status = ?`,
      [status1,auto,status2], function (err, row) {
        callback(err, row)
      })
  }

  //Kosten Typen
  //0 --> Standardkosten fuer Bestellung
  //1 --> Zusatzkosten Tank 
  //2 --> Zusatzkosten Sauberkeit
  //3 --> Zusatzkosten Verspaetung bei Abgabe
  //4 --> Zusatzkosten Schaeden
  //5 --> Zusatzkosten Abbruch Kunde Bestellung zu spaet (strafzahlung)

  addCost (standard, callback) {
    return this.db.run(
      'INSERT INTO kosten (bnr_fk, pos, menge, typ, beschreibung) VALUES (?,?,?,?,?)',
      standard, function (err) {
        callback(err)
      })
  }

  // bestimmten kosteneintrag loeschen
  deleteOrderCost (bnr, pos, callback) {
    return this.db.run(
      `DELETE FROM kosten WHERE bnr_fk = ? AND pos = ?`,
      [bnr, pos], function (err) {
        callback(err)
      })
  }

  // letztes Auftreten des Kostentyps loeschen
  deleteFirstOrderCost (bnr, typ, callback) {
    return this.db.run(
      `DELETE FROM kosten WHERE bnr_fk = ? AND typ = ? AND pos = (SELECT MAX(pos) FROM kosten WHERE bnr_fk = ? AND typ = ?);`,
      [bnr, typ, bnr, typ], function (err) {
        callback(err)
      })
  }

  //Kosten Hoehe updaten
  updateCost(menge, bnr_fk, pos, beschreibung, callback){
    return this.db.run(
      `UPDATE kosten SET menge = ?, beschreibung = ? WHERE bnr_fk = ? AND pos = ?`,
      [menge, beschreibung, bnr_fk, pos], function (err) {
        callback(err)
      })
  }
   //Alle offenen Bestellungen Kunde erhalten
   getOrderCost (bnr, callback) {
    let costs = []
    return this.db.all(
      `SELECT menge, pos, typ, beschreibung, user_fk FROM kosten JOIN bestellung ON kosten.bnr_fk=bestellung.bnr WHERE bnr_fk = ?`,
      [bnr], function (err, rows) {
        rows.forEach(function (row) {
          costs.push(row)
        })
        callback(err, costs)
      })
  }

  //Bestellungen nach Status u. Auto holen
  getOrdersByCarAndStatus(auto,status,callback){
    let orders = []
    return this.db.all(
      `SELECT * FROM bestellung WHERE auto_fk = ? AND status = ?`,
      [auto,status], function (err, rows) {
        rows.forEach(function (row) {
          orders.push(row)
        })
        callback(err, orders)
      })
  }

  addOrderCost (cost, callback) {
    return this.db.run(
      'INSERT INTO kosten (bnr_fk, pos, menge, typ, beschreibung) VALUES (?,?,?,?,?)',
      cost, (err) => {
        callback(err)
      })
  }

  //schaeden-tabelle stellt log fuer alle jemals aufgetretenen probleme auto dar
  // prioritaet:
  // -1 bei schaeden bedeutet behandelter Schaden (z.B. wenn Auto repariert wurde)
  // 0 --> fatal, d.h. auto kann nicht ausgeliehen werden, bis behoben
  // > 0 --> autoschaeden/probleme sind vorhanden, aber verhindern ausleihe auto nicht (z.b. kleiner autokratzer)
  getOpenCarDamage (auto, callback) {
    let damage = []
    return this.db.all(
      `SELECT * FROM schaden WHERE auto_fk = ? AND prioritaet >= 0`,
      [auto], function (err, rows) {
        rows.forEach(function (row) {
          damage.push(row)
        })
        callback(err, damage)
      })
  }

  //schaden hinzufuegen
  createDamage (damage, callback) {
    return this.db.run(
      'INSERT INTO schaden (auto_fk, pos, beschreibung, prioritaet, typ, hoehe, bnr_fk, pos_fk) VALUES (?,?,?,?,?,?,?,?)',
      damage, (err) => {
        callback(err)
      })
  }

    //schaden hinzufuegen
    updatePriority (update, callback) {
      return this.db.run(
        `UPDATE schaden SET prioritaet = ? WHERE auto_fk = ? AND pos = ?`,
        update, (err) => {
          callback(err)
        })
    }
    getCarTypes(callback) {
        return this.db.all(
            `SELECT distinct typ FROM auto order by typ`, function (err, rows) {
                callback(err, rows.map(r => r.typ))
            })
    }
    getCarTueren(callback) {
        return this.db.all(
            `SELECT distinct tueren FROM auto order by tueren`, function (err, rows) {
                callback(err, rows.map(r => r.tueren))
            })
    }
   //schaden loeschen
   deleteDamage (auto, pos, callback) {
    return this.db.run(
      `DELETE FROM schaden WHERE auto_fk = ? AND pos = ?`,
      [auto, pos], function (err) {
        callback(err)
      })
  }


  //schaden bnr_fk updaten
  updateBnrDamage (bnr, auto, pos, callback) {
  return this.db.run(
    `UPDATE schaden SET bnr_fk = ? WHERE auto_fk = ? AND pos = ?`,
    bnr,auto,pos, (err) => {
      callback(err)
    })
  }


}

module.exports = Db
