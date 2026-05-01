const express = require('express');
const mongoose = require('mongoose');
const Photo = require('./models/Photos');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;



mongoose.connect('mongodb://localhost/pcat-test-db')
  .then(() => {
    console.log('Veritabanı bağlantısı başarılı!');
  })
  .catch((err) => {
    console.log('Veritabanı hatası:', err);
  });


app.set('view engine', 'ejs'); 
app.use(express.static('public')); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination : (req , file , cb) =>{
    cb(null , 'public/uploads');
  },
  filename : (req , file , cb)=>{
     cb(null , Date.now() + '-' + file.originalname)
  },
});
const upload = multer({ storage: storage });


app.get('/', async(req, res) => {
  const photos = await Photo.find({}).sort('-dataCreated');

  res.render('index', {photos});
});



app.post('/fotograf-ekle', upload.single('image'), async (req, res) => {
  try {
    
    await Photo.create({
      title: req.body.title, 
      description: req.body.description, 
      image: '/uploads/' + req.file.filename 
    });

    res.redirect('/');
  } catch (error) {
    console.log("Kayıt hatası:", error);
    res.status(500).send("Veri kaydedilemedi.");
  }
});

app.get('/fotograflar/:id' , async(req , res)=>{

  const photo = await Photo.findById(req.params.id);

  res.render('photo' , {photo});
})



app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başarıyla başlatıldı...`);
});