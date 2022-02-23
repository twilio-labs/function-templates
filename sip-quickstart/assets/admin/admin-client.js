class AdminClient {
  constructor() {
    this.isReady = this.token !== null;
  }

  async _handleResponse(response) {
    if (!response.ok) {
      if (response.status === 403) {
        this.token = null;
        this.isReady = false;
      }

      if (response.status === 500) {

        const responseBody = response.json();
        this.token = null;
        this.isReady = false;

        const adminPasswordError = {
          statusCode: response.status,
          message: responseBody.message,
          consoleUrl: responseBody.consoleUrl
        }

        throw adminPasswordError
      }
      // Throw an error
      // eslint-disable-next-line no-throw-literal
      throw {
        statusCode: response.status,
        message: await response.text(),
      };
    }
  }

  async _post(url, obj) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obj),
    });
    await this._handleResponse(response);
    return response.json();
  }

  async checkAdminPassword() {
    const response = await fetch('./check-adminPassword');
    await this._handleResponse(response);
    return response.json();
  }

  async login(password) {
    const result = await this._post('./login', { password });
    this.token = result.token;
    this.isReady = true;
    return this.token !== null;
  }

  async postAction(action) {
    const bodyObj = {
      token: this.token,
      action,
    };
    return this._post('./perform-action', bodyObj);
  }

  async fetchState() {
    if (this.token) {
      const response = await fetch(
        `./check-status?token=${encodeURIComponent(this.token)}`
      );
      await this._handleResponse(response);
      return response.json();
    }
    return false;
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
