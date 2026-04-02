import dotenv from "dotenv";
dotenv.config();
const API_KEY = process.env.FAST2SMSAPIKEY;
const OTP_URL = process.env.FAST2SMSURL;

const SendOtp = async (mobileNumber, otp) => {
  const payload = {
    variables_values: `${otp}`,
    route: "otp",
    numbers: `${mobileNumber}`,
  };
 

try {
  const response = await fetch(OTP_URL, {
    method: "POST",
    headers: {
      authorization: API_KEY,
    },
    body: new URLSearchParams(payload),
  });
  
  const data = await response.json();
 
  
  
  if (data.return === true) {
    return "success";
  } else { 
    // console.error("Failed to send OTP");
    return "error";
  }
} catch (error) { 
    // console.error("Error:", error);
    return "error";
  }
};

export default SendOtp;
