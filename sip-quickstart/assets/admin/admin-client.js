class AdminClient {

  constructor() {
    this.isReady = this.token !== null;
  }

  async _handleResponse(response) {
    if (!response.ok) {
      if (response.status === 403) {
        console.warn('Invalid token, resetting client');
        this.token = null;
        this.isReady = false;
      }
      // Throw an error
      throw {
        statusCode: response.status,
        message: await response.text()
      }; 
    }
  }

  async _post(url, obj) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(obj)
    });
    await this._handleResponse(response);
    return await response.json();
  }
  
  async login(password) {
    try {
      const result = await this._post("./login", {password});
      this.token = result.token;
      this.isReady = true;
    } catch(err) {
      console.error(`${err.statusCode}: ${err.message}`);
    }
    return this.token !== null;
  }

  async postAction(action) {
    const bodyObj = {
      token: this.token,
      action: action
    };
    return await this._post("./perform-action", bodyObj);
  }

  async fetchState() {
    const response = await fetch(
      `./check-status?token=${encodeURIComponent(this.token)}`
    );
    await this._handleResponse(response);
    return await response.json();
  }

  get token() {
    return localStorage.getItem('adminToken');
  }

  set token(adminToken) {
    if (adminToken !== null && adminToken !== undefined) {
      localStorage.setItem('adminToken', adminToken);
    } else {
      localStorage.removeItem('adminToken');
    }
  }
}
