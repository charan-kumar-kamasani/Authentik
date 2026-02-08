// OTP service using Plivo Verify API
// Requires the following env variables set in your .env:
// PLIVO_AUTH_ID, PLIVO_AUTH_TOKEN, TEST_PHONENUMBER, TEST_OTP

require("dotenv").config();

const PLIVO_AUTH_ID = process.env.PLIVO_AUTH_ID;
const PLIVO_AUTH_TOKEN = process.env.PLIVO_AUTH_TOKEN;
const PLIVO_API = process.env.PLIVO_API;
const TEST_PHONENUMBER = process.env.TEST_PHONENUMBER;
const TEST_OTP = process.env.TEST_OTP;

// Note: This file uses global fetch which is available in Node 18+.
// If you run an older Node version add a fetch polyfill (node-fetch) or upgrade Node.

const sendOTP = async (countryCode, phoneNumber) => {
  try {

    if (phoneNumber !== TEST_PHONENUMBER) {
      const response = await fetch(
        `${PLIVO_API}/Account/${PLIVO_AUTH_ID}/Verify/Session`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization:
              "Basic " +
              Buffer.from(`${PLIVO_AUTH_ID}:${PLIVO_AUTH_TOKEN}`).toString(
                "base64",
              ),
          },
          method: "POST",
          body: JSON.stringify({ recipient: `${countryCode}${phoneNumber}` }),
        },
      );

      const json = await response.json().catch(() => ({}));

      // Plivo returns 202 Accepted on success (verify session created)
      if (
        response.ok &&
        (response.status === 202 || response.statusText === "Accepted")
      ) {
        return { success: true, message: "OTP sent successfully" };
      }

      return {
        success: false,
        message:
          json?.error || "Error occurred while sending OTP. Please try later!",
      };
    }

    // test number: always succeed
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

    if (phoneNumber !== TEST_PHONENUMBER) {
      // fetch the latest in-progress session for recipient
      const sessionResponse = await fetch(
        `${PLIVO_API}/Account/${PLIVO_AUTH_ID}/Verify/Session?recipient=${countryCode}${phoneNumber}&status=in-progress&limit=1`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization:
              "Basic " +
              Buffer.from(`${PLIVO_AUTH_ID}:${PLIVO_AUTH_TOKEN}`).toString(
                "base64",
              ),
          },
          method: "GET",
        },
      );

      const sessionJson = await sessionResponse.json().catch(() => ({}));

      if (sessionResponse.ok) {
        const sessions = sessionJson?.sessions || [];
        if (sessions.length > 0) {
          const sessionId = sessions[0].session_uuid;

          const verifyResponse = await fetch(
            `${PLIVO_API}/Account/${PLIVO_AUTH_ID}/Verify/Session/${sessionId}`,
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization:
                  "Basic " +
                  Buffer.from(`${PLIVO_AUTH_ID}:${PLIVO_AUTH_TOKEN}`).toString(
                    "base64",
                  ),
              },
              method: "POST",
              body: JSON.stringify({ otp: code }),
            },
          );

          const verifyJson = await verifyResponse.json().catch(() => ({}));
          
          // Plivo returns 200 OK on successful verification
          if (verifyResponse.ok) {
            return { success: true, message: "OTP verified successfully" };
          }
        }
      }

      return { success: false, message: "Invalid OTP" };
    }

    // test number bypass
    if (code === TEST_OTP)
      return { success: true, message: "OTP verified successfully" };
    return { success: false, message: "Invalid OTP" };
  } catch (error) {
    console.error("verifyOTP error", error);
    return { success: false, message: "Error occurred while verifying OTP" };
  }
};

module.exports = { sendOTP, verifyOTP };
