import { data } from "dom7";
import { f7, f7ready, Icon, Link, Navbar, NavLeft, NavTitle, Page, Swiper, SwiperSlide } from "framework7-react";
import React, { useState, useEffect } from "react";
import SwiperCore, { Mousewheel, Navigation } from "swiper";
import "../css/generate.less";

SwiperCore.use([Navigation, Mousewheel]);

export default function Genrate(props) {
     //define state
     const [swiperRef, setSwiperRef] = useState(null);
     const [backLink, setBackLink] = useState(true);
     const slideDummy = {
         src: "", //"https://placekitten.com/800",
         like: false,
         generating: false,
     };
     const [slideData, setSlideData] = useState([slideDummy, slideDummy, slideDummy]);
     const [currentSlideVisible, setCurrentSlideVisible] = useState(0)
     const [actualIndex, setActualIndex] = useState(0)

     //define interval
     useEffect(() => {
        const timer = setInterval(refreshGenerating, 500);
        return () => clearInterval(timer);
      });

    //define utilitariean functions
    const getDirection = function (current, question) {
        // returns -1 for prev, 0 for current, 1 for next
        if (current == 0) {
            if (question == 1) return 1;
            else if (question == 2) return -1;
        } else if (current == 1) {
            if (question == 2) return 1;
            else if (question == 0) return -1;
        } else if (current == 2) {
            if (question == 0) return 1;
            else if (question == 1) return -1;
        }
        return 0;
    };
    let i = 0;
    async function getSlideDataByRealIndex(rI) {
        const response = await fetch(`/api/generators/${props.generatorID}/${rI}`, {
            method: "GET",
        }); //TODO Catch connection failiure
        if (response.status == 200) {
            const data = await response.json();
            let generating = false;
            if (data.status == "generating") {
                generating = true;
            }

            return {
                src: `${data.src}`,
                like: data.like,
                generating: generating,
            };
        } else if (response.status == 202) {
            return {
                src: `https://placekitten.com/${800}`,
                like: false,
                generating: false,
            };
        } else {
            f7.dialog.alert("Serverfehler", "Anfrage fehlgeschlagen");
        }
        //f7.dialog.alert("Verbindungsfehler", "Es konnte keine Verbindung zum Webserver hergestellt werden.");
        console.error(rI, response.status, data);
        return {
            src: `https://placekitten.com/${800}`,
            like: false,
            generating: false,
        };
    }

    const getSlideIndexByRealIndex = function (ri) {
        if (actualIndex == ri) {
            return currentSlideVisible;
        } else if (actualIndex == ri + 1) {
            if (actualIndex == 0) {
                return 2;
            } else if (actualIndex == 1) {
                return 0;
            } else {
                return 1;
            }
        } else if (actualIndex == ri - 1) {
            if (actualIndex == 0) {
                return 1;
            } else if (actualIndex == 1) {
                return 2;
            } else {
                return 3;
            }
        }
        return -1;
    };
    async function getSlideDataBySlideIndex(slideIndex) {
        return await getSlideDataByRealIndex(actualIndex + getDirection(currentSlideVisible, slideIndex));
    }


    // create slides
    const makeSlide = function (index) {
        // index must be either 0, 1 or 2 !!!
        async function like(c) {
            const ai = actualIndex;
            const cl = slideData[index].like;
            if (!cl) {
                f7.notification
                    .create({
                        icon: '<img src="/icons/favicon.png">',
                        title: "Direkter Link zu diesem Bild",
                        //subtitle: '',
                        text: `${window.location.protocol}//${window.location.host}/#!/generator/${props.generatorID}/${ai}/`,
                        closeButton: true,
                        closeTimeout: 4000,
                    })
                    .open();
            }
            const response = await fetch(`/api/generators/${props.generatorID}/${ai}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ like: !cl }),
            }).catch((error) => {
                console.error("Error:", error);
                f7.dialog.alert("Verbindungsfehler", "Es konnte keine Verbindung zum Webserver hergestellt werden.");
            });
            if (response.status == 200) {
                const data = await response.json();
                const d0 = await getSlideDataByRealIndex(ai);
                const d1 = await getSlideDataByRealIndex(ai + 1);
                const s0 = getSlideIndexByRealIndex(ai);
                const s1 = getSlideIndexByRealIndex(ai + 1);
                let sd = slideData;
                if (s0 != -1) {
                    sd[s0] = d0;
                }
                if (s1 != -1) {
                    sd[s1] = d1;
                }
                if (sd != slideData) {
                    setSlideData(sd)
                }
            } else {
                f7.dialog.alert("Serverfehler", "Anfrage fehlgeschlagen");
            }
        }
        console.log(slideData)
        return (
            <SwiperSlide index={index} key={index} virtualIndex={index} onDoubleClick={like}>
                <div className="heart-underlaying-image">
                    <img
                        src={slideData[index].src}
                        className="swiper-lazy"
                        style={slideData[index].like ? { opacity: 0.7 } : { opacity: 1 }}
                        alt=""
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
    const slides = Array.from({ length: 3 }).map((_, index) => makeSlide(index));

    const realIndexChange = function (ev) {
        /*
    This function does some trickery to have infinite slides with just 3 dom elements.
    The function is also called when the slider is initialized.
    */
        // figure out swipe direction
        const direction = getDirection(currentSlideVisible, ev.realIndex);
        setCurrentSlideVisible(ev.realIndex);
        let ai = actualIndex
        if (direction === -1) {
            ai--;
            setActualIndex(ai)
            const indexToModify = (ev.realIndex + 2) % 3; // like -1 but always positive
            let sd = slideData;
            sd[indexToModify] = slideDummy; //TODO WHY
            setSlideData(sd)
            getSlideDataByRealIndex(ai - 1).then((data) => {
                if (data != null) {
                    let sd2 = slideData;
                    sd2[indexToModify] = data;
                    setSlideData(sd2)
                }
            });
        } else if (direction === 1) {
            ai++
            setActualIndex(ai)
            const indexToModify = (ev.realIndex + 1) % 3;
            let sd = slideData;
            sd[indexToModify] = slideDummy; //TODO WHY
            setSlideData(sd)
            getSlideDataByRealIndex(ai + 1).then((data) => {
                if (data != null) {
                    let sd2 = slideData;
                    sd2[indexToModify] = data;
                    setSlideData(sd2)
                }
            });
        }
        console.log(ai, ev.realIndex, direction)
        // allow sliding back only if not on first page
        if (ai == 0) {
            ev.allowSlidePrev = false;
            document.getElementsByClassName("swiper-button-prev")[0].classList.add("swiper-button-disabled"); //TODO: Error handeling
        } else {
            ev.allowSlidePrev = true;
            document.getElementsByClassName("swiper-button-prev")[0].classList.remove("swiper-button-disabled"); //TODO: Error handeling
        }
        //lock sliding foreward if image is still generating
        if (slideData[ev.realIndex].generating) {
            ev.allowSlideNext = false;
            document.getElementsByClassName("swiper-button-next")[0].classList.add("swiper-button-disabled");
            //refreshGenerating()
        } else {
            ev.allowSlideNext = true;
            document.getElementsByClassName("swiper-button-next")[0].classList.remove("swiper-button-disabled");
        }
    };
    async function refreshGenerating() {
        if (slideData[currentSlideVisible].generating) {
            const ai = actualIndex;
            const d = await getSlideDataByRealIndex(actualIndex);
            const s0 = getSlideIndexByRealIndex(ai);
            if (s0 != -1) {
                console.log("next")
                let sd = slideData;
                sd[s0] = d;
                if (d.generating == false && s0 == currentSlideVisible) {
                    swiperRef.allowSlideNext = true;
                    document.getElementsByClassName("swiper-button-next")[0].classList.remove("swiper-button-disabled");
                }
                console.log(currentSlideVisible, s0, slideData, d, ai)
                setSlideData(sd);
            }
        }
    }
    async function initialize(ev) {
        console.log("initialize")
        let ai = actualIndex
        if ("imageID" in props) {
            ai = parseInt(props.imageID)
            setActualIndex(ai);
            setBackLink(false);
        }
        f7.preloader.show();
        const d0 = await getSlideDataByRealIndex(ai);
        const d1 = await getSlideDataByRealIndex(ai + 1);
        const d2 = await getSlideDataByRealIndex(ai - 1);
        setSlideData([d0, d1, d2]);
        f7.preloader.hide();
        realIndexChange(ev);
    }

    return (
        <Page>
            <Navbar backLink={backLink ? "Zurück" : undefined}>
                {!backLink && (
                    <NavLeft>
                        <Link
                            iconIos="f7:house"
                            iconAurora="f7:house"
                            iconMd="material:house"
                            href={`${window.location.protocol}//${window.location.host}/`}
                            external
                        ></Link>
                    </NavLeft>
                )}
                <NavTitle>WoDone Bildgenerierung</NavTitle>
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
                onInit={(ev) => {
                    f7ready(() => {
                        initialize(ev);
                    });
                }}
                
            >
                {slides}
            </Swiper>
        </Page>
    );
}
