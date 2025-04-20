require('dotenv').config();
const express = require('express');
const app = express();
const followersRoute = require('./routes/followers');

app.use('/api/followers', followersRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
