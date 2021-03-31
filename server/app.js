//Backend
//Express-Server, der Anfragen von Frontend an jeweiligen Endpunkten übernimmt
const express = require('express')
const DB = require('./db')
const config = require('./config')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const moment = require('moment')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const { time } = require('console')
const multer  = require('multer');
var fs = require('fs')
moment().format()

const db = new DB('autovermietung.db') //DB wird geöffnet --> siehe db.js
const app = express()
const router = express.Router()

//Mailoptionen für Senden Email von Gmail-Account
let transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587, // tsl port gmail smpt server
  secure: true, // übertragung über ssl/ttl
  auth: {
    user: 'carsharing23@gmail.com',
    pass: 'iwrfbrcwouhgvpdi'
  }
})
let mailOptions;


router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
router.use(cookieParser())
const frontendUrl = process.env.FRONTEND_APP_URL || 'http://localhost:8080';
// CORS middleware
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', frontendUrl) // webseite, die requests sendet
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept')
  next()
})

//Registrieren Kunden durch Hinzufügen Daten in Datenbank 
router.post('/register', function (req, res) {
  db.insert([
    req.body.name,
    req.body.vorname,
    req.body.email,
    bcrypt.hashSync(req.body.password, 8),
    req.body.address,
    req.body.telephone,
    0,
    0
  ],
  function (err) {
    if (err) return res.status(500).send('There was a problem registering the user.')
    db.selectByEmail(req.body.email, (err, user) => {
        if (err || !user) return res.status(500).send('Error on the server.')
        if (!user) return res.status(404).send('Credentials invalid')
        let valid = moment.utc().add(24, 'hours') // valid for 1 day
        //Erstellen sicheres Token und Speichern in DB
        let token = crypto.randomBytes(32).toString('hex')
        db.updateReset([
          bcrypt.hashSync(token, 8),
          moment(valid).format('YYYY-MM-DD HH:mm:ss'),
          user.id
        ],
        function (err) {
          if (err) return res.status(500).send('Error on the server.')
          mailOptions = {
            from: '"Autovermietung" <service@autovermietung.de>',
            to: user.user,
            subject: 'Verifizieren Sie Ihren Account',
            html: '<h4><b>Account verifizieren</b></h4>' +
            'Hallo Herr/Frau ' + user.nachname + ',' +
            '<p>Um Ihren Account zu verifizeren, drücken Sie auf diesen Link:</p>' +
            '<a href=' + (process.env.FRONTEND_APP_URL || 'http://localhost:3000') +'/verify-account/' + user.id + '/' + token + '>Account verifizeren</a>' +
            '<p>Dieser Link ist für 24h gültig</p>' +
            '<br><br>' +
            '<p>--Ihr HEYRJP-Team</p>'
          }
          transporter.sendMail(mailOptions, function (error, info) { // sending mail to user where he can verify account. User id and the token are sent as params in a link
            if (error) {
              res.status(500).send('Error on the server.')
            } else {
              res.status(200).send('User successfully created!\nPlease verify your account first by clicking on the link sent to the provided email')
            }
          })
        })
    })
  })
})
//Mitarbeiter registrieren
router.post('/register-employee', function (req, res) {
  let token = req.cookies.jwt
  let userr = null
  //Da nur Admin dies tun darf, wird hier verifizert, ob Anfragender Adminrechte hat
  confirmToken(token,res, function(ausgabe){
    if(ausgabe.role != -1) {
        userr = ausgabe.user
        //Wenn Anfragender Adminrechte hat, dann wird Mitarbeiter erstellt, sonst Fehler
        if (userr.rolle == 2) {
          db.insert([
            req.body.name,
            req.body.vorname,
            req.body.username,
            bcrypt.hashSync(req.body.password, 8),
            'n.a',
            null,
            1,
            1
          ],
          function (err) {
            if (err) return res.status(500).send('There was a problem registering the user.')
            res.status(200).send('Employee successfully created!')
          })
        } else {
          return res.status(401).send('Unauthorized access')
        }
    } else {
    if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
    else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
    else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
    else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
    }
  })
})

//Loginprozess
router.post('/login', (req, res) => {
  //wird geschaut, ob gesendetr Username/Email und PW mit gespeicherten Daten übereinstimmen
  db.selectByEmail(req.body.email, (err, user) => {
    if (err) return res.status(500).send('Error on the server.')
    if (!user) return res.status(404).send('Credentials invalid')
    let passwordIsValid = bcrypt.compareSync(req.body.password, user.pass)
    if (!passwordIsValid) return res.status(401).send('Credentials invalid')
    //Wenn Account verifiziert wurde
    if(user.aktiviert == 1){
      //Erstellen JWT-Token und Speichern in Cookie, sodass Kunde diesen immer automatisch mitsendet
      let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 3600 // expires in 1 hour
      })
      res.cookie('jwt', token, {
        maxAge: 60 * 60 * 1000, // expires in 1 h
        httpOnly: true, //not accesible via javscript by clinet
        secure: false // true in production --> only https
      })
      //zurücksenden Erfolg der Authentifizierung + Rolle, die in Browser temporär gespeichert werden
      res.status(200).send({auth: true, role: user.rolle})
    }
    //Wenn nicht verifiziert
    else if(user.aktiviert == 0){
      let valid = moment.utc().add(24, 'hours') // valid for 1 day
      //Erstellen sicheres Token und Speichern in DB
      let token = crypto.randomBytes(32).toString('hex')
      db.updateReset([
        bcrypt.hashSync(token, 8),
        moment(valid).format('YYYY-MM-DD HH:mm:ss'),
        user.id
      ],
      function (err) {
          if (err) return res.status(500).send('Error on the server.')
          mailOptions = {
          from: '"Autovermietung" <service@autovermietung.de>',
          to: user.user,
          subject: 'Verifizieren Sie Ihren Account',
          html: '<h4><b>Account verifizieren</b></h4>' +
          'Hallo Herr/Frau ' + user.nachname + ',' +
          '<p>Um Ihren Account zu verifizeren, drücken Sie auf diesen Link:</p>' +
          '<a href=' + (process.env.FRONTEND_APP_URL || 'http://localhost:3000') +'/verify-account/' + user.id + '/' + token + '>Account verifizeren</a>' +
          '<p>Dieser Link ist für 24h gültig</p>' +
          '<br><br>' +
          '<p>--Ihr HEYRJP-Team</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) { // sending mail to user where he can verify account. User id and the token are sent as params in a link
          if (error) {
            res.status(500).send('Error on the server.')
          } else {
            res.status(420).send('We\'ve sent a verification email. Please verify your account first before logging in again')
          }
        })
      })
    }
    else{
      res.status(500).send('Error on the server.')
    }
  })
});

//Logout
router.post('/logout', (req, res) => {
  res.clearCookie("jwt");
  res.send('Set Cookie');
})

//Anfrage Kunde, um Passwort ändern zu können
router.post('/reset-userpw', (req, res) => {
  //Test, ob Email vorhanden ist
  db.selectByEmail(req.body.email, (err, user) => {
    if (err) return res.status(500).send('Error on the server.')
    if (!user) return res.status(200).send({success: true})
    let valid = moment.utc().add(24, 'hours') // valid for 1 day
    //Wenn Rücksetz-Anfrage von Passwort und nur wenn Account bereits verifizert ist und nur durch Kunden nutzbar
    if (user.rolle == 0 && user.aktiviert == 1) {
      //Erstellen sicheres Token und Speichern in DB
      let token = crypto.randomBytes(32).toString('hex')
      db.updateReset([
        bcrypt.hashSync(token, 8),
        moment(valid).format('YYYY-MM-DD HH:mm:ss'),
        user.id
      ],
      function (err) {
        if (err) return res.status(500).send('Error on the server.')
        //Senden Email an Kunden mit enthaltenen Token und Link auf Website zum Zurücksetzen PW
        //Mail-Inhalt
        mailOptions = {
          from: '"Autovermietung" <service@autovermietung.de>',
          to: user.user,
          subject: 'Setzen Sie Ihr Account-Passwort zurück',
          html: '<h4><b>Passwort zurücksetzen</b></h4>' +
        '<p>Um Ihr Passwort zurückzusetzen, drücken Sie auf diesen Link:</p>' +
        '<a href=' + frontendUrl + '/reset/' + user.id + '/' + token + '>Setzen Sie Ihr Passwort zurück</a>' +
        '<p>Dieser Link ist für 24h gültig</p>' +
        '<br><br>' +
        '<p>--Ihr Autovermietung-Team</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) { // sending mail to user where he can reset password. User id and the token are sent as params in a link
          if (error) {
            res.status(500).send('Error on the server.')
          } else {
            res.status(200).send({success: true})
          }
        })
      })
    } else {
      res.status(420).send('The account is either not available or not verified. Please check your emails for a verification link')
    }
  })
})

//Passwort ändern von Kunden
router.post('/confirm-pwreset', (req, res) => {
  //Wenn Link gültig, d.h. ID Kunde + Token, dann wird PW von Kunde in DB geändert
  db.selectById(req.body.id, (err, user) => {
    if (err) return res.status(500).send('Error on the server.')
    if (!user || (user.ablaufdatum == null && user.resetToken == null)) return res.status(404).send('Invalid or expired reset link')
    let tokenIsValid = bcrypt.compareSync(req.body.token, user.resetToken)
    if (!tokenIsValid) return res.status(401).send('Invalid or expired reset link')
    let currentTime = moment.utc()
    let currentTimeFormated = moment(currentTime).format('YYYY-MM-DD HH:mm:ss')
    let isafter = moment(currentTimeFormated).isAfter(user.ablaufdatum)
    db.updateReset([
      null,
      null,
      req.body.id
    ], (err) => {
      if (err) return res.status(500).send('Error on the server.')
      if (isafter) return res.status(401).send('Invalid or expired reset link')
      db.updatePass(bcrypt.hashSync(req.body.password, 8), req.body.id, (err) => {
        if (err) return res.status(500).send('Error on the server.')
        return res.status(200).send({success: true})
      })
    })
  })
})

router.get('/verify-account/:id/:token', (req, res) => {
  //Wenn Link gültig, d.h. ID Kunde + Token, dann wird Account verifiziert
  db.selectById(req.params.id, (err, user) => {
    if (err) return res.status(500).end('<h1>Error on the server.</h1>')
    if (!user || (user.ablaufdatum == null && user.resetToken == null)) return res.status(404).end('<h1>Invalid or expired reset link</h1>')
    let tokenIsValid = bcrypt.compareSync(req.params.token, user.resetToken)
    if (!tokenIsValid) return res.status(401).end('<h1>Invalid or expired reset link</h1>')
    let currentTime = moment.utc()
    let currentTimeFormated = moment(currentTime).format('YYYY-MM-DD HH:mm:ss')
    let isafter = moment(currentTimeFormated).isAfter(user.ablaufdatum)
    db.updateReset([
      null,
      null,
      req.params.id
    ], (err) => {
      if (err) return res.status(500).end('<h1>Error on the server.</h1>')
      if (isafter) return res.status(401).end('<h1>Invalid or expired reset link</h1>')
      db.verifyUser(req.params.id, (err) => {
        if (err) return res.status(500).end('<h1>Error on the server.</h1>')
        res.status(200).end("<h1>Der Account wurde erfolgreich verifiziert</h1>" + '<p> <a href=' + frontendUrl + '8080/login>Zum Login</a></p>')
      })
    })
  })
})

//Mitarbeiter-Daten aktualisieren/ändern durch Admin
router.put('/employee/:id', (req, res) => {
  let token = req.cookies.jwt
  let userr = null
  //Wenn Person keine Adminrechte oder Person nicht der Mitarbeiter ist,
  //von dem die Daten geändert werden sollen (also falsche ID), dann Fehler
  confirmToken(token,res, function(ausgabe){
    if(ausgabe.role != -1) {
          userr = ausgabe.user
          if (req.params.id != null && (userr.rolle == 2 || (userr.rolle == 1))) {
            if (req.body.name != null && req.body.username == null && req.body.password == null) {
              let typ = req.body.name.split(":")[1]
              let name =  req.body.name.split(":")[0]
              if(typ == 2){
                db.updateName(name, req.params.id, (err) => {
                  if (err) return ausgabe.res.status(500).send('Error on the server.')
                  return ausgabe.res.status(200).send({name: name})
                })
              }
              else if(typ == 1){
                db.updateVorname(name, req.params.id, (err) => {
                  if (err) return ausgabe.res.status(500).send('Error on the server.')
                  return ausgabe.res.status(200).send({name: name})
                })
              }
            } else if (req.body.name == null && req.body.username != null && req.body.password == null) {
              db.updateMail(req.body.username, req.params.id, (err) => {
                if (err) return ausgabe.res.status(500).send('Error on the server.')
                return ausgabe.res.status(200).send({username: req.body.username})
              })
            } else if (req.body.name == null && req.body.username == null && req.body.password != null) {
              db.updatePass(bcrypt.hashSync(req.body.password, 8), req.params.id, (err) => {
                if (err) return ausgabe.res.status(500).send('Error on the server.')
                return ausgabe.res.status(200).send(null)
              })
            } else if(req.body.adresse != null) {
              db.updateAdresse(req.body.adresse, req.params.id, (err) => {
                if (err) return ausgabe.res.status(500).send('Error on the server.')
                return ausgabe.res.status(200).send({adresse: req.body.adresse})
              })
            } else if(req.body.telefon != null) {
              db.updateTelefon(req.body.telefon, req.params.id, (err) => {
                if (err) return ausgabe.res.status(500).send('Error on the server.')
                return ausgabe.res.status(200).send({telefon: req.body.telefon})
              })
            } else { return ausgabe.res.status(400).send('Invalid request') }
          } else if (userr.rolle < 1) {
            return ausgabe.res.status(401).send('Unauthorized access')
          } else {
            return ausgabe.res.status(400).send('Invalid request')
          }
    } else {
      if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
      else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
      else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
      else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
    }
  })
})

//Mitarbeiter aus DB löschen
router.delete('/employee/:id', (req, res) => {
  let token = req.cookies.jwt
  //Wenn keine Adminrechte, dann Fehler
  confirmToken(token,res, function(ausgabe){
    if(ausgabe.role != -1) {
      let user = ausgabe.user
      if(user.rolle == 2 || user.rolle == 1){
          db.deleteAccount(req.params.id, (err) => {
            if (err) return ausgabe.res.status(500).send('Error on the server.')
            return ausgabe.res.status(200).send(null)
          })
      }
      else{
        return ausgabe.res.status(401).send('Unauthorized access')
      }
    } else {
      if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
      else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
      else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
      else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
    }
  })  
})

//Test der Zugriffsrechte Person durch Auswertung JWT in Cookie
router.get('/authenticate', (req, res) => {
  let token = req.cookies.jwt
  //Wenn Token vorhanden, Verifizerung, ob Token gültig
  confirmToken(token,res, function(ausgabe){
    if(ausgabe.role != -1) {
          return ausgabe.res.status(200).send({auth: true, role: ausgabe.role})
    } else {
      if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
      else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
      else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
      else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
    }
  })
})


//Mitarbeiter holen
router.get('/employee/:id', (req, res) => {
  let token = req.cookies.jwt
  let userr = null
  confirmToken(token,res, function(ausgabe){
    if(ausgabe.role != -1) {
          userr = ausgabe.user
          if (req.params.id != null) {
            //Wenn Paramter -200, dann alle Mitarbeiter holen
            if (req.params.id == -200) {
              //Nur Admin darf das
              if (userr.rolle == 2 || userr.rolle == 1) {
                db.getAllEmployees((err, users) => {
                  if (err) return ausgabe.res.status(500).send('Error on the server.')
                  if (!users) return ausgabe.res.status(404).send('No Employees available')
                  return ausgabe.res.status(200).send({employees: users})
                })
              } else {
                return ausgabe.res.status(401).send('Unauthorized access')
              }
            } else {
              //Wenn andere ID, dann Mitarbeiter holen und testen, ob
              //Adminrechte oder ID der des anfragenden Mitarbeiters entspricht
              db.selectById(req.params.id, (err, user) => {
                if (err) return ausgabe.res.status(500).send('Error on the server.')
                if (!user) return ausgabe.res.status(404).send('Employee not found')
                if (userr.rolle == 2 || (userr.rolle == 1 && (userr.id == user.id || user.rolle == 0))) {
                  let employee = {id: user.id, name: user.nachname, vorname: user.vorname , email: user.user, rolle: user.rolle, adresse: user.adresse, telefon: user.telefon}
                  return ausgabe.res.status(200).send({employee: employee})
                } else {
                  return ausgabe.res.status(401).send('Unauthorized access')
                }
              })
            }
          } else {
            return ausgabe.res.status(404).send('Requested resource is not available')
          }
    } else {
      if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
      else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
      else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
      else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
    }
  })
})

router.get('/customers', (req, res) => {
  let token = req.cookies.jwt
  let userr = null
  confirmToken(token,res, function(ausgabe){
    if(ausgabe.role != -1) {
      userr = ausgabe.user
        //Wenn Paramter -200, dann alle Mitarbeiter holen
          //Nur Admin darf das
          if (userr.rolle == 2 || userr.rolle == 1) {
            db.getAllCustomers((err, users) => {
              if (err) return ausgabe.res.status(500).send('Error on the server.')
              if (!users) return ausgabe.res.status(404).send('No Employees available')
              return ausgabe.res.status(200).send({customers: users})
            })
          } else {
            return ausgabe.res.status(401).send('Unauthorized access')
          }
    } else {
      if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
      else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
      else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
      else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
    }
  })
})

//Kunden aus DB löschen
router.delete('/customer/:id', (req, res) => {
  let token = req.cookies.jwt
  confirmToken(token,res, function(ausgabe){
    if(ausgabe.role != -1) {
      let user = ausgabe.user
      // Ab Mitarbeiter oder nur Kunden, dem Konto gehört
      if(user.rolle > 0 || (user.rolle == 0 && (req.params.id == user.id))){
        db.getOpenCustomerOrders(req.params.id, (err, bestellungen) => {
          if (err) return res.status(500).send('Error on the server.')
          if (bestellungen.length > 0) return res.status(409).send('Still active orders available')
          db.deleteAccount(req.params.id, (err) => {
            if (err) return ausgabe.res.status(500).send('Error on the server.')
            return ausgabe.res.status(200).send(null)
          })
        })
      }
      else{
        return ausgabe.res.status(401).send('Unauthorized access')
      }
    } else {
      if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
      else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
      else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
      else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
    }
  })  
})

//Auto(s) holen
router.get('/car/:autoname', (req, res) => {
  if(req.params.autoname != null){
    if (req.params.autoname == "alle") {
      db.getAllCars((err, cars) => {
        if (err) return res.status(500).send('Error on the server.')
        if (!cars) return res.status(404).send('No Cars available')
        //sieht hier jede Bestellung (also auch Anfrage von Kunden)
        //bereits als vollständige Bestellung an 
        //--> Auto kann nicht gemietet werden, erst wenn Mitarbeiter Bestellung löschen würde
        db.getAllTimeframes((err, timeframes) => {
          if (err) return res.status(500).send('Error on the server.')
          let orderTime = [] 
          for (timee of timeframes){
            let found = false
            let index = 0
            for(i=0;i<orderTime.length;i++){
              if(orderTime[i].auto == timee.auto_fk){
                index = i
                found = true
                break
              }
            }
            if(!found){
              let length = orderTime.push({auto: timee.auto_fk, times:[]})
              index = length - 1
            }
            found = false
            orderTime[index].times.push({from: timee.startdatum, to: timee.enddatum})
          }
          //werden jetzt alle Autos und die zu ihnen gehörigen Bestellzeiträume zurückgegeben
          return res.status(200).send({cars: cars, times: orderTime})
        })
      })
    }
    else{
      db.getCar(req.params.autoname, (err, car) => {
        if (err) return res.status(500).send('Error on the server.')
        if (!car) return res.status(404).send('Car not available')
        //sucht nach allen Bestellzeitraeumen fuer Auto
        db.getCarTimeframes(req.params.autoname, (err, carTimeframes) => {
          if (err) return res.status(500).send('Error on the server.')
          return res.status(200).send({car: car, carTimes: carTimeframes})
        })
      })
    } 
  }else {
    return res.status(404).send('Requested resource is not available')
  }
})

//schaeden auto holen
router.get('/car/:autoname/schaeden', (req, res) => {
  if(req.params.autoname != null){
    let token = req.cookies.jwt
    //Wenn Token vorhanden, Verifizerung, ob Token gültig
    confirmToken(token,res, function(ausgabe){
      if(ausgabe.role != -1) {
        user = ausgabe.user
        // nur mitarbeiter darf auf schaeden zugreifen
        if(user.rolle > 0){
          db.getOpenCarDamage(req.params.autoname, (err, cardamage) => {
            if (err) return ausgabe.res.status(500).send('Error on the server.')
            if (cardamage.length == 0) return ausgabe.res.status(200).send({success: true}) // kein aktiver schaden ist erfolg
            return ausgabe.res.status(200).send({cardamage: cardamage})
          })
        }
        else{
          return ausgabe.res.status(401).send('Unauthorized access')  
        }
      } else {
        if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
        else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
        else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
        else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
      }
    })
   }else{
       return res.status(404).send('Requested resource is not available')
   }  
})

//schaeden auto loeschen
router.delete('/car/:autoname/schaeden/:pos', (req, res) => {
  if(req.params.autoname != null){
    let token = req.cookies.jwt
    //Wenn Token vorhanden, Verifizerung, ob Token gültig
    confirmToken(token,res, function(ausgabe){
      if(ausgabe.role != -1) {
        user = ausgabe.user
        // nur mitarbeiter darf auf schaeden zugreifen
        if(user.rolle > 0){
          db.getDamagebyCar(req.params.autoname, req.params.pos, (err, schaden) =>{
            if (err) return ausgabe.res.status(500).send('Error on the server.')
            if (!schaden) return res.status(404).send('No Damage available')
            db.deleteDamage(req.params.autoname, req.params.pos, (err) => {
              if (err) return ausgabe.res.status(500).send('Error on the server.')
              let updater = false
              db.getOpenCarDamage(req.params.autoname, (err, cardamage) => {
                if (err) return ausgabe.res.status(500).send('Error on the server.')
                let fatal = false
                for(let i=0;i<cardamage.length;i++){
                  if(cardamage[i].prioritaet == 0){
                    fatal = true
                    break
                  }
                }
                // auto verfuegbar
                if (cardamage.length == 0 || !fatal){
                  updater = true
                } 
                 // schauen, ob es zu schaden bestellung gibt u. wenn ja, dann kosten auch dazu loeschen, falls noch offene bestellung
                if(schaden.bnr_fk != null && schaden.pos_fk != null){
                  db.getOrderbyBnr(schaden.bnr_fk, (err, order) =>{
                    if (err) return ausgabe.res.status(500).send('Error on the server.')
                    if (!order || order.status == 3 || order.status == 4) return res.status(200).send({success: true, cost: false})
                    db.deleteOrderCost (schaden.bnr_fk, schaden.pos_fk, (err) => {
                      if (err) return ausgabe.res.status(500).send('Error on the server.')
                      if(updater){
                        db.updateVerfuegbarkeit(req.params.autoname, 1, (err) => {
                          if (err) return ausgabe.res.status(500).send('Error on the server.')
                          return res.status(200).send({success: true, cost: true, verfuegbar: true})
                        })
                      }
                      else{
                        return ausgabe.res.status(200).send({success: true, cost: true})
                      }
                    })
                  })
                }
                else{
                  if(updater){
                    db.updateVerfuegbarkeit(req.params.autoname, 1, (err) => {
                      if (err) return ausgabe.res.status(500).send('Error on the server.')
                      return res.status(200).send({success: true, verfuegbar: true})
                    })
                  }
                  else{
                    return ausgabe.res.status(200).send({success: true})
                  }
                }
              })
            })
          })
        }
        else{
          return ausgabe.res.status(401).send('Unauthorized access')  
        }
      } else {
        if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
        else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
        else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
        else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
      }
    })
   }else{
       return res.status(404).send('Requested resource is not available')
   }  
})

// schaden fixen 
router.put('/car/:autoname/schaeden/updateStatus', (req, res) => {
  if(req.body.status != null &&  req.body.pos != null){
    let token = req.cookies.jwt
    //Wenn Token vorhanden, Verifizerung, ob Token gültig
    confirmToken(token,res, function(ausgabe){
      if(ausgabe.role != -1) {
        user = ausgabe.user
        // nur mitarbeiter
        if(user.rolle > 0){
          // kann nur autoschaeden fixen, wenn auto auch in laden vorhanden ist (d.h. nicht ausgeliehen)
          db.getCar(req.params.autoname, (err, auto) =>{
            if (err) return ausgabe.res.status(500).send('Error on the server.')
            if (!auto || auto.ausgeliehen) return res.status(404).send('Cant fix damage when car is rented')
            db.updatePriority([req.body.status, req.params.autoname, req.body.pos], (err) => {
              if (err) return ausgabe.res.status(500).send('Error on the server.')
              //schauen, ob noch offene fatale schaeden vorhanden --> wenn nicht, dann wird autostatus geupdated zu verfuebar
              db.getOpenCarDamage(req.params.autoname, (err, cardamage) => {
                if (err) return ausgabe.res.status(500).send('Error on the server.')
                let fatal = false
                for(let i=0;i<cardamage.length;i++){
                  if(cardamage[i].prioritaet == 0){
                    fatal = true
                    break
                  }
                }
                // auto wieder verfuegbar
                if (cardamage.length == 0 || !fatal){
                  db.updateVerfuegbarkeit(req.params.autoname, 1, (err) => {
                    if (err) return ausgabe.res.status(500).send('Error on the server.')
                    return res.status(200).send({success: true, verfuegbar: true})
                  })
                } 
                else{
                  return res.status(200).send({success: true})
                }
              })
            })
          })
        }
        else{
          return ausgabe.res.status(401).send('Unauthorized access')  
        }
      } else {
        if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
        else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
        else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
        else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
      }
    })
   }else{
       return res.status(404).send('Requested resource is not available')
   }  
})

router.put('/car/:autoname/updateAusleihe', (req, res) => {
  if(req.body.status != null){
    let token = req.cookies.jwt
    //Wenn Token vorhanden, Verifizerung, ob Token gültig
    confirmToken(token,res, function(ausgabe){
      if(ausgabe.role != -1) {
        user = ausgabe.user
        // nur mitarbeiter
        if(user.rolle > 0){
          db.updateAutoAusleihe(req.body.status, req.params.autoname, (err) => {
            if (err) return ausgabe.res.status(500).send('Error on the server.')
            return res.status(200).send({success: true})
          })
        }
        else{
          return ausgabe.res.status(401).send('Unauthorized access')  
        }
      } else {
        if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
        else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
        else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
        else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
      }
    })
   }else{
       return res.status(404).send('Requested resource is not available')
   }  
})

//schaeden auto erstellen
router.post('/car/:autoname/schaeden', (req, res) => {
  if(req.body.beschreibung != null && req.body.prio != null && req.body.typ != null && req.body.kosten != null){
    let token = req.cookies.jwt
    //Wenn Token vorhanden, Verifizerung, ob Token gültig
    confirmToken(token,res, function(ausgabe){
      if(ausgabe.role != -1) {
        user = ausgabe.user
         db.getAllCarDamage(req.params.autoname, (err, damage) => {
          if (err) return ausgabe.res.status(500).send('Error on the server.')
          // letzte positionszahl erhalten
            let posMax = 0
            if(damage.length == 1){
              posMax = damage[0].pos
            }
            else{
              for(let i=0;i<damage.length-1;i++){
                if(damage[i].pos > damage[i+1].pos){
                  posMax = damage[i].pos
                }
                else{
                  posMax = damage[i+1].pos
                }
              }
          }
          // nur mitarbeiter+admin darf schaeden hinzufuegen
          if(user.rolle > 0){
            db.getCar(req.params.autoname, (err, auto) =>{
              if (err) return ausgabe.res.status(500).send('Error on the server.')
              // darf nur schaden hinzufuegen, wenn auto in laden physisch vorhanden ist
              if (!auto || auto.ausgeliehen) return res.status(404).send('Cant add damage when car is rented')
              let bnr = null
              let pos = null
              if(req.body.bnr != null && req.body.pos != null){
                bnr = req.body.bnr
                pos = req.body.pos
              }
              db.createDamage([
                req.params.autoname,
                (posMax+1),
                req.body.beschreibung,
                req.body.prio,
                req.body.typ,
                req.body.kosten,
                bnr,
                pos
              ], (err) => {
                if (err) return ausgabe.res.status(500).send('Error on the server.')
                // wenn schaden prioritaet 0, dann wird auto fuer weitere bestellungen gesperrt
                // alle bereits bestaetigten bestellungen (1), werden wieder auf offenen gesetzt 
                //u. muessen erneut bestaetigt werden durch Mitarbeiter
                if( req.body.prio == 0){
                  db.getOrdersByCarAndStatus(req.params.autoname, 1, (err,orders) => {
                    if (err) return ausgabe.res.status(500).send('Error on the server.')
                    db.updateVerfuegbarkeit(req.params.autoname, 0, (err) => {
                      if (err) return ausgabe.res.status(500).send('Error on the server.')
                      db.updateOrdersByCarAndStatus(req.params.autoname, 0, 1, (err) => {
                        if (err) return ausgabe.res.status(500).send('Error on the server.')
                        return res.status(200).send({success: true, pos: posMax+1, verfuegbar: false, orders: orders})
                      })
                    })
                  })
                }
                else{
                  return res.status(200).send({success: true, pos: posMax+1})
                }
              })
            })
          }
          else{
            return ausgabe.res.status(401).send('Unauthorized access')  
          }
        })
      } else {
        if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
        else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
        else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
        else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
      }
    })
   }else{
       return res.status(404).send('Requested resource is not available')
   }  
})

router.get('/rent/', (req, res) => {
  let token = req.cookies.jwt
  //Wenn Token vorhanden, Verifizerung, ob Token gültig
  confirmToken(token,res, function(ausgabe){
    if(ausgabe.role != -1) {
      user = ausgabe.user
      userr = ({vorname: user.vorname, nachname: user.nachname, user: user.user, adresse: user.adresse, telefon: user.telefon})
      return ausgabe.res.status(200).send({user: userr}) 
    } else {
      if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
      else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
      else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
      else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
    }
  })
})

// bestellung erstellen
router.post('/rent/', (req, res) => {
  let token = req.cookies.jwt
  //Wenn Token vorhanden, Verifizerung, ob Token gültig
  confirmToken(token,res, function(ausgabe){
    if(ausgabe.role != -1) {
      user = ausgabe.user
       // nur kunde darf bestellung erstellen
      if(user.rolle == 0){
        db.getOpenCustomerOrders(user.id, (err, bestellungen) => {
          if (err) return res.status(500).send('Error on the server.')
          // darf nur eine aktive bestellung von kunden vorhanden sein --> aktiv = bestellung, deren status nicht "abgeschlossen" (3,4) ist
          if (bestellungen.length > 0) return res.status(500).send('You are already having an active order.\nGo into the account tab for more information on your orders')
          timestamp = moment.utc() //erstellzeitraum bestellung, damit mitarbeiter danach filtern kann
          // kunde darf nicht mehr als 3 Bestellungen an einem Tag abbrechen --> sonst koennte kunde
          // staendig bestellung erstellen, sofort abbrechen (wdh.)
          db.getCustomerOrdersHistory(user.id, (err, bestellungen) => {
            if (err) return res.status(500).send('Error on the server.')
            let heute = new Date(moment(timestamp).format('YYYY/MM/DD'))
            let counter = 0
            for(let i=0;i<bestellungen.length-1;i++){
              let zeitstempel = new Date(bestellungen[i].zeitstempel)
              if(heute.getTime() == zeitstempel.getTime()){
                counter ++
              }
            }
            if(counter > 3){
              return res.status(500).send('We identified unusual behaviour on your account.\nTherefore you will not be able to do any more orders for today')
            }
            else{
              db.getCarTimeframes(req.body.auto, (err, carTimeframes) => {
                if (err) return res.status(500).send('Error on the server.')
                let gueltig = true
                for(let i=0;i<carTimeframes.length;i++){
                  let von = new Date(carTimeframes[i].startdatum)
                  let bis = new Date(carTimeframes[i].enddatum)
                  let startdatum = new Date(req.body.start)
                  let enddatum = new Date(req.body.ende)
                  if (((startdatum.getTime() <= von.getTime()) && (enddatum.getTime() >= von.getTime())
                    || ((startdatum.getTime() <= bis.getTime()) && (enddatum.getTime() >= bis.getTime()))
                    || ((startdatum.getTime() >= von.getTime()) && (enddatum.getTime() <= bis.getTime())))) {
                     gueltig = false
                     break
                  }
                }
                if(gueltig){
                  db.createOrder([
                    user.id,
                    req.body.auto,
                    req.body.start,
                    req.body.ende,
                    0,
                    moment(timestamp).format('YYYY/MM/DD'),
                  ], (err, value) => {
                    if (err || !value) return res.status(500).send('Error on the server.')
                    db.addCost([
                      value,
                      0,
                      req.body.kosten,
                      0,
                      'Standardkosten',
                    ], (err) => {
                      if (err) return res.status(500).send('Error on the server.')
                      return res.status(200).send({success: true})
                    })
                  })
                }
                else{
                  return res.status(409).send('Invalid period for order')
                }
              })
            }
          })
        })
      }else{
        return res.status(401).send('Unauthorized access')
      } 
    } else {
      if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
      else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
      else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
      else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
    }
  })
})


// bestellungen holen (sowohl kunde als auch mitarbeiter)
router.get('/order/:bnr', (req, res) => {
 if(req.params.bnr != null){
  let token = req.cookies.jwt
  //Wenn Token vorhanden, Verifizerung, ob Token gültig
  confirmToken(token,res, function(ausgabe){
    if(ausgabe.role != -1) {
      user = ausgabe.user
      // wenn mind. mitarbeiter
      if (user.rolle > 0){
        if (req.params.bnr.includes("alle")) {
          // alle bestellungen jeden typs holen
          db.getAllOrders((err, orders) => {
            if (err) return res.status(500).send('Error on the server.')
            if (!orders) return res.status(404).send('No Orders available')
            return res.status(200).send({orders: orders})
          })
        }
        else if (req.params.bnr.includes("offen")) {
          // alle offenen bestellungen bestimmten typs holen
          let typ = req.params.bnr.split(" ")[1]
          db.getAllOpenOrders(typ, (err, orders) => {
            if (err) return res.status(500).send('Error on the server.')
            if (!orders) return res.status(404).send('No Orders available')
            return res.status(200).send({orders: orders})
          })
        }
        // alle geschlossenen bestellungen holen
        else if(req.params.bnr == "geschlossen"){
          db.getOrderHistory((err, orders) => {
            if (err) return res.status(500).send('Error on the server.')
            if (!orders) return res.status(404).send('No Orders available')
            return res.status(200).send({orders: orders})
          })
        }
        else{
          // sucht spezifische Bestellung mit bnr
          db.getOrderbyBnr(req.params.bnr, (err, order) => {
            if (err) return res.status(500).send('Error on the server.')
            if (!order) return res.status(404).send('Order not available')
            return res.status(200).send({order: order})
          })
        } 
      } 
      // wenn kunde
      else{
        if (req.params.bnr == "offen") {
          // alle offenen bestellungen holen
          db.getOpenCustomerOrders(user.id, (err, orders) => {
            if (err) return res.status(500).send('Error on the server.')
            if (!orders) return res.status(404).send('No Orders available')
            return res.status(200).send({orders: orders})
          })
        }
        else if (req.params.bnr == "geschlossen") {
          // alle geschlossenen bestellungen holen
          db.getCustomerOrdersHistory(user.id, (err, orders) => {
            if (err) return res.status(500).send('Error on the server.')
            if (!orders) return res.status(404).send('No Orders available')
            return res.status(200).send({orders: orders})
          })
        }
        else{
          // sucht spezifische Bestellung mit bnr
          db.getCustomerOrderbyBnr(user.id, req.params.bnr, (err, order) => {
            if (err) return res.status(500).send('Error on the server.')
            if (!order) return res.status(404).send('Order not available')
            return res.status(200).send({order: order})
          })
        } 
      }
    } else {
      if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
      else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
      else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
      else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
    }
  })
 }else{
    return res.status(404).send('Requested resource is not available')
 }  
})

// testen, ob bestellung mit auto u. bnr vorhanden
router.get('/order/:bnr/car/:autoname', (req, res) => {
 if(req.params.bnr != null){
  let token = req.cookies.jwt
  //Wenn Token vorhanden, Verifizerung, ob Token gültig
  confirmToken(token,res, function(ausgabe){
    if(ausgabe.role != -1) {
      user = ausgabe.user
      // wenn mind. mitarbeiter
      if (user.rolle > 0){
        // test, ob es bestellung mit bnr gibt, die noch offen ist
        db.getOrderbyBnr(req.params.bnr, (err, order) => {
          if (err) return res.status(500).send('Error on the server.')
          // darf nur kosten zu bestellungen hinzufügen, wenn auto ausgeliehen und zurückgegeben wurde
          if (!order || order.status != 2) return res.status(200).send({success:false})
          db.getDamagebyBnrAndCar(req.params.bnr, req.params.autoname, (err, schaeden) => {
            if (err) return res.status(500).send('Error on the server.')
            if (!schaeden) return res.status(404).send('No Orders available')
            return res.status(200).send({success: true, schaeden: schaeden})
          })
        })
      } 
      else{
        res.status(401).send('Unauthorized access')
      }
    }else {
      if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
      else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
      else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
      else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
    }
  })
 }else{
      return res.status(404).send('Requested resource is not available')
 }  
})

// bestellungen status aktualisieren z.B. bei abbrechen 
router.put('/order/:bnr/updateStatus', (req, res) => {
  if(req.params.bnr != null && req.body.status != null){
    let token = req.cookies.jwt
    //Wenn Token vorhanden, Verifizerung, ob Token gültig
    confirmToken(token,res, function(ausgabe){
      if(ausgabe.role != -1) {
        user = ausgabe.user
        // kunde darf nur eigene bestellungen bearbeiten
        if(user.rolle = 0){
          db.getCustomerOrderbyBnr(user.id, req.param.bnr, (err, orders) => {
            if (err) return res.status(500).send('Error on the server.')
            if (!orders) return res.status(404).send('No Orders available') // abbruch, wenn fremde bestellung angefragt
            db.updateStatusOrder(req.params.bnr, req.body.status, (err) => {
              if (err) return res.status(500).send('Error on the server.')
              return res.status(200).send({success: true})
            })    
          })
        }
        else{
          db.updateStatusOrder(req.params.bnr, req.body.status, (err) => {
            if (err) return res.status(500).send('Error on the server.')
            return res.status(200).send({success: true})
          })    
        }
      } else {
        if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
        else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
        else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
        else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
      }
    })
  }else{
       return res.status(404).send('Requested resource is not available')
  }  
})

//kosten holen
router.get('/order/:bnr/cost', (req, res) => {
  if(req.params.bnr != null){
    let token = req.cookies.jwt
    //Wenn Token vorhanden, Verifizerung, ob Token gültig
    confirmToken(token,res, function(ausgabe){
      if(ausgabe.role != -1) {
        user = ausgabe.user
        db.getOrderCost(req.params.bnr, (err, costs) => {
          if (err || !costs) return res.status(500).send('Error on the server.')
          //Kunde darf nur auf eigene Bestellungen zugreifen
          if(user.rolle == 0 && (user.id != costs[0].user_fk)){
              res.status(401).send('Unauthorized access')
          }
          return res.status(200).send({costs: costs})
        })  
      } else {
        if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
        else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
        else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
        else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
      }
    })
  }else{
       return res.status(404).send('Requested resource is not available')
  }  
})

//kosten erstellen
router.post('/order/:bnr/cost', (req, res) => {
  if(req.params.bnr != null && req.body.typ != null && req.body.kosten != null){
    let token = req.cookies.jwt
    //Wenn Token vorhanden, Verifizerung, ob Token gültig
    confirmToken(token,res, function(ausgabe){
      if(ausgabe.role != -1) {
        user = ausgabe.user
        db.getOrderCost(req.params.bnr, (err, costs) => {
          if (err || !costs) return res.status(500).send('Error on the server.')
          //Kunde darf nur auf eigene Bestellungen zugreifen
          if(user.rolle == 0 && (user.id != costs[0].user_fk)){
              res.status(401).send('Unauthorized access')
          }
          // letzte positionszahl erhalten
          let posMax = 0
          if(costs.length == 1){
            posMax = costs[0].pos
          }
          else{
            for(let i=0;i<costs.length-1;i++){
              if(costs[i].pos > costs[i+1].pos){
                posMax = costs[i].pos
              }
              else{
                posMax = costs[i+1].pos
              }
            }
         }
         // wenn kosten wegen verspaeteter abgabe schauen, ob bereits vorhanden
         let vorhanden = false
         let kosten = ''
         if(req.body.typ == 3){
          for(let i=0;i<costs.length;i++){
            if(costs[i].typ == 3){
              vorhanden = true
              kosten = costs[i]
              break
            }
          }
         }
         if(vorhanden){
          db.updateCost(req.body.kosten, req.params.bnr, kosten.pos, req.body.beschreibung, (err) => {
            if (err) return res.status(500).send('Error on the server.')
            return res.status(200).send({success: true, changed: true, pos : kosten.pos})
          })
         }
         else{
            db.addOrderCost(
              [req.params.bnr, 
                (posMax+1), 
                req.body.kosten,
                req.body.typ,
                req.body.beschreibung
              ], (err) => {
                let cost = ({bnr_fk: req.params.bnr, 
                  pos: (posMax+1), 
                  menge: req.body.kosten,
                  typ: req.body.typ,
                  beschreibung: req.body.beschreibung})
                if (err) return res.status(500).send('Error on the server.')
                return res.status(200).send({success: true, changed: false, cost: cost})
            })    
          }
        })
      } else {
        if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
        else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
        else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
        else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
      }
    })
  }else{
      return res.status(404).send('Requested resource is not available')
  }  
})

app.use(express.static(__dirname));
app.use(multer({dest:"uploaded/cars"}).array("files"));

app.post("/upload-image", function (req, res, ) {
  let filedata = req.files;
  if (!filedata) {
    res.status(500);
    res.send("Ошибка при загрузке файла");
  } else {
    res.send(filedata[0]);
  }
});

app.get("/get-image", function (req, res,) {
  fs.readFile(__dirname + "/../" + req.query.path, function (err, data) {
    if (err) {
      fs.readFile(__dirname + "/../" + req.query.path.replace(/\\/g, '/'), function (err, data) {
        if (err) {
          return res.status(404).send("Image's not found");
        }
        res.writeHead(200, {'Content-Type': req.query.mimeType || 'image/jpeg', 'filename': req.query.origName})
        res.end(data) // Send the file data to the browser.
      })
    } else {
      res.writeHead(200, {'Content-Type': req.query.mimeType || 'image/jpeg', 'filename': req.query.origName})
      res.end(data) // Send the file data to the browser.
    }
  });
});

app.delete("/file", function (req) {
  fs.unlinkSync(__dirname + "/../" + req.query.path);
});


router.post("/delete-car", function (req, res) {
  confirmToken(req.cookies.jwt, res, function (ausgabe) {
    if (ausgabe.role != 2) {
      return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
    }
    db.removeCar(req.body, (err) => {
      if (err) return res.status(500).send('Error on the server.')
      if (req.body.image && req.body.image.path) {
        fs.unlinkSync(req.body.image.path);
      }
      return res.status(200).send({success: true})
    })
  })
});

const validateCar = car => !(!car.name || !car.sitzplaetze || !car.tueren || !car.typ || !car.verbrauch || !car.kraftstoff ||  !car.leistung
  || !car.preis || !car.verfuegbar || !car.getriebe);

router.post("/save-car", function (req, res) {

  confirmToken(req.cookies.jwt, res, function (ausgabe) {
    if (ausgabe.role != 2) {
      return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
    }
    db.getCar(req.body.name, (err, car) => {
      if (err) return res.status(500).send('Error on the server.')
      if (car) {
        //update a car
        const carUpdates = {...car, ...req.body};
        if (!validateCar(carUpdates)) {
          return res.status(400).send('Please fill all required fields.');
        }
        db.saveCar(carUpdates, (err) => {
          if (err) return res.status(500).send('Error on the server.')
          return res.status(200).send({success: true})
        })
      } else {
        if (!validateCar(req.body)) {
          return res.status(400).send('Please fill all required fields.');
        }
        // create a car
        db.createCar(req.body, (err) => {
          if (err) {
            return res.status(500).send('Error on the server.')
          }
          return res.status(200).send({success: true})
        })
      }
    })
  })
});
router.delete('/order/:bnr/cost/:pos/:typ', (req, res) => {
  if(req.params.bnr != null){
    let token = req.cookies.jwt
    //Wenn Token vorhanden, Verifizerung, ob Token gültig
    confirmToken(token,res, function(ausgabe){
      if(ausgabe.role != -1) {
        user = ausgabe.user
        // zum testen, ob kunde kosten loeschen darf
        db.getOrderCost(req.params.bnr, (err, costs) => {
          if (err || !costs) return res.status(500).send('Error on the server.')
          //Kunde darf nur auf eigene Bestellungen zugreifen
          if(user.rolle == 0 && (user.id != costs[0].user_fk)){
              res.status(401).send('Unauthorized access')
          }
          else{
            if(req.params.pos != null && req.params.typ == null){
              db.deleteOrderCost(req.params.bnr, req.params.pos, (err) => {
                if (err ) return res.status(500).send('Error on the server.')
                return res.status(200).send({success: true})
              })
            }
            else{
              db.deleteFirstOrderCost(req.params.bnr, req.params.typ, (err) => {
                if (err ) return res.status(500).send('Error on the server.')
                return res.status(200).send({success: true})
              })
            }
          }
        })  
      } else {
        if(ausgabe.auth == 403) return ausgabe.res.status(ausgabe.auth).send('Forbidden Access')
        else if(ausgabe.auth == 401) return ausgabe.res.status(ausgabe.auth).send('Unauthorized access')
        else if(ausgabe.auth == 404) return ausgabe.res.status(ausgabe.auth).send('Requested resource is not available')
        else if(ausgabe.auth == 500) return ausgabe.res.status(ausgabe.auth).send('Error on the server.')
      }
    })
  }else{
       return res.status(404).send('Requested resource is not available')
  }  
})

//Wenn Token vorhanden, Verifizerung, ob Token gültig
//Danach werden entschlüsselte Daten aus Token geholt, um Person in DB zu suchen
//Wird Zugriffsrecht Person zurückgegeben, sonst Fehler
function confirmToken (token, res, callback)
{
  if (token) {
    jwt.verify(token, config.secret, function (err, decoded) {
      if (err) {
        res.clearCookie('jwt')
        callback({auth: 401, role: -1, res: res})
        return
      }
      //Aus Token Infos über Person (ID) lesen und diese aus DB holen
      db.selectById(decoded.id, (err, user) => {
        if (err) {
          res.clearCookie('jwt')
          callback({auth: 500, role: -1, res: res})
          return
        }
        //Wenn Nutzer vorhanden ist, dann Rücksenden der Zugrissrechte (Rolle)
        //sonst Fehler
        if (!user) {
          res.clearCookie('jwt')
          callback({auth: 404, role: -1, res: res})
          return
        } 
        callback({auth: true, role: user.rolle, user: user, res: res})
      })
    })
  } else {
    callback({auth: 403, role: -1, res: res})
  }
}

router.get("/car-types", function (req, res) {
    db.getCarTypes((err, result) => {
      if (err) return res.status(500).send('Error on the server.')
      return res.status(200).send(result)
    })
});

router.get("/car-door-numbers", function (req, res) {
  db.getCarTueren((err, result) => {
    if (err) return res.status(500).send('Error on the server.')
    return res.status(200).send(result)
  })
});

app.use(router)

let port = process.env.PORT || 3000

// eslint-disable-next-line no-unused-vars
let server = app.listen(port, function () {
  console.log('Express server listening on port ' + port)
})
