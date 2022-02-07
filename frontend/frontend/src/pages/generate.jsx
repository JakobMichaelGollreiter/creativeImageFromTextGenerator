///////////////////////////////////////////
// WoDone
// /frontend/frontend/src/pages/generate.jsx
// Authors: Tobias Höpp, August Wittgenstein
// Image-Swiper
///////////////////////////////////////////

import { f7, f7ready, Icon, Link, Navbar, NavLeft, NavTitle, Page, Swiper, SwiperSlide } from "framework7-react";
import React, { useState, useEffect } from "react";
import SwiperCore, { Mousewheel, Navigation } from "swiper";
import "../css/generate.less";

SwiperCore.use([Navigation, Mousewheel]);

export default function Generate(props) {
    // interval setzen und sicherstellen, dass es auch wieder gelöscht wird
    useEffect(() => {
        const timer = setInterval(refreshGenerating, 500);
        return () => clearInterval(timer);
    });

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

    // Bild-Informationen vom Server abfragen
    async function getSlideDataByRealIndex(rI) {
        const response = await fetch(`/api/generators/${props.generatorID}/${rI}`, {
            method: "GET",
        });
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
            // Der Server hat mitgeteilt, dass das Bild (noch) nicht generiert werden kann.
            // Als Entschuldigung gibt es ein Katzenbild, welches jedoch nie tatsächlich angezeigt werden sollte
            const data = await response.json();
            return {
                src: `https://placekitten.com/${800}`,
                like: false,
                generating: true,
            };
        } else {
            f7.dialog.close();
            f7.dialog.alert("Serverfehler", "Anfrage fehlgeschlagen");
        }
        f7.dialog.close();
        f7.dialog.alert("Verbindungsfehler", "Es konnte keine Verbindung zum Webserver hergestellt werden.");
        return {
            src: `https://placekitten.com/${800}`,
            like: false,
            generating: true,
        };
    }

    async function getSlideDataBySlideIndex(slideIndex) {
        // Hinweis: slideIndex ist der Index aus dem Swiper (0, 1 oder 2), RealIndex ist Synonym zu actualIndex
        return await getSlideDataByRealIndex(actualIndex + getDirection(currentSlideVisible, slideIndex));
    }

    const [swiperRef, setSwiperRef] = useState(null);
    const [backLink, setBackLink] = useState(true);
    const slideDummy = {
        src: "",
        like: false,
        generating: false,
    };
    const [swiperState, actuallySetSwiperState] = useState({
        slides: [slideDummy, slideDummy, slideDummy],
        currentSlideVisible: 0,
        actualIndex: 0,
    });

    // Das Arbeiten mit dem State leichter machen
    const setSwiperState = function () {
        actuallySetSwiperState({
            slides: slideData,
            currentSlideVisible: currentSlideVisible,
            actualIndex: actualIndex,
        });
    };
    let actualIndex = swiperState.actualIndex;
    let currentSlideVisible = swiperState.currentSlideVisible;
    let slideData = swiperState.slides;

    // Funktion zum Erstellen der anzuzeigenden Slides, index darf nur 0, 1 oder 2 sein (!)
    const makeSlide = function (index) {
        // Liken bzw. unliken Handeln
        async function like(c) {
            if (!slideData[index].like) {
                f7.notification
                    .create({
                        icon: '<img src="/icons/favicon.png">',
                        title: "Direkter Link zu diesem Bild",
                        text: `${window.location.protocol}//${window.location.host}/#!/generator/${props.generatorID}/${actualIndex}/`,
                        closeButton: true,
                        closeTimeout: 4000,
                    })
                    .open();
            }
            const response = await fetch(`/api/generators/${props.generatorID}/${actualIndex}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ like: !slideData[index].like }),
            }).catch((error) => {
                f7.dialog.close();
                f7.dialog.alert("Verbindungsfehler", "Es konnte keine Verbindung zum Webserver hergestellt werden.");
            });
            if (response.status == 200) {
                const data = await response.json();
                // like animation starten und automatisch beenden
                if(!slideData[index].like){
                    setlikeAnimation(true)
                    setTimeout(()=>{setlikeAnimation(false)},1000)
                }
                // alle Slides aktuallisieren, sodass Veränderungen durch das Liken angezeigt werden.
                const d0 = await getSlideDataBySlideIndex(0);
                const d1 = await getSlideDataBySlideIndex(1);
                const d2 = await getSlideDataBySlideIndex(2);
                slideData = [d0, d1, d2];
                setSwiperState();
            } else {
                f7.dialog.close();
                f7.dialog.alert("Serverfehler", "Anfrage fehlgeschlagen");
            }
        }
        const [likeAnimation, setlikeAnimation] = useState(false);
        return (
            <SwiperSlide index={index} key={index} virtualIndex={index} onDoubleClick={like}>
                <div className="heart-underlaying-image">
                    <img
                        src={slideData[index].src}
                        className="swiper-lazy"
                        //style={slideData[index].like ? { opacity: 0.7 } : { opacity: 1 }}
                        style={
                            {
                                border: slideData[index].like ? "10px solid greenyellow": undefined,
                                opacity: likeAnimation ? 0.7 : 1
                            }
                        }
                        alt=""
                    ></img>
                </div>
                <Icon
                    slot="media"
                    f7="heart_circle"
                    className="heart-icon"
                    style={likeAnimation ? { opacity: 1 } : { opacity: 0 }}
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
                </button>*/}
            </SwiperSlide>
        );
    };
    const slides = Array.from({ length: 3 }).map((_, index) => makeSlide(index));

    /*
        Zum Renderen des Swipers wird ein Loop aus nur 3 Slides verwendet, da sich dies als praktikabelste Lösung
        mit dem Swiper-Modul herausgestellt hat. Die Funktion realIndexChange wird bei jedem Slide-Vorgang ausgeführt
        und berechnet den neuen tatsächlichen index (actualIndex) der angezeigten Slide. Anschließend werden die Slides
        so verändert, dass rechts von der aktuell angezeigten Slide das Bild mit actualIndex+1 und links das bild mit
        actualIndex-1 angezeigt wird.
        Sollte das aktuelle Bild (der derzeit anzegeigten Slide) derzeit noch generiert werden, so wird die Funktion 
        refreshGenerating mehrmals pro Sekunde den aktuellen generierungsstatus abfragen und das Bild durch die neuste 
        Iteration ersetzen.
        Liked man ein Bild, so werden alle Slides aktualisiert, um die Änderungen zu übernehmen.
    */
    const realIndexChange = function (ev) {
        // Swipe-Richtung herausfinden
        // ev.realIndex ist der Index der aktuell angezeigten Slide (0, 1 oder 2)
        const direction = getDirection(currentSlideVisible, ev.realIndex);
        currentSlideVisible = ev.realIndex;
        // actualIndex und slides react-state aktualisieren
        if (direction === -1) {
            actualIndex--;
            const indexToModify = (ev.realIndex + 2) % 3;
            slideData[indexToModify] = slideDummy;
            setSwiperState();
            getSlideDataByRealIndex(actualIndex - 1).then((data) => {
                if (data != null) {
                    slideData[indexToModify] = data;
                    setSwiperState();
                }
            });
        } else if (direction === 1) {
            actualIndex++;
            const indexToModify = (ev.realIndex + 1) % 3;
            slideData[indexToModify] = slideDummy;
            setSwiperState();
            getSlideDataByRealIndex(actualIndex + 1).then((data) => {
                if (data != null) {
                    slideData[indexToModify] = data;
                    setSwiperState();
                }
            });
        }
        // Zurücksliden nur genau dann erlauben, wenn das derzeit angezeigte Bild nicht das aller erste ist
        if (actualIndex == 0) {
            ev.allowSlidePrev = false;
            document.getElementsByClassName("swiper-button-prev")[0].classList.add("swiper-button-disabled");
        } else {
            ev.allowSlidePrev = true;
            document.getElementsByClassName("swiper-button-prev")[0].classList.remove("swiper-button-disabled");
        }
        // Weitersliden nur genau dann erlauben, wenn das derzeit angezeigte Bild schon fertig generiert ist (sonst müsste man sowieso erst darauf warten, bevor etwas angezeigt wird)
        if (slideData[ev.realIndex].generating) {
            ev.allowSlideNext = false;
            document.getElementsByClassName("swiper-button-next")[0].classList.add("swiper-button-disabled");
        } else {
            ev.allowSlideNext = true;
            document.getElementsByClassName("swiper-button-next")[0].classList.remove("swiper-button-disabled");
        }
    };
    // Prüfen, ob das aktuelle Bild noch generiert wird und es, wenn ja, aktualisieren
    async function refreshGenerating() {
        if (slideData[currentSlideVisible].generating) {
            const c = currentSlideVisible;
            const a = actualIndex;
            const d = await getSlideDataBySlideIndex(currentSlideVisible);
            // nur dann aktualisieren, wenn in der Zwischenzeit sich die aktuelle Slide nicht geändert hat (sonst könnte ein falsches Bild aktualisiert werden)
            if (c == currentSlideVisible && a == actualIndex) {
                slideData[c] = d;
                if (d.generating == false) {
                    swiperRef.allowSlideNext = true;
                    document.getElementsByClassName("swiper-button-next")[0].classList.remove("swiper-button-disabled");
                }
                setSwiperState();
            }
        }
    }

    async function initialize(ev) {
        // wenn ein Direkt-Link auf ein Bild verwendet wird, dieses Bild anzeigen statt Bild 0
        if ("imageID" in props) {
            actualIndex = parseInt(props.imageID);
            setBackLink(false);
        }
        f7.preloader.show();
        const d0 = await getSlideDataBySlideIndex(0);
        const d1 = await getSlideDataBySlideIndex(1);
        const d2 = await getSlideDataBySlideIndex(2);
        slideData = [d0, d1, d2];
        setSwiperState();
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
