// OTP service using Plivo Verify API
// Requires the following env variables set in your .env:
// PLIVO_AUTH_ID, PLIVO_AUTH_TOKEN, TEST_PHONENUMBER, TEST_OTP

require("dotenv").config();

const PLIVO_AUTH_ID = process.env.PLIVO_AUTH_ID;
const PLIVO_AUTH_TOKEN = process.env.PLIVO_AUTH_TOKEN;
const PLIVO_API = process.env.PLIVO_API;
const TEST_PHONENUMBER = process.env.TEST_PHONENUMBER;
const TEST_OTP = process.env.TEST_OTP;

const msg91_api = process.env.MSG91_API;
const auth_key = process.env.AUTH_KEY;
const otp_expiry = process.env.OTP_EXPIRY;
const template_id = process.env.TEMPLATE_ID;

// Note: This file uses global fetch which is available in Node 18+.
// If you run an older Node version add a fetch polyfill (node-fetch) or upgrade Node.

const sendOTP = async (countryCode, phoneNumber) => {
  try {
    if (phoneNumber !== TEST_PHONENUMBER) {
      const mobile = `${countryCode}${phoneNumber}`;

      const url = `${msg91_api}?mobile=+91${mobile}&authkey=${auth_key}&otp_expiry=10&template_id=${template_id}&realTimeResponse=1`;
      console.log("____url", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      const json = await response.json().catch(() => ({}));

      if (response.ok) {
        return { success: true, message: "OTP sent successfully" };
      }

      return {
        success: false,
        message: json?.message || "Error sending OTP",
      };
    }

    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("sendOTP error", error);
    return {
      success: false,
      message: "Error occurred while sending OTP. Please try later!",
    };
  }
};

const verifyOTP = async (countryCode, phoneNumber, code) => {
  try {
    console.log("__________", phoneNumber);
    if (phoneNumber !== TEST_PHONENUMBER) {
      const sessionResponse = await fetch(
        `${msg91_api}/verify?otp=${code}&mobile=+91${phoneNumber}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            authkey: `${auth_key}`,
          },
          method: "GET",
        },
      );

      console.log(
        "____Session",
        sessionResponse.status,
        sessionResponse.statusText,
      );
      if ((sessionResponse.status == 200, sessionResponse.statusText == "OK"))
        return { success: true, message: "OTP verified successfully" };
      return { success: false, message: "Invalid OTP" };
    }

    // test number bypass
  } catch (error) {
    console.error("verifyOTP error", error);
    return { success: false, message: "Error occurred while verifying OTP" };
  }
};

module.exports = { sendOTP, verifyOTP };
