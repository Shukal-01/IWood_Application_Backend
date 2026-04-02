import mongoose from "mongoose";

mongoose.set('maxTimeMS', 10000); // Set default query timeout to 10 seconds

const handleConnectToMongodb = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // console.log('✅ Connected to MongoDB');
    
    // Create indexes for commonly queried fields to improve performance
    await createIndexes();
  } catch (error) {
    // console.log('❌ Error connecting to MongoDB: ', error.message);
  }
};

// Create indexes for frequently queried fields
const createIndexes = async () => {
  try {
    // Get all model names from Mongoose
    const modelNames = mongoose.modelNames();
    
    // Create indexes for each model based on commonly queried fields
    for (const modelName of modelNames) {
      const model = mongoose.model(modelName);
      
      // Common fields that should be indexed in most collections
      if (model.collection) {
        // Check if model has a name field (common in user models)
        if (model.schema.paths.name) {
          await model.collection.createIndex({ name: 1 });
          await model.collection.createIndex({ name: 'text' }); // Text index for search
        }
        
        // Check if model has userId (common in many collections)
        if (model.schema.paths.userId) {
          await model.collection.createIndex({ userId: 1 });
        }
        
        // Check for status fields (common for filtering active/inactive)
        if (model.schema.paths.status) {
          await model.collection.createIndex({ status: 1 });
        }
        
        // Always index createdAt for sorting by date
        if (model.schema.paths.createdAt) {
          await model.collection.createIndex({ createdAt: -1 });
        }
      }
    }
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

export default handleConnectToMongodb;
