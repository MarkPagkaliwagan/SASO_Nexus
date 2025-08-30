import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";

export default function EventList() {
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

  if (loading) return <p className="text-center mt-4">Loading events...</p>;
  if (events.length === 0) return <p className="text-center mt-4">No events found.</p>;

  return (
    <div className="p-4 overflow-x-auto">
      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={1}
        loop={events.length > 1}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 2 },
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
            className="w-full sm:w-[250px] md:w-[300px] lg:w-[320px] xl:w-[350px] h-[400px] flex justify-center"
          >
            <div className="w-full h-full perspective cursor-pointer" onClick={() => handleFlip(event.id)}>
              <div
                className={`relative w-full h-full duration-700 [transform-style:preserve-3d] ${
                  flipped[event.id] ? "rotate-y-180" : ""
                }`}
              >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden rounded-xl overflow-auto shadow-lg flex justify-center items-center">
                  {event.image ? (
                    <img
                      src={`http://127.0.0.1:8000/storage/${event.image}`}
                      alt={event.description}
                      className="w-auto h-auto max-w-full max-h-full rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>

                {/* Back */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-xl shadow-lg p-4 flex flex-col justify-center items-center">
                  <h2 className="text-lg font-semibold mb-2">{event.department}</h2>
                  <span className="text-sm text-gray-500 mb-2">{event.academic_year}</span>
                  <p className="text-gray-700 text-center">{event.description}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .perspective { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
