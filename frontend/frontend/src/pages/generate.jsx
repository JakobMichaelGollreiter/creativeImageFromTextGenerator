import { click, show } from "dom7";
import { Navbar, Page, Swiper, SwiperSlide, Icon, f7ready, f7, NavLeft, Link, NavRight, NavTitle } from "framework7-react";
import React from "react";
import SwiperCore, {Navigation, Mousewheel} from 'swiper';
import "../css/generate.less";
import { useState, useEffect } from "react";

SwiperCore.use([Navigation, Mousewheel]);

export default function Genrate(props) {

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
  let i = 0;
  async function getSlideDataByRealIndex (rI){
    const response = await fetch(`/api/generators/${props.generatorID}/${rI}`, {
      method: "GET",
    }) //TODO Catch connection failiure
    if (response.status == 200) {
      const data = await response.json()
      let generating = false
      if (data.status == "generating"){
        generating = true;
      }
     
        return {
          "src": `${data.src}`,
          "like": data.like,
          "generating": generating,}
    }else if (response.status == 202){
      const data = await response.json()
      console.log(data);
    }else{
      f7.dialog.alert("Serverfehler", "Anfrage fehlgeschlagen");
    }
   //f7.dialog.alert("Verbindungsfehler", "Es konnte keine Verbindung zum Webserver hergestellt werden.");

    return {
      "src": `https://placekitten.com/${800}`,
      "like": false
    }
  }

  async function getSlideDataBySlideIndex (slideIndex){
    return await getSlideDataByRealIndex(actualIndex + getDirection(currentSlideVisible, slideIndex))
  }

  //define state
  const [swiperRef, setSwiperRef] = useState(null);
  const [backLink, setBackLink] = useState(true);
  const swiperDummy = {
    "src": "",//"https://placekitten.com/800",
    "like": false,
    "generating": false,
  };
  const [swiperState, actuallySetSwiperState] = useState({
    "slides": [swiperDummy,swiperDummy,swiperDummy],
    "currentSlideVisible": 0,
    "actualIndex": 0,
  });
  //make it easy to work with state
  const setSwiperState = function(){
    actuallySetSwiperState(
      {
        "slides": slideData,
        "currentSlideVisible": currentSlideVisible,
        "actualIndex": actualIndex,
      }
    )
  }
  let actualIndex = swiperState.actualIndex
  let currentSlideVisible = swiperState.currentSlideVisible
  let slideData = swiperState.slides

  // create slides
  const makeSlide = function (index) {
    // index must be either 0, 1 or 2 !!!
    async function like (c) {
      if (!slideData[index].like){
        f7.notification.create({
          icon: '<img src="/icons/favicon.png">',
          title: 'Direkter Link zu diesem Bild',
          //subtitle: '',
          text: `${window.location.protocol}//${window.location.host}/app/generator/${props.generatorID}/${actualIndex}/`,
          closeButton: true,
          closeTimeout: 3000,
        }).open();
      }
      const response = await fetch(`/api/generators/${props.generatorID}/${actualIndex}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({"like": !slideData[index].like})
      }).catch(error => {
        console.error('Error:', error);
        f7.dialog.alert("Verbindungsfehler", "Es konnte keine Verbindung zum Webserver hergestellt werden.");
      });
      if (response.status == 200) {
        const data = await response.json()
        console.log(data);
        const d0 = await getSlideDataBySlideIndex(0)
        const d1 = await getSlideDataBySlideIndex(1)
        const d2 = await getSlideDataBySlideIndex(2)
        slideData = [d0,d1,d2]
        setSwiperState()
      }else{
        f7.dialog.alert("Serverfehler", "Anfrage fehlgeschlagen");
      }
    }
    return (
      <SwiperSlide 
        index={index} 
        key={index} 
        virtualIndex={index} 
        onDoubleClick={like}
        >
        <div className="heart-underlaying-image">
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
        {/*<button className="likeBtn" onClick={like}>
          <Icon
            slot="media"
            f7="heart_circle"
            size={35}
            style={slideData[index].like ? { color: "red" } : { color: "gray" }}
            className="likeBtn-icon"
          ></Icon>
          Like
        </button>
        <div className="swiper-lazy-preloader swiper-lazy-preloader"></div>*/}
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
      actualIndex--;
      const indexToModify = (ev.realIndex + 2) % 3 // like -1 but always positive
      getSlideDataByRealIndex(actualIndex - 1).then((data) => {
        if (data != null) {
          slideData[indexToModify] = data
          setSwiperState()
          console.log(data)
        }
      })
    }else if (direction === 1){
      actualIndex++;
      const indexToModify = (ev.realIndex + 1) % 3
      getSlideDataByRealIndex(actualIndex + 1).then((data) => {
        if (data != null) {
          slideData[indexToModify] = data
          setSwiperState()
          console.log(data)
        }
      })
    }
    // allow sliding back only if not on first page
    if (actualIndex == 0){
      ev.allowSlidePrev = false;
      document.getElementsByClassName("swiper-button-prev")[0].classList.add("swiper-button-disabled"); //TODO: Error handeling
    }else{
      ev.allowSlidePrev = true;
      document.getElementsByClassName("swiper-button-prev")[0].classList.remove("swiper-button-disabled"); //TODO: Error handeling
    }
    //lock sliding foreward if image is still generating
    if(slideData[ev.realIndex].generating){
      ev.allowSlideNext = false;
      document.getElementsByClassName("swiper-button-next")[0].classList.add("swiper-button-disabled");
    }else{
      ev.allowSlideNext = true;
      document.getElementsByClassName("swiper-button-next")[0].classList.remove("swiper-button-disabled");
    }
  }
  async function refreshGenerating(){
    if(slideData[currentSlideVisible].generating){
      const c = currentSlideVisible //zwischenspeichern zum Prüfen
      const d = await getSlideDataBySlideIndex(currentSlideVisible)
      if(c == currentSlideVisible){
        slideData[c] = d
        console.log("hier", d, d.generating)
        if (d.generating == false){
          swiperRef.allowSlideNext = true;
          document.getElementsByClassName("swiper-button-next")[0].classList.remove("swiper-button-disabled");
        }
        setSwiperState()
      }
    }
  }
  async function initialize (ev){
    if ("imageID" in props){
      actualIndex = parseInt(props.imageID)
      setBackLink(false)
    }
    console.log(actualIndex)
    f7.preloader.show();
    const d0 = await getSlideDataBySlideIndex(0)
    const d1 = await getSlideDataBySlideIndex(1)
    const d2 = await getSlideDataBySlideIndex(2)
    slideData = [d0,d1,d2]
    setSwiperState()
    f7.preloader.hide();
    realIndexChange(ev)
  }

  const refreshGeneratingTimeout = setTimeout(refreshGenerating, 100);

  return (
    <Page>
      <Navbar backLink={backLink ? "Zurück" : undefined}>
      {!backLink && <NavLeft>
        <Link
        iconIos="f7:house"
        iconAurora="f7:house"
        iconMd="material:house"
        href={`${window.location.protocol}//${window.location.host}/app/`} 
        external></Link>
      </NavLeft>}
      <NavTitle>
      WoDone Bildgenerierung
      </NavTitle>
      </Navbar>
      <Swiper
        onSwiper={setSwiperRef}
        slidesPerView={1}
        centeredSlides={true}
        allowSlidePrev={false}
        loop
        //virtual
        //lazy={{ loadPrevNext: false, checkInView: true }}
        navigation={f7.device.desktop}
        mousewheel
        keyboard
        onRealIndexChange={realIndexChange}
        onInit={(ev)=>{f7ready(()=>{initialize(ev)})}}
        onBeforeDestroy={() => {clearInterval(refreshGeneratingTimeout)}}
      >
        {slides}
      </Swiper>
    </Page>
  );
}