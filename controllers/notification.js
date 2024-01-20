const admin = require("firebase-admin");

const serviceAccount = {
  type: "service_account",
  project_id: "oralfish-d697e",
  private_key_id: "77dc017b83c6d71bfd3ac8e114405e4a5494013a",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDCZOL1HpTWgXMA\njkH4NUKY2PpfmSMV8dh8vOnSp2o+6UxwN9aWZ+wslhEMQQREizqGux3/SD8iROBz\nNLU9NzL3dwnzg2zzfCUhdRMWnTXwxMO9fDlqikQRoCRxHL6seW7NvviRAT4B7jAq\npb3TCufeEhY44MQNs5BpOofdgmOeXk7Jrh37Wlki48kuHrlKX63FTMph6Y2AE8MB\nU9Z/gc/6249JHK2AOnhwP1mu45CZ6pA7qARL2NRENCpWS0rKUt00kXXNJkXrMtUR\nsueb0QGg7qNeAmeBv0XdupAol7WCqH9RzUkaw4MUVFqcp027nyIYkM06A57sizcS\nSK5zButDAgMBAAECggEAIqoH2Krz4o5h2gMEG4Uv0365out1WLfwIUo0reZBqWdD\nxK0IXHi6oja+Yn+Dic+EB7t9PWT+MRe0KIcJHJnnwj4dbamNd5u3KVCtrzYohL8p\nonPw7yEpwzTZ2rvD+pCK5DB+NalRi9mUCD7W6zfCIhT6lnjqLQFMqp8P1D2okvgw\n+HzoFcBot/QRz8OiLQTIGu5HyFgjHVdyF6B8yTuXVk5+Fb9tw2whom/rOMzXH4TC\nDTrEXTnnXrGrfTF4ru/9DHBjVJgBBG5taRsyOopdei4ml+SLFDo7CjWdXZ4oh0mx\nuJFIHWxm2DMMd9lnznTFMhppvoEkyghwx/QBAGkTuQKBgQD+XCOpl/BECnndjqY6\nbLKOtGFrWh+gBW4BiBrAYz3GCQLm/Ta95BOYvegdrDReY+KZ/9wE4dbh8re0hbaF\nbU7dHZVh1x+WGdyyFx906DSLGDJzZ40nUCmLwuoz+dUiNyXYGlVBEVYr8LwgzL46\nfYGo7JKSV51Kl1Cfz9yHgMre+QKBgQDDpcOo2UyyWQ0I50dL/2w79HduWcW2M2Me\nzQKetYJb2iBS8mnXJQgKWGrCgZUNr8CUsvenT1IY2+3GInyzCpHwJ7Bo+iXjj2mo\ncvHrbeIwLuiHfyKXLMqtjdvb4FkvKmJaaOu2AboXgEH60Fci87YFTgsBHDBvZ4am\nt1kxnbtfGwKBgQDCLbbv7lT2rISyFgdijL6XYK8KVCfWcq6zLqM1gc2T1CdKDb5v\noqEvNrLvjBoCgQBpjkD53Sq9HR0PDBD1tSfCd6YlpiOv5BhuQGa8SdRq51MEdOX2\nQCUnU+qVOUFzOGSEoD27Sa/eJY6I/6StZEjKm6edXpNucSuUhQuWykSViQKBgCaO\nHR/CKtYerG3rveYhIMAz7fFGKas9NzRTrEeAd38IXkRaVzc5qfr375oDFU+MKgRj\nvGAxRnl1pcbc9vwFgjr0Z1RYr2zHz0eN11TQ47khFVvWVwe5oPtQsFoFPS4JSTaN\n5J2Ke5S0BsyZkAJoSp+DALIoTvc1TJjAGwinD8yvAoGAd/K9xSl2R2s6MtHGKgD9\nZKC4gLr9rA9lOz08AJvLbun4nki8yzibxW7gC7DnKnEVEcOcbDR9A8EXCbRO7aG+\nZLqQQrBuciZI6Go/Wa9UByYI/fzxgwYxdd9jVg2gJy6UJt4MUhHwLCn/7xoUJgMn\njfDlHdFVyTKPuQsCJ7+zlyU=\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-d7822@oralfish-d697e.iam.gserviceaccount.com",
  client_id: "112886385536713231479",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-d7822%40oralfish-d697e.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const singleNotification = async (req, res) => {
  console.log("notificationRouter");
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  const message = {
    token,
    notification: {
      title,
      body,
    },
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      res.status(200).json({ success: true, response });
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error", message: error });
    });
};

module.exports = { singleNotification };
