const app = require('./app');
const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/wsafe")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log("Mongo Error " ,err));

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
