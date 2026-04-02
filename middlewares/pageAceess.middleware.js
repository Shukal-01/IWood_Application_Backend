function handlePageAccess(name, process) {
  try {
    return function (req, res, next) {

      const adminData = req.user.userData;
      if (!adminData) {
        return res.status(400).json({ message: "error", detail: "eccess_error" });
      }

      if (adminData.role.includes("superadmin")) {
        return next();
      } else {
        if (adminData.role[0]) {
          if (adminData.role[0][name]) {
            if (adminData.role[0][name].includes(process)) {
              return next();
            }
          }
        }
      }
      return res.status(400).json({ message: "error", detail: "eccess_error" });
    };
  } catch (error) {
    return res.status(400).json({ message: "error", detail: "eccess_error" });
  }
}

export default handlePageAccess;