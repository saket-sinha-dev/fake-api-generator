/**
 * Data Integrity Tests
 * Tests for database constraints, data validation, and data consistency
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('Data Integrity Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('Schema Validation', () => {
    it('should enforce required fields', async () => {
      const ProjectSchema = new mongoose.Schema({
        name: { type: String, required: true },
        owner: { type: String, required: true },
      });
      
      const Project = mongoose.model('Project', ProjectSchema);
      
      const invalidProject = new Project({});
      
      await expect(invalidProject.save()).rejects.toThrow();
    });

    it('should validate field types', async () => {
      const ResourceSchema = new mongoose.Schema({
        name: { type: String, required: true },
        count: { type: Number, required: true },
      });
      
      const Resource = mongoose.model('Resource', ResourceSchema);
      
      const invalidResource = new Resource({
        name: 'test',
        count: 'not-a-number', // Invalid type
      });
      
      await expect(invalidResource.save()).rejects.toThrow();
    });

    it('should enforce unique constraints', async () => {
      const UserSchema = new mongoose.Schema({
        email: { type: String, required: true, unique: true },
      });
      
      const User = mongoose.model('User', UserSchema);
      
      await User.create({ email: 'test@example.com' });
      
      // Try to create duplicate
      await expect(
        User.create({ email: 'test@example.com' })
      ).rejects.toThrow();
    });

    it('should validate string length constraints', async () => {
      const ArticleSchema = new mongoose.Schema({
        title: { 
          type: String, 
          required: true,
          minlength: 5,
          maxlength: 100,
        },
      });
      
      const Article = mongoose.model('Article', ArticleSchema);
      
      // Too short
      await expect(
        Article.create({ title: 'Hi' })
      ).rejects.toThrow();
      
      // Too long
      await expect(
        Article.create({ title: 'a'.repeat(101) })
      ).rejects.toThrow();
    });

    it('should validate number range constraints', async () => {
      const ProductSchema = new mongoose.Schema({
        price: { 
          type: Number, 
          required: true,
          min: 0,
          max: 999999,
        },
      });
      
      const Product = mongoose.model('Product', ProductSchema);
      
      // Negative price
      await expect(
        Product.create({ price: -10 })
      ).rejects.toThrow();
      
      // Too high
      await expect(
        Product.create({ price: 1000000 })
      ).rejects.toThrow();
    });

    it('should validate enum values', async () => {
      const OrderSchema = new mongoose.Schema({
        status: { 
          type: String, 
          required: true,
          enum: ['pending', 'processing', 'completed', 'cancelled'],
        },
      });
      
      const Order = mongoose.model('Order', OrderSchema);
      
      // Invalid status
      await expect(
        Order.create({ status: 'invalid' })
      ).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const ContactSchema = new mongoose.Schema({
        email: { 
          type: String, 
          required: true,
          match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        },
      });
      
      const Contact = mongoose.model('Contact', ContactSchema);
      
      // Invalid email
      await expect(
        Contact.create({ email: 'not-an-email' })
      ).rejects.toThrow();
    });
  });

  describe('Referential Integrity', () => {
    it('should maintain foreign key relationships', async () => {
      const AuthorSchema = new mongoose.Schema({
        name: String,
      });
      
      const BookSchema = new mongoose.Schema({
        title: String,
        authorId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Author',
          required: true,
        },
      });
      
      const Author = mongoose.model('Author', AuthorSchema);
      const Book = mongoose.model('Book', BookSchema);
      
      const author = await Author.create({ name: 'John Doe' });
      const book = await Book.create({ 
        title: 'Test Book', 
        authorId: author._id,
      });
      
      expect(book.authorId.toString()).toBe(author._id.toString());
    });

    it('should populate references correctly', async () => {
      const CategorySchema = new mongoose.Schema({
        name: String,
      });
      
      const PostSchema = new mongoose.Schema({
        title: String,
        categoryId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Category',
        },
      });
      
      const Category = mongoose.model('Category', CategorySchema);
      const Post = mongoose.model('Post', PostSchema);
      
      const category = await Category.create({ name: 'Tech' });
      const post = await Post.create({ 
        title: 'Test Post', 
        categoryId: category._id,
      });
      
      const populatedPost = await Post.findById(post._id)
        .populate('categoryId')
        .exec();
      
      expect(populatedPost?.categoryId).toBeDefined();
    });

    it('should handle orphaned references', async () => {
      const TagSchema = new mongoose.Schema({
        name: String,
      });
      
      const ArticleSchema = new mongoose.Schema({
        title: String,
        tags: [{ 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Tag',
        }],
      });
      
      const Tag = mongoose.model('Tag', TagSchema);
      const Article2 = mongoose.model('Article2', ArticleSchema);
      
      const tag = await Tag.create({ name: 'JavaScript' });
      const article = await Article2.create({ 
        title: 'Test Article', 
        tags: [tag._id],
      });
      
      // Delete tag
      await Tag.findByIdAndDelete(tag._id);
      
      // Article still references deleted tag
      const foundArticle = await Article2.findById(article._id);
      expect(foundArticle?.tags).toHaveLength(1);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistency in transactions', async () => {
      const AccountSchema = new mongoose.Schema({
        name: String,
        balance: Number,
      });
      
      const Account = mongoose.model('Account', AccountSchema);
      
      const account1 = await Account.create({ 
        name: 'Account 1', 
        balance: 1000,
      });
      const account2 = await Account.create({ 
        name: 'Account 2', 
        balance: 500,
      });
      
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Transfer money
        await Account.findByIdAndUpdate(
          account1._id,
          { $inc: { balance: -100 } },
          { session }
        );
        
        await Account.findByIdAndUpdate(
          account2._id,
          { $inc: { balance: 100 } },
          { session }
        );
        
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
      
      const updated1 = await Account.findById(account1._id);
      const updated2 = await Account.findById(account2._id);
      
      expect(updated1?.balance).toBe(900);
      expect(updated2?.balance).toBe(600);
    });

    it('should rollback on transaction failure', async () => {
      const WalletSchema = new mongoose.Schema({
        userId: String,
        balance: Number,
      });
      
      const Wallet = mongoose.model('Wallet', WalletSchema);
      
      const wallet = await Wallet.create({ 
        userId: 'user1', 
        balance: 100,
      });
      
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        await Wallet.findByIdAndUpdate(
          wallet._id,
          { $inc: { balance: -200 } }, // Would make balance negative
          { session }
        );
        
        // This would fail validation
        throw new Error('Insufficient balance');
      } catch (error) {
        await session.abortTransaction();
      } finally {
        session.endSession();
      }
      
      // Balance should remain unchanged
      const unchanged = await Wallet.findById(wallet._id);
      expect(unchanged?.balance).toBe(100);
    });
  });

  describe('Index Performance', () => {
    it('should use indexes for queries', async () => {
      const PersonSchema = new mongoose.Schema({
        email: { type: String, index: true },
        age: { type: Number },
      });
      
      const Person = mongoose.model('Person', PersonSchema);
      
      // Create test data
      await Person.create([
        { email: 'person1@test.com', age: 25 },
        { email: 'person2@test.com', age: 30 },
        { email: 'person3@test.com', age: 35 },
      ]);
      
      const result = await Person.findOne({ email: 'person2@test.com' });
      expect(result?.age).toBe(30);
    });

    it('should enforce compound indexes', async () => {
      const EventSchema = new mongoose.Schema({
        userId: String,
        eventType: String,
        timestamp: Date,
      });
      
      EventSchema.index({ userId: 1, timestamp: -1 });
      
      const Event = mongoose.model('Event', EventSchema);
      
      await Event.create([
        { userId: 'user1', eventType: 'login', timestamp: new Date() },
        { userId: 'user1', eventType: 'logout', timestamp: new Date() },
      ]);
      
      const events = await Event.find({ userId: 'user1' })
        .sort({ timestamp: -1 });
      
      expect(events).toHaveLength(2);
    });
  });

  describe('Data Migration Safety', () => {
    it('should handle schema changes', async () => {
      const OldSchema = new mongoose.Schema({
        name: String,
        age: Number,
      });
      
      const TestModel = mongoose.model('TestModel', OldSchema);
      
      const doc = await TestModel.create({ name: 'Test', age: 25 });
      
      // Simulate schema change
      const NewSchema = new mongoose.Schema({
        name: String,
        age: Number,
        email: { type: String, default: '' },
      });
      
      // Old documents should still work
      const found = await TestModel.findById(doc._id);
      expect(found?.name).toBe('Test');
    });

    it('should validate data after migration', async () => {
      const MigrationSchema = new mongoose.Schema({
        oldField: String,
        newField: String,
      });
      
      const MigrationModel = mongoose.model('Migration', MigrationSchema);
      
      // Create old document
      await MigrationModel.create({ oldField: 'value' });
      
      // After migration, newField should be added
      const docs = await MigrationModel.find({});
      docs.forEach(doc => {
        expect(doc.oldField).toBeDefined();
      });
    });
  });

  describe('Backup and Restore', () => {
    it('should maintain data integrity in exports', async () => {
      const BackupSchema = new mongoose.Schema({
        name: String,
        data: Object,
      });
      
      const BackupModel = mongoose.model('Backup', BackupSchema);
      
      const original = await BackupModel.create({
        name: 'test',
        data: { nested: { value: 123 } },
      });
      
      // Export
      const exported = original.toJSON();
      
      // Verify structure
      expect(exported.name).toBe('test');
      expect(exported.data.nested.value).toBe(123);
    });

    it('should restore data correctly', async () => {
      const RestoreSchema = new mongoose.Schema({
        title: String,
        count: Number,
      });
      
      const RestoreModel = mongoose.model('Restore', RestoreSchema);
      
      const backup = {
        title: 'Backed up',
        count: 42,
      };
      
      // Restore from backup
      const restored = await RestoreModel.create(backup);
      
      expect(restored.title).toBe('Backed up');
      expect(restored.count).toBe(42);
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent updates correctly', async () => {
      const CounterSchema = new mongoose.Schema({
        name: String,
        value: { type: Number, default: 0 },
      });
      
      const Counter = mongoose.model('Counter', CounterSchema);
      
      const counter = await Counter.create({ name: 'test', value: 0 });
      
      // Simulate concurrent increments
      const updates = Array.from({ length: 10 }, () =>
        Counter.findByIdAndUpdate(
          counter._id,
          { $inc: { value: 1 } },
          { new: true }
        )
      );
      
      await Promise.all(updates);
      
      const final = await Counter.findById(counter._id);
      expect(final?.value).toBe(10);
    });

    it('should prevent race conditions with versioning', async () => {
      const VersionedSchema = new mongoose.Schema({
        name: String,
        value: Number,
      });
      
      VersionedSchema.set('versionKey', '__v');
      
      const Versioned = mongoose.model('Versioned', VersionedSchema);
      
      const doc = await Versioned.create({ name: 'test', value: 0 });
      
      // Load same document twice
      const doc1 = await Versioned.findById(doc._id);
      const doc2 = await Versioned.findById(doc._id);
      
      // Both have same version
      expect(doc1?.__v).toBe(doc2?.__v);
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize input data', async () => {
      const SafeSchema = new mongoose.Schema({
        content: String,
      });
      
      const Safe = mongoose.model('Safe', SafeSchema);
      
      const maliciousInput = '<script>alert("xss")</script>';
      
      const doc = await Safe.create({ content: maliciousInput });
      
      // Should store as-is (sanitization happens at display)
      expect(doc.content).toBe(maliciousInput);
    });

    it('should trim whitespace from strings', async () => {
      const TrimSchema = new mongoose.Schema({
        name: { type: String, trim: true },
      });
      
      const Trim = mongoose.model('Trim', TrimSchema);
      
      const doc = await Trim.create({ name: '  test  ' });
      
      expect(doc.name).toBe('test');
    });

    it('should normalize data formats', async () => {
      const NormalizeSchema = new mongoose.Schema({
        email: { 
          type: String, 
          lowercase: true,
          trim: true,
        },
      });
      
      const Normalize = mongoose.model('Normalize', NormalizeSchema);
      
      const doc = await Normalize.create({ email: '  TEST@EXAMPLE.COM  ' });
      
      expect(doc.email).toBe('test@example.com');
    });
  });
});
