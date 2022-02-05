import { attr, click, show } from 'dom7';
import { Navbar, Page, Swiper, SwiperSlide, Icon } from 'framework7-react';
import React from 'react';
import SwiperCore, { Lazy, Virtual } from 'swiper';
import '../css/generate.less';
import { useState, useEffect } from 'react';

export default function App() {

  //define utilitariean functions

  const getDirection = function (current, question){
    // returns -1 for prev, 0 for current, 1 for next
    if (current == 0){
      if (question == 1) return 1;
      else if (question == 2) return -1;
    } else if (current == 1){
      if (question == 2) return 1;
      else if (question == 0) return -1;
    } else if (current == 2){
      if (question == 0) return 1;
      else if (question == 1) return -1;
    }
    return 0;
  }

  const getSlideDataByRealIndex = function (rI){
    console.log("serverRequest", rI)
    return {
      "src": `https://placekitten.com/${rI + 800}`,
      "like": false
    }
  }

  const getSlideDataBySlideIndex = function (slideIndex){
    return getSlideDataByRealIndex(realIndex + getDirection(currentSlideVisible, slideIndex))
  }

  //define state
  const [swiperRef, setSwiperRef] = useState(null); //TODO remove?

  const [swiperState, actuallySetSwiperState] = useState({
    "slides": [{
      "src": "https://placekitten.com/100",
      "like": false,
    },
    {
      "src": "https://placekitten.com/101",
      "like": false
    },
    {
      "src": "https://placekitten.com/102",
      "like": false
    }],
    "currentSlideVisible": 0,
    "actalIndex": 0,
  });
  //make it easy to work with state
  const setSwiperState = function(){
    actuallySetSwiperState(
      {
        "slides": slideData,
        "currentSlideVisible": currentSlideVisible,
        "actalIndex": realIndex,
      }
    )
  }
  let realIndex = swiperState.actalIndex
  let currentSlideVisible = swiperState.currentSlideVisible
  let slideData = swiperState.slides

  // create slides
  const makeSlide = function (index) {
    // index must be either 0, 1 or 2 !!!
    const like = function (c) {
      if (slideData[index].like){
        console.log("unliked", realIndex)
      }else{
        console.log("liked", realIndex)
      }
      
      slideData=[getSlideDataBySlideIndex(0), getSlideDataBySlideIndex(1), getSlideDataBySlideIndex(2)]
      //slideData[index].like = !slideData[index].like; //demo only TODO remove!
      setSwiperState()
    }

    console.log("render")
    return (
      <SwiperSlide 
        index={index} 
        key={index} 
        virtualIndex={index} 
        onDoubleClick={like}
        >
        <button onClick={() => console.log(window.data)}>print searchText</button>
        <div className='heart-underlaying-image'>
        <img
          src={slideData[index].src} //must be loading.gif!
          className="swiper-lazy"
          style={slideData[index].like ? { opacity: 0.7 } : { opacity: 1 }}
          alt="Bild wird geladen."
        ></img>
        </div>
        <Icon
          slot="media"
          f7="heart_circle"
          className="heart-icon"
          style={slideData[index].like ? { opacity: 1 } : { opacity: 0 }}
        ></Icon>
        <button className='likeBtn' onClick={like}>
          <Icon
            slot='media'
            f7='heart_circle'
            size={35}
            style={slideData[index].like ? { color: "red" } : { color: "gray" }}
            className="likeBtn-icon"
          ></Icon>
          Like
        </button>
        {/*<div className="swiper-lazy-preloader swiper-lazy-preloader"></div>*/}
      </SwiperSlide>
    );
  };  
  const slides = Array.from({ length:  3}).map(
    (_, index) => makeSlide(index)
  );

  const realIndexChange = function(ev){
    /*
    This function does some trickery to have infinite slides with just 3 dom elements.
    The function is also called when the slider is initialized.
    */
    // figure out swipe direction
    const direction = getDirection(currentSlideVisible, ev.realIndex)
    currentSlideVisible = ev.realIndex;
    if (direction === -1){
      realIndex--;
      const indexToModify = (ev.realIndex + 2) % 3 // like -1 but always positive
      slideData[indexToModify] = getSlideDataByRealIndex(realIndex - 1)
      setSwiperState()
    }else if (direction === 1){
      realIndex++;
      const indexToModify = (ev.realIndex + 1) % 3
      slideData[indexToModify] = getSlideDataByRealIndex(realIndex + 1)
      setSwiperState()
    }
    // allow sliding back only if not on first page
    if (realIndex == 0){
      ev.allowSlidePrev = false;
      document.getElementsByClassName("swiper-button-prev")[0].classList.add("swiper-button-disabled"); //TODO: Error handeling
    }else{
      ev.allowSlidePrev = true;
      document.getElementsByClassName("swiper-button-prev")[0].classList.remove("swiper-button-disabled"); //TODO: Error handeling
    }
  }
  const initialize = function(ev){
    slideData = [getSlideDataBySlideIndex(0), getSlideDataBySlideIndex(1), getSlideDataBySlideIndex(2)]
    setSwiperState()
    return realIndexChange(ev)
  }

  return (
    <Page>
      <Navbar title='WoDone Bildgenerierung' backLink='Zurück'></Navbar>
      <Swiper
        onSwiper={setSwiperRef}
        slidesPerView={1}
        centeredSlides={true}
        allowSlidePrev={false}
        loop
        //virtual
        //lazy={{ loadPrevNext: false, checkInView: true }}
        navigation
        mousewheel
        keyboard
        onRealIndexChange={realIndexChange}
        onInit={initialize}
      >
        {slides}
      </Swiper>
    </Page>
  );
}