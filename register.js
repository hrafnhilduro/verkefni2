const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');
const xss = require('xss');
const { save } = require('./db');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next);
}

const validation = [
  check('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  check('email')
    .isLength({ min: 1 })
    .withMessage('Netfang má ekki vera tómt'),
  check('email')
    .isEmail()
    .withMessage('Netfang ekki gilt'),
  check('phonenumber')
    .matches(/^[0-9]{3}(-| )?[0-9]{4}$/)
    .withMessage('Símanúmer ekki gilt'),
  check('pres')
    .isLength({ min: 10 })
    .withMessage('Kynning verður að vera að a.m.k. 100 stafir'),
];

const sanitazion = [
  sanitize('name')
    .trim()
    .escape(),
  sanitize('email').normalizeEmail(),
  sanitize('phone').toInt(),
];

function form(req, res) {
  res.render('index', {
    title: 'Umsóknir',
    name: '',
    email: '',
    phonenumber: '',
    pres: '',
    job: '',
    errors: [],
    redError: [],
  });
}

async function register(req, res) {
  const { body: { name, email, phonenumber, pres, job } = {} } = req; // eslint-disable-line

  const data = {
    name: xss(name),
    email: xss(email),
    phonenumber: xss(phonenumber),
    pres: xss(pres),
    job: xss(job),
  };

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array();
    if (typeof job === 'undefined') {
      errorMessages.push({
        param: 'job',
        msg: 'Það verður að velja starf',
      });
    }
    const isError = [];
    errorMessages.forEach((error) => {
      isError.push(error.param);
    });

    res.render('index', {
      title: 'Umsóknir',
      name,
      email,
      phonenumber,
      pres,
      job,
      errors: errorMessages,
      redError: isError,
    });
  } else {
    await save(data);
    return res.redirect('/success');
  }
  return res.redirect('/success');
}

function success(req, res) {
  res.render('success', { title: 'Komið!' });
}

router.get('/success', catchErrors(success));
router.get('/', catchErrors(form));
router.post('/register', validation, sanitazion, catchErrors(register));

module.exports = router;
