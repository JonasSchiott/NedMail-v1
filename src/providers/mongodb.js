const {
	Provider,
	util: { mergeDefault, mergeObjects, isObject }
} = require("klasa");
const { MongoClient: Mongo } = require("mongodb");
module.exports = class extends Provider {
	constructor(...args) {
		super(...args, {
			description: "Allows use of MongoDB functionality throughout Klasa"
		});
		this.db = null;
	}

	async init() {
		const connection = mergeDefault(
			{
				host: process.env.DATABASE_HOST,
				port: process.env.DATABASE_PORT,
				db: process.env.DATABASE_COLLECTION,
				options: {
					useUnifiedTopology: true
				}
			},
			this.client.options.providers.mongodb
		);
		const mongoClient = await Mongo.connect(
			process.env.DATABASE_URI,
			mergeObjects(connection.options, { useNewUrlParser: true })
		);
		this.db = mongoClient.db(connection.db);
	}

	/* Table methods */

	get exec() {
		return this.db;
	}

	hasTable(table) {
		return this.db
			.listCollections()
			.toArray()
			.then((collections) => collections.some((col) => col.name === table));
	}

	createTable(table) {
		return this.db.createCollection(table);
	}

	deleteTable(table) {
		return this.db.dropCollection(table);
	}

	/* Document methods */

	getAll(table, filter = []) {
		if (filter.length) {
			return this.db
				.collection(table)
				.find({ id: { $in: filter } }, { _id: 0 })
				.toArray();
		}
		return this.db
			.collection(table)
			.find({}, { _id: 0 })
			.toArray();
	}

	getKeys(table) {
		return this.db
			.collection(table)
			.find({}, { id: 1, _id: 0 })
			.toArray();
	}

	get(table, id) {
		return this.db.collection(table).findOne(resolveQuery(id));
	}

	has(table, id) {
		return this.get(table, id).then(Boolean);
	}

	getRandom(table) {
		return this.db.collection(table).aggregate({ $sample: { size: 1 } });
	}

	create(table, id, doc = {}) {
		return this.db.collection(table).insertOne(mergeObjects(this.parseUpdateInput(doc), resolveQuery(id)));
	}

	delete(table, id) {
		return this.db.collection(table).deleteOne(resolveQuery(id));
	}

	update(table, id, doc) {
		return this.db.collection(table).updateOne(resolveQuery(id), {
			$set: isObject(doc) ? flatten(doc) : parseEngineInput(doc)
		});
	}

	replace(table, id, doc) {
		return this.db.collection(table).replaceOne(resolveQuery(id), this.parseUpdateInput(doc));
	}
};

const resolveQuery = (query) => (isObject(query) ? query : { id: query });

function flatten(obj, path = "") {
	let output = {};
	for (const [key, value] of Object.entries(obj)) {
		if (isObject(value)) {
			output = Object.assign(output, flatten(value, path ? `${path}.${key}` : key));
		} else {
			output[path ? `${path}.${key}` : key] = value;
		}
	}
	return output;
}

function parseEngineInput(updated) {
	return Object.assign({}, ...updated.map((entry) => ({ [entry.data[0]]: entry.data[1] })));
}
