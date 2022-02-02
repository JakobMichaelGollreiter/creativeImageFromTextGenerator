import { click } from "dom7";
import { Navbar, Page, Swiper, SwiperSlide, Icon, View } from "framework7-react";
import React from "react";
import SwiperCore, { Lazy, Virtual } from 'swiper';
import "../css/generate.less";
import { useState } from "react";

SwiperCore.use([Virtual, Lazy]);


export default function App() {
  //used source https://codesandbox.io/s/gynpf?file=/src/App.jsx:336-1972
  const [swiperRef, setSwiperRef] = useState(null);
  /*
  let appendNumber = 600;
  let prependNumber = 1;
  
  //this does not work...
  const prepend = () => {
    swiperRef.virtual.prependSlide([
      'Slide ' + --prependNumber,
      'Slide ' + --prependNumber,
    ]);
  };

  const append = () => {
    swiperRef.virtual.appendSlide('Slide ' + ++appendNumber);
  };

  const slideTo = (index) => {
    swiperRef.slideTo(index - 1, 0);
  };
  */

  const makeSlide = function (index) {
    const [showOverlay, setShowOverlay] = useState(false);
    const swiperClick = function (c) {
      setShowOverlay(!showOverlay);
      like(index)
    }
    return (
      <SwiperSlide index={index} key={index} virtualIndex={index} onDoubleClick={() => setShowOverlay(!showOverlay)}>
        <div className="heart-underlaying-image">
        <img
          src={`https://placekitten.com/${index + 800}`} //must be loading.gif!
          className="swiper-lazy"
          style={showOverlay ? { opacity: 0.5 } : { opacity: 1 }}
          alt="Bild wird geladen."
        ></img>
        </div>
        <Icon
          slot="media"
          f7="heart_circle"
          className="heart-icon"
          style={showOverlay ? { opacity: 1 } : { opacity: 0 }}
        ></Icon>
        <div className="swiper-lazy-preloader swiper-lazy-preloader"></div>
      </SwiperSlide>
    );
  };
  
  const slides = Array.from({ length:  2000}).map(
    (_, index) => makeSlide(index)
  );/*
  //this does not work. So no more then 1000 slides possible.
  const activeIndexChange = function (s) {
    console.log("test")
    if (s.activeIndex >= slides.length - 5) {
      swiperRef.virtual.appendSlide(makeSlide(slides.length));
    }
  };*/
  return (
    <Page>
      <Navbar title="WoDone Bildgenerierung" backLink="Zurück"></Navbar>
      <Swiper
        onSwiper={setSwiperRef}
        slidesPerView={1}
        centeredSlides={true}
        //spaceBetween={30}
        //pagination={{
        //  type: 'fraction',
        //}}
        //navigation={true}
        //onActiveIndexChange={activeIndexChange}
        virtual
        lazy={{ loadPrevNext: false, checkInView: true }}
        onLazyImageLoad={() => console.log("LOAD")} 
      >
        {slides}
      </Swiper>
    </Page>
  );
}



//SwiperCore.use([Lazy]);
/*
const Generate = () => {
  const makeSlide = function (index) {
    const [showOverlay, setShowOverlay] = useState(false);
    const swiperClick = function (c) {
      setShowOverlay(!showOverlay);
      like(index)
    }
    return (
      <SwiperSlide key={index} virtualIndex={index} onDoubleClick={() => setShowOverlay(!showOverlay)}>
        <div className="heart-underlaying-image">
        <img
          src={`https://placekitten.com/${index + 800}`}
          className="swiper-lazy"
          style={showOverlay ? { opacity: 0.5 } : { opacity: 1 }}
          alt="Bild wird geladen."
        ></img>
        </div>
        <Icon
          slot="media"
          f7="heart_circle"
          className="heart-icon"
          style={showOverlay ? { opacity: 1 } : { opacity: 0 }}
        ></Icon>
        <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
      </SwiperSlide>
    );
  };
  let maxIndex = 2000; // starts with 0
  let slides = Array.from({ length: maxIndex + 1 }).map((el, index) =>
    makeSlide(index)
  );

  const activeIndexChange = function (s) {
    //console.log(s);
    if (s.activeIndex >= maxIndex - 10) {
      slides.push(makeSlide(maxIndex + 1));
      s.update();
      maxIndex++;
    }
  };

  const like = function (index) {
    console.log("Es wurde geliked:", index)
  }

  return (
    <Page>
      <Navbar title="WoDone Bildgenerierung" backLink="Zurück"></Navbar>
      <Swiper
        modules={[Virtual]}
        spaceBetween={50}
        slidesPerView={1}
        virtual
        onActiveIndexChange={activeIndexChange}
        lazy={{ loadPrevNext: false, checkInView: true }}
        onLazyImageLoad={() => console.log("LOAD")} 
        onDoubleClick={like}
      >
        {slides}
      </Swiper>
    </Page>
  );
};

export default Generate;
*/