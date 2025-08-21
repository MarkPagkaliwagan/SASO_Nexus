import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import spcLogo from "../images/SPC.png";
import sasoLogo from "../images/SASO.png";

export default function HomePanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/events");
        setEvents(response.data.events || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleFlip = (id) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col font-serif bg-transparent overflow-x-hidden">
      {/* Top Main Panel */}
      <div className="flex flex-row items-center justify-start px-4 pt-4 w-full">
        <img src={spcLogo} alt="SPC Logo" className="w-36 md:w-40 lg:w-44 xl:w-48 object-contain" />
        <img src={sasoLogo} alt="SASO Logo" className="w-24 md:w-28 lg:w-32 xl:w-36 object-contain ml-2 md:ml-4 lg:ml-6" />
        <h1 className="ml-2 md:ml-4 lg:ml-6 text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-green-950 drop-shadow-lg tracking-wider uppercase border-b-4 border-gray-800 pb-0">
          Student Affairs and Services Office
        </h1>
      </div>

      {/* Event Swiper */}
      <div className="mt-6 px-4 w-full">
        {loading ? (
          <p className="text-center mt-4">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-center mt-4">No events found.</p>
        ) : (
          <Swiper
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={1}
            loop={events.length > 1}
            breakpoints={{
              320: { slidesPerView: 1 },
              480: { slidesPerView: 1.2 },
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 2.5 },
              1280: { slidesPerView: 3 },
            }}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            modules={[EffectCoverflow, Pagination, Autoplay]}
            className="mySwiper"
          >
            {events.map((event) => (
              <SwiperSlide
                key={event.id}
                className="w-full h-[400px] flex justify-center"
              >
                <div className="w-full h-full perspective cursor-pointer" onClick={() => handleFlip(event.id)}>
                  <div
                    className={`relative w-full h-full duration-700 [transform-style:preserve-3d] ${
                      flipped[event.id] ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-lg flex justify-center items-center">
                      {event.image ? (
                        <img
                          src={`http://127.0.0.1:8000/storage/${event.image}`}
                          alt={event.description}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-xl shadow-lg p-4 flex flex-col justify-center items-center">
                      <h2 className="text-lg md:text-xl font-semibold mb-2">{event.department}</h2>
                      <span className="text-sm md:text-base text-gray-500 mb-2">{event.academic_year}</span>
                      <p className="text-sm md:text-base text-center text-gray-700">{event.description}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Other content below will naturally appear here */}
      
      <style>{`
        .perspective { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
