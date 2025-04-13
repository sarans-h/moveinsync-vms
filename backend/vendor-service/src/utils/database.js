const mongoose = require('mongoose');
const config = require('../config');

class Database {
  static async connect() {
    try {
      await mongoose.connect(config.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      });
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  }

  static async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('MongoDB disconnected successfully');
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
      process.exit(1);
    }
  }

  static async clearCollection(collectionName) {
    try {
      await mongoose.connection.collection(collectionName).deleteMany({});
      console.log(`Collection ${collectionName} cleared successfully`);
    } catch (error) {
      console.error(`Error clearing collection ${collectionName}:`, error);
      throw error;
    }
  }

  static async dropCollection(collectionName) {
    try {
      await mongoose.connection.collection(collectionName).drop();
      console.log(`Collection ${collectionName} dropped successfully`);
    } catch (error) {
      console.error(`Error dropping collection ${collectionName}:`, error);
      throw error;
    }
  }

  static async dropDatabase() {
    try {
      await mongoose.connection.dropDatabase();
      console.log('Database dropped successfully');
    } catch (error) {
      console.error('Error dropping database:', error);
      throw error;
    }
  }

  static async getCollectionNames() {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      return collections.map(collection => collection.name);
    } catch (error) {
      console.error('Error getting collection names:', error);
      throw error;
    }
  }

  static async getCollectionStats(collectionName) {
    try {
      const stats = await mongoose.connection.db.collection(collectionName).stats();
      return {
        name: stats.ns,
        count: stats.count,
        size: stats.size,
        avgObjSize: stats.avgObjSize,
        storageSize: stats.storageSize,
        totalIndexSize: stats.totalIndexSize,
        indexSizes: stats.indexSizes
      };
    } catch (error) {
      console.error(`Error getting stats for collection ${collectionName}:`, error);
      throw error;
    }
  }

  static async createIndex(collectionName, indexSpec, options = {}) {
    try {
      await mongoose.connection.collection(collectionName).createIndex(indexSpec, options);
      console.log(`Index created successfully for collection ${collectionName}`);
    } catch (error) {
      console.error(`Error creating index for collection ${collectionName}:`, error);
      throw error;
    }
  }

  static async dropIndex(collectionName, indexName) {
    try {
      await mongoose.connection.collection(collectionName).dropIndex(indexName);
      console.log(`Index ${indexName} dropped successfully from collection ${collectionName}`);
    } catch (error) {
      console.error(`Error dropping index ${indexName} from collection ${collectionName}:`, error);
      throw error;
    }
  }

  static async getIndexes(collectionName) {
    try {
      return await mongoose.connection.collection(collectionName).indexes();
    } catch (error) {
      console.error(`Error getting indexes for collection ${collectionName}:`, error);
      throw error;
    }
  }
}

module.exports = Database; 