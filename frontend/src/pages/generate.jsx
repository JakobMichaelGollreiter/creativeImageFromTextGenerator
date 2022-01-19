import { click } from "dom7";
import { Navbar, Page, Swiper, SwiperSlide, Icon, View } from "framework7-react";
import React from "react";
import { Virtual } from "swiper";
import "../css/generate.less";
import { useState } from "react";

//SwiperCore.use([Lazy]);

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
        /*onLazyImageLoad={() => console.log("LOAD")} */
        onDoubleClick={like}
      >
        {slides}
      </Swiper>
    </Page>
  );
};

export default Generate;
