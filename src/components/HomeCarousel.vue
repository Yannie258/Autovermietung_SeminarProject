<template>
  <div class="container">
    <!--    <div id="carouselExampleSlidesOnly" class="carousel slide" data-ride="carousel">-->
    <!--      <div class="carousel-inner">-->
    <!--        <div v-for="(slide, index) in slides" :key="index" v-bind:class="`carousel-item${index === 0 ? ' active': ''}`">-->
    <!--          <img class="d-block w-100" v-bind:src="`${slide.image}`" alt="">-->
    <!--          <div class="link">-->
    <!--            <a v-bind:href="`${slide.link}`">{{slide.text}}</a>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--      <a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">-->
    <!--        <span class="carousel-control-prev-icon" aria-hidden="true"></span>-->
    <!--        <span class="sr-only">Previous</span>-->
    <!--      </a>-->
    <!--      <a class="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">-->
    <!--        <span class="carousel-control-next-icon" aria-hidden="true"></span>-->
    <!--        <span class="sr-only">Next</span>-->
    <!--      </a>-->
    <!--      <ol class="carousel-indicators">-->
    <!--        <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>-->
    <!--        <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>-->
    <!--        <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>-->
    <!--      </ol>-->
    <!--    </div>-->
    <vueper-slides
        :visible-slides="1"
        class="no-shadow top-slider"
        ref="vueperslides2"
        @slide="$refs.vueperslides1.goToSlide($event.currentSlide.index, { emit: false })"
        :bullets="true"
        :touchable="false"
        :gap="1"
        :arrows="true"
        :autoplay="true"
        :duration="3000"
        :fixed-height="true"
        >
      <vueper-slide
          v-for="(slide, i) in slides"
          :key="i"
          :image="slide.image">
        <template v-slot:content>
          <a class="search-link btn btn-primary" v-bind:href="`${slide.link}`">{{ slide.text }}</a>
        </template>
      </vueper-slide>
    </vueper-slides>

  </div>
</template>


<script>
import {VueperSlides, VueperSlide} from 'vueperslides'
import 'vueperslides/dist/vueperslides.css'

export default {
  components: {
    VueperSlides,
    VueperSlide,
  },
  data() {
    return {
      slides: [
        {
          image: require('@/assets/Slides/E-TRON.jpg'),
          link: '/search/Audi%20E-TRON',
          text: 'Audi E-TRON Angebote',
        },
        {
          image: require('@/assets/Slides/Audi A4.webp'),
          link: '/search/Audi%20A4',
          text: 'Audi A4 Angebote',
        },
        {
          image: require('@/assets/Slides/Audi A5.jpg'),
          link: '/search/Audi%20A5',
          text: 'Audi A5 Angebote',
        },
        {
          image: require('@/assets/Slides/Audi A8.webp'),
          link: '/search/Audi%20A8',
          text: 'Audi A8 Angebote',
        },
        {
          image: require('@/assets/Slides/BMW 5er.jpg'),
          link: '/search/BMW%205',
          text: 'BMW 5er Angebote',
        },
        {
          image: require('@/assets/Slides/BMW 7er.jpg'),
          link: '/search/BMW%207er',
          text: 'BMW 7er Angebote',
        },
        {
          image: require('@/assets/Slides/E-Klasse.webp'),
          link: '/search/Mercedes%20E',
          text: 'Mercedes E-Klasse Angebote',
        },
        {
          image: require('@/assets/Slides/S-Klasse.jpg'),
          link: '/search/Mercedes%20S',
          text: 'Mercedes S-Klasse Angebote',
        },
      ],
    }
  }
}

</script>

<style lang="scss" scoped>
.vueperslides {
  height: 600px;
  .vueperslide {
    background-repeat: no-repeat;
    min-height: 600px;
    a.search-link {
      position: absolute;
      bottom: 10%;
      right: 5%;
      padding: 5px 10px;
    }
  }
}
</style>
