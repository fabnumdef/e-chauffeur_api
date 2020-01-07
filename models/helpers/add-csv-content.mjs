export default function addCSVContentPlugin(schema) {
  // eslint-disable-next-line no-param-reassign
  schema.statics.createFromCSV = async function createFromCSV(datas) {
    await this.db.createCollection(this.collection.collectionName);

    const session = await this.startSession();
    session.startTransaction();
    try {
      await this.create(datas, { session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  };
}
