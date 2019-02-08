const express = require('express');
const { Client } = require('pg');

const { runQuery } = require('./db');

const connectionString = process.env.DATABASE_URL;

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

router.use(express.urlencoded({ extended: true }));

async function remove(id) {
  const client = new Client({ connectionString });
  await client.connect();
  let selection;
  try {
    await client.query('DELETE FROM applications WHERE id = ($1)', [id]);
    selection = await client.query('SELECT * FROM applications');
  } catch (e) {
    console.error('error', e);
  } finally {
    await client.end();
  }
  return selection.rows;
}
remove().catch((err) => {
  console.error(err);
});

async function getApps() {
  const client = new Client({ connectionString });
  await client.connect();
  let selection;
  try {
    selection = await client.query('SELECT * FROM applications ORDER BY id');
  } catch (e) {
    throw e;
  } finally {
    await client.end();
  }
  return selection.rows;
}
getApps().catch((err) => {
  console.error(err);
});

async function processApplication(req, res) {
  const ID = req.params.id;
  await runQuery(
    `UPDATE applications SET processed = TRUE, updated = current_timestamp WHERE id =${ID}`,
  );

  return res.redirect('/applications');
}

async function deleteApplication(req, res) {
  const ID = req.params.id;
  await runQuery(`DELETE FROM applications WHERE id=${ID}`);

  return res.redirect('/applications');
}

router.get('/applications', async (req, res) => {
  const selection = await getApps();
  res.render('applist', {
    title: 'Umsóknir',
    appList: selection,
  });
});

router.post('/applications/remove/:id', catchErrors(deleteApplication));
router.post('/applications/processed/:id', catchErrors(processApplication));

module.exports = router;
