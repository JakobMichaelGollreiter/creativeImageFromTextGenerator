
import { empty } from 'dom7';
import { Navbar, Page, SwiperSlide, Swiper } from 'framework7-react';
import React from 'react';
import SwiperCore, { Virtual, Lazy } from 'swiper';
import '../css/generate.less';

//SwiperCore.use([Lazy]);

const Generate = () => {

  const photos = ['https://placekitten.com/800/800', 'https://placekitten.com/1024/1024'];



  const makeSlide = function (index){
    return (<SwiperSlide key={index} virtualIndex={index}>
      <img
        src={`https://placekitten.com/${index + 800}`}
        className="swiper-lazy"
      ></img>
      <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
      {/* Hier ist eine Option für die Like - Funktion*/}
    </SwiperSlide>)
  }
  let maxIndex = 2000; // starts with 0
  let slides = Array.from({ length: maxIndex + 1 }).map(
    (el, index) => makeSlide(index))

  const activeIndexChange = function (s) {
    console.log(s)
    if (s.activeIndex >= maxIndex -10){
      slides.push(makeSlide(maxIndex +1));
      s.update()
      maxIndex++;
    }
  }

  /* Javascript benötigt die Like - Funktion ganz sicher auch*/

  return (
    
      
    <Page>
      <Navbar title="WoDone Bildgenerierung" backLink="Zurück"></Navbar>
      <Swiper modules={[Virtual]} spaceBetween={50} slidesPerView={1} virtual onActiveIndexChange={activeIndexChange} lazy={{loadPrevNext:false, checkInView: true}} onLazyImageLoad={()=>console.log("LOAD")}>
      {slides}
    </Swiper>
    {/* Hier ist eine andere (vielleicht schwierigere) Option für die Like - Funktion. Oben zu <Swiper ...> muss ein event-Listener, der auf Lange Klicks (Maus) und lange Touches reagiert. */}
    </Page>
  );
};

export default Generate