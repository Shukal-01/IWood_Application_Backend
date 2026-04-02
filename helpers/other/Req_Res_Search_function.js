export const responseMessages = {
  success: {
    common: 200,
    create: 201,
    noContent: 204,
  },
  error: {
    common: 400,
    notFound: 404,
    unauthorized: 401,
    serverError: 500,
  }
}

export const sendErrors = (res, code, message) => {
  const validCodes = Object.values(responseMessages.error);
  const statusCode = validCodes.includes(code) ? code : responseMessages.error.common;

  return res.status(statusCode).json({
    message: "error",
    detail: message,
  });
};

export const sendError = (res, code, message) => {
  return res.status(code).json({ message: "error", detail: message });
};

export const sendSuccess = (res, status, data, detail) => {
  return res.status(status).json({
    message: "success",
    data: data || null,
    detail: detail || null,
  });
};

export const search = async (givenModel, givenObject) => {
  const isExist = await givenModel.findOne(givenObject);
  if (isExist) {
    return isExist;
  } else {
    return false;
  }
};
