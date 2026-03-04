// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './App.css';

// const API_URL = 'http://localhost:5000';

// function VideoCard({ video }) {
//   const [loadIframe, setLoadIframe] = useState(false);
//   const [showError, setShowError] = useState(false);

//   return (
//     <div className="video-card">
//       <h3>{video.name}</h3>
//       {!loadIframe ? (
//         <div className="video-placeholder" onClick={() => setLoadIframe(true)}>
//           <div className="play-button">▶</div>
//           <p>Click to load video</p>
//         </div>
//       ) : (
//         <>
//           <iframe
//             src={video.embedUrl}
//             width="100%"
//             height="315"
//             allow="autoplay"
//             title={video.name}
//             loading="lazy"
//             onError={() => setShowError(true)}
//           />
//           {showError && (
//             <div className="video-error">
//               <p>⚠️ Video taking too long to process</p>
//             </div>
//           )}
//         </>
//       )}
//       <div className="video-info">
//         <small>Created: {new Date(video.createdTime).toLocaleString()}</small>
//       </div>
//       <div className="video-actions">
//         <a href={video.webViewLink} target="_blank" rel="noopener noreferrer" className="action-link">
//           📂 Open in Drive
//         </a>
//         <a href={video.downloadUrl} target="_blank" rel="noopener noreferrer" className="action-link download">
//           ⬇️ Download
//         </a>
//       </div>
//     </div>
//   );
// }

// function App() {
//   const [videos, setVideos] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState('all');
//   const [videoCount, setVideoCount] = useState(0);
//   const [loadAll, setLoadAll] = useState(false);

//   useEffect(() => {
//     fetchVideos();
//   }, []);

//   const fetchVideos = async (filterType = filter) => {
//     setLoading(true);
//     setError(null);
//     try {
//       let url = `${API_URL}/videos`;
//       const params = new URLSearchParams();
      
//       if (filterType === 'top10') {
//         params.append('limit', '10');
//       } else if (filterType === 'last2hours') {
//         params.append('hours', '2');
//       }
      
//       if (params.toString()) {
//         url += `?${params.toString()}`;
//       }
      
//       const response = await axios.get(url);
//       setVideos(response.data.videos);
//       setVideoCount(response.data.count);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to fetch videos');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFilterChange = (newFilter) => {
//     setFilter(newFilter);
//     fetchVideos(newFilter);
//   };

//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>Google Drive Videos</h1>
//         <div className="filter-buttons">
//           <button 
//             onClick={() => handleFilterChange('all')} 
//             className={filter === 'all' ? 'filter-button active' : 'filter-button'}
//           >
//             All Videos
//           </button>
//           <button 
//             onClick={() => handleFilterChange('top10')} 
//             className={filter === 'top10' ? 'filter-button active' : 'filter-button'}
//           >
//             Top 10 Recent
//           </button>
//           <button 
//             onClick={() => handleFilterChange('last2hours')} 
//             className={filter === 'last2hours' ? 'filter-button active' : 'filter-button'}
//           >
//             Last 2 Hours
//           </button>
//         </div>
//         {videoCount > 0 && <p className="video-count">Showing {videoCount} video(s)</p>}
//       </header>

//       {error && <div className="error">{error}</div>}
      
//       {loading && <div className="loading">Loading videos...</div>}

//       {videos.length > 0 && !loadAll && (
//         <div className="load-all-container">
//           <button onClick={() => setLoadAll(true)} className="load-all-button">
//             Load All Videos at Once
//           </button>
//           <p className="load-info">Or click individual videos below to load them one by one</p>
//         </div>
//       )}

//       <div className="video-grid">
//         {videos.map((video) => (
//           loadAll ? (
//             <div key={video.id} className="video-card">
//               <h3>{video.name}</h3>
//               <iframe
//                 src={video.embedUrl}
//                 width="100%"
//                 height="315"
//                 allow="autoplay"
//                 title={video.name}
//                 loading="lazy"
//               />
//               <div className="video-info">
//                 <small>Created: {new Date(video.createdTime).toLocaleString()}</small>
//               </div>
//               <div className="video-actions">
//                 <a href={video.webViewLink} target="_blank" rel="noopener noreferrer" className="action-link">
//                   📂 Open in Drive
//                 </a>
//                 <a href={video.downloadUrl} target="_blank" rel="noopener noreferrer" className="action-link download">
//                   ⬇️ Download
//                 </a>
//               </div>
//             </div>
//           ) : (
//             <VideoCard key={video.id} video={video} />
//           )
//         ))}
//       </div>
//     </div>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LiveCamera from "./components/LiveCamera";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LiveCamera />} />

        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;