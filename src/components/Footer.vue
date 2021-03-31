<template>
  <footer>
    <div class="container">
      <div class="row">
        <div class="col">
          <div class="logo">
            <a href="/">
              <img alt="logo" src="../assets/logo.png">
            </a>
          </div>
        </div>
        <div class="col">
          <h3 class="text-center">Kontaktmöglichkeiten</h3>
          <hr>
          <p class="form-group">
            <i class="bi bi-telephone-fill"></i> <a class="ml-2" v-bind:href="`tel:${phone}`">{{ phone }}</a>
          </p>
          <p class="form-group">
            <i class="bi bi-envelope-fill"></i> <a class="ml-2" v-bind:href="`mailto:${email}`">{{ email }}</a>
          </p>
          <p class="form-group">
            <i class="bi bi-geo-alt-fill"></i> <span  class="ml-2">{{ address }}</span>
          </p>
        </div>
        <div class="col footer-menu">
          <router-link class="aside-anchor" to="/">Home</router-link>
          <router-link class="aside-anchor" to="/about">ÜBER UNS</router-link>
          <router-link class="aside-anchor" to="/search">AUTO MIETEN</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>


<script>
//Fusszeile Website
export default {
  data() {
    return {
      phone: '0371 8556677',
      email: 'info@heyrjp.de',
      address: 'Weststraße 50, 09112 Chemnitz',
    }
  }
}

</script>

<style lang="scss" scoped>
footer {
  display: flex;
  padding: 15px;
  min-height: 150px;

  hr {
    background: #fff;
  }

  .logo {
    height: 110px;

    img {
      max-height: 100%;
    }
  }

  .footer-menu {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-around;
  }
}

@media (max-width: 991px) {
  footer {
    flex-direction: column;

    > .col, .logo {
      text-align: center;
    }

    .footer-menu {
      align-items: center;
    }
  }
}
</style>
