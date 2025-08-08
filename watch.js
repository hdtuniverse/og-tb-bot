module.exports = function(app) {
  app.get('/watch', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>OG Terabox Player Pro</title>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --dark-bg: #0a0a0a;
            --card-bg: rgba(255, 255, 255, 0.05);
            --glass-bg: rgba(255, 255, 255, 0.1);
            --text-primary: #ffffff;
            --text-secondary: #b3b3b3;
            --border-color: rgba(255, 255, 255, 0.1);
            --shadow-primary: 0 20px 40px rgba(0, 0, 0, 0.3);
            --shadow-glow: 0 0 30px rgba(102, 126, 234, 0.3);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            height: 100%;
            background: var(--dark-bg);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow-x: hidden;
            color: var(--text-primary);
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(79, 172, 254, 0.1) 0%, transparent 50%);
            z-index: -1;
        }

        .container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            gap: 20px;
        }

        .header {
            display: flex;
            align-items: center;
            padding: 20px 30px;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border-radius: 60px;
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-primary);
            transition: all 0.3s ease;
        }

        .header:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-glow);
        }

        .logo {
            width: 50px;
            height: 50px;
            margin-right: 20px;
            filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.4));
        }

        .title {
            font-size: 28px;
            font-weight: 700;
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
        }

        .player-container {
            width: 100%;
            max-width: 1400px;
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-primary);
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .player-container:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-glow);
        }

        .video-wrapper {
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: 56.25%;
            background: #000;
            border-radius: 20px 20px 0 0;
            overflow: hidden;
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

        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10;
            transition: opacity 0.3s ease;
        }

        .loading-spinner {
            width: 60px;
            height: 60px;
            border: 3px solid rgba(102, 126, 234, 0.3);
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .loading-text {
            font-size: 18px;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 10px;
        }

        .loading-subtext {
            font-size: 14px;
            color: var(--text-secondary);
            text-align: center;
            max-width: 300px;
        }

        .player-info {
            padding: 25px 30px;
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
        }

        .stream-title {
            font-size: 22px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 12px;
            line-height: 1.3;
        }

        .stream-meta {
            display: flex;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: var(--glass-bg);
            border-radius: 20px;
            border: 1px solid var(--border-color);
            font-size: 14px;
            font-weight: 500;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            animation: pulse 2s infinite;
        }

        .status-dot.error {
            background: #ef4444;
        }

        .status-dot.warning {
            background: #f59e0b;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .quality-badge {
            padding: 6px 12px;
            background: var(--accent-gradient);
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .controls-panel {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid var(--border-color);
        }

        .control-group {
            display: flex;
            gap: 10px;
        }

        .control-btn {
            padding: 10px 16px;
            background: var(--glass-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
        }

        .control-btn:hover {
            background: var(--primary-gradient);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .error-message {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
            padding: 20px;
            border-radius: 16px;
            margin: 20px;
            text-align: center;
            font-weight: 500;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .container {
                padding: 15px;
                gap: 15px;
            }
            
            .header {
                padding: 15px 25px;
                border-radius: 50px;
            }
            
            .logo {
                width: 40px;
                height: 40px;
                margin-right: 15px;
            }
            
            .title {
                font-size: 22px;
            }
            
            .player-container {
                border-radius: 20px;
            }
            
            .video-wrapper {
                border-radius: 16px 16px 0 0;
            }
            
            .player-info {
                padding: 20px;
            }
            
            .stream-title {
                font-size: 18px;
            }
            
            .stream-meta {
                gap: 15px;
            }
            
            .controls-panel {
                flex-direction: column;
                gap: 15px;
                align-items: stretch;
            }
            
            .control-group {
                justify-content: center;
                flex-wrap: wrap;
            }
        }

        /* Landscape mode on mobile */
        @media (max-width: 768px) and (orientation: landscape) {
            .container {
                padding: 10px;
                justify-content: flex-start;
            }
            
            .header {
                display: none;
            }
            
            .player-container {
                max-width: 100%;
                height: 90vh;
                display: flex;
                flex-direction: column;
            }
            
            .video-wrapper {
                flex: 1;
                padding-bottom: 0;
                height: auto;
                border-radius: 16px 16px 0 0;
            }
            
            .player-info {
                padding: 15px 20px;
            }
        }

        /* Large screens */
        @media (min-width: 1200px) {
            .video-wrapper {
                padding-bottom: 50%;
            }
            
            .title {
                font-size: 32px;
            }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--primary-gradient);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--secondary-gradient);
        }

        /* Video controls styling */
        video::-webkit-media-controls-panel {
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
        }

        video::-webkit-media-controls-play-button,
        video::-webkit-media-controls-volume-slider,
        video::-webkit-media-controls-timeline {
            filter: brightness(1.2) saturate(1.2);
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }

        /* Focus styles for keyboard navigation */
        .control-btn:focus {
            outline: 2px solid #667eea;
            outline-offset: 2px;
        }

        video:focus {
            outline: 3px solid #667eea;
            outline-offset: 4px;
        }
    </style>
    <link rel="me" href="https://www.blogger.com/profile/06524804581875423226" />
    <meta name='google-adsense-platform-account' content='ca-host-pub-1556223355139109'/>
    <meta name='google-adsense-platform-domain' content='blogspot.com'/>
</head>
<body>
    <div class="container">
        <header class="header">
            <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#4facfe;stop-opacity:1" />
                    </linearGradient>
                    <filter id="logoGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGrad)" stroke-width="2" opacity="0.5"/>
                <rect x="20" y="30" width="60" height="40" rx="12" fill="url(#logoGrad)" filter="url(#logoGlow)" opacity="0.9"/>
                <polygon points="40,42 40,58 58,50" fill="white" opacity="0.95"/>
                <circle cx="15" cy="20" r="6" fill="url(#logoGrad)" opacity="0.4"/>
                <circle cx="85" cy="80" r="4" fill="url(#logoGrad)" opacity="0.3"/>
                <circle cx="80" cy="15" r="3" fill="url(#logoGrad)" opacity="0.5"/>
            </svg>
            <h1 class="title">OG Terabox Player Pro</h1>
        </header>

        <main class="player-container">
            <div class="video-wrapper">
                <div class="loading-overlay" id="loadingOverlay">
                    <div class="loading-spinner"></div>
                    <div class="loading-text" id="loadingText">Initializing Player...</div>
                    <div class="loading-subtext" id="loadingSubtext">Preparing your streaming experience</div>
                </div>
                <video 
                    id="videoPlayer" 
                    controls 
                    playsinline 
                    allowfullscreen 
                    preload="metadata"
                    crossorigin="anonymous"
                    poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwMCIgaGVpZ2h0PSI3ODciIHZpZXdCb3g9IjAgMCAxNDAwIDc4NyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE0MDAiIGhlaWdodD0iNzg3IiBmaWxsPSIjMDAwMDAwIi8+CjxjaXJjbGUgY3g9IjcwMCIgY3k9IjM5My41IiByPSI2MCIgZmlsbD0iIzY2N2VlYSIgb3BhY2l0eT0iMC44Ii8+Cjxwb2x5Z29uIHBvaW50cz0iNjgwLDM2MyA2ODAsMzk0IDcyMCwzOTMuNSIgZmlsbD0iI0ZGRkZGRiIvPgo8dGV4dCB4PSI3MDAiIHk9IjQ2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRkZGRiIgZm9udC1mYW1pbHk9IkludGVyIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iNTAwIj5TdHJlYW0gUmVhZHk8L3RleHQ+Cjwvc3ZnPgo="
                    aria-label="Video player">
                </video>
            </div>
            
            <div class="player-info">
                <h2 class="stream-title" id="streamTitle">Live Stream Player</h2>
                <div class="stream-meta">
                    <div class="status-indicator">
                        <div class="status-dot" id="statusDot"></div>
                        <span id="statusText">Connecting...</span>
                    </div>
                    <div class="quality-badge" id="qualityBadge">HD</div>
                </div>
                
                <div class="controls-panel">
                    <div class="control-group">
                        <button class="control-btn" id="refreshBtn" onclick="refreshStream()">
                            🔄 Refresh
                        </button>
                        <button class="control-btn" id="fullscreenBtn" onclick="toggleFullscreen()">
                            ⛶ Fullscreen
                        </button>
                    </div>
                    <div class="control-group">
                        <button class="control-btn" id="pipBtn" onclick="togglePiP()" style="display: none;">
                            📺 Picture-in-Picture
                        </button>
                        <button class="control-btn" id="downloadBtn" onclick="downloadStream()" style="display: none;">
                            ⬇ Download
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        class TeraboxPlayer {
            constructor() {
                this.video = document.getElementById('videoPlayer');
                this.loadingOverlay = document.getElementById('loadingOverlay');
                this.loadingText = document.getElementById('loadingText');
                this.loadingSubtext = document.getElementById('loadingSubtext');
                this.statusText = document.getElementById('statusText');
                this.statusDot = document.getElementById('statusDot');
                this.qualityBadge = document.getElementById('qualityBadge');
                this.streamTitle = document.getElementById('streamTitle');
                this.pipBtn = document.getElementById('pipBtn');
                
                this.hls = null;
                this.streamUrl = this.getStreamUrl();
                this.retryCount = 0;
                this.maxRetries = 3;
                
                this.init();
            }

            getStreamUrl() {
                const params = new URLSearchParams(window.location.search);
                return params.get('streamlink');
            }

            init() {
                if (!this.streamUrl) {
                    this.showError('Stream URL parameter missing', 'Please provide a valid streamlink parameter in the URL');
                    return;
                }

                // Check for Picture-in-Picture support
                if ('pictureInPictureEnabled' in document) {
                    this.pipBtn.style.display = 'block';
                }

                this.setupEventListeners();
                this.loadStream();
            }

            setupEventListeners() {
                // Video events
                this.video.addEventListener('loadstart', () => this.updateStatus('Loading...', 'warning'));
                this.video.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
                this.video.addEventListener('canplay', () => this.updateStatus('Ready to play', 'success'));
                this.video.addEventListener('play', () => this.updateStatus('Playing', 'success'));
                this.video.addEventListener('pause', () => this.updateStatus('Paused', 'warning'));
                this.video.addEventListener('waiting', () => this.updateStatus('Buffering...', 'warning'));
                this.video.addEventListener('error', (e) => this.handleVideoError(e));
                this.video.addEventListener('ended', () => this.updateStatus('Stream ended', 'error'));

                // Fullscreen events
                document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
                
                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => this.handleKeyboard(e));

                // Prevent context menu
                this.video.addEventListener('contextmenu', e => e.preventDefault());
            }

            async loadStream() {
                try {
                    this.updateLoadingText('Connecting to stream...', 'Establishing secure connection');
                    
                    if (Hls.isSupported()) {
                        await this.loadHLSStream();
                    } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
                        await this.loadNativeStream();
                    } else {
                        throw new Error('HLS streaming not supported in this browser');
                    }
                } catch (error) {
                    console.error('Stream loading error:', error);
                    this.handleStreamError(error);
                }
            }

            async loadHLSStream() {
                this.hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90,
                    maxBufferLength: 30,
                    maxMaxBufferLength: 600,
                    startLevel: -1,
                    autoStartLoad: true,
                    debug: false
                });

                this.hls.loadSource(this.streamUrl);
                this.hls.attachMedia(this.video);

                this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                    this.onManifestParsed(data);
                });

                this.hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
                    this.updateQualityBadge(data);
                });

                this.hls.on(Hls.Events.ERROR, (event, data) => {
                    this.handleHLSError(data);
                });

                this.hls.on(Hls.Events.BUFFER_APPENDING, () => {
                    this.updateStatus('Buffering...', 'warning');
                });

                this.hls.on(Hls.Events.BUFFER_APPENDED, () => {
                    this.updateStatus('Playing', 'success');
                });
            }

            async loadNativeStream() {
                this.video.src = this.streamUrl;
                
                return new Promise((resolve, reject) => {
                    this.video.addEventListener('loadedmetadata', resolve, { once: true });
                    this.video.addEventListener('error', reject, { once: true });
                });
            }

            onManifestParsed(data) {
                this.hideLoading();
                this.updateStatus('Stream ready', 'success');
                
                // Auto-play with user gesture fallback
                this.video.play().catch(err => {
                    console.warn('Autoplay failed:', err);
                    this.updateStatus('Tap to play', 'warning');
                });

                // Update stream info
                if (data.levels && data.levels.length > 0) {
                    const maxLevel = Math.max(...data.levels.map(l => l.height));
                    this.updateQualityDisplay(maxLevel);
                }
            }

            onMetadataLoaded() {
                this.hideLoading();
                const duration = this.video.duration;
                if (duration && isFinite(duration)) {
                    this.streamTitle.textContent = \`Video Stream (\${this.formatDuration(duration)})\`;
                } else {
                    this.streamTitle.textContent = 'Live Stream';
                }
            }

            handleHLSError(data) {
                console.error('HLS Error:', data);
                
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            this.retryStream('Network error - retrying...');
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            this.hls.recoverMediaError();
                            this.updateStatus('Recovering from media error...', 'warning');
                            break;
                        default:
                            this.showError('Fatal streaming error', data.details || 'Unknown error occurred');
                            break;
                    }
                } else {
                    this.updateStatus('Minor error - stream continues', 'warning');
                }
            }

            handleVideoError(event) {
                const error = this.video.error;
                let message = 'Video playback error';
                
                if (error) {
                    switch (error.code) {
                        case error.MEDIA_ERR_ABORTED:
                            message = 'Video loading aborted';
                            break;
                        case error.MEDIA_ERR_NETWORK:
                            message = 'Network error occurred';
                            break;
                        case error.MEDIA_ERR_DECODE:
                            message = 'Video decoding error';
                            break;
                        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                            message = 'Video format not supported';
                            break;
                    }
                }
                
                this.showError(message, 'Please try refreshing the page');
            }

            retryStream(message) {
                if (this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    this.updateStatus(\`\${message} (Attempt \${this.retryCount}/\${this.maxRetries})\`, 'warning');
                    
                    setTimeout(() => {
                        if (this.hls) {
                            this.hls.destroy();
                        }
                        this.loadStream();
                    }, 2000);
                } else {
                    this.showError('Connection failed', 'Maximum retry attempts reached. Please refresh the page.');
                }
            }

            updateStatus(message, type = 'success') {
                this.statusText.textContent = message;
                this.statusDot.className = \`status-dot \${type === 'success' ? '' : type}\`;
            }

            updateLoadingText(main, sub) {
                this.loadingText.textContent = main;
                this.loadingSubtext.textContent = sub;
            }

            updateQualityBadge(data) {
                if (data.level && data.level.height) {
                    this.updateQualityDisplay(data.level.height);
                }
            }

            updateQualityDisplay(height) {
                let quality = 'SD';
                if (height >= 2160) quality = '4K';
                else if (height >= 1440) quality = '2K';
                else if (height >= 1080) quality = 'FHD';
                else if (height >= 720) quality = 'HD';
                
                this.qualityBadge.textContent = quality;
            }

            hideLoading() {
                this.loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    this.loadingOverlay.style.display = 'none';
                }, 300);
            }

            showError(title, message) {
                this.hideLoading();
                this.updateStatus('Error', 'error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.innerHTML = \`
                    <h3 style="margin-bottom: 10px; font-size: 18px;">\${title}</h3>
                    <p>\${message}</p>
                \`;
                
                this.video.parentNode.appendChild(errorDiv);
            }

            formatDuration(seconds) {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = Math.floor(seconds % 60);
                
                if (hours > 0) {
                    return \`\${hours}:\${minutes.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
                }
                return \`\${minutes}:\${secs.toString().padStart(2, '0')}\`;
            }

            handleFullscreenChange() {
                const isFullscreen = document.fullscreenElement !== null;
                this.updateStatus(isFullscreen ? 'Fullscreen mode' : 'Normal view', 'success');
            }

            handleKeyboard(event) {
                if (event.target === this.video || event.target === document.body) {
                    switch (event.code) {
                        case 'Space':
                            event.preventDefault();
                            this.video.paused ? this.video.play() : this.video.pause();
                            break;
                        case 'KeyF':
                            event.preventDefault();
                            toggleFullscreen();
                            break;
                        case 'KeyM':
                            event.preventDefault();
                            this.video.muted = !this.video.muted;
                            break;
                        case 'KeyR':
                            event.preventDefault();
                            refreshStream();
                            break;
                    }
                }
            }
        }

        // Global functions for button controls
        function refreshStream() {
            location.reload();
        }

        function toggleFullscreen() {
            const player = document.querySelector('.player-container');
            
            if (!document.fullscreenElement) {
                player.requestFullscreen().catch(err => {
                    console.error('Fullscreen error:', err);
                });
            } else {
                document.exitFullscreen();
            }
        }

        async function togglePiP() {
            const video = document.getElementById('videoPlayer');
            
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else {
                    await video.requestPictureInPicture();
                }
            } catch (error) {
                console.error('Picture-in-Picture error:', error);
            }
        }

        function downloadStream() {
            const streamUrl = new URLSearchParams(window.location.search).get('streamlink');
            if (streamUrl) {
                const a = document.createElement('a');
                a.href = streamUrl;
                a.download = 'stream.m3u8';
                a.click();
            }
        }

        // Initialize player when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new TeraboxPlayer();
        });

        // Service Worker for offline support (optional)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.log('Service Worker registration failed:', err);
            });
        }
    </script>
</body>
</html>
`);
  });
};
