

module.exports = function(app) {

  app.get('/watch', (req, res) => {
    
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>OG Terabox Player</title>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            height: 100%;
            background: linear-gradient(135deg, #ff0844 0%, #ffb199 50%, #ff6b35 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
        }

        .container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            padding: 20px;
            background: 
                radial-gradient(circle at 20% 80%, rgba(255, 8, 68, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.3) 0%, transparent 50%),
                linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.5) 100%);
        }

        .header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding: 15px 25px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 50px;
            border: 2px solid rgba(255, 107, 53, 0.3);
            box-shadow: 0 8px 32px rgba(255, 8, 68, 0.2);
        }

        .logo {
            width: 40px;
            height: 40px;
            margin-right: 15px;
            filter: drop-shadow(0 2px 8px rgba(255, 8, 68, 0.3));
        }

        .title {
            font-size: 24px;
            font-weight: 700;
            color: #fff;
            text-shadow: 0 2px 10px rgba(255, 8, 68, 0.5);
            letter-spacing: 1px;
            background: linear-gradient(45deg, #ff0844, #ff6b35, #ffb199);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .player-wrapper {
            width: 100%;
            max-width: 1200px;
            position: relative;
            background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
            border-radius: 20px;
            box-shadow: 
                0 20px 60px rgba(255, 8, 68, 0.3),
                0 0 0 1px rgba(255, 107, 53, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            overflow: hidden;
            border: 3px solid transparent;
            background-clip: padding-box;
        }

        .player-wrapper::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(45deg, #ff0844, #ff6b35, #ffb199, #ff0844);
            border-radius: 23px;
            z-index: -1;
            opacity: 0.7;
        }

        .video-container {
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: 56.25%; /* 16:9 aspect ratio */
        }

        video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: #000;
        }

        .controls-info {
            padding: 15px 20px;
            background: linear-gradient(135deg, rgba(255, 8, 68, 0.15), rgba(255, 107, 53, 0.1));
            backdrop-filter: blur(20px);
            color: white;
            text-align: center;
            border-top: 1px solid rgba(255, 107, 53, 0.2);
        }

        .stream-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #fff;
            text-shadow: 0 1px 5px rgba(255, 8, 68, 0.3);
        }

        .stream-status {
            font-size: 14px;
            color: #ffb199;
            opacity: 0.9;
            font-weight: 500;
        }

        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 16px;
            z-index: 10;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header {
                margin-bottom: 15px;
                padding: 10px 20px;
            }
            
            .logo {
                width: 35px;
                height: 35px;
                margin-right: 12px;
            }
            
            .title {
                font-size: 20px;
            }
            
            .player-wrapper {
                border-radius: 15px;
                max-width: 100%;
            }
            
            .player-wrapper::before {
                border-radius: 18px;
            }
            
            .video-container {
                padding-bottom: 56.25%;
            }
            
            .controls-info {
                padding: 12px 15px;
            }
            
            .stream-title {
                font-size: 16px;
            }
            
            .stream-status {
                font-size: 13px;
            }
        }

        /* Landscape mode on mobile */
        @media (max-width: 768px) and (orientation: landscape) {
            .container {
                padding: 5px;
            }
            
            .header {
                display: none; /* Hide header in landscape for space */
            }
            
            .video-container {
                padding-bottom: 100vh;
                height: 90vh;
                padding-bottom: 0;
            }
            
            .controls-info {
                display: none; /* Hide info bar in landscape for more space */
            }
            
            .player-wrapper {
                max-width: 100%;
                height: 100%;
                border-radius: 0;
            }
            
            .player-wrapper::before {
                border-radius: 0;
            }
        }

        /* Extra small screens */
        @media (max-width: 480px) {
            .stream-title {
                font-size: 15px;
            }
            
            .stream-status {
                font-size: 12px;
            }
        }

        /* Large screens */
        @media (min-width: 1200px) {
            .video-container {
                padding-bottom: 50%; /* Slightly different ratio for larger screens */
            }
        }

        /* Custom video controls styling */
        video::-webkit-media-controls-panel {
            background-color: rgba(0, 0, 0, 0.8);
        }

        video::-webkit-media-controls-play-button,
        video::-webkit-media-controls-volume-slider,
        video::-webkit-media-controls-timeline {
            filter: brightness(1.2);
        }
    </style>
    <link rel="me" href="https://www.blogger.com/profile/06524804581875423226" />
    <meta name='google-adsense-platform-account' content='ca-host-pub-1556223355139109'/>
    <meta name='google-adsense-platform-domain' content='blogspot.com'/>
</head>
<body>
    <div class="container">
        <div class="header">
            <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#ff0844;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#ff6b35;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ffb199;stop-opacity:1" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <!-- Outer ring -->
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad1)" stroke-width="3" opacity="0.6"/>
                
                <!-- Main box shape -->
                <rect x="25" y="35" width="50" height="30" rx="8" fill="url(#grad1)" filter="url(#glow)"/>
                
                <!-- Play triangle -->
                <polygon points="42,45 42,55 52,50" fill="white" opacity="0.9"/>
                
                <!-- Cloud elements -->
                <circle cx="20" cy="25" r="8" fill="url(#grad1)" opacity="0.4"/>
                <circle cx="80" cy="75" r="6" fill="url(#grad1)" opacity="0.3"/>
                <circle cx="75" cy="20" r="5" fill="url(#grad1)" opacity="0.5"/>
                
                <!-- Tech lines -->
                <line x1="15" y1="70" x2="35" y2="80" stroke="url(#grad1)" stroke-width="2" opacity="0.6"/>
                <line x1="65" y1="20" x2="85" y2="30" stroke="url(#grad1)" stroke-width="2" opacity="0.6"/>
                
                <!-- Center glow -->
                <circle cx="50" cy="50" r="20" fill="url(#grad1)" opacity="0.1"/>
            </svg>
            <div class="title">OG Terabox Player</div>
        </div>
        <div class="player-wrapper">
            <div class="video-container">
                <div class="loading" id="loading">Loading stream...</div>
                <video id="video" controls playsinline allowfullscreen preload="metadata" poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2NzUiIHZpZXdCb3g9IjAgMCAxMjAwIDY3NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjc1IiBmaWxsPSIjMDAwMDAwIi8+Cjx0ZXh0IHg9IjYwMCIgeT0iMzM3LjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCI+U3RyZWFtIFJlYWR5PC90ZXh0Pgo8L3N2Zz4K"></video>
            </div>
            <div class="controls-info">
                <div class="stream-title">Live Stream Player</div>
                <div class="stream-status" id="status">Connecting...</div>
            </div>
        </div>
    </div>

    <script>
        const video = document.getElementById('video');
        const loading = document.getElementById('loading');
        const status = document.getElementById('status');

        function getStreamLinkFromUrl() {
            const params = new URLSearchParams(window.location.search);
            return params.get('streamlink');
        }

        function updateStatus(message) {
            status.textContent = message;
        }

        function hideLoading() {
            loading.style.display = 'none';
        }

        const streamlink = getStreamLinkFromUrl();

        if (!streamlink) {
            updateStatus("Stream link parameter missing in URL");
            hideLoading();
            alert("Stream link parameter missing in URL.");
            throw new Error("Stream link parameter missing");
        }

        try {
            console.log("Stream URL from URL param:", streamlink);
            
            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                
                hls.loadSource(streamlink);
                hls.attachMedia(video);
                
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    hideLoading();
                    updateStatus("Stream ready");
                    video.play().catch(err => {
                        console.warn("Autoplay failed:", err);
                        updateStatus("Tap to play");
                    });
                });
                
                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('HLS.js error:', data);
                    hideLoading();
                    if (data.fatal) {
                        updateStatus("Stream error - please refresh");
                    } else {
                        updateStatus("Minor error - stream continues");
                    }
                });

                hls.on(Hls.Events.BUFFER_APPENDING, () => {
                    updateStatus("Buffering...");
                });

                hls.on(Hls.Events.BUFFER_APPENDED, () => {
                    updateStatus("Playing");
                });
                
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamlink;
                video.addEventListener('loadedmetadata', () => {
                    hideLoading();
                    updateStatus("Stream ready");
                    video.play().catch(err => {
                        console.warn("Autoplay failed:", err);
                        updateStatus("Tap to play");
                    });
                });
                
                video.addEventListener('error', () => {
                    hideLoading();
                    updateStatus("Stream error - please refresh");
                });
                
            } else {
                hideLoading();
                updateStatus("HLS not supported in this browser");
                alert('HLS is not supported in this browser.');
            }

            // Additional video event listeners
            video.addEventListener('play', () => updateStatus("Playing"));
            video.addEventListener('pause', () => updateStatus("Paused"));
            video.addEventListener('waiting', () => updateStatus("Buffering..."));
            video.addEventListener('canplay', () => updateStatus("Ready"));
            
        } catch (error) {
            console.error("Error loading stream:", error);
            hideLoading();
            updateStatus("Failed to load stream");
            alert("Failed to load stream URL.");
        }

        // Prevent context menu on video
        video.addEventListener('contextmenu', e => e.preventDefault());
        
        // Handle fullscreen changes  
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                updateStatus("Fullscreen mode");
            } else {
                updateStatus("Playing");
            }
        });
    </script>
</body>
</html>
`);
  });

};
