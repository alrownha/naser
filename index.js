const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const Jimp = require('jimp');

const app = express();
const PORT = process.env.PORT || 3000;

// Session setup
app.use(session({
  secret: 'forexsecret',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Predefined credentials
const USERNAME = 'trader';
const PASSWORD = 'sniper';

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});
const upload = multer({ storage: storage });

function ensureAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  } else {
    res.redirect('/');
  }
}

app.get('/', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    req.session.authenticated = true;
    res.redirect('/upload');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

app.get('/upload', ensureAuth, (req, res) => {
  res.render('upload', { result: null });
});

app.post('/upload', ensureAuth, upload.single('chart'), async (req, res) => {
  if (!req.file) {
    return res.render('upload', { result: 'No file uploaded' });
  }
  try {
    // simple placeholder analysis of chart image
    const image = await Jimp.read(req.file.path);
    const { r, g, b } = image.clone().resize(1,1).bitmap.data;
    let suggestion = 'Hold position';
    if (r > b) {
      suggestion = 'Consider buying the pair';
    } else if (b > r) {
      suggestion = 'Consider selling the pair';
    }
    res.render('upload', { result: `Sniper setup suggestion: ${suggestion}` });
  } catch (err) {
    console.error(err);
    res.render('upload', { result: 'Error analyzing chart' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
