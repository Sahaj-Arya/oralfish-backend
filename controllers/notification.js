const admin = require("firebase-admin");
const { sendEmail } = require("../utils/sendEmail");

const nodemailer = require("nodemailer");
const { StatusCodes } = require("http-status-codes");
const { settlement } = require("../utils/template/settlement");
const User = require("../models/User");
const { getAllFCMTokens } = require("../utils/helperFunctions");
const Notification = require("../models/Notification");

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

const sendNotification = async (data) => {
  const { tokens = [], title, image, route, route_id } = data;
  let body = data?.message;
  await Notification.create({
    title,
    body,
    image,
    user_id: "",
    route_id: route_id ? route_id : "",
    route: route ? route : "Home",
  });

  if (tokens.length < 1 || !title || !body) {
    console.log({ error: "Invalid request parameters" });
  }

  let message = {
    data: {
      route,
      route_id,
      sound: "default",
    },
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        imageUrl: image,
        sound: "default",
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
      await admin.messaging().send({
        ...message,
        token: token,
      });
      arr.push(token);
    } catch (error) {
      // console.error("Error sending message:", error.errorInfo.message);
    }
  });
};

const sendbulkNotificationFn = async (params) => {
  const {
    title,
    body,
    image,
    user_id = "",
    route = "",
    route_id = "",
  } = params;

  // console.log("bulk", params);

  // Create the notification document
  await Notification.create({
    title,
    body,
    image,
    user_id,
    route,
    route_id,
  });

  // Get FCM tokens
  let tokens;
  try {
    tokens = await getAllFCMTokens();
  } catch (error) {
    console.error("Error retrieving FCM tokens:", error);
    return;
  }

  // Exit early if there are no tokens or necessary data
  if (!tokens.length || !title || !body) {
    return;
  }

  // Construct the message payload
  const message = {
    data: {
      route,
      route_id,
    },
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        imageUrl: image,
        sound: "default",
      },
    },
    apns: {
      payload: {
        aps: {
          "mutable-content": 1,
        },
      },
      fcm_options: {
        image,
      },
    },
  };

  // Send notifications in parallel
  const results = await Promise.all(
    tokens.map(async (token) => {
      try {
        await admin.messaging().send({ ...message, token });
        // return { token, status: "success" };
      } catch (error) {}
    })
  );

  // Log the results
  // console.log("Send results:", results);
};

const singleNotification = async (req, res) => {
  const { token, title, body, image } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  let message = {
    // data: {
    //   route,
    //   route_id,
    //   sound: "default",
    // },
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        imageUrl: image,
        sound: "default",
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
  const {
    tokens = [],
    title,
    body,
    image,
    route = "",
    route_id = "",
  } = req.body;

  if (tokens.length < 1 || !title || !body) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  let message = {
    data: {
      route,
      route_id,
      sound: "default",
    },
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        imageUrl: image,
        sound: "default",
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
      await admin.messaging().send({
        ...message,
        token,
      });
      arr.push(token);
    } catch (error) {}
  });

  return res
    .status(200)
    .json({ success: true, message: "Notification sent successfully" });
};

const bulkNotification = async (req, res) => {
  const { title, body, image, route, route_id } = req.body;

  await Notification.create({
    title,
    body,
    image,
    user_id: "",
    route,
    route_id,
  });

  let tokens = await getAllFCMTokens();

  if (tokens.length < 1 || !title || !body) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  let message = {
    data: {
      route,
      route_id,
      sound: "default",
    },
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        imageUrl: image,
        sound: "default",
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
      await admin.messaging().send({
        ...message,
        token: token,
      });
      arr.push(token);
    } catch (error) {
      // console.error("Error sending message:", error.errorInfo.message);
    }
  });

  return res
    .status(200)
    .json({ success: true, message: "Notification sent successfully" });
};

const sendNotificationToAll = async (req, res) => {
  const { title, body, image = "", route = "", route_id = "" } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  let message = {
    data: {
      route,
      route_id,
      sound: "default",
    },
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        imageUrl: image,
        sound: "default",
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

  const users = await User.find({}, { _id: 0, name: 1, fcm_token: 1 });
  for (const user of users) {
    const { name, fcm_token } = user;

    fcm_token.forEach(async (token) => {
      try {
        await admin.messaging().send({
          ...message,
          token: token,
        });
      } catch (error) {
        console.error("Error sending message:", error.errorInfo.message);
      }
    });
  }

  return res
    .status(200)
    .json({ success: true, message: "Notification sent successfully" });
};

async function sendSingleEmail(req, res) {
  let recipient = req.body.email;
  let name = req.body.name;

  try {
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "mail.new-india-consultants.com", // SMTP server hostname
      port: 465, // TCP port to connect to
      secure: true, // true for 465, false for other ports; deprecated, should be false for port 587
      auth: {
        user: "rojgar@new-india-consultants.com", // SMTP username
        pass: "Foodfoodfood1@", // SMTP password
      },
    });

    // Setup email data
    const mailOptions = {
      from: '"Rojgar App" <rojgar@new-india-consultants.com>', // sender address
      to: recipient, // list of receivers
      // subject: subject, // Subject line
      // html: body // HTML body
      subject: "Subject of the email", // Subject line
      html: settlement(name),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Message sent successfully!",
      messageId: info,
    });
  } catch (error) {
    return res
      .status(StatusCodes.NOT_MODIFIED)
      .json({ success: false, error: error.message });
  }
}

async function sendMultiEmail(req, res) {
  let recipient = req.body.email;
  let name = req.body.name;

  try {
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "mail.new-india-consultants.com", // SMTP server hostname
      port: 465, // TCP port to connect to
      secure: true, // true for 465, false for other ports; deprecated, should be false for port 587
      auth: {
        user: "rojgar@new-india-consultants.com", // SMTP username
        pass: "Foodfoodfood1@", // SMTP password
      },
    });

    // Setup email data
    const mailOptions = {
      from: '"Rojgar App" <rojgar@new-india-consultants.com>', // sender address
      to: recipient, // list of receivers
      // subject: subject, // Subject line
      // html: body // HTML body
      subject: "Subject of the email", // Subject line
      html: settlement(name),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Message sent successfully!",
      messageId: info,
    });
  } catch (error) {
    return res
      .status(StatusCodes.NOT_MODIFIED)
      .json({ success: false, error: error.message });
  }
}

const sendbulkNotification = async (tokens, title, body, image) => {
  if (tokens.length < 1 || !title || !body) {
    console.log("Invalid request parameters");
    return;
  }

  let message = {
    notification: {
      title,
      body,
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

  if (image) {
    message.android = {
      notification: {
        imageUrl: image,
      },
    };
  }

  let arr = [];

  tokens.forEach(async (token) => {
    try {
      await admin.messaging().send({
        ...message,
        token: token,
      });
      arr.push(token);
    } catch (error) {
      console.error("Error sending message:", error.errorInfo.message);
    }
  });
  // // console.log(arr);
  // return res
  //   .status(200)
  //   .json({ success: true, message: "Notification sent successfully" });
};

const saveNotification = async (req, res) => {
  const { tokens, ...rest } = req.body;
  const notification = await Notification.create(rest);

  if (!notification) {
    return res.status(400).json({
      error: "Failed to create notification",
      message: notification,
      success: false,
    });
  }
  return res.status(StatusCodes.CREATED).json({
    message: "notification created successfully",
    data: notification,
    success: true,
  });
};

const saveNotificationfn = async (data) => {
  const { ...rest } = data;
  await Notification.create(rest);
};

const getNotificationById = async (req, res) => {
  const { id } = req.body;
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10

  if (!id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "No User Id provided",
      success: false,
    });
  }

  try {
    const query = {
      user_id: { $in: [null, undefined, "", id] },
    };

    // Calculate the pagination values
    const skip = (page - 1) * limit;

    // Fetch the total number of documents that match the query
    const totalDocuments = await Notification.countDocuments(query);

    // Calculate total pages
    const totalPages = Math.ceil(totalDocuments / limit);

    // Fetch notifications with pagination and sorting by recent
    const notifications = await Notification.find(query)
      .sort({ created_at: -1 }) // Sort by created_at in descending order (most recent first)
      .skip(skip) // Skip the appropriate number of documents for pagination
      .limit(Number(limit)); // Limit the results to the specified number per page

    if (notifications.length === 0) {
      return res.status(400).json({
        error: "No notifications found",
        success: false,
      });
    }

    // Determine if there's a next page
    const nextPage = page < totalPages ? Number(page) + 1 : null;

    return res.status(StatusCodes.OK).json({
      message: "Notifications fetched",
      data: notifications,
      success: true,
      pagination: {
        currentPage: Number(page),
        totalPages: totalPages,
        totalDocuments: totalDocuments,
        nextPage: nextPage,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "An error occurred while fetching notifications",
      success: false,
    });
  }
};

module.exports = {
  singleNotification,
  multiNotification,
  sendSingleEmail,
  sendEmail,
  sendNotificationToAll,
  sendMultiEmail,
  bulkNotification,
  sendbulkNotification,
  sendNotification,
  sendbulkNotificationFn,
  saveNotification,
  saveNotificationfn,
  getNotificationById,
};
