import React, { useEffect, useState } from "react";

export default function ExamList() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch("/api/submissions");
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const data = await res.json();
        setSubmissions(data);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError("Unable to load exam submissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Loading submissions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl shadow-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">
        📋 Exam Submissions
      </h1>

      <div className="overflow-x-auto shadow-xl rounded-2x1 border border-green-200">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-green-700 text-white sticky top-0">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">Exam</th>
              <th className="p-4">Examinee</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-center">Score</th>
              <th className="p-4 text-center">Max Score</th>
              <th className="p-4">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="p-6 text-center text-gray-500 italic"
                >
                  No submissions yet.
                </td>
              </tr>
            ) : (
              submissions.map((s, i) => {
                const details =
                  typeof s.details === "string"
                    ? JSON.parse(s.details)
                    : s.details;

                return (
                  <tr
                    key={s.id}
                    className={`transition duration-200 ${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-green-50`}
                  >
                    <td className="p-4 font-medium text-gray-700">{s.id}</td>
                    <td className="p-4 font-semibold text-gray-800">
                      {s.exam ? s.exam.title : `Exam #${s.exam_id}`}
                    </td>
                    <td className="p-4 text-gray-700">
                      {details?.first_name} {details?.last_name}
                    </td>
                    <td className="p-4 text-gray-600">{details?.email}</td>
                    <td className="p-4 text-center font-semibold text-green-700">
                      {s.score}
                    </td>
                    <td className="p-4 text-center text-gray-700">
                      {s.max_score}
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
