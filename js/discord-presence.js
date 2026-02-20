/**
 * discord-presence.js
 * Realtime Discord presence via Lanyard WebSocket API
 * User ID: 657553032678080514
 * Features: Spotify link, equalizer bars, elapsed time
 */

(function () {
  const USER_ID = '657553032678080514';
  const WS_URL  = 'wss://api.lanyard.rest/socket';

  /* ── DOM refs ── */
  let elStatus, elStatusText, elStatusDot,
      elActivity, elActivityName, elActivityDetail,
      elActivityState, elActivityImg, elActivityImgWrap, elActivityElapsed,
      elSpotify, elSpotifyTitle, elSpotifyArtist, elSpotifyAlbumArt,
      elSpotifyBar, elSpotifyProgress, elSpotifyEq, elSpotifyLink,
      elAvatar, elTag, elCustomStatus, elIdle;

  /* ── Status colours ── */
  const STATUS_COLOR = {
    online:  '#23d18b',
    idle:    '#f0a500',
    dnd:     '#f04747',
    offline: '#747f8d',
  };

  /* ── Spotify progress + elapsed ticker ── */
  let spotifyInterval   = null;
  let activityInterval  = null;
  let spotifyData       = null;
  let activityStartTime = null;

  const fmtMs = ms => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  const fmtElapsed = ms => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m elapsed`;
    if (m > 0) return `${m}m ${s % 60}s elapsed`;
    return `${s}s elapsed`;
  };

  function tickSpotify() {
    if (!spotifyData) return;
    const elapsed = Date.now() - spotifyData.timestamps.start;
    const total   = spotifyData.timestamps.end - spotifyData.timestamps.start;
    const pct     = Math.min(100, (elapsed / total) * 100);
    if (elSpotifyBar)      elSpotifyBar.style.width = pct + '%';
    if (elSpotifyProgress) elSpotifyProgress.textContent = `${fmtMs(elapsed)} / ${fmtMs(total)}`;
  }

  function tickActivity() {
    if (!activityStartTime || !elActivityElapsed) return;
    elActivityElapsed.textContent = fmtElapsed(Date.now() - activityStartTime);
  }

  /* ── Equalizer animation toggle ── */
  function setEqualizer(playing) {
    if (!elSpotifyEq) return;
    elSpotifyEq.style.display = playing ? 'flex' : 'none';
    /* restart animation by re-inserting bars */
    if (playing) {
      elSpotifyEq.querySelectorAll('.eq-bar').forEach((b, i) => {
        b.style.animationPlayState = 'running';
      });
    }
  }

  /* ── Render ── */
  function render(data) {
    /* Avatar */
    if (elAvatar && data.discord_user) {
      elAvatar.src = avatarUrl(data.discord_user);
    }

    /* Tag */
    if (elTag && data.discord_user) elTag.textContent = '@' + data.discord_user.username;

    /* Status */
    const status = data.discord_status || 'offline';
    const color  = STATUS_COLOR[status] || STATUS_COLOR.offline;
    if (elStatusDot)  { elStatusDot.style.background = color; elStatusDot.style.boxShadow = `0 0 8px ${color}`; }
    if (elStatusText) elStatusText.textContent = status.toUpperCase();
    if (elStatus)     elStatus.dataset.status = status;

    /* Custom status */
    const custom = data.activities?.find(a => a.type === 4);
    if (elCustomStatus) {
      if (custom && (custom.state || custom.emoji?.name)) {
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
      if (elSpotify) elSpotify.style.display = '';
      /* Song title — also a clickable link */
      if (elSpotifyTitle) {
        elSpotifyTitle.textContent = sp.song;
        if (elSpotifyLink) {
          elSpotifyLink.href = sp.track_id
            ? `https://open.spotify.com/track/${sp.track_id}`
            : `https://open.spotify.com/search/${encodeURIComponent(sp.song)}`;
          elSpotifyLink.title = `Open "${sp.song}" in Spotify`;
        }
      }
      if (elSpotifyArtist) elSpotifyArtist.textContent = sp.artist.replace(/;/g, ',');
      if (elSpotifyAlbumArt && sp.album_art_url) {
        elSpotifyAlbumArt.src = sp.album_art_url;
        elSpotifyAlbumArt.style.display = '';
      }
      spotifyData = sp;
      tickSpotify();
      spotifyInterval = setInterval(tickSpotify, 1000);
      setEqualizer(true);
    } else {
      if (elSpotify) elSpotify.style.display = 'none';
      setEqualizer(false);
    }

    /* Other activity */
    clearInterval(activityInterval);
    activityStartTime = null;
    const activity = data.activities?.find(a => a.type !== 2 && a.type !== 4);
    if (activity) {
      if (elActivity) elActivity.style.display = '';
      if (elActivityName)   elActivityName.textContent   = activity.name    || '';
      if (elActivityDetail) elActivityDetail.textContent = activity.details || '';
      if (elActivityState)  elActivityState.textContent  = activity.state   || '';

      /* Elapsed time */
      if (activity.timestamps?.start) {
        activityStartTime = activity.timestamps.start;
        tickActivity();
        activityInterval = setInterval(tickActivity, 1000);
        if (elActivityElapsed) elActivityElapsed.style.display = '';
      } else {
        if (elActivityElapsed) elActivityElapsed.style.display = 'none';
      }

      /* Activity image */
      if (elActivityImgWrap) {
        const appId    = activity.application_id;
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

    /* Idle panel — show only when nothing is happening */
    const hasActivity = (data.listening_to_spotify && data.spotify) || activity;
    if (elIdle) elIdle.style.display = hasActivity ? 'none' : '';
  }

  /* ── Avatar URL helper (no BigInt) ── */
  function avatarUrl(u) {
    if (u.avatar) {
      const ext = u.avatar.startsWith('a_') ? 'gif' : 'webp';
      return `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=128`;
    }
    /* default avatar index = (id >> 22) % 6  — done with string math to avoid BigInt issues */
    const idx = parseInt(u.id.slice(-4), 10) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  }

  /* ── REST fetch for immediate render ── */
  function fetchREST() {
    fetch(`https://api.lanyard.rest/v1/users/${USER_ID}`)
      .then(r => r.json())
      .then(j => { if (j.success) render(j.data); })
      .catch(() => {});
  }

  /* ── WebSocket ── */
  function connect() {
    const ws = new WebSocket(WS_URL);
    let heartbeatInterval = null;

    ws.addEventListener('message', e => {
      const msg = JSON.parse(e.data);
      if (msg.op === 1) {
        heartbeatInterval = setInterval(() => ws.send(JSON.stringify({ op: 3 })), msg.d.heartbeat_interval);
        ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: USER_ID } }));
      }
      if (msg.op === 0 && (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE')) {
        render(msg.d);
      }
    });

    ws.addEventListener('close', () => { clearInterval(heartbeatInterval); setTimeout(connect, 3000); });
    ws.addEventListener('error', () => ws.close());
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    elStatus           = document.getElementById('dc-status');
    elStatusText       = document.getElementById('dc-status-text');
    elStatusDot        = document.getElementById('dc-status-dot');
    elActivity         = document.getElementById('dc-activity');
    elActivityName     = document.getElementById('dc-activity-name');
    elActivityDetail   = document.getElementById('dc-activity-detail');
    elActivityState    = document.getElementById('dc-activity-state');
    elActivityElapsed  = document.getElementById('dc-activity-elapsed');
    elActivityImg      = document.getElementById('dc-activity-img');
    elActivityImgWrap  = document.getElementById('dc-activity-img-wrap');
    elSpotify          = document.getElementById('dc-spotify');
    elSpotifyTitle     = document.getElementById('dc-spotify-title');
    elSpotifyLink      = document.getElementById('dc-spotify-link');
    elSpotifyArtist    = document.getElementById('dc-spotify-artist');
    elSpotifyAlbumArt  = document.getElementById('dc-spotify-art');
    elSpotifyBar       = document.getElementById('dc-spotify-bar');
    elSpotifyProgress  = document.getElementById('dc-spotify-progress');
    elSpotifyEq        = document.getElementById('dc-spotify-eq');
    elAvatar           = document.getElementById('dc-avatar');
    elTag              = document.getElementById('dc-tag');
    elCustomStatus     = document.getElementById('dc-custom-status');
    elIdle             = document.getElementById('dc-idle');

    fetchREST(); /* immediate render from REST */
    connect();   /* then keep live via WebSocket */
  });
})();
