import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserGraduate,
  FaHeartbeat,
  FaCross,
  FaRunning,
  FaUsers,
} from "react-icons/fa";
import { formatDistanceToNow, parseISO, isValid, format } from "date-fns";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

const Department = () => {
  const [announcements, setAnnouncements] = useState([]);

  const departments = [
    {
      name: "Guidance Office",
      description:
        "The Guidance Office serves as a cornerstone for student well-being, offering support for personal, academic, and career development.\nThey help students navigate challenges and prepare for their future goals.",
      icon: <FaUserGraduate className="text-blue-500 w-12 h-12" />,
    },
    {
      name: "Student Formation and Development Unit (SFDU)",
      description:
        "SFDU emphasizes leadership, spirituality, and community engagement through programs and retreats.\nIt nurtures values and builds stronger student leaders.",
      icon: <FaUsers className="text-green-500 w-12 h-12" />,
    },
    {
      name: "School Clinic",
      description:
        "The School Clinic maintains student health and safety through first aid services and wellness programs.\nIt ensures that medical attention is always available inside the campus.",
      icon: <FaHeartbeat className="text-red-500 w-12 h-12" />,
    },
    {
      name: "Campus Ministry",
      description:
        "Campus Ministry provides spiritual guidance and fosters a faith-centered campus community.\nIt helps students grow in faith while serving others.",
      icon: <FaCross className="text-purple-500 w-12 h-12" />,
    },
    {
      name: "Sports Development Unit",
      description:
        "Promotes physical fitness and sportsmanship through organized sports and wellness initiatives.\nIt encourages discipline, teamwork, and a healthy lifestyle.",
      icon: <FaRunning className="text-yellow-500 w-12 h-12" />,
    },
  ];

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/announcements")
      .then((res) => setAnnouncements(res.data))
      .catch((err) => console.error(err));
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    const parsed = parseISO(timestamp);
    if (isValid(parsed)) {
      return formatDistanceToNow(parsed, { addSuffix: true });
    } else {
      return format(new Date(), "MMM dd, yyyy hh:mm a");
    }
  };

  return (
    <div className="w-full mt-10 px-4">
      {/* Departments Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 border-b-2 border-gray-300 pb-2">
          Departments
        </h2>
        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          initialSlide={Math.floor(departments.length / 2)}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination]}
          className="mySwiper"
        >
          {departments.map((dept, index) => (
            <SwiperSlide key={index} className="w-[420px] h-[420px] flex">
              <div className="box w-full h-full flex flex-col items-center justify-start text-center p-6">
                <div className="text-6xl mb-4">{dept.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  {dept.name}
                </h3>
                <div className="text-gray-700 text-base space-y-3">
                  {dept.description.split("\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Announcements Section */}
      <section>
        <h2 className="text-3xl font-bold mb-6 border-b-2 border-gray-300 pb-2">
          Announcements
        </h2>
        <div className="flex flex-col gap-6">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 max-w-2xl w-full mx-auto flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center p-4 border-b border-gray-200 gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                  {a.department[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">
                    {a.department}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {formatTimestamp(a.created_at)}
                  </div>
                </div>
              </div>

              {/* Content with preserved line breaks */}
              <div className="px-4 py-2 text-gray-700 space-y-2">
                {a.announcement.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              {/* Media (image or video) */}
              {(a.image || a.video) && (
                <div className="flex flex-col justify-center items-center mb-4 gap-4">
                  {a.image && (
                    <img
                      src={`http://127.0.0.1:8000/storage/${a.image}`}
                      alt="announcement"
                      className="rounded-xl object-cover w-full max-w-md hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {a.video && (
                    <video
                      src={`http://127.0.0.1:8000/storage/${a.video}`}
                      controls
                      className="rounded-xl w-full max-w-md hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-200 text-gray-500 text-sm italic text-center">
                Posted by {a.department} • {formatTimestamp(a.created_at)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Department;
