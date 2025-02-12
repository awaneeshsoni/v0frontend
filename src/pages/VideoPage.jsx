import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

function VideoPage() {
  const { wsid, vid } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [name, setName] = useState(localStorage.getItem("username") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/video/${vid}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (res.ok) {
          setVideo(data);
          setComments(data.comments || []);
        }
      } catch (err) {
        console.error("Error fetching video:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [vid]);

  const handleAddComment = async () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!commentText.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    setError(""); // Clear previous errors
    const timestamp = videoRef.current.currentTime.toFixed(2); // Ensure timestamp is captured

    const newComment = { name, text: commentText, timestamp };

    try {
      const res = await fetch(`http://localhost:5000/api/video/${vid}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      });

      const data = await res.json();
      console.log("New comment response:", data);

      if (res.ok) {
        setComments([...comments, newComment]); // Ensure new comment is added properly
        setCommentText(""); // Clear input
        videoRef.current.play(); // Resume video
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <div className="p-6 flex gap-6 h-[90vh]">
      {/* Video Section */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">{video ? video.title : "Loading..."}</h2>
        <div className="flex-1 max-h-[70vh] overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="animate-spin border-4 border-gray-400 border-t-black rounded-full w-12 h-12"></div>
            </div>
          ) : (
            <video ref={videoRef} controls className="w-full h-full">
              <source src={video?.url} type="video/mp4" />
            </video>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="w-80 bg-gray-100 p-4 rounded-lg shadow flex flex-col">
        <h3 className="text-xl font-bold mb-3">Comments</h3>

        {/* Error Message */}
        {error && <p className="text-red-500 mb-2">{error}</p>}

        {/* Name Input */}
        {!localStorage.getItem("username") && (
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
        )}

        {/* Comments List (Scrollable) */}
        <div className="flex-1 overflow-y-auto max-h-[50vh]">
          {comments === null ? (
            <div className="flex justify-center">
              <div className="animate-spin border-4 border-gray-400 border-t-black rounded-full w-8 h-8"></div>
            </div>
          ) : (
            comments.map((c, index) => (
              <div
                key={index}
                className="p-2 bg-white border rounded cursor-pointer mb-2"
                onClick={() => {
                  if (c.timestamp !== undefined) {
                    videoRef.current.currentTime = parseFloat(c.timestamp); // Ensure it's a number
                  }
                }}
              >
                <p className="text-sm font-bold">{c.name || "Unknown"}</p>
                <p>{c.text || "No comment text"}</p>
                <p className="text-xs text-gray-500">
                  ⏳ {c.timestamp !== undefined ? parseFloat(c.timestamp).toFixed(2) + "s" : "No timestamp"}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Comment Input (Pauses video when focused) */}
        <textarea
          placeholder="Add a comment..."
          value={commentText}
          onFocus={() => videoRef.current.pause()} // Pause video immediately on focus
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full p-2 border rounded mt-2"
        />
        <button className="w-full bg-black text-white py-2 rounded mt-2" onClick={handleAddComment}>
          Add Comment
        </button>
      </div>
    </div>
  );
}

export default VideoPage;
