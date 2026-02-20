/**
 * discord-presence.js
 * Realtime Discord presence via Lanyard WebSocket API
 * User ID: 657553032678080514
 */

(function () {
  const USER_ID = '657553032678080514';
  const WS_URL  = 'wss://api.lanyard.rest/socket';

  /* ── DOM refs (populated after DOMContentLoaded) ── */
  let elStatus, elStatusText, elStatusDot,
      elActivity, elActivityName, elActivityDetail,
      elActivityState, elActivityImg, elActivityImgWrap,
      elSpotify, elSpotifyTitle, elSpotifyArtist, elSpotifyAlbumArt,
      elSpotifyBar, elSpotifyProgress,
      elAvatar, elTag, elCustomStatus;

  /* ── Status colours ── */
  const STATUS_COLOR = {
    online:    '#23d18b',
    idle:      '#f0a500',
    dnd:       '#f04747',
    offline:   '#747f8d',
  };

  /* ── Spotify progress ticker ── */
  let spotifyInterval = null;
  let spotifyData     = null;

  function tickSpotify() {
    if (!spotifyData) return;
    const now       = Date.now();
    const elapsed   = now - spotifyData.timestamps.start;
    const total     = spotifyData.timestamps.end - spotifyData.timestamps.start;
    const pct       = Math.min(100, (elapsed / total) * 100);
    if (elSpotifyBar) elSpotifyBar.style.width = pct + '%';

    const fmtMs = ms => {
      const s = Math.floor(ms / 1000);
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    };
    if (elSpotifyProgress)
      elSpotifyProgress.textContent = `${fmtMs(elapsed)} / ${fmtMs(total)}`;
  }

  /* ── Render presence data ── */
  function render(data) {
    /* Avatar */
    if (elAvatar && data.discord_user) {
      const u = data.discord_user;
      const avatarUrl = u.avatar
        ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith('a_') ? 'gif' : 'webp'}?size=128`
        : `https://cdn.discordapp.com/embed/avatars/${(BigInt(u.id) >> 22n) % 6n}.png`;
      elAvatar.src = avatarUrl;
      elAvatar.alt = u.username;
    }

    /* Tag */
    if (elTag && data.discord_user) {
      elTag.textContent = '@' + data.discord_user.username;
    }

    /* Status dot + text */
    const status = data.discord_status || 'offline';
    const color  = STATUS_COLOR[status] || STATUS_COLOR.offline;
    if (elStatusDot)  { elStatusDot.style.background = color; elStatusDot.style.boxShadow = `0 0 8px ${color}`; }
    if (elStatusText) elStatusText.textContent = status;
    if (elStatus)     elStatus.dataset.status = status;

    /* Custom status */
    const custom = data.activities?.find(a => a.type === 4);
    if (elCustomStatus) {
      if (custom) {
        elCustomStatus.textContent = (custom.emoji?.name ? custom.emoji.name + '  ' : '') + (custom.state || '');
        elCustomStatus.style.display = '';
      } else {
        elCustomStatus.style.display = 'none';
      }
    }

    /* Spotify */
    clearInterval(spotifyInterval);
    spotifyData = null;
    if (data.listening_to_spotify && data.spotify) {
      const sp = data.spotify;
      if (elSpotify)       elSpotify.style.display = '';
      if (elSpotifyTitle)  elSpotifyTitle.textContent  = sp.song;
      if (elSpotifyArtist) elSpotifyArtist.textContent = sp.artist.replace(/;/g, ',');
      if (elSpotifyAlbumArt && sp.album_art_url) {
        elSpotifyAlbumArt.src   = sp.album_art_url;
        elSpotifyAlbumArt.style.display = '';
      }
      spotifyData = sp;
      tickSpotify();
      spotifyInterval = setInterval(tickSpotify, 1000);
    } else {
      if (elSpotify) elSpotify.style.display = 'none';
    }

    /* Other activity (game / app) — skip Spotify (type 2) and custom (type 4) */
    const activity = data.activities?.find(a => a.type !== 2 && a.type !== 4);
    if (activity) {
      if (elActivity)       elActivity.style.display = '';
      if (elActivityName)   elActivityName.textContent   = activity.name || '';
      if (elActivityDetail) elActivityDetail.textContent = activity.details || '';
      if (elActivityState)  elActivityState.textContent  = activity.state  || '';

      /* Activity image */
      if (elActivityImgWrap) {
        const appId = activity.application_id;
        const largeImg = activity.assets?.large_image;
        if (appId && largeImg) {
          const imgUrl = largeImg.startsWith('mp:external/')
            ? `https://media.discordapp.net/external/${largeImg.replace('mp:external/', '')}`
            : `https://cdn.discordapp.com/app-assets/${appId}/${largeImg}.png`;
          elActivityImg.src = imgUrl;
          elActivityImgWrap.style.display = '';
        } else {
          elActivityImgWrap.style.display = 'none';
        }
      }
    } else {
      if (elActivity) elActivity.style.display = 'none';
    }
  }

  /* ── WebSocket connection ── */
  function connect() {
    const ws = new WebSocket(WS_URL);
    let heartbeatInterval = null;

    ws.addEventListener('open', () => {
      /* Lanyard hello → subscribe */
    });

    ws.addEventListener('message', e => {
      const msg = JSON.parse(e.data);

      if (msg.op === 1) {
        /* Hello — start heartbeat and subscribe */
        heartbeatInterval = setInterval(() => {
          ws.send(JSON.stringify({ op: 3 }));
        }, msg.d.heartbeat_interval);

        ws.send(JSON.stringify({
          op: 2,
          d: { subscribe_to_id: USER_ID }
        }));
      }

      if (msg.op === 0) {
        if (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') {
          render(msg.d);
        }
      }
    });

    ws.addEventListener('close', () => {
      clearInterval(heartbeatInterval);
      setTimeout(connect, 3000); /* reconnect */
    });

    ws.addEventListener('error', () => ws.close());
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    elStatus          = document.getElementById('dc-status');
    elStatusText      = document.getElementById('dc-status-text');
    elStatusDot       = document.getElementById('dc-status-dot');
    elActivity        = document.getElementById('dc-activity');
    elActivityName    = document.getElementById('dc-activity-name');
    elActivityDetail  = document.getElementById('dc-activity-detail');
    elActivityState   = document.getElementById('dc-activity-state');
    elActivityImg     = document.getElementById('dc-activity-img');
    elActivityImgWrap = document.getElementById('dc-activity-img-wrap');
    elSpotify         = document.getElementById('dc-spotify');
    elSpotifyTitle    = document.getElementById('dc-spotify-title');
    elSpotifyArtist   = document.getElementById('dc-spotify-artist');
    elSpotifyAlbumArt = document.getElementById('dc-spotify-art');
    elSpotifyBar      = document.getElementById('dc-spotify-bar');
    elSpotifyProgress = document.getElementById('dc-spotify-progress');
    elAvatar          = document.getElementById('dc-avatar');
    elTag             = document.getElementById('dc-tag');
    elCustomStatus    = document.getElementById('dc-custom-status');

    connect();
  });
})();
