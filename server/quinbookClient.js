const QUINBOOK_CONFIG = {
  iShopConfig: "0396df57e78b6d04b6854dd682e27b3c",
  clientId: "699b2ffc22107ed2300cc0a8",
  url: "https://finest-escape.de/nuernberg/vecnas-game/",
  language: "de",
};

class QuinbookClient {
  constructor() {
    this._token = null;
    this._tokenExp = 0;
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

  _isTokenValid() {
    if (!this._token) return false;
    const nowSec = Math.floor(Date.now() / 1000);
    return this._tokenExp - 300 > nowSec; // 5min buffer
  }

  async getToken() {
    if (this._isTokenValid()) return this._token;

    const res = await fetch("https://api.quinbook.com/v2/shop/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://finest-escape.de",
        Referer: "https://finest-escape.de/",
      },
      body: JSON.stringify(QUINBOOK_CONFIG),
    });

    if (!res.ok) {
      throw new Error(`Quinbook init failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    this._token = data.token ?? data.accessToken ?? data.access_token;

    if (!this._token) {
      throw new Error("No token in Quinbook init response");
    }

    this._tokenExp = this._parseJwtExp(this._token);
    return this._token;
  }

  async getSlots(date) {
    const token = await this.getToken();
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

    return res.json();
  }
}

module.exports = new QuinbookClient();
