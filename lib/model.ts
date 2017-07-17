import {
	Aggregate,
	Document,
	DocumentToObjectOptions,
	Model as MongooseModel,
	ModelMapReduceOption,
	ModelUpdateOptions,
	NativeError,
	Query,
	SaveOptions,
	Schema,
	Types as MongooseTypes,
	ValidationError
} from 'mongoose';

export interface IModelType<T extends TypedModel> {
	new(model?: Document): T;
}

export interface IMeta {
	properties: any;
	schemaOptions: any;
}

export type ModelMapReduceOption<T, Key, Value> = ModelMapReduceOption<T, Key, Value>;

export class TypedModel {
	protected static _model: MongooseModel<Document>;
	protected static _meta: IMeta;
	protected static _schema: Schema;
	protected _document: Document;

	constructor(document?: any) {
		if (document && typeof document.__v !== 'undefined') {
			this._document = document;
			return;
		}

		const Model = (this.constructor as any)._model;
		this._document = new Model(document);
		this._document['_typedObject'] = this;
	}

	public get document(): Document {
		return this._document;
	}

	public get _id(): any {
		return this._document._id;
	}

	public set _id(value: any) {
		this._document._id = value;
	}

	public get __v(): any {
		return this._document.__v;
	}

	public set __v(value: any) {
		this._document.__v = value;
	}

	public get id(): any {
		return (this._document as any).id;
	}

	public get isNew(): boolean {
		return this._document.isNew;
	}

	// public get createdDate(): Date {
	// 	return (this._document as any).createdDate;
	// }

	// public set createdDate(createdDate: Date) {
	// 	(this._document as any).createdDate = createdDate;
	// }

	// public get updatedDate(): Date {
	// 	return (this._document as any).updatedDate;
	// }

	// public set updatedDate(updatedDate: Date) {
	// 	(this._document as any).updatedDate = updatedDate;
	// }

	public get createdAt(): Date {
		return (this._document as any).createdAt;
	}

	public set createdAt(createdAt: Date) {
		(this._document as any).createdAt = createdAt;
	}

	public get updatedAt(): Date {
		return (this._document as any).updatedAt;
	}

	public set updatedAt(updatedAt: Date) {
		(this._document as any).updatedAt = updatedAt;
	}

	/************************************************
	 *
	 * Static methods
	 *
	 ************************************************/

	/**
	 * Returns Model class
	 */
	public static getModel(): MongooseModel<Document> {
		return this._model;
	}

	/**
	 * Returns schema instance
	 */
	public static getSchema(): Schema {
		return this._schema;
	}

	/**
	 * Removes documents from the collection.
	 */
	public static remove(conditions?: object): Query<void> {
		return this._model.remove(conditions) as any;
	}

	/**
	 * Finds documents.
	 */
	public static find<T extends TypedModel[]>(
		conditions?: object,
		projection?: object,
		options?: object,
	): Query<T> {
		return this.fromQuery(this._model.find(conditions, projection, options));
	}

	/**
	 * Finds one document. The conditions are cast to their respective
	 * SchemaTypes before the command is sent.
	 */
	public static findOne<T extends TypedModel>(
		conditions: object,
		projection?: object,
		options?: object,
	): Query<T> {
		return this.fromQuery(this._model.findOne(conditions, projection, options));
	}

	/**
	 * Finds a single document by its _id field. findById(id) is almost*
	 * equivalent to findOne({ _id: id }). findById() triggers findOne hooks.
	 */
	public static findById<T extends TypedModel>(
		id: object | string | number,
		projection?: object,
		options?: object,
	): Query<T> {
		return this.fromQuery(this._model.findById(id, projection, options));
	}

	/**
	 * Counts number of matching documents in a database collection.
	 */
	public static count(conditions?: object): Query<number> {
		return this._model.count(conditions) as any;
	}

	/**
	 * Creates a Query for a distinct operation.
	 */
	public static distinct(field: string, conditions?: object): Query<any[]> {
		return this._model.distinct(field, conditions) as any;
	}

	/**
	 * Creates a Query, applies the passed conditions, and returns the Query.
	 */
	public static where<T extends TypedModel[]>(
		path: string,
		conditions?: object,
	): Query<T> {
		return this.fromQuery(this._model.where(path, conditions) as any);
	}

	/**
	 * Creates a Query and specifies a $where condition.
	 */
	public static $where<T extends TypedModel[]>(
		argument: string | Function,
	): Query<T> {
		return this.fromQuery(this._model.$where(argument));
	}

	/**
	 * Issues a mongodb findAndModify update command.
	 * Finds a matching document, updates it according to the update arg, passing
	 * any options, and returns the found document.
	 */
	public static findOneAndUpdate<T extends TypedModel>(
		conditions?: object,
		update?: object,
		options?: object,
	): Query<T> {
		return this.fromQuery(this._model.findOneAndUpdate(conditions, update, options));
	}

	/**
	 * Issues a mongodb findAndModify update command by a document's _id field.
	 * findByIdAndUpdate(id, ...) is equivalent to
	 * findOneAndUpdate({ _id: id }, ...).
	 */
	public static findByIdAndUpdate<T extends TypedModel>(
		id: object | number | string,
		update?: object,
		options?: object,
	): Query<T> {
		return this.fromQuery(this._model.findByIdAndUpdate(id, update, options));
	}

	/**
	 * Issue a mongodb findAndModify remove command.
	 * Finds a matching document, removes it.
	 */
	public static findOneAndRemove<T extends TypedModel>(
		conditions?: object,
		options?: object,
	): Query<T> {
		return this.fromQuery(this._model.findOneAndRemove(conditions, options));
	}

	/**
	 * Issue a mongodb findAndModify remove command by a document's _id field.
	 * findByIdAndRemove(id, ...) is equivalent to
	 * findOneAndRemove({ _id: id }, ...). Finds a matching document, removes it.
	 */
	public static findByIdAndRemove<T extends TypedModel>(
		id: object | number | string,
		options?: object,
	): Query<T> {
		return this.fromQuery(this._model.findByIdAndRemove(id, options));
	}

	/**
	 * Shortcut for saving one or more documents to the database.
	 * MyModel.create(docs) does new MyModel(doc).save() for every doc in docs.
	 * Triggers the save() hook.
	 */
	public static async create<T extends TypedModel>(doc: any[]): Promise<T[]>;
	public static async create<T extends TypedModel>(doc: any): Promise<T> {
		return this.parseResult(await this._model.create(doc)) as any;
	}

	/**
	 * Shortcut for validating an array of documents and inserting them into
	 * MongoDB if they're all valid. This function is faster than .create()
	 * because it only sends one operation to the server, rather than one for each
	 * document.
	 * This function does not trigger save middleware.
	 */
	public static async insertMany<T extends TypedModel>(docs: any[]): Promise<T[]>;
	public static async insertMany<T extends TypedModel>(docs: any): Promise<T> {
		return this.parseResult(await this._model.insertMany(docs)) as any;
	}

	/**
	 * Shortcut for creating a new Document from existing raw data,
	 * pre-saved in the DB. The document returned has no paths marked
	 * as modified initially.
	 */
	public static hydrate<T extends TypedModel>(obj: object): T {
		return this.parseResult(this._model.hydrate(obj)) as T;
	}

	/**
	 * Updates documents in the database without returning them.
	 * All update values are cast to their appropriate SchemaTypes before being
	 * sent.
	 */
	public static update(
		conditions: object,
		doc: object,
		options?: ModelUpdateOptions,
	): Query<any> {
		return this._model.update(conditions, doc, options) as any;
	}

	/**
	 * Same as `update()`, except MongoDB will update _all_ documents that match
	 * `criteria` (as opposed to just the first one) regardless of the value of
	 * the `multi` option.
	 * **Note** updateMany will _not_ fire update middleware. Use
	 * `pre('updateMany')` and `post('updateMany')` instead.
	 */
	public static updateMany(
		conditions: object,
		doc: object,
		options?: ModelUpdateOptions,
	): Query<any> {
		return (this._model as any).updateMany(conditions, doc, options);
	}

	/**
	 * Same as `update()`, except MongoDB will update _only_ the first document
	 * that matches `criteria` regardless of the value of the `multi` option.
	 *
	 * **Note** updateMany will _not_ fire update middleware. Use
	 * `pre('updateMany')` and `post('updateMany')` instead.
	 */
	public static updateOne(
		conditions: object,
		doc: object,
		options?: ModelUpdateOptions,
	): Query<any> {
		return (this._model as any).updateOne(conditions, doc, options);
	}

	/**
	 * Same as `update()`, except MongoDB replace the existing document with the
	 * given document (no atomic operators like `$set`).
	 *
	 * **Note** updateMany will _not_ fire update middleware. Use
	 * `pre('updateMany')` and `post('updateMany')` instead.
	 */
	public static replaceOne(
		conditions: object,
		doc: object,
		options?: ModelUpdateOptions,
	): Query<any> {
		return (this._model as any).replaceOne(conditions, doc, options);
	}

	/**
	 * Executes a mapReduce command.
	 */
	public static mapReduce<Key, Value>(
		o: ModelMapReduceOption<Document, Key, Value>,
	): Promise<any> {
		return this._model.mapReduce(o);
	}

	/**
	 * geoNear support for Mongoose
	 */
	public static geoNear<T extends TypedModel[]>(
		near: any | any[],
		options: object,
	): Query<T> {
		return this.fromQuery(this._model.geoNear(near, options));
	}

	/**
	 * Performs aggregations on the models collection.
	 */
	public static aggregate(...aggregations: object[]): Aggregate<object[]> {
		return this._model.aggregate(...aggregations);
	}

	/**
	 * Implements $geoSearch functionality for Mongoose
	 */
	public static geoSearch<T extends TypedModel[]>(
		conditions: object,
		options: {
			/** x,y point to search for */
			near: number[];
			/** the maximum distance from the point near that a result can be */
			maxDistance: number;
			/** The maximum number of results to return */
			limit?: number;
			/** return the raw object instead of the Mongoose Model */
			lean?: boolean;
		}): Query<T> {
		return this.fromQuery(this._model.geoSearch(conditions, options));
	}

	// tslint:disable-next-line no-empty
	protected static initSchema(): void { }

	protected static fromQuery<T extends TypedModel[]>(query: Query<any>): Query<any>;
	protected static fromQuery<T extends TypedModel>(query: Query<any>): Query<any> {
		const exec = query.exec;
		const then = query.then;

		(query as any).exec = async (...args: any[]) => {
			return this.parseResult(await exec.apply(query, args));
		};
		(query as any).then = async (...args: any[]) => {
			return this.parseResult(await then.apply(query, args));
		};

		return query as any;
	}

	protected static parseResult<T extends TypedModel>(
		this: IModelType<T>,
		result: any,
	): T | T[] {
		if (!result) {
			return null;
		}

		if (Array.isArray(result)) {
			return result.map(r => new this(r));
		} else {
			return new this(result);
		}
	}

	/************************************************
	 *
	 * Instance methods
	 *
	 ************************************************/

	/** Checks if a path is set to its default. */
	public $isDefault(path?: string): boolean {
		return this._document.$isDefault(path);
	}

	/**
	 * Takes a populated field and returns it to its unpopulated state.
	 * If the path was not populated, this is a no-op.
	 */
	public depopulate(path: string): this {
		this._document.depopulate(path);
		return this;
	}

	/**
	 * Returns true if the Document stores the same data as doc.
	 * Documents are considered equal when they have matching _ids, unless
	 * neither document has an _id, in which case this function falls back to
	 * using deepEqual().
	 */
	public equals(doc: this): boolean {
		return this._document.equals(doc.document);
	}

	/**
	 * Explicitly executes population and returns a promise.
	 * Useful for ES2015 integration.
	 */
	public async execPopulate(): Promise<this> {
		return this.fromQuery(await this._document.execPopulate());
	}

	/**
	 * Returns the value of a path.
	 */
	public get(path: string, type?: any): any {
		return this._document.get(path, type);
	}

	/**
	 * Initializes the document without setters or marking anything modified.
	 * Called internally after a document is returned from mongodb.
	 */
	public init(doc: Document, opts?: object): this {
		return this.fromQuery(this._document.init(doc, opts));
	}

	/** Helper for console.log */
	public inspect(options?: object): any {
		return this._document.inspect(options);
	}

	/**
	 * Marks a path as invalid, causing validation to fail.
	 * The errorMsg argument will become the message of the ValidationError.
	 * The value argument (if passed) will be available through the
	 * ValidationError.value property.
	 */
	public invalidate(
		path: string,
		errorMsg: string | NativeError,
		value: any,
		kind?: string,
	): ValidationError | boolean {
		return this._document.invalidate(path, errorMsg, value, kind);
	}

	/**
	 * Returns true if path was directly set and modified, else false.
	 */
	public isDirectModified(path: string): boolean {
		return this._document.isDirectModified(path);
	}

	/**
	 * Checks if path was initialized
	 */
	public isInit(path: string): boolean {
		return this._document.isInit(path);
	}

	/**
	 * Returns true if this document was modified, else false.
	 * If path is given, checks if a path or any full path containing path as
	 * part of its path chain has been modified.
	 */
	public isModified(path?: string): boolean {
		return this._document.isModified(path);
	}

	/**
	 * Checks if path was selected in the source query which initialized this
	 * document.
	 */
	public isSelected(path: string): boolean {
		return this._document.isSelected(path);
	}

	/**
	 * Marks the path as having pending changes to write to the db.
	 * Very helpful when using Mixed types.
	 * @param path the path to mark modified
	 */
	public markModified(path: string): void {
		this._document.markModified(path);
	}

	/**
	 * Returns the list of paths that have been modified.
	 */
	public modifiedPaths(): string[] {
		return this._document.modifiedPaths();
	}

	/**
	 * Populates document refers, executing the callback when complete.
	 * If you want to use promises instead, use this function with
	 * execPopulate()
	 * Population does not occur unless a callback is passed or you explicitly
	 * call execPopulate(). Passing the same path a second time will overwrite
	 * the previous path options. See Model.populate() for explaination of
	 * options.
	 */
	public populate(...args: any[]): this {
		return this.fromQuery((this._document as any).populate(...args));
	}

	/**
	 * Gets _id(s) used during population of the given path. If the path was not
	 * populated, undefined is returned.
	 */
	public populated(path: string): any {
		return this._document.populated(path);
	}

	/**
	 * The return value of this method is used in calls to JSON.stringify(doc).
	 * This method accepts the same options as Document#toObject. To apply the
	 * options to every document of your schema by default, set your schemas
	 * toJSON option to the same argument.
	 */
	public toJSON(options?: DocumentToObjectOptions): object {
		return this._document.toJSON(options);
	}

	/**
	 * Converts this document into a plain javascript object, ready for storage
	 * in MongoDB. Buffers are converted to instances of mongodb.Binary for
	 * proper storage.
	 */
	public toObject(options?: DocumentToObjectOptions): object {
		return this._document.toObject(options);
	}

	/**
	 * Helper for console.log
	 */
	public toString(): string {
		return this._document.toString();
	}

	/**
	 * Clears the modified state on the specified path.
	 * @param path the path to unmark modified
	 */
	public unmarkModified(path: string): void {
		this._document.unmarkModified(path);
	}

	/**
	 * Executes registered validation rules for this document.
	 */
	public validate(optional?: object): Promise<void> {
		return this._document.validate(optional);
	}

	/**
	 * Executes registered validation rules (skipping asynchronous validators for
	 * this document. This method is useful if you need synchronous validation.
	 */
	public validateSync(pathsToValidate: string | string[]): Error {
		return this._document.validateSync(pathsToValidate);
	}

	/**
	 * Saves this document.
	 */
	public async save(options?: SaveOptions): Promise<this> {
		return this.fromQuery(await this._document.save(options));
	}

	/**
	 * Signal that we desire an increment of this documents version.
	 */
	public increment(): this {
		this._document.increment();
		return this;
	}

	/**
	 * Removes this document from the db.
	 */
	public remove(): Promise<this> {
		return this._document.remove().then(() => this);
	}

	/**
	 * Sends an update command with this document _id as the query selector.
	 */
	public async update(doc: object, options?: ModelUpdateOptions): Query<this> {
		return this.fromQuery(await this._document.update(doc, options));
	}

	/**
	 * Sets the value of a path, or many paths.
	 */
	public set(...values: any[]): this {
		(this._document as any).set(...values);
		return this;
	}

	/**
	 * Makes a model instance from document
	 */
	protected fromQuery(document: Document): this {
		const Model = this.constructor as any;
		return new Model(document);
	}
}
