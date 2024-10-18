app.get('/test-image', (req, res) => {
    const imagePath = path.join(__dirname, 'test-image.jpg'); // Coloque uma imagem de teste no diretório do servidor
    res.sendFile(imagePath);
});

app.get('/test-api', (req, res) => {
    console.log('Requisição recebida para test-api');

    let options = {
        'method': 'GET',
        'hostname': 'https://api.developer.pixelcut.ai/v1/upscale',
        'path': '/v1/account',
        'headers': {
            'Content-Type': 'multipart/form-data',
            'Accept': 'image/*',
            'X-API-Key': ' sk_e61dc5d84cd3495995b0604f2b9ef669'
        },
        'maxRedirects': 20
    };

    const testReq = https.request(options, (testRes) => {
        let chunks = [];

        testRes.on("data", (chunk) => {
            chunks.push(chunk);
        });

        testRes.on("end", () => {
            let body = Buffer.concat(chunks);
            console.log('Resposta do teste da API:', body.toString());
            res.send(body.toString());
        });

        testRes.on("error", (error) => {
            console.error('Erro no teste da API:', error);
            res.status(500).json({ error: error.message });
        });
    });

    testReq.end();
});

app.get('/test', (req, res) => {
    res.send('Servidor está funcionando!');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

console.log('Servidor iniciado. Aguardando conexões...');
console.log('Teste de execução do Node.js');
