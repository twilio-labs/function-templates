module.exports = {
  shouldSucceed: true,
  post: function(url, options) {
    return new Promise((resolve, reject) => {
      if (this.shouldSucceed) {
        process.nextTick(resolve());
      } else {
        process.nextTick(reject(new Error()));
      }
    });
  }
};
