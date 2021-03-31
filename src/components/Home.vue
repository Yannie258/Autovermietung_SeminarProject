<template>
  <div id="app-home">
    <div class="home">
      <div class="form-group">
        <HomeCarousel/>
      </div>
      <div class="container">
        <h1>{{ msg }}</h1>
        <hr>
      </div>
      <router-view/>
      <div class="container">
        <h2 class="text-center">
        Mobilität ist in der heutigen Zeit unverzichtbar. Daher hat es sich HEYRJP zur
        Aufgabe gemacht, Sie in Bewegung zu bringen. Seit der Aufnahme der Geschäftstätigkeit
        folgen wir unserem Geschäftsziel, Sie mit hochwertigem Service und
        bestechend guten Leistungen zu überzeugen. Wir machen Ihre Wünsche wahr.</h2>
        <hr>

      </div>
      <div>
        <vueper-slides
            :visible-slides="4"
            class="no-shadow container partner-slider"
            ref="vueperslides2"
            @slide="$refs.vueperslides1.goToSlide($event.currentSlide.index, { emit: false })"
            :bullets="false"
            :touchable="false"
            :gap="2.5"
            :arrows="false"
            :autoplay="true"
            :duration="3000">
          <vueper-slide
              v-for="(slide, i) in slides"
              :key="i"
              :image="slide.image">
          </vueper-slide>
        </vueper-slides>
      </div>
    </div>
  </div>


</template>

<script>
//Homepage-Komponente
import {VueperSlides, VueperSlide} from 'vueperslides'
import 'vueperslides/dist/vueperslides.css'
import HomeCarousel from "@/components/HomeCarousel";

export default {
  name: 'out',
  components: {
    VueperSlides,
    VueperSlide,
    HomeCarousel,
  },
  data() {
    return {
      msg: 'Ihre HEYRJP Autovermietung',
      block: 'full',
      slides: [
        {image: require('@/assets/Marke/audi.png')},
        {image: require('@/assets/Marke/bmw.png')},
        {image: require('@/assets/Marke/VW.png')},
        {image: require('@/assets/Marke/Merc.png')},
        //{image: require('@/assets/Marke/opel.png')},
        //{image: require('@/assets/Marke/mazda.png')},
        //{image: require('@/assets/Marke/porsche.png')},
      ]
    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style type="scss" scoped>
.partner-slider .vueperslide {
  box-sizing: border-box;
  transition: 0.3s ease-in-out;
  opacity: 0.7;
  cursor: pointer;
  background-size: contain;
  background-repeat: no-repeat;
}

.partner-slider .vueperslide--active {
  opacity: 1;
}
</style>
