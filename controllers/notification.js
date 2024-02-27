const admin = require("firebase-admin");

const serviceAccount = {
  type: "service_account",
  project_id: "rojgar-8ee2d",
  private_key_id: "318019896e4b8109a6d0460f59ea7ecdc426f5f5",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCs0r3dolqxEM+u\nr/EGRGK9ohz2LcGcxLO5VnLKS3S5Wyp+QGEMKdSS+wx3N/dvqXzpceOwS5aXO9Qz\nCTZYFZjomcfnucFUsVzvDb4daYnN3uAyreMrvUgNZfQkYFtYCON5l6zG+JuLKvoA\n6DqwIW6XKdWJzo+YRYmZhkponbreheOiylHiD5M8eBKAyRamAB9EQO1JjUOiMj6A\ns0s1xmFPX+ZoV7dDlax+kNVPnk8SshOGF0eCQlVxqlbsnMaL+OMmgejgv0Uedpbr\nYT3OXfV1xIsHqv9SWR9xzrkNtzbvehOZMQO+4l+YAC7KNEOwQpHUX6vVEOiqZCbF\nmgZ4sDsnAgMBAAECggEAMvbwy8/Je+bvv92dr9Hx5mdMsCJdMrxlHbZLIrHuyYyD\ncvjMRbh+OhvzmKK2AsVSE0ulMAOSdKXNlYFVd9NipNFYvNKwGyg0tkBwvJ63ZzEf\nH4Lc97SZb24N+b46obL5Vg2vA3wj7n3tfN//EprBUK2jDcEO4oI7Kj2KauB8z4ri\n64GOyJhd9EIGn0GbqUiXnyCmU1WzkwniqnH5f2g1zPFB3P52mXqnkCPDS4sqtx2h\nS62ATqRZX7bVWoQAn2WLjEyGrSwXoiHK9E3dj+z9KBGTu8KiN+3Kz7lW6mm/LJeh\n8KMNu1hUyku8gL/ZI7U6SudFPUTsxwTbbX4lWUvtoQKBgQDiQBwCHrRpVTfdoL8f\nawMubLisf6BLCFHFR5TS11uN1EvU1QR+whSxzksKLeuXO5MqNL8RTLrLSOGn/EWw\nHwQgoWirO5MxKg8SAdm93Fk//3HMGdUsKXrXdtIvm/5943zmnPzBzAqytIM+Qie1\nN34tBHj4VgxvFB2f6V/5hiZvhwKBgQDDjDNzVVh3q1bRtGxYZ6uXY2uYiZo5Ymcj\nC+bYF9HU0r8mlkgABNC2nqoPdsjhyW7YjrJHTtBppWFX40FGsGBWpWQ6IeMMYbEl\nclLhryiBVpNxNAw6CMr1Z31VRyPUTzIG7qqvjfJHPJZa1M4plRbIx0VBmyL+Rgdx\ncYCU0dR/YQKBgHJSSJS9pRWQTOE85zXd4cakgxAOkRU4x/CyQb3jucxJmGObm2Dd\neo15mqszFtbc8HikHGOGbOBpHDTAoQnkMja2uGfFe5OdF+5WZwqre6F91qd16iQd\ndYfH717FKOu9dhAlBQZ7rnAsDCD6VowX1Ta0CtgYysGZ3Xo+9xLjOSqjAoGAR4GU\nKt+RmykHdWWxnN5EC/bqGHxw7f0C0/j9MBX9wAJUreqUZ5VbMPxyGXeJW69KHlyH\n6rVyVr+IChhq/Utv3x9ZuDw+B4ANxDC7CBYCDNG41tN+iRZACV8PoMiD3JYdKBXM\nSqfwaYZJQOvCe8gt7buYorX1JOA8xooHx+O2/eECgYEAkqEE++rp6cVUsS4Ld92k\n3QX2bh1Twk8x4GQriiQlH0jb+atw9rlONrtaU4GBpPOnjgevV6mIGLPUrW3nilLj\n6ECuQLjP2+4P4T0bfa8qemWzJJQOAlXwUmHF0et4oE0OYM3v+luIu4UN3Slmq24I\n94XMSaOw4hB5g0b1zH/jTcw=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-c07tr@rojgar-8ee2d.iam.gserviceaccount.com",
  client_id: "107860746729505144040",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-c07tr%40rojgar-8ee2d.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const singleNotification = async (req, res) => {
  const { token, title, body, image } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  // let message = {
  //   token,
  //   notification: {
  //     title,
  //     body,
  //   },
  // };

  let message = {
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        imageUrl: image,
      },
    },
    token,
    apns: {
      payload: {
        aps: {
          "mutable-content": 1,
        },
      },
      fcm_options: {
        image: image,
      },
    },
    // webpush: {
    //   headers: {
    //     image: image,
    //   },
    // },
  };

  // if (image) {
  //   message.android = {
  //     notification: {
  //       imageUrl: image,
  //     },
  //   };
  // }

  admin
    .messaging()
    .send(message)
    .then((response) => {
      res.status(200).json({ success: true, response, data: message });
    })
    .catch((error) => {
      res.status(500).json({
        error: "Internal server error",
        message: error,
        data: message,
      });
    });
};

const multiNotification = async (req, res) => {
  const { tokens = [], title, body, image } = req.body;

console.log(tokens);

  if (tokens.length < 1 || !title || !body) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  // let message = {
  //   token,
  //   notification: {
  //     title,
  //     body,
  //   },
  // };

  // if (image) {
  //   message.android = {
  //     notification: {
  //       imageUrl: image,
  //     },
  //   };
  // }

  let message = {
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        imageUrl: image,
      },
    },
    apns: {
      payload: {
        aps: {
          "mutable-content": 1,
        },
      },
      fcm_options: {
        image: image,
      },
    },
    // webpush: {
    //   headers: {
    //     image: image,
    //   },
    // },
  };

  let arr = [];
  tokens.forEach(async (token) => {
    try {
      const response = await admin.messaging().send({
        ...message,
        token: token,
      });
      console.log("Successfully sent message:", response);
      arr.push(token);
    } catch (error) {
      console.error("Error sending message:", error.errorInfo.message);
    }
  });

  res.status(200).json({ success: true, data: arr });
};

module.exports = { singleNotification, multiNotification };
