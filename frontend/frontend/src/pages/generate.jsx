import { click, show } from "dom7";
import { Navbar, Page, Swiper, SwiperSlide, Icon } from "framework7-react";
import React from "react";
import SwiperCore, { Lazy, Virtual } from 'swiper';
import "../css/generate.less";
import { useState, useEffect } from "react";

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
    const [showLike, setShowLike] = useState(false);
    const swiperClick = function (c) {
      console.log("liked")
      setShowLike(!showLike);
      like(index)
    }

    //const enterPress = useKeyPress();

    return (
      <SwiperSlide 
        index={index} 
        key={index} 
        virtualIndex={index} 
        onDoubleClick={() => setShowLike(!showLike)}
        >
        <div className="heart-underlaying-image">
        <img
          src={`https://placekitten.com/${index + 800}`} //must be loading.gif!
          className="swiper-lazy"
          style={showLike ? { opacity: 0.7 } : { opacity: 1 }}
          alt="Bild wird geladen."
        ></img>
        </div>
        <Icon
          slot="media"
          f7="heart_circle"
          className="heart-icon"
          style={showLike ? { opacity: 1 } : { opacity: 0 }}
        ></Icon>
        <button className="likeBtn" onClick={() => setShowLike(!showLike)}>
          <Icon
            slot="media"
            f7="heart_circle"
            size={35}
            style={showLike ? { color: "red" } : { color: "gray" }}
            className="likeBtn-icon"
          ></Icon>
          Like
        </button>
        <div className="swiper-lazy-preloader swiper-lazy-preloader">
        </div>
      </SwiperSlide>
    );
  };

  /*{ window.addEventListener('keydown', event => {
      if (event.code === 'Space') {
        console.log("space bar pressed")
        setShowOverlay(!showOverlay);
      }
    })
  }*/
  
  const slides = Array.from({ length:  2000}).map(
    (_, index) => makeSlide(index)
  );

  /*
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
        //onLazyImageLoad={() => console.log("LOAD")}
        navigation
        mousewheel
        keyboard
        onKeyPress={() => {
          //console.log(swiperRef.activeIndex)
          //console.log(slides[swiperRef.activeIndex])
        }}
      >
        {slides}
      </Swiper>
    </Page>
  );
}

function useKeyPress() {

  /*const [keyPressed, setKeyPressed] = useState(false);
  function downHandler ({ key }) {
    if (key == targetKey) {
      setKeyPressed(true)
    }
  }

  function upHandler ({ key }) {
    if (key == targetKey) {
      setKeyPressed(false)
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", downHandler)
    window.addEventListener("keyup", upHandler)
    return () => {
      window.removeEventListener("keydown", downHandler)
      window.removeEventListener("keyup", upHandler)
    };
  }, []);*/

  return
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