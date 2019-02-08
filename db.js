const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL; // sótt úr env gegnum dotenv pakka

async function insert(name, email, phone, pres, job) {
  const client = new Client({ connectionString });
  client.connect();

  try {
    const query = 'INSERT INTO applications (name, email, phonenumber, presentation) VALUES ($1, $2, $3, $4)';
    await client.query(query, [name, email, phone, pres, job]);
  } catch (err) {
    console.error(err);
  }
  await client.end();
}

async function save(data) {
  const client = new Client({ connectionString });
  await client.connect();

  const query = 'INSERT INTO applications(name, email, phonenumber, presentation, job) VALUES($1, $2, $3, $4, $5)';
  const values = [data.name, data.email, data.phonenumber, data.pres, data.job];

  try {
    await client.query(query, values);
  } catch (err) {
    console.error('Error inserting data');
    throw err;
  } finally {
    await client.end();
  }
}

async function runQuery(query) {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(query);
  } catch (err) {
    console.error('Error running query');
    throw err;
  } finally {
    await client.end();
  }
}

module.exports = {
  insert,
  runQuery,
  save,
};
