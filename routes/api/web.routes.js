import { Router } from "express";
import contactUsController from "../../controllers/web/contactUsController.js";
import webGetData from "../../controllers/web/getDataController.js";
import eventContactFormController from "../../controllers/web/eventContactFormController.js";
import blogNewsletterController from "../../controllers/web/blogNewsletterController.js";

const router = Router();

// ------------------ contactUs
router.post("/contactUs/add", contactUsController.add);
router.get("/contactUs/getAll", contactUsController.get);
router.delete("/contactUs/delete/:itemId", contactUsController.deleteData);
router.put("/contactUs/update/:itemId", contactUsController.updateData);
// ------------------ contactUs

// ------------------ eventContactForm
router.post("/eventContactForm/add", eventContactFormController.add);
router.get("/eventContactForm/getAll", eventContactFormController.get);
router.delete("/eventContactForm/delete/:itemId", eventContactFormController.deleteData);
router.put("/eventContactForm/update/:itemId", eventContactFormController.updateData);
// ------------------ eventContactForm

// ------------------ blogNewsletter
router.post("/blogNewsletter/add", blogNewsletterController.add);
router.get("/blogNewsletter/getAll", blogNewsletterController.get); 
router.delete("/blogNewsletter/delete/:itemId", blogNewsletterController.deleteData);
router.put("/blogNewsletter/update/:itemId", blogNewsletterController.updateData);

// get routes --
router.get(
  "/influencer/categories/getall",
  webGetData.handleGetAllInfluencerCategories
);
router.get(
  "/production-house/categories/getall",
  webGetData.handleGetAllProductionHouseCategories
);
router.get("/store/categories/getall", webGetData.handleGetAllStoreCategories);
router.get("/event-companies/categories/getall", webGetData.handleGetAllEventCompaniesCategories);
// get routes --

const webRoutes = router;
export default webRoutes;
