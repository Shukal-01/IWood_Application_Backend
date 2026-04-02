import { Router } from "express";
import handlePageAccess from "../../middlewares/pageAceess.middleware.js";
import subAdminController from "../../controllers/admin/subAdminControllers.js";
import { sendSuccess } from "../../helpers/other/Req_Res_Search_function.js";
import countryController from "../../controllers/admin/myCountryController.js";
import cityController from "../../controllers/admin/cityController.js";
import stateController from "../../controllers/admin/stateController.js";
import influencercategoriesController from "../../controllers/admin/influencercategoriesController.js";
import influencersubcategoriesController from "../../controllers/admin/influencersubcategoriesController.js";
import productionhousecategoriesController from "../../controllers/admin/productionhousecategoriesController.js";
import eventcompanycategoriesController from "../../controllers/admin/eventcompanycategoriesController.js";
import storecategoriesController from "../../controllers/admin/storecategoriesController.js";
import influencerPostCategoriesController from "../../controllers/admin/postCategories/inluencerPostCategories.controller.js";
import productionHousePostCategoriesController from "../../controllers/admin/postCategories/productionHousePostCategories.controller.js";
import storePostCategoriesController from "../../controllers/admin/postCategories/storePostCategories.controller.js";
import eventCompanyPostCategoriesController from "../../controllers/admin/postCategories/eventCompanyPostCategories.controller.js";
import movieGenreController from "../../controllers/admin/movieGenreController.js";
import productionHouseCrewCategoriesController from "../../controllers/admin/productionHouseCrewCategoriesController.js";
import movieCastingCategoryController from "../../controllers/admin/movieCastingCategoryController.js";
import productionHouseContentTypeController from "../../controllers/admin/productionHouseContentTypeController.js";
import reviewContentBannersController from "../../controllers/admin/reviewContentBannersController.js";
import movieReviewContentController from "../../controllers/admin/movieReviewContentController.js";
import signR2UrlsMiddleware from "../../middlewares/signR2Urls.js";
import contactUsController from "../../controllers/admin/contactUsController.js";
const router = Router();

// ------------------ roles
const roleArray = ["add", "view", "delete", "update"];
const allRoles = [
  "subadmin",
  "country",
  "state",
  "city",
  "influencercategories",
  "influencersubcategories",
  "productionhousecategories",
  "eventcompanycategories",
  "storecategories",
  "influencerpostcategories",
  "productionhousepostcategories",
  "storepostcategories",
  "eventcompanypostcategories",
  "moviegenre",
  "productionhousecrewcategories",
  "moviecastingcategories",
  "productionhousecontenttypes",
  "reviewcontentbanners",
  "moviereviewcontents",
  "contactus",
];

router.get("/roles/getAll", (req, res) => {
  return sendSuccess(res, 200, allRoles, "");
  //   res.status(200).json({ message: "success", data: allRoles });
});
// ------------------ roles

// ------------------ subadmins
router.post(
  "/subadmin/add",
  handlePageAccess(allRoles[0], roleArray[0]),
  subAdminController.add
);
router.get(
  "/subadmin/getAll",
  handlePageAccess(allRoles[0], roleArray[1]),
  subAdminController.get
);
router.delete(
  "/subadmin/delete/:itemId",
  handlePageAccess(allRoles[0], roleArray[2]),
  subAdminController.deleteData
);
router.put(
  "/subadmin/update/:itemId",
  handlePageAccess(allRoles[0], roleArray[3]),
  subAdminController.updateDate
);
// ------------------ subadmins

// ------------------ general
router.post(
  "/country/add",
  handlePageAccess(allRoles[1], roleArray[0]),
  countryController.add
);
router.get(
  "/country/getAll",
  handlePageAccess(allRoles[1], roleArray[1]),
  countryController.get
);
router.delete(
  "/country/delete/:itemId",
  handlePageAccess(allRoles[1], roleArray[2]),
  countryController.deleteData
);
router.put(
  "/country/update/:itemId",
  handlePageAccess(allRoles[1], roleArray[3]),
  countryController.updateDate
);
// ------------------ general
// ------------------ general
router.post(
  "/state/add",
  handlePageAccess(allRoles[2], roleArray[0]),
  stateController.add
);
router.get(
  "/state/getAll",
  handlePageAccess(allRoles[2], roleArray[1]),
  stateController.get
);
router.delete(
  "/state/delete/:itemId",
  handlePageAccess(allRoles[2], roleArray[2]),
  stateController.deleteData
);
router.put(
  "/state/update/:itemId",
  handlePageAccess(allRoles[2], roleArray[3]),
  stateController.updateDate
);
// ------------------ general
// ------------------ general
router.post(
  "/city/add",
  handlePageAccess(allRoles[3], roleArray[0]),
  cityController.add
);
router.get(
  "/city/getAll",
  handlePageAccess(allRoles[3], roleArray[1]),
  cityController.get
);
router.delete(
  "/city/delete/:itemId",
  handlePageAccess(allRoles[3], roleArray[2]),
  cityController.deleteData
);
router.put(
  "/city/update/:itemId",
  handlePageAccess(allRoles[3], roleArray[3]),
  cityController.updateDate
);
// ------------------ general

// ------------------ influencer categories
router.post(
  "/influencercategories/add",
  handlePageAccess(allRoles[4], roleArray[0]),
  influencercategoriesController.add
);
router.get(
  "/influencercategories/getAll",
  handlePageAccess(allRoles[4], roleArray[1]),
  influencercategoriesController.get
);
router.delete(
  "/influencercategories/delete/:itemId",
  handlePageAccess(allRoles[4], roleArray[2]),
  influencercategoriesController.deleteData
);
router.put(
  "/influencercategories/update/:itemId",
  handlePageAccess(allRoles[4], roleArray[3]),
  influencercategoriesController.updateDate
);
// ------------------ influencer categories

// ------------------ influencer subcategories
router.post(
  "/influencersubcategories/add",
  handlePageAccess(allRoles[5], roleArray[0]),
  influencersubcategoriesController.add
);
router.get(
  "/influencersubcategories/getAll",
  handlePageAccess(allRoles[5], roleArray[1]),
  influencersubcategoriesController.get
);
router.delete(
  "/influencersubcategories/delete/:itemId",
  handlePageAccess(allRoles[5], roleArray[2]),
  influencersubcategoriesController.deleteData
);
router.put(
  "/influencersubcategories/update/:itemId",
  handlePageAccess(allRoles[5], roleArray[3]),
  influencersubcategoriesController.updateDate
);
// ------------------ influencer subcategories

// ------------------ production house categories
router.post(
  "/productionhousecategories/add",
  handlePageAccess(allRoles[6], roleArray[0]),
  productionhousecategoriesController.add
);
router.get(
  "/productionhousecategories/getAll",
  handlePageAccess(allRoles[6], roleArray[1]),
  productionhousecategoriesController.get
);
router.delete(
  "/productionhousecategories/delete/:itemId",
  handlePageAccess(allRoles[6], roleArray[2]),
  productionhousecategoriesController.deleteData
);
router.put(
  "/productionhousecategories/update/:itemId",
  handlePageAccess(allRoles[6], roleArray[3]),
  productionhousecategoriesController.updateDate
);
// ------------------ production house categories

// ------------------ event company categories
router.post(
  "/eventcompanycategories/add",
  handlePageAccess(allRoles[7], roleArray[0]),
  eventcompanycategoriesController.add
);
router.get(
  "/eventcompanycategories/getAll",
  handlePageAccess(allRoles[7], roleArray[1]),
  eventcompanycategoriesController.get
);
router.delete(
  "/eventcompanycategories/delete/:itemId",
  handlePageAccess(allRoles[7], roleArray[2]),
  eventcompanycategoriesController.deleteData
);
router.put(
  "/eventcompanycategories/update/:itemId",
  handlePageAccess(allRoles[7], roleArray[3]),
  eventcompanycategoriesController.updateDate
);
// ------------------ event company categories

// ------------------ store categories
router.post(
  "/storecategories/add",
  handlePageAccess(allRoles[8], roleArray[0]),
  storecategoriesController.add
);
router.get(
  "/storecategories/getAll",
  handlePageAccess(allRoles[8], roleArray[1]),
  storecategoriesController.get
);
router.delete(
  "/storecategories/delete/:itemId",
  handlePageAccess(allRoles[8], roleArray[2]),
  storecategoriesController.deleteData
);
router.put(
  "/storecategories/update/:itemId",
  handlePageAccess(allRoles[8], roleArray[3]),
  storecategoriesController.updateDate
);
// ------------------ store categories
// ------------------ store categories
router.post(
  "/influencerpostcategories/add",
  handlePageAccess(allRoles[9], roleArray[0]),
  influencerPostCategoriesController.add
);

router.get(
  "/influencerpostcategories/getAll",
  handlePageAccess(allRoles[9], roleArray[1]),
  influencerPostCategoriesController.get
);
router.delete(
  "/influencerpostcategories/delete/:itemId",
  handlePageAccess(allRoles[9], roleArray[2]),
  influencerPostCategoriesController.deleteData
);
router.put(
  "/influencerpostcategories/update/:itemId",
  handlePageAccess(allRoles[9], roleArray[3]),
  influencerPostCategoriesController.updateDate
);
// ------------------ store categories
// ------------------ store categories
router.post(
  "/productionhousepostcategories/add",
  handlePageAccess(allRoles[10], roleArray[0]),
  productionHousePostCategoriesController.add
);
router.get(
  "/productionhousepostcategories/getAll",

  handlePageAccess(allRoles[10], roleArray[1]),
  productionHousePostCategoriesController.get
);
router.delete(
  "/productionhousepostcategories/delete/:itemId",
  handlePageAccess(allRoles[10], roleArray[2]),
  productionHousePostCategoriesController.deleteData
);
router.put(
  "/productionhousepostcategories/update/:itemId",
  handlePageAccess(allRoles[10], roleArray[3]),
  productionHousePostCategoriesController.updateDate
);
// ------------------ store categories
// ------------------ store categories
router.post(
  "/storepostcategories/add",
  handlePageAccess(allRoles[11], roleArray[0]),
  storePostCategoriesController.add
);

router.get(
  "/storepostcategories/getAll",
  handlePageAccess(allRoles[11], roleArray[1]),
  storePostCategoriesController.get
);
router.delete(
  "/storepostcategories/delete/:itemId",
  handlePageAccess(allRoles[11], roleArray[2]),
  storePostCategoriesController.deleteData
);
router.put(
  "/storepostcategories/update/:itemId",
  handlePageAccess(allRoles[11], roleArray[3]),
  storePostCategoriesController.updateDate
);
// ------------------ store categories
// ------------------ store categories
router.post(
  "/eventcompanypostcategories/add",
  handlePageAccess(allRoles[12], roleArray[0]),
  eventCompanyPostCategoriesController.add
);

router.get(
  "/eventcompanypostcategories/getAll",
  handlePageAccess(allRoles[12], roleArray[1]),
  eventCompanyPostCategoriesController.get
);
router.delete(
  "/eventcompanypostcategories/delete/:itemId",
  handlePageAccess(allRoles[12], roleArray[2]),
  eventCompanyPostCategoriesController.deleteData
);
router.put(
  "/eventcompanypostcategories/update/:itemId",
  handlePageAccess(allRoles[12], roleArray[3]),
  eventCompanyPostCategoriesController.updateDate
);
// ------------------ store categories

// ------------------ moviegenre
router.post(
  "/moviegenre/add",
  handlePageAccess(allRoles[13], roleArray[0]),
  movieGenreController.add
);

router.get(
  "/moviegenre/getAll",
  handlePageAccess(allRoles[13], roleArray[1]),
  movieGenreController.get
);
router.delete(
  "/moviegenre/delete/:itemId",
  handlePageAccess(allRoles[13], roleArray[2]),
  movieGenreController.deleteData
);
router.put(
  "/moviegenre/update/:itemId",
  handlePageAccess(allRoles[13], roleArray[3]),
  movieGenreController.updateDate
);
// ------------------ moviegenre

// ------------------ productionHouseCrewCategoriesController
router.post(
  "/productionhousecrewcategories/add",
  handlePageAccess(allRoles[14], roleArray[0]),
  productionHouseCrewCategoriesController.add
);
router.get(
  "/productionhousecrewcategories/getAll",
  handlePageAccess(allRoles[14], roleArray[1]),
  productionHouseCrewCategoriesController.get
);
router.delete(
  "/productionhousecrewcategories/delete/:itemId",
  handlePageAccess(allRoles[14], roleArray[2]),
  productionHouseCrewCategoriesController.deleteData
);
router.put(
  "/productionhousecrewcategories/update/:itemId",
  handlePageAccess(allRoles[14], roleArray[3]),
  productionHouseCrewCategoriesController.updateDate
);
// ------------------ productionHouseCrewCategoriesController

// ------------------ moviecastingcategories
router.post(
  "/moviecastingcategories/add",
  handlePageAccess(allRoles[15], roleArray[0]),
  movieCastingCategoryController.add
);
router.get(
  "/moviecastingcategories/getAll",
  handlePageAccess(allRoles[15], roleArray[1]),
  movieCastingCategoryController.get
);
router.delete(
  "/moviecastingcategories/delete/:itemId",
  handlePageAccess(allRoles[15], roleArray[2]),
  movieCastingCategoryController.deleteData
);
router.put(
  "/moviecastingcategories/update/:itemId",
  handlePageAccess(allRoles[15], roleArray[3]),
  movieCastingCategoryController.updateDate
);
// ------------------ moviecastingcategories
// ------------------ productionhousecontenttypes
router.post(
  "/productionhousecontenttypes/add",
  handlePageAccess(allRoles[16], roleArray[0]),
  productionHouseContentTypeController.add
);
router.get(
  "/productionhousecontenttypes/getAll",
  handlePageAccess(allRoles[16], roleArray[1]),
  productionHouseContentTypeController.get
);
router.delete(
  "/productionhousecontenttypes/delete/:itemId",
  handlePageAccess(allRoles[16], roleArray[2]),
  productionHouseContentTypeController.deleteData
);
router.put(
  "/productionhousecontenttypes/update/:itemId",
  handlePageAccess(allRoles[16], roleArray[3]),
  productionHouseContentTypeController.updateDate
);
// ------------------ productionhousecontenttypes
// ------------------ reviewcontentbanners
router.post(
  "/reviewcontentbanners/add",
  handlePageAccess(allRoles[17], roleArray[0]),
  reviewContentBannersController.add
);
router.get(
  "/reviewcontentbanners/getAll",
  handlePageAccess(allRoles[17], roleArray[1]),
  reviewContentBannersController.get
);
router.delete(
  "/reviewcontentbanners/delete/:itemId",
  handlePageAccess(allRoles[17], roleArray[2]),
  reviewContentBannersController.deleteData
);
router.put(
  "/reviewcontentbanners/update/:itemId",
  handlePageAccess(allRoles[17], roleArray[3]),
  reviewContentBannersController.updateDate
);
// ------------------ reviewcontentbanners

// ------------------ movie review contents
router.post(
  "/moviereviewcontents/add",
  handlePageAccess(allRoles[18], roleArray[0]),
  movieReviewContentController.add
);
router.get(
  "/moviereviewcontents/getAll",
  handlePageAccess(allRoles[18], roleArray[1]),
  movieReviewContentController.get
);
router.get("/moviereviewcontents/search", movieReviewContentController.search);
router.get(
  "/moviereviewcontents/:id",
  handlePageAccess(allRoles[18], roleArray[1]),
  movieReviewContentController.getById
);
router.delete(
  "/moviereviewcontents/delete/:itemId",
  handlePageAccess(allRoles[18], roleArray[2]),
  movieReviewContentController.deleteData
);
router.put(
  "/moviereviewcontents/update/:itemId",
  handlePageAccess(allRoles[18], roleArray[3]),
  movieReviewContentController.updateDate
);
// ------------------ movie review contents

// ------------------ contactus
router.get("/contactus/getAll", contactUsController.get);
router.get("/contactus/get/:id", contactUsController.getById);
router.delete("/contactus/delete/:id", contactUsController.deleteData);
router.put("/contactus/update/:id", contactUsController.updateDate);
// ------------------ contactus

const adminRoutes = router;
export default adminRoutes;
