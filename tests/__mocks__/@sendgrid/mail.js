let lastEmailPayload;

module.exports = {
  setApiKey: jest.fn(),
  send: jest.fn((payload) => {
    lastEmailPayload = payload;
    return Promise.resolve([{ statusCode: 202 }]);
  }),
  __getLastEmailPayload: () => lastEmailPayload
};