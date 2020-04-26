const express = require('express');
const app = express();

app.get('/api/fieldvalues/:fieldname', async (req, res) => {
  res.setHeader('Content-Type', 'html/text');
  res.send("fieldname=" + req.params.fieldname)
});

const server = app.listen(process.env.API_PORT, () =>
  console.log('Express server is running on '+ server.address())
);
