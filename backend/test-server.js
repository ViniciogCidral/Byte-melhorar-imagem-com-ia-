const express = require('express');
const app = express();

app.get('/test', (req, res) => {
    res.send('Teste funcionando!');
});

app.listen(3000, () => console.log('Servidor de teste rodando na porta 3000'));
