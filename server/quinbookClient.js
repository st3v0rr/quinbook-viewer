const ROOMS = {
  prestige: {
    label: "Prestige",
    iShopConfig: "0396df57e78b6d04b6854dd682e27b3c",
    clientId: "699b2ffc22107ed2300cc0a8",
    url: "https://finest-escape.de/nuernberg/prestige/",
    language: "de",
    bookingUrl: "https://finest-escape.de/nuernberg/prestige/#Buchung",
  },
  henker: {
    label: "Der Henker",
    iShopConfig: "63154d5661f774fb7d2d11701d466aa2",
    clientId: "699b2ffc22107ed2300cc0a8",
    url: "https://finest-escape.de/nuernberg/der-henker/",
    language: "de",
    bookingUrl: "https://finest-escape.de/nuernberg/der-henker/#Buchung",
  },
  vecnas: {
    label: "Vecna's Game",
    iShopConfig: "65586803f1435736f42a541d3a924595",
    clientId: "699b2ffc22107ed2300cc0a8",
    url: "https://finest-escape.de/nuernberg/vecnas-game/#Buchung",
    language: "de",
    bookingUrl: "https://finest-escape.de/nuernberg/vecnas-game/#Buchung",
  },
};

class QuinbookClient {
  constructor() {
    this._tokens = {};
    this._tokenExps = {};
    this._tokenPromises = {};
  }

  _parseJwtExp(token) {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      return decoded.exp ?? 0;
    } catch {
      return 0;
    }
  }

  _isTokenValid(roomKey) {
    if (!this._tokens[roomKey]) return false;
    const nowSec = Math.floor(Date.now() / 1000);
    return this._tokenExps[roomKey] - 300 > nowSec;
  }

  async getToken(roomKey) {
    if (this._isTokenValid(roomKey)) return this._tokens[roomKey];
    if (this._tokenPromises[roomKey]) return this._tokenPromises[roomKey];

    const config = ROOMS[roomKey];
    console.log(`[quinbook] fetching new token for ${roomKey}`);

    this._tokenPromises[roomKey] = fetch("https://api.quinbook.com/v2/shop/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://finest-escape.de",
        Referer: "https://finest-escape.de/",
      },
      body: JSON.stringify({
        iShopConfig: config.iShopConfig,
        clientId: config.clientId,
        url: config.url,
        language: config.language,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Quinbook init failed: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        const token = data.authToken ?? data.token ?? data.accessToken ?? data.access_token;
        if (!token) throw new Error("No token in Quinbook init response");
        this._tokens[roomKey] = token;
        this._tokenExps[roomKey] = this._parseJwtExp(token);
        const expiresAt = new Date(this._tokenExps[roomKey] * 1000).toISOString();
        console.log(`[quinbook] token for ${roomKey} acquired, expires at ${expiresAt}`);
        return token;
      })
      .finally(() => {
        this._tokenPromises[roomKey] = null;
      });

    return this._tokenPromises[roomKey];
  }

  async getSlots(roomKey, date) {
    const token = await this.getToken(roomKey);
    console.log(`[quinbook] fetching slots for ${roomKey} ${date}`);
    const start = Date.now();
    const res = await fetch(
      `https://api.quinbook.com/v2/shop/slots/${date}?tzoffset=-60`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Origin: "https://finest-escape.de",
          Referer: "https://finest-escape.de/",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Quinbook slots failed for ${date}: ${res.status} ${res.statusText}`);
    }

    const ms = Date.now() - start;
    console.log(`[quinbook] slots for ${roomKey} ${date} received in ${ms}ms`);
    return res.json();
  }
}

module.exports = { client: new QuinbookClient(), ROOMS };
